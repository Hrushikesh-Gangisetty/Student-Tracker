import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import AttendanceChart from '../components/AttendanceChart.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import TaskChart from '../components/TaskChart.jsx';
import { TaskBadge } from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { errorMessage } from '../services/api.js';
import { attendanceHint, attendancePercent, deadlineState, formatDate } from '../services/helpers.js';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const isShort = (subject) => {
  const percent = attendancePercent(subject);
  return percent !== null && percent < 75;
};

function AttendanceStatus({ subjects }) {
  const short = subjects.filter(isShort);

  if (subjects.length === 0) return null;

  if (short.length === 0) {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        <p>
          <span className="font-medium">Attendance on track.</span> All subjects are at 75% or above.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="font-medium">Attendance shortage</p>
        <ul className="mt-1 space-y-0.5">
          {short.map((s) => (
            <li key={s._id}>
              {s.name} is at {attendancePercent(s)}%. {attendanceHint(s)}.
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function UpcomingTasks({ tasks }) {
  if (tasks.length === 0) {
    return <p className="py-8 text-center text-sm text-stone-500">You're all caught up.</p>;
  }

  return (
    <ul className="divide-y divide-stone-100">
      {tasks.map((task) => {
        const state = deadlineState(task);
        return (
          <li key={task._id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-stone-900">{task.title}</p>
              <p className="truncate text-xs text-stone-500">
                <span className={state === 'overdue' ? 'font-medium text-red-600' : ''}>
                  {formatDate(task.deadline)}
                </span>
                {task.subjectId && ` · ${task.subjectId.name}`}
              </p>
            </div>
            <TaskBadge state={state} />
          </li>
        );
      })}
    </ul>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const header = (
    <PageHeader
      title={`${greeting()}, ${user?.name?.split(' ')[0] ?? 'there'}`}
      subtitle="Here's your academic overview."
      action={
        <p className="text-sm text-stone-500">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      }
    />
  );

  if (error) return <>{header}<Alert>{error}</Alert></>;
  if (!data) return <>{header}<p className="text-sm text-stone-500">Loading dashboard...</p></>;

  const attendance = data.overallAttendance;
  const attended = data.subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
  const held = data.subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const shortCount = data.subjects.filter(isShort).length;
  const nextTask = data.upcomingTasks[0];

  return (
    <>
      {header}

      {/* gap-px over a coloured background draws the thin dividing lines between the cells */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 xl:grid-cols-4">
        <StatCard
          label="Total Subjects"
          value={data.totalSubjects}
          note={
            data.totalSubjects === 0 ? 'None added yet' : shortCount ? `${shortCount} below 75%` : 'All at 75% or above'
          }
        />
        <StatCard
          label="Overall Attendance"
          value={attendance === null ? 'N/A' : `${attendance}%`}
          valueClass={attendance !== null && attendance < 75 ? 'text-red-600' : 'text-stone-900'}
          note={held ? `${attended} of ${held} classes` : 'No classes recorded'}
        />
        <StatCard
          label="Pending Tasks"
          value={data.pendingTasks}
          note={nextTask ? `Next due ${formatDate(nextTask.deadline)}` : 'Nothing due'}
        />
        <StatCard
          label="Completed Tasks"
          value={data.completedTasks}
          note={`of ${data.totalTasks} total`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-stone-900">Attendance by Subject</h2>
          <p className="mb-3 text-xs text-stone-500">Dashed line marks the 75% requirement.</p>
          <AttendanceChart subjects={data.subjects} />
          <AttendanceStatus subjects={data.subjects} />
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold text-stone-900">Task Progress</h2>
          <TaskChart pending={data.pendingTasks} completed={data.completedTasks} />
        </section>
      </div>

      <section className="card mt-6 p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Upcoming Tasks</h2>
          <Link to="/tasks" className="text-sm font-medium text-brand-700 hover:underline">View all</Link>
        </div>
        {data.totalTasks === 0 ? (
          <p className="py-8 text-center text-sm text-stone-500">
            No tasks yet. Add an assignment to get started.
          </p>
        ) : (
          <UpcomingTasks tasks={data.upcomingTasks} />
        )}
      </section>
    </>
  );
}
