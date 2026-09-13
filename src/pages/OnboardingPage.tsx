import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Recycle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { setUserRole } from '../lib/firestore';

const roles = [
  {
    id: 'ORGANIZER' as const,
    icon: <Calendar size={32} />,
    title: 'Event Organizer',
    desc: 'I organize events (weddings, corporate gatherings, festivals) and want to manage waste responsibly.',
    benefits: ['AI waste prediction', 'Partner matching', 'Pickup scheduling', 'Impact reports'],
    color: 'border-brand-green bg-primary-50 text-brand-green',
    active: 'ring-2 ring-brand-green',
  },
  {
    id: 'RECOVERY_PARTNER' as const,
    icon: <Recycle size={32} />,
    title: 'Recovery Partner',
    desc: 'I represent an NGO, composting facility, florist recycler, or waste recovery organization.',
    benefits: ['Receive pickup requests', 'Manage capacity', 'Track impact', 'Build reputation'],
    color: 'border-orange-400 bg-orange-50 text-orange-600',
    active: 'ring-2 ring-orange-400',
  },
];

export default function OnboardingPage() {
  const { currentUser, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<'ORGANIZER' | 'RECOVERY_PARTNER' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleContinue() {
    if (!selected || !currentUser) return;
    setLoading(true);
    try {
      await setUserRole(currentUser.uid, selected);
      await refreshProfile();
      navigate(selected === 'ORGANIZER' ? '/dashboard' : '/partner-dashboard');
    } catch (e) {
      setError('Failed to save your role. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf5] dark:bg-[#0d1510] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <img src="/utsavcycle-logo.png" alt="UtsavCycle AI" className="w-16 h-16 rounded-full object-cover mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">How will you use UtsavCycle AI?</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Choose your role to get a tailored experience.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`text-left bg-white dark:bg-[#1a2018] rounded-2xl border-2 p-6 transition-all duration-150 hover:shadow-card-hover ${
                selected === role.id ? `border-current ${role.color} ${role.active}` : 'border-gray-100 dark:border-[#2a3828]'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${role.color}`}>
                {role.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">{role.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{role.desc}</p>
              <ul className="space-y-1.5">
                {role.benefits.map(b => (
                  <li key={b} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle size={14} className="text-brand-green shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              {selected === role.id && (
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-brand-green">
                  <CheckCircle size={14} /> Selected
                </div>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 text-center text-sm text-red-600 bg-red-50 rounded-xl py-3 px-4">{error}</div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleContinue}
          disabled={!selected}
          loading={loading}
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
