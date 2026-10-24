export const SUBJECTS = ['Mathematics', 'Physics', 'Computer Science', 'English'];
export const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
export const RISK_LEVELS = ['High', 'Medium', 'Low'];
export const RISK_COLORS = { High: '#dc2626', Medium: '#f59e0b', Low: '#16a34a' };
export const INTERVENTION_TYPES = ['Faculty Meeting', 'Mentoring Session', 'Parent Meeting', 'Remedial Class', 'Counselling'];
export const INTERVENTION_STATUSES = ['Planned', 'In Progress', 'Completed'];
export const PROGRESS_OPTIONS = ['Not Started', 'Improving', 'No Change', 'Resolved'];

// All thresholds in one place so the rules stay transparent and easy to tune
export const RULES = {
  attendanceHigh: 65,
  attendanceMedium: 75,
  marksHigh: 40,
  marksMedium: 55,
  assignmentMedium: 50,
  failingSubjectsHigh: 2,
};

// Human-readable rule text shown on the Risk page (generated from RULES)
export const RULE_TEXT = {
  High: [
    `Attendance below ${RULES.attendanceHigh}%`,
    `Average marks below ${RULES.marksHigh}`,
    `${RULES.failingSubjectsHigh} or more subjects below ${RULES.marksHigh} marks`,
  ],
  Medium: [
    `Attendance from ${RULES.attendanceHigh}% to below ${RULES.attendanceMedium}%`,
    `Average marks from ${RULES.marksHigh} to below ${RULES.marksMedium}`,
    `Average assignment score below ${RULES.assignmentMedium}`,
    `At least one subject below ${RULES.marksHigh} marks`,
  ],
  Low: ['None of the High or Medium conditions are met'],
};

export const avg = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0);
export const round1 = (n) => Math.round(n * 10) / 10;

// Computes metrics and the risk level with reasons for one student
export function analyze(student) {
  const marks = SUBJECTS.map((s) => Number(student.marks?.[s]) || 0);
  const assignments = SUBJECTS.map((s) => Number(student.assignments?.[s]) || 0);
  const attendance = Number(student.attendance) || 0;
  const avgMarks = round1(avg(marks));
  const avgAssignment = round1(avg(assignments));
  const failing = marks.filter((m) => m < RULES.marksHigh).length;

  const high = [];
  const medium = [];

  if (attendance < RULES.attendanceHigh) high.push(`Attendance ${attendance}% is below ${RULES.attendanceHigh}%`);
  else if (attendance < RULES.attendanceMedium) medium.push(`Attendance ${attendance}% is below ${RULES.attendanceMedium}%`);

  if (avgMarks < RULES.marksHigh) high.push(`Average marks ${avgMarks} is below ${RULES.marksHigh}`);
  else if (avgMarks < RULES.marksMedium) medium.push(`Average marks ${avgMarks} is below ${RULES.marksMedium}`);

  if (failing >= RULES.failingSubjectsHigh) high.push(`${failing} subjects below ${RULES.marksHigh} marks`);
  if (failing >= 1) medium.push(`${failing} subject(s) below ${RULES.marksHigh} marks`);

  if (avgAssignment < RULES.assignmentMedium) medium.push(`Average assignment score ${avgAssignment} is below ${RULES.assignmentMedium}`);

  const level = high.length ? 'High' : medium.length ? 'Medium' : 'Low';
  return { attendance, avgMarks, avgAssignment, failing, risk: { level, reasons: [...high, ...medium] } };
}

export const enrich = (student) => ({ ...student, ...analyze(student) });

export function subjectAverages(students) {
  return SUBJECTS.map((subject) => ({
    subject,
    marks: round1(avg(students.map((s) => Number(s.marks?.[subject]) || 0))),
    assignment: round1(avg(students.map((s) => Number(s.assignments?.[subject]) || 0))),
  }));
}

export const today = () => new Date().toISOString().slice(0, 10);

export const formatDate = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
