# Student Success Analytics Dashboard

Analyzes students' marks, attendance, and assignment performance to identify students who may need academic support.

## Features

1. **Dashboard**: total students, average marks, average attendance, students needing attention, with interactive pie and bar charts.
2. **Student Management**: add, edit, delete, search, filter, and view student records.
3. **Performance Analytics**: subject-wise class averages, attendance vs marks scatter plot, attendance by student, and a per-student subject breakdown.
4. **Academic Risk Classification**: transparent rules classify each student as High, Medium, or Low priority. Every triggered reason is shown.
5. **Intervention Tracking**: log faculty meetings, mentoring sessions, and other interventions with suggested actions, follow-up dates, status, and progress. Overdue follow-ups are highlighted, and flagged students with no intervention are listed.

## Tech Stack

| Technology   | Purpose                    |
| ------------ | -------------------------- |
| HTML5        | Structure                  |
| CSS3         | Responsive design          |
| ReactJS      | Interactive UI             |
| React Router | Navigation                 |
| Recharts     | Charts and graphs          |
| JSON Server  | Dummy REST API and storage |

## Risk Rules

Thresholds are in `src/analytics.js` (`RULES`).

| Level  | Conditions (any one is enough)                                                                  |
| ------ | ----------------------------------------------------------------------------------------------- |
| High   | Attendance below 65%, or average marks below 40, or 2+ subjects below 40                        |
| Medium | Attendance 65–74%, or average marks 40–54, or average assignment score below 50, or any subject below 40 |
| Low    | None of the above                                                                               |

## Setup

```bash
cd student-success-analytics
npm install
npm start          # JSON Server on http://localhost:5000 and app on http://localhost:5173
```

To run them separately: `npm run server` and `npm run dev`.

To point the app at another API, create a `.env` file with `VITE_API_URL=http://your-host:port`.

## Data

All data lives in `db.json`: `students` (with per-subject `marks` and `assignments`, plus `attendance`) and `interventions`. Changes made in the app are written back to this file by JSON Server.
