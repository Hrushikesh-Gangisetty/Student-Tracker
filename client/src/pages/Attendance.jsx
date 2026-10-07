import { useEffect, useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SubjectForm from '../components/SubjectForm.jsx';
import api, { errorMessage } from '../services/api.js';
import { attendanceHint, attendancePercent } from '../services/helpers.js';

function StatusBadge({ percent }) {
  if (percent === null) return <Badge>No classes yet</Badge>;
  return percent >= 75 ? <Badge color="green">Good</Badge> : <Badge color="red">Shortage</Badge>;
}

export default function Attendance() {
  const [subjects, setSubjects] = useState(null);
  const [error, setError] = useState('');
  // null = closed, 'new' = add form, otherwise the subject being edited
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveSubject(values) {
    if (editing === 'new') await api.post('/subjects', values);
    else await api.put(`/subjects/${editing._id}`, values);
    setEditing(null);
    await load();
  }

  // Quick update after a class: present = attended + 1 and total + 1, absent = total + 1 only.
  async function markClass(subject, present) {
    try {
      await api.put(`/subjects/${subject._id}/attendance`, {
        attendedClasses: subject.attendedClasses + (present ? 1 : 0),
        totalClasses: subject.totalClasses + 1,
      });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function deleteSubject(subject) {
    if (!window.confirm(`Delete "${subject.name}" and its attendance record?`)) return;
    try {
      await api.delete(`/subjects/${subject._id}`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  // The same four buttons are used by the desktop table and the mobile cards.
  const actions = (subject) => (
    <div className="flex items-center gap-1">
      <button
        className="icon-btn flex items-center gap-1 hover:bg-green-50 hover:text-green-700"
        title="Mark present (attended +1)"
        aria-label={`Mark present for ${subject.name}`}
        onClick={() => markClass(subject, true)}
      >
        <Check size={16} /><span className="text-sm lg:hidden">Present</span>
      </button>
      <button
        className="icon-btn flex items-center gap-1 hover:bg-red-50 hover:text-red-700"
        title="Mark absent (total +1)"
        aria-label={`Mark absent for ${subject.name}`}
        onClick={() => markClass(subject, false)}
      >
        <X size={16} /><span className="text-sm lg:hidden">Absent</span>
      </button>
      <button
        className="icon-btn"
        title="Edit"
        aria-label={`Edit ${subject.name}`}
        onClick={() => setEditing(subject)}
      >
        <Pencil size={16} />
      </button>
      <button
        className="icon-btn hover:bg-red-50 hover:text-red-700"
        title="Delete"
        aria-label={`Delete ${subject.name}`}
        onClick={() => deleteSubject(subject)}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Attendance"
        subtitle="Track your subject-wise attendance."
        action={
          <button className="btn-primary" onClick={() => setEditing('new')}>
            <Plus size={16} /> Add Subject
          </button>
        }
      />

      <Alert>{error}</Alert>

      {subjects === null && !error && <p className="text-sm text-stone-500">Loading subjects...</p>}

      {subjects?.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-medium text-stone-900">No subjects added yet.</p>
          <p className="mt-1 text-sm text-stone-500">Add your first subject to start tracking attendance.</p>
        </div>
      )}

      {subjects?.length > 0 && (
        <div className="card hidden overflow-x-auto lg:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Attended</th>
                <th className="px-4 py-3 font-medium">Total Classes</th>
                <th className="px-4 py-3 font-medium">Attendance %</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {subjects.map((subject) => {
                const percent = attendancePercent(subject);
                return (
                  <tr key={subject._id}>
                    <td className="px-4 py-3 font-medium text-stone-900">{subject.name}</td>
                    <td className="px-4 py-3 text-stone-600">{subject.attendedClasses}</td>
                    <td className="px-4 py-3 text-stone-600">{subject.totalClasses}</td>
                    <td className="px-4 py-3 font-medium text-stone-900">
                      {percent === null ? 'N/A' : `${percent}%`}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge percent={percent} />
                      <p className="mt-1 text-xs text-stone-500">{attendanceHint(subject)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">{actions(subject)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Phones and tablets: one card per subject, so nothing is hidden behind a sideways scroll */}
      {subjects?.length > 0 && (
        <div className="space-y-3 lg:hidden">
          {subjects.map((subject) => {
            const percent = attendancePercent(subject);
            return (
              <div key={subject._id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium break-words text-stone-900">{subject.name}</h3>
                    <p className="mt-0.5 text-sm text-stone-500">
                      {subject.attendedClasses} / {subject.totalClasses} classes attended
                    </p>
                    <p className="mt-1 text-xs text-stone-500">{attendanceHint(subject)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold text-stone-900">
                      {percent === null ? 'N/A' : `${percent}%`}
                    </p>
                    <StatusBadge percent={percent} />
                  </div>
                </div>
                <div className="mt-3 flex justify-end border-t border-stone-100 pt-2">
                  {actions(subject)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add Subject' : 'Edit Subject'} onClose={() => setEditing(null)}>
          <SubjectForm
            subject={editing === 'new' ? null : editing}
            onSave={saveSubject}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  );
}
