import { useState } from 'react';
import Alert from './Alert.jsx';
import { errorMessage } from '../services/api.js';

// Used for both "Add Task" and "Edit Task".
export default function TaskForm({ task, subjects, onSave, onCancel }) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [deadline, setDeadline] = useState(task?.deadline?.slice(0, 10) ?? '');
  const [subjectId, setSubjectId] = useState(task?.subjectId?._id ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError('Task title is required.');
    if (!deadline) return setError('Please choose a deadline.');

    setError('');
    setSaving(true);
    try {
      await onSave({ title: title.trim(), description: description.trim(), deadline, subjectId });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Alert>{error}</Alert>

      <label className="label" htmlFor="task-title">Title</label>
      <input
        id="task-title"
        className="input mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. DBMS Assignment"
        autoFocus
      />

      <label className="label" htmlFor="task-description">Description</label>
      <textarea
        id="task-description"
        rows="3"
        className="input mb-4"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional details"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="task-subject">Subject</label>
          <select
            id="task-subject"
            className="input"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">No subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="task-deadline">Deadline</label>
          <input
            id="task-deadline"
            type="date"
            className="input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
