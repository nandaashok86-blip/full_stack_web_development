import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../api.js';
import { RISK_COLORS, SUBJECTS, enrich, subjectAverages } from '../analytics.js';
import { Card, PageHeader, Status } from '../components/ui.jsx';

const chartProps = { width: '100%', height: 280 };

export default function Performance() {
  const { students, loading, error } = useData();
  const [selectedId, setSelectedId] = useState('');

  if (loading || error) return <div className="page"><PageHeader title="Performance Analytics" /><Status loading={loading} error={error} /></div>;

  const rows = students.map(enrich);
  const selected = rows.find((r) => r.id === selectedId) || rows[0];
  const breakdown = selected
    ? SUBJECTS.map((subject) => ({
        subject,
        marks: Number(selected.marks?.[subject]) || 0,
        assignment: Number(selected.assignments?.[subject]) || 0,
      }))
    : [];

  return (
    <div className="page">
      <PageHeader title="Performance Analytics" subtitle="Marks, assignment scores, attendance and subject-wise performance" />

      <Card title="Subject-wise Class Average">
        <ResponsiveContainer {...chartProps}>
          <BarChart data={subjectAverages(students)}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="subject" fontSize={12} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="marks" name="Avg Marks" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            <Bar dataKey="assignment" name="Avg Assignment" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid-2">
        <Card title="Attendance vs Average Marks">
          <ResponsiveContainer {...chartProps}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" domain={[50, 100]} />
              <YAxis type="number" dataKey="avgMarks" name="Avg marks" domain={[0, 100]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={rows} name="Students">
                {rows.map((r) => <Cell key={r.id} fill={RISK_COLORS[r.risk.level]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="muted small">Point colour shows risk level: red = High, amber = Medium, green = Low.</p>
        </Card>

        <Card title="Attendance by Student">
          <ResponsiveContainer {...chartProps}>
            <BarChart data={rows.map((r) => ({ name: r.name.split(' ')[0], attendance: r.attendance }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '75%', position: 'right', fontSize: 11 }} />
              <ReferenceLine y={65} stroke="#dc2626" strokeDasharray="4 4" label={{ value: '65%', position: 'right', fontSize: 11 }} />
              <Bar dataKey="attendance" name="Attendance %" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card
        title={selected ? `Subject Breakdown: ${selected.name}` : 'Subject Breakdown'}
        action={
          <select className="input select-sm" value={selected?.id ?? ''} onChange={(e) => setSelectedId(e.target.value)}>
            {rows.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        }
      >
        {selected && (
          <>
            <div className="chips">
              <span>Attendance <b>{selected.attendance}%</b></span>
              <span>Avg marks <b>{selected.avgMarks}</b></span>
              <span>Avg assignment <b>{selected.avgAssignment}</b></span>
              <span>Subjects below 40 <b>{selected.failing}</b></span>
            </div>
            <ResponsiveContainer {...chartProps}>
              <BarChart data={breakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="subject" fontSize={12} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="marks" name="Marks" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="assignment" name="Assignment" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </Card>
    </div>
  );
}
