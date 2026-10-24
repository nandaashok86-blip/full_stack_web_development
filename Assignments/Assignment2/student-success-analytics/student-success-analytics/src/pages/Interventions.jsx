import { useState } from 'react';
import { api, useData } from '../api.js';
import {
  INTERVENTION_STATUSES, INTERVENTION_TYPES, PROGRESS_OPTIONS, enrich, formatDate, today,
} from '../analytics.js';
import { Badge, Card, Field, Modal, PageHeader, Status } from '../components/ui.jsx';

const blankForm = (studentId = '') => ({
  studentId, type: INTERVENTION_TYPES[0], sessionDate: today(), facultyName: '',
  suggestedAction: '', followUpDate: '', status: 'Planned', progress: 'Not Started', notes: '',
});

export default function Interventions() {
  const { students, interventions, loading, error, reload } = useData();
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState('');

  if (loading || error) return <div className="page"><PageHeader title="Intervention Tracking" /><Status loading={loading} error={error} /></div>;

  const studentName = (id) => students.find((s) => s.id === id)?.name ?? 'Unknown';
  const rows = interventions
    .filter((i) => statusFilter === 'All' || i.status === statusFilter)
    .sort((a, b) => (b.sessionDate || '').localeCompare(a.sessionDate || ''));

  // Students flagged as Medium/High who have no intervention yet
  const flaggedWithout = students
    .map(enrich)
    .filter((s) => s.risk.level !== 'Low' && !interventions.some((i) => i.studentId === s.id));

  const openAdd = (studentId = '') => { setEditId(null); setForm(blankForm(studentId)); setFormError(''); };
  const openEdit = (i) => { setEditId(i.id); setForm({ ...i }); setFormError(''); };
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.studentId) return setFormError('Select a student.');
    if (!form.facultyName.trim()) return setFormError('Enter the faculty or mentor name.');
    if (!form.suggestedAction.trim()) return setFormError('Describe the suggested action.');
    if (form.followUpDate && form.sessionDate && form.followUpDate < form.sessionDate)
      return setFormError('Follow-up date cannot be before the session date.');
    try {
      if (editId) await api.update('interventions', editId, form);
      else await api.create('interventions', form);
      setForm(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const remove = async (i) => {
    if (!window.confirm('Delete this intervention record?')) return;
    try {
      await api.remove('interventions', i.id);
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const isOverdue = (i) => i.followUpDate && i.followUpDate < today() && i.status !== 'Completed';

  return (
    <div className="page">
      <PageHeader
        title="Intervention Tracking"
        subtitle="Record meetings, mentoring, suggested actions, follow-ups and progress"
        action={<button type="button" className="btn btn-primary" onClick={() => openAdd()}>+ Log Intervention</button>}
      />

      {flaggedWithout.length > 0 && (
        <Card title={`Flagged students without an intervention (${flaggedWithout.length})`}>
          <div className="chips">
            {flaggedWithout.map((s) => (
              <button key={s.id} type="button" className="chip-btn" onClick={() => openAdd(s.id)}>
                <Badge level={s.risk.level} /> {s.name} + log
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="toolbar card">
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {INTERVENTION_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="muted">{rows.length} record(s)</span>
      </div>

      <div className="card table-card">
        {rows.length === 0 ? (
          <div className="empty">No intervention records yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th><th>Type</th><th>Session</th><th>Faculty</th><th>Suggested Action</th><th>Follow-up</th><th>Status</th><th>Progress</th><th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id} className={isOverdue(i) ? 'overdue' : ''}>
                    <td>{studentName(i.studentId)}</td>
                    <td>{i.type}</td>
                    <td>{formatDate(i.sessionDate)}</td>
                    <td>{i.facultyName}</td>
                    <td className="wrap">{i.suggestedAction}</td>
                    <td>{formatDate(i.followUpDate)}{isOverdue(i) && <span className="overdue-tag">Overdue</span>}</td>
                    <td><span className={`badge status-${i.status.toLowerCase().replace(/\s+/g, '-')}`}>{i.status}</span></td>
                    <td>{i.progress}</td>
                    <td className="right actions">
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => openEdit(i)}>Edit</button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(i)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!form} title={editId ? 'Edit Intervention' : 'Log Intervention'} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={save} className="form">
            <div className="form-grid">
              <Field label="Student" full>
                <select className="input" value={form.studentId} onChange={(e) => setField('studentId', e.target.value)}>
                  <option value="">Select student</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
                </select>
              </Field>
              <Field label="Intervention type">
                <select className="input" value={form.type} onChange={(e) => setField('type', e.target.value)}>
                  {INTERVENTION_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Faculty / mentor"><input className="input" value={form.facultyName} onChange={(e) => setField('facultyName', e.target.value)} /></Field>
              <Field label="Session date"><input className="input" type="date" value={form.sessionDate} onChange={(e) => setField('sessionDate', e.target.value)} /></Field>
              <Field label="Follow-up date"><input className="input" type="date" value={form.followUpDate} onChange={(e) => setField('followUpDate', e.target.value)} /></Field>
              <Field label="Status">
                <select className="input" value={form.status} onChange={(e) => setField('status', e.target.value)}>
                  {INTERVENTION_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Progress">
                <select className="input" value={form.progress} onChange={(e) => setField('progress', e.target.value)}>
                  {PROGRESS_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Suggested action" full>
                <textarea className="input" rows={2} value={form.suggestedAction} onChange={(e) => setField('suggestedAction', e.target.value)} />
              </Field>
              <Field label="Notes / progress details" full>
                <textarea className="input" rows={2} value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
              </Field>
            </div>
            {formError && <div className="alert">{formError}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editId ? 'Save changes' : 'Log intervention'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
