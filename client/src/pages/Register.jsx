import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import Alert from '../components/Alert.jsx';
import api, { errorMessage } from '../services/api.js';

const fields = [
  { key: 'name', label: 'Name', type: 'text', autoComplete: 'name' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { key: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
  { key: 'confirm', label: 'Confirm Password', type: 'password', autoComplete: 'new-password' },
];

function validate({ name, email, password, confirm }) {
  if (!name.trim() || !email.trim() || !password || !confirm) return 'All fields are required.';
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Please enter a valid email address.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  if (password !== confirm) return 'Passwords do not match.';
  return '';
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const problem = validate(form);
    if (problem) return setError(problem);

    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Create account" subtitle="It takes less than a minute.">
      <Alert>{error}</Alert>

      <form onSubmit={handleSubmit} noValidate>
        {fields.map(({ key, label, type, autoComplete }) => (
          <div key={key} className="mb-4">
            <label className="label" htmlFor={key}>{label}</label>
            <input
              id={key}
              type={type}
              autoComplete={autoComplete}
              className="input"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}

        <button type="submit" className="btn-primary mt-2 w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">Login</Link>
      </p>
    </AuthCard>
  );
}
