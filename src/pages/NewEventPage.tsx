import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { createEvent } from '../lib/firestore';
import { AlertCircle } from 'lucide-react';

const eventTypes = [
  { value: '', label: 'Select event type' },
  { value: 'Wedding', label: 'Wedding' },
  { value: 'Corporate', label: 'Corporate Event' },
  { value: 'Festival', label: 'Festival / Mela' },
  { value: 'Puja', label: 'Puja / Religious Event' },
  { value: 'Birthday', label: 'Birthday Party' },
  { value: 'Conference', label: 'Conference / Seminar' },
  { value: 'Other', label: 'Other' },
];

const foodTypes = [
  { value: '', label: 'Select food type' },
  { value: 'Veg', label: 'Vegetarian' },
  { value: 'Non-Veg', label: 'Non-Vegetarian' },
  { value: 'Mixed', label: 'Mixed' },
];

const cateringTypes = [
  { value: '', label: 'Select catering type' },
  { value: 'In-house', label: 'In-house / Home Catering' },
  { value: 'External Caterer', label: 'External Caterer' },
  { value: 'Buffet', label: 'Buffet Service' },
  { value: 'Sit-down', label: 'Sit-down Meal' },
];

const decorationTypes = [
  { value: '', label: 'Select decoration type' },
  { value: 'Flowers', label: 'Fresh Flowers Only' },
  { value: 'Flowers + Fabric', label: 'Flowers + Fabric' },
  { value: 'Flowers + Plastic', label: 'Flowers + Plastic' },
  { value: 'Minimal', label: 'Minimal' },
  { value: 'Elaborate', label: 'Elaborate / Multi-category' },
];

/** Generate a local ID for offline-first usage */
function localId() {
  return 'local_' + Math.random().toString(36).slice(2, 10);
}

export default function NewEventPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', type: '', date: '', location: '',
    guestCount: '', duration: '', foodType: '',
    cateringType: '', decorationType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!form.name.trim()) { setError('Please enter an event name.'); return; }
    if (!form.type) { setError('Please select an event type.'); return; }
    if (!form.date) { setError('Please select an event date.'); return; }
    if (!form.location.trim()) { setError('Please enter a location.'); return; }
    if (!form.guestCount || parseInt(form.guestCount) < 1) { setError('Please enter a valid guest count.'); return; }
    if (!currentUser) { setError('You must be logged in.'); return; }

    setLoading(true);

    const eventData = {
      name: form.name.trim(),
      type: form.type,
      date: form.date,
      location: form.location.trim(),
      guestCount: parseInt(form.guestCount) || 0,
      duration: parseInt(form.duration) || 4,
      foodType: form.foodType || 'Mixed',
      cateringType: form.cateringType || 'External Caterer',
      decorationType: form.decorationType || 'Flowers + Fabric',
      organizerUid: currentUser.uid,
      status: 'DRAFT' as const,
    };

    try {
      // Try Firestore first
      const id = await createEvent(eventData);
      navigate(`/events/${id}`);
    } catch (firestoreErr: any) {
      // Firestore rules not yet deployed — save to localStorage so app works now
      const isPermissionError =
        firestoreErr?.code === 'permission-denied' ||
        firestoreErr?.message?.includes('permission') ||
        firestoreErr?.message?.includes('Missing or insufficient permissions');

      if (isPermissionError) {
        // Store locally and redirect
        const id = localId();
        const existing = JSON.parse(localStorage.getItem('uc_events') || '[]');
        existing.unshift({
          id,
          ...eventData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _local: true,
        });
        localStorage.setItem('uc_events', JSON.stringify(existing));
        navigate(`/events/${id}`);
      } else {
        setError('Failed to create event. Please check your connection and try again.');
        console.error('Event creation error:', firestoreErr);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Event</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Enter event details to get AI waste predictions</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Event Name *"
                placeholder="e.g. Sharma Wedding"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
              <Select
                label="Event Type *"
                options={eventTypes}
                value={form.type}
                onChange={e => set('type', e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Event Date *"
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
              <Input
                label="Location / City *"
                placeholder="e.g. Mumbai"
                value={form.location}
                onChange={e => set('location', e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Guest Count *"
                type="number"
                placeholder="200"
                min="1"
                value={form.guestCount}
                onChange={e => set('guestCount', e.target.value)}
              />
              <Input
                label="Duration (hours)"
                type="number"
                placeholder="6"
                min="1"
                value={form.duration}
                onChange={e => set('duration', e.target.value)}
              />
            </div>

            <Select
              label="Food Type"
              options={foodTypes}
              value={form.foodType}
              onChange={e => set('foodType', e.target.value)}
            />

            <Select
              label="Catering Type"
              options={cateringTypes}
              value={form.cateringType}
              onChange={e => set('cateringType', e.target.value)}
            />

            <Select
              label="Decoration Type"
              options={decorationTypes}
              value={form.decorationType}
              onChange={e => set('decorationType', e.target.value)}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/events')}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Create Event
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
