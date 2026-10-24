import { useState } from 'react';
import { api, useData } from '../api.js';
import { DEPARTMENTS, RISK_LEVELS, SUBJECTS, enrich } from '../analytics.js';
import { Badge, Field, Modal, PageHeader, Status } from '../components/ui.jsx';

const blankSubjects = () => Object.fromEntries(SUBJECTS.map((s) => [s, '']));
const blankForm = () => ({
  name: '', rollNo: '', department: DEPARTMENTS[0], email: '', attendance: '',
  marks: blankSubjects(), assignments: blankSubjects(),
});

export default function Students() {
  const { students, interventions, loading, error, reload } = useData();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [level, setLevel] = useState('All');
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [formError, setFormError] = useState('');

  if (loading || error) return <div className="page"><PageHeader title="Student Management" /><Status loading={loading} error={error} /></div>;

  const rows = students
    .map(enrich)
    .filter((s) => dept === 'All' || s.department === dept)
    .filter((s) => level === 'All' || s.risk.level === level)
    .filter((s) => `${s.name} ${s.rollNo} ${s.email}`.toLowerCase().includes(search.trim().toLowerCase()));

  const openAdd = () => { setEditId(null); setForm(blankForm()); setFormError(''); };
  const openEdit = (s) => {
    setEditId(s.id);
    setForm({
      name: s.name, rollNo: s.rollNo, department: s.department, email: s.email, attendance: String(s.attendance),
      marks: Object.fromEntries(SUBJECTS.map((n) => [n, String(s.marks?.[n] ?? '')])),
      assignments: Object.fromEntries(SUBJECTS.map((n) => [n, String(s.assignments?.[n] ?? '')])),
    });
    setFormError('');
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setSubject = (group, subject, value) => setForm((f) => ({ ...f, [group]: { ...f[group], [subject]: value } }));

  const save = async (e) => {
    e.preventDefault();
    const inRange = (v) => v !== '' && Number(v) >= 0 && Number(v) <= 100;
    const f = form;
    if (!f.name.trim() || !f.rollNo.trim()) return setFormError('Name and roll number are required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setFormError('Enter a valid email address.');
    if (!inRange(f.attendance)) return setFormError('Attendance must be between 0 and 100.');
    if (![...Object.values(f.marks), ...Object.values(f.assignments)].every(inRange))
      return setFormError('All marks and assignment scores must be between 0 and 100.');
    if (students.some((s) => s.rollNo.toLowerCase() === f.rollNo.trim().toLowerCase() && s.id !== editId))
      return setFormError('This roll number already exists.');

    const payload = {
      name: f.name.trim(),
      rollNo: f.rollNo.trim(),
      department: f.department,
      email: f.email.trim(),
      attendance: Number(f.attendance),
      marks: Object.fromEntries(SUBJECTS.map((n) => [n, Number(f.marks[n])])),
      assignments: Object.fromEntries(SUBJECTS.map((n) => [n, Number(f.assignments[n])])),
    };
    try {
      if (editId) await api.update('students', editId, payload);
      else await api.create('students', payload);
      setForm(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete ${s.name}? Their intervention records will also be deleted.`)) return;
    try {
      await Promise.all(interventions.filter((i) => i.studentId === s.id).map((i) => api.remove('interventions', i.id)));
      await api.remove('students', s.id);
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Student Management"
        subtitle="Add, edit, search and view student records"
        action={<button type="button" className="btn btn-primary" onClick={openAdd}>+ Add Student</button>}
      />

      <div className="toolbar card">
        <input className="input grow" placeholder="Search by name, roll number or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="All">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="All">All risk levels</option>
          {RISK_LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
        <span className="muted">{rows.length} of {students.length}</span>
      </div>

      <div className="card table-card">
        {rows.length === 0 ? (
          <div className="empty">No students match your filters.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th><th>Name</th><th>Dept</th><th>Attendance</th><th>Avg Marks</th><th>Avg Assignment</th><th>Risk</th><th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td>{s.rollNo}</td>
                    <td>{s.name}</td>
                    <td>{s.department}</td>
                    <td>{s.attendance}%</td>
                    <td>{s.avgMarks}</td>
                    <td>{s.avgAssignment}</td>
                    <td><Badge level={s.risk.level} /></td>
                    <td className="right actions">
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewing(s)}>View</button>
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => openEdit(s)}>Edit</button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(s)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View details */}
      <Modal open={!!viewing} title={viewing?.name} onClose={() => setViewing(null)}>
        {viewing && (
          <>
            <div className="details">
              <div><span>Roll No</span>{viewing.rollNo}</div>
              <div><span>Department</span>{viewing.department}</div>
              <div><span>Email</span>{viewing.email}</div>
              <div><span>Attendance</span>{viewing.attendance}%</div>
              <div><span>Risk</span><Badge level={viewing.risk.level} /></div>
            </div>
            <div className="table-wrap">
              <table className="compact">
                <thead><tr><th>Subject</th><th>Marks</th><th>Assignment</th></tr></thead>
                <tbody>
                  {SUBJECTS.map((s, i) => (
                    <tr key={s}><td>{s}</td><td>{viewing.marks?.[s]}</td><td>{viewing.assignments?.[s]}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="sub-title">Why this risk level?</h3>
            {viewing.risk.reasons.length ? (
              <ul className="reasons">{viewing.risk.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            ) : (
              <p className="muted">No risk conditions triggered.</p>
            )}
          </>
        )}
      </Modal>

      {/* Add / edit */}
      <Modal open={!!form} title={editId ? 'Edit Student' : 'Add Student'} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={save} className="form">
            <div className="form-grid">
              <Field label="Full name"><input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} /></Field>
              <Field label="Roll number"><input className="input" value={form.rollNo} onChange={(e) => setField('rollNo', e.target.value)} /></Field>
              <Field label="Department">
                <select className="input" value={form.department} onChange={(e) => setField('department', e.target.value)}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Email"><input className="input" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} /></Field>
              <Field label="Attendance (%)" full>
                <input className="input" type="number" min="0" max="100" value={form.attendance} onChange={(e) => setField('attendance', e.target.value)} />
              </Field>
            </div>

            <h3 className="sub-title">Subject marks and assignment scores (0–100)</h3>
            <div className="table-wrap">
              <table className="compact">
                <thead><tr><th>Subject</th><th>Marks</th><th>Assignment</th></tr></thead>
                <tbody>
                  {SUBJECTS.map((s) => (
                    <tr key={s}>
                      <td>{s}</td>
                      <td><input className="input" type="number" min="0" max="100" value={form.marks[s]} onChange={(e) => setSubject('marks', s, e.target.value)} /></td>
                      <td><input className="input" type="number" min="0" max="100" value={form.assignments[s]} onChange={(e) => setSubject('assignments', s, e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {formError && <div className="alert">{formError}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editId ? 'Save changes' : 'Add student'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
