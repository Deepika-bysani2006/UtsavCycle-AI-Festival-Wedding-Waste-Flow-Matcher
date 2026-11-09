import { useState } from 'react';
import { Calendar, Recycle, CheckCircle, X } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export type SelectedRole = 'ORGANIZER' | 'RECOVERY_PARTNER';

interface RoleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (role: SelectedRole) => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

export function RoleSelectModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = 'Which login do you want?',
  subtitle = 'Choose your account type to continue with Google:',
}: RoleSelectModalProps) {
  const [role, setRole] = useState<SelectedRole>('ORGANIZER');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#1a2018] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-[#2a3828] text-gray-900 dark:text-gray-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-[#1f2d1d] transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-green-950/70 text-brand-green dark:text-green-300 mb-3 border border-transparent dark:border-green-800/40">
            Account Type
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>

        {/* Role Options */}
        <div className="space-y-3 mb-6">
          {/* Event Organizer Option */}
          <div
            onClick={() => !loading && setRole('ORGANIZER')}
            className={clsx(
              'flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150',
              role === 'ORGANIZER'
                ? 'border-brand-green bg-primary-50/70 dark:bg-green-950/40 shadow-sm'
                : 'border-gray-200 dark:border-[#2a3828] hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-[#1f2d1d]/60'
            )}
          >
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl',
              role === 'ORGANIZER'
                ? 'bg-brand-green text-white'
                : 'bg-primary-50 dark:bg-green-900/20 text-brand-green dark:text-green-400'
            )}>
              <Calendar size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-base text-gray-900 dark:text-gray-100">
                  🎪 Event Organizer
                </span>
                {role === 'ORGANIZER' && (
                  <CheckCircle size={18} className="text-brand-green dark:text-green-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                For individuals & planners organizing weddings, festivals, pujas, parties, or corporate events.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1a2018] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-[#2a3828]">
                  AI Waste Predictions
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1a2018] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-[#2a3828]">
                  Find Recyclers
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1a2018] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-[#2a3828]">
                  Pickup Requests
                </span>
              </div>
            </div>
          </div>

          {/* Recovery Partner / Supplier Option */}
          <div
            onClick={() => !loading && setRole('RECOVERY_PARTNER')}
            className={clsx(
              'flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150',
              role === 'RECOVERY_PARTNER'
                ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 shadow-sm'
                : 'border-gray-200 dark:border-[#2a3828] hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-[#1f2d1d]/60'
            )}
          >
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl',
              role === 'RECOVERY_PARTNER'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
            )}>
              <Recycle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-base text-gray-900 dark:text-gray-100">
                  ♻️ Recovery Partner / Supplier
                </span>
                {role === 'RECOVERY_PARTNER' && (
                  <CheckCircle size={18} className="text-orange-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                For NGOs, composting units, floral/plastic recyclers, or waste recovery suppliers.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1a2018] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-[#2a3828]">
                  Accept Pickups
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1a2018] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-[#2a3828]">
                  Manage Capacity
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1a2018] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-[#2a3828]">
                  Track Recovery
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          type="button"
          onClick={() => onConfirm(role)}
          loading={loading}
          className={clsx(
            'w-full py-3 text-base flex items-center justify-center gap-3',
            role === 'RECOVERY_PARTNER'
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-brand-green hover:bg-brand-green-dark text-white'
          )}
        >
          {!loading && GOOGLE_ICON}
          <span>
            Continue with Google as{' '}
            <strong>{role === 'RECOVERY_PARTNER' ? 'Supplier' : 'Organizer'}</strong>
          </span>
        </Button>

        {/* Secondary close button */}
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
