import { useState } from 'react';
import Alert from './Alert.jsx';
import { errorMessage } from '../services/api.js';

// Used for both "Add Subject" and "Edit Subject". onSave receives the form values
// and should return a promise (the API call).
export default function SubjectForm({ subject, onSave, onCancel }) {
  const [name, setName] = useState(subject?.name ?? '');
  const [totalClasses, setTotalClasses] = useState(subject?.totalClasses ?? 0);
  const [attendedClasses, setAttendedClasses] = useState(subject?.attendedClasses ?? 0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const total = Number(totalClasses);
    const attended = Number(attendedClasses);

    if (!name.trim()) return setError('Subject name is required.');
    if (!Number.isInteger(total) || !Number.isInteger(attended) || total < 0 || attended < 0) {
      return setError('Class counts must be whole numbers, 0 or more.');
    }
    if (attended > total) return setError('Classes attended cannot be more than total classes.');

    setError('');
    setSaving(true);
    try {
      await onSave({ name: name.trim(), totalClasses: total, attendedClasses: attended });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Alert>{error}</Alert>

      <label className="label" htmlFor="subject-name">Subject Name</label>
      <input
        id="subject-name"
        className="input mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. DBMS"
        autoFocus
      />

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="total-classes">Total Classes</label>
          <input
            id="total-classes"
            type="number"
            min="0"
            className="input"
            value={totalClasses}
            onChange={(e) => setTotalClasses(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="attended-classes">Classes Attended</label>
          <input
            id="attended-classes"
            type="number"
            min="0"
            max={totalClasses}
            className="input"
            value={attendedClasses}
            onChange={(e) => setAttendedClasses(e.target.value)}
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
