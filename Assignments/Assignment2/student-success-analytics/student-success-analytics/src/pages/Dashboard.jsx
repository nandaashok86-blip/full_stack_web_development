import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../api.js';
import { RISK_COLORS, RISK_LEVELS, avg, enrich, round1, subjectAverages } from '../analytics.js';
import { Badge, Card, PageHeader, Stat, Status } from '../components/ui.jsx';

export default function Dashboard() {
  const { students, loading, error } = useData();
  if (loading || error) return <div className="page"><PageHeader title="Dashboard" /><Status loading={loading} error={error} /></div>;

  const rows = students.map(enrich);
  const needAttention = rows.filter((r) => r.risk.level !== 'Low').length;
  const pie = RISK_LEVELS.map((level) => ({ name: level, value: rows.filter((r) => r.risk.level === level).length }));
  const priority = rows.filter((r) => r.risk.level === 'High');

  return (
    <div className="page">
      <PageHeader title="Student Success Dashboard" subtitle="Overview of marks, attendance and students who need academic support" />

      <div className="stats">
        <Stat label="Total Students" value={rows.length} />
        <Stat label="Average Marks" value={round1(avg(rows.map((r) => r.avgMarks)))} accent="#0ea5e9" />
        <Stat label="Average Attendance" value={`${round1(avg(rows.map((r) => r.attendance)))}%`} accent="#16a34a" />
        <Stat label="Needing Attention" value={needAttention} accent="#dc2626" />
      </div>

      <div className="grid-2">
        <Card title="Risk Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>
                {pie.map((p) => <Cell key={p.name} fill={RISK_COLORS[p.name]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Subject-wise Class Average">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={subjectAverages(students)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="subject" fontSize={12} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="marks" name="Marks" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="assignment" name="Assignments" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="High-Priority Students" action={<Link to="/interventions" className="link">Track interventions →</Link>}>
        {priority.length === 0 ? (
          <p className="muted">No students are currently classified as high priority.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Department</th><th>Attendance</th><th>Avg Marks</th><th>Priority</th></tr>
              </thead>
              <tbody>
                {priority.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.department}</td>
                    <td>{r.attendance}%</td>
                    <td>{r.avgMarks}</td>
                    <td><Badge level={r.risk.level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
