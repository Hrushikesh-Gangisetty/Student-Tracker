import { GraduationCap } from 'lucide-react';

// Shared frame for the login and register pages.
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 flex items-center gap-2 text-sm font-medium text-brand-700">
          <GraduationCap size={20} />
          Smart Student Tracker
        </p>
        <div className="card p-6 sm:p-7">
          <h1 className="font-serif text-2xl font-semibold text-stone-900">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-stone-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
