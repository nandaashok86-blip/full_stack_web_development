import { useState } from 'react';
import { useData } from '../api.js';
import { RISK_LEVELS, RULE_TEXT, enrich } from '../analytics.js';
import { Badge, Card, PageHeader, Status } from '../components/ui.jsx';

export default function Risk() {
  const { students, loading, error } = useData();
  const [level, setLevel] = useState('All');

  if (loading || error) return <div className="page"><PageHeader title="Risk Classification" /><Status loading={loading} error={error} /></div>;

  const rows = students
    .map(enrich)
    .sort((a, b) => RISK_LEVELS.indexOf(a.risk.level) - RISK_LEVELS.indexOf(b.risk.level))
    .filter((r) => level === 'All' || r.risk.level === level);

  return (
    <div className="page">
      <PageHeader title="Academic Risk Classification" subtitle="Transparent, rule-based priority for academic support" />

      <Card title="Classification Rules">
        <div className="rules">
          {RISK_LEVELS.map((l) => (
            <div key={l} className={`rule-box rule-${l.toLowerCase()}`}>
              <h3><Badge level={l} /> priority</h3>
              <ul>{RULE_TEXT[l].map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="muted small">
          A student is placed in the highest level whose conditions they meet. Every triggered condition is listed in the table below.
          Thresholds are defined in <code>src/analytics.js</code>.
        </p>
      </Card>

      <Card
        title="Students by Priority"
        action={
          <select className="input select-sm" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="All">All levels</option>
            {RISK_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Priority</th><th>Name</th><th>Dept</th><th>Attendance</th><th>Avg Marks</th><th>Avg Assignment</th><th>Subjects &lt; 40</th><th>Reasons</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><Badge level={r.risk.level} /></td>
                  <td>{r.name}</td>
                  <td>{r.department}</td>
                  <td>{r.attendance}%</td>
                  <td>{r.avgMarks}</td>
                  <td>{r.avgAssignment}</td>
                  <td>{r.failing}</td>
                  <td className="reasons-cell">{r.risk.reasons.length ? r.risk.reasons.join('; ') : 'No concerns'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
