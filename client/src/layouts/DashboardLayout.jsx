import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarCheck, GraduationCap, LayoutDashboard, ListTodo, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));

  // Dark mode is just a class on <html>; index.css swaps the colour variables for it.
  function toggleTheme() {
    document.documentElement.classList.toggle('dark', !dark);
    localStorage.setItem('theme', dark ? 'light' : 'dark');
    setDark(!dark);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-page md:flex">
      {/* Top bar on mobile, sidebar on desktop */}
      <aside className="sticky top-0 z-20 border-b border-stone-200 bg-surface md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-5">
          <div className="flex items-center gap-2 font-serif text-lg font-semibold text-stone-900">
            <GraduationCap size={20} className="text-brand-700" />
            Student Tracker
          </div>
          <button
            className="icon-btn md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className={`${menuOpen ? 'block' : 'hidden'} px-3 pb-3 md:flex md:flex-1 md:flex-col`}>
          <div className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:bg-stone-100'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="mt-3 border-t border-stone-200 pt-3 md:mt-auto">
            <p className="truncate px-3 text-sm font-medium text-stone-900">{user?.name}</p>
            <p className="truncate px-3 text-xs text-stone-500">{user?.email}</p>
            <button
              onClick={toggleTheme}
              className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
              {dark ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
