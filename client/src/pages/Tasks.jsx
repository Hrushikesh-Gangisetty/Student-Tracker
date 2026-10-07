import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Circle, Pencil, Plus, Trash2 } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { TaskBadge } from '../components/Badge.jsx';
import api, { errorMessage } from '../services/api.js';
import { deadlineState, formatDate } from '../services/helpers.js';

const filters = ['All', 'Pending', 'Completed', 'Overdue'];

function matchesFilter(task, filter) {
  if (filter === 'Pending') return task.status === 'pending';
  if (filter === 'Completed') return task.status === 'completed';
  if (filter === 'Overdue') return deadlineState(task) === 'overdue';
  return true;
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const state = deadlineState(task);
  const done = state === 'completed';

  return (
    <div className={`card flex items-start gap-3 p-4 ${done ? 'bg-stone-50' : ''}`}>
      <button
        className={`mt-0.5 cursor-pointer ${done ? 'text-green-600' : 'text-stone-400 hover:text-green-600'}`}
        onClick={onToggle}
        title={done ? 'Mark as pending' : 'Mark as completed'}
        aria-label={`${done ? 'Mark as pending' : 'Complete'}: ${task.title}`}
      >
        {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-medium ${done ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
            {task.title}
          </h3>
          <TaskBadge state={state} />
        </div>
        {task.description && (
          <p className={`mt-1 text-sm break-words ${done ? 'text-stone-400' : 'text-stone-600'}`}>
            {task.description}
          </p>
        )}
        <p
          className={`mt-2 flex items-center gap-1.5 text-xs ${
            state === 'overdue' ? 'font-medium text-red-600' : state === 'soon' ? 'text-amber-700' : 'text-stone-500'
          }`}
        >
          <CalendarDays size={14} />
          {formatDate(task.deadline)}
          {task.subjectId && <span className="text-stone-500">· {task.subjectId.name}</span>}
        </p>
      </div>

      <div className="flex shrink-0 gap-1">
        <button className="icon-btn" title="Edit" aria-label={`Edit ${task.title}`} onClick={onEdit}>
          <Pencil size={16} />
        </button>
        <button
          className="icon-btn hover:bg-red-50 hover:text-red-700"
          title="Delete"
          aria-label={`Delete ${task.title}`}
          onClick={onDelete}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState(null);
  const [subjects, setSubjects] = useState([]); // for the subject dropdown in the form
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  // null = closed, 'new' = add form, otherwise the task being edited
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    load();
    api.get('/subjects').then((res) => setSubjects(res.data)).catch(() => {});
  }, []);

  async function saveTask(values) {
    if (editing === 'new') await api.post('/tasks', values);
    else await api.put(`/tasks/${editing._id}`, values);
    setEditing(null);
    await load();
  }

  async function toggleStatus(task) {
    try {
      const status = task.status === 'completed' ? 'pending' : 'completed';
      await api.patch(`/tasks/${task._id}/status`, { status });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  // Pending tasks first; within each group the API order (nearest deadline) is kept.
  const visible = (tasks ?? [])
    .filter((task) => matchesFilter(task, filter))
    .sort((a, b) => (a.status === 'completed') - (b.status === 'completed'));

  function emptyMessage() {
    if (filter === 'Pending') return "You're all caught up.";
    if (filter === 'Overdue') return 'Nothing overdue. Nice work!';
    return 'No completed tasks yet.';
  }

  return (
    <>
      <PageHeader
        title="Tasks & Assignments"
        subtitle="Manage your academic tasks and deadlines."
        action={
          <button className="btn-primary" onClick={() => setEditing('new')}>
            <Plus size={16} /> Add Task
          </button>
        }
      />

      <Alert>{error}</Alert>

      {tasks === null && !error && <p className="text-sm text-stone-500">Loading tasks...</p>}

      {tasks?.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-medium text-stone-900">No tasks yet.</p>
          <p className="mt-1 text-sm text-stone-500">Add an assignment to get started.</p>
        </div>
      )}

      {tasks?.length > 0 && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map((name) => (
              <button
                key={name}
                onClick={() => setFilter(name)}
                aria-pressed={filter === name}
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium ${
                  filter === name
                    ? 'bg-brand-600 text-white'
                    : 'border border-stone-300 bg-surface text-stone-600 hover:bg-stone-50'
                }`}
              >
                {name} ({tasks.filter((task) => matchesFilter(task, name)).length})
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="card p-10 text-center text-sm text-stone-500">{emptyMessage()}</div>
          ) : (
            <div className="space-y-3">
              {visible.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={() => toggleStatus(task)}
                  onEdit={() => setEditing(task)}
                  onDelete={() => deleteTask(task)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add Task' : 'Edit Task'} onClose={() => setEditing(null)}>
          <TaskForm
            task={editing === 'new' ? null : editing}
            subjects={subjects}
            onSave={saveTask}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  );
}
