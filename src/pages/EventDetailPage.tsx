import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { ArrowLeft, Leaf, Truck } from 'lucide-react';
import { getEvent, updateEvent } from '../lib/firestore';
import type { Event } from '../types';
export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // Check localStorage first for local events
    if (id.startsWith('local_')) {
      try {
        const all = JSON.parse(localStorage.getItem('uc_events') || '[]');
        const found = all.find((e: any) => e.id === id) || null;
        setEvent(found);
      } catch { setEvent(null); }
      setLoading(false);
      return;
    }
    getEvent(id)
      .then(ev => {
        if (ev) { setEvent(ev); setLoading(false); return; }
        // Not in Firestore, check local
        const all = JSON.parse(localStorage.getItem('uc_events') || '[]');
        setEvent(all.find((e: any) => e.id === id) || null);
        setLoading(false);
      })
      .catch(() => {
        // Firestore error — try local
        try {
          const all = JSON.parse(localStorage.getItem('uc_events') || '[]');
          setEvent(all.find((e: any) => e.id === id) || null);
        } catch { setEvent(null); }
        setLoading(false);
      });
  }, [id]);

  async function handleActivate() {
    if (!event?.id) return;
    await updateEvent(event.id, { status: 'ACTIVE' });
    setEvent(prev => prev ? { ...prev, status: 'ACTIVE' } : prev);
  }

  if (loading) return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        {[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
      </div>
    </AppLayout>
  );

  if (!event) return (
    <AppLayout>
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-gray-500">Event not found.</p>
        <Link to="/events"><Button variant="outline" className="mt-4">Back to Events</Button></Link>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/events" className="text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-green-400">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{event.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{event.type} · {event.date} · {event.location}</p>
          </div>
          <div className="ml-auto"><StatusBadge status={event.status} /></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Guest Count', value: `${event.guestCount} guests` },
            { label: 'Duration', value: `${event.duration}h` },
            { label: 'Food Type', value: event.foodType || '—' },
            { label: 'Catering', value: event.cateringType || '—' },
            { label: 'Decoration', value: event.decorationType || '—' },
            { label: 'Status', value: <StatusBadge status={event.status} /> },
          ].map((row, i) => (
            <Card key={i} padding="sm">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{row.label}</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{row.value}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {event.status === 'DRAFT' && (
            <Button onClick={handleActivate}>Activate Event</Button>
          )}
          <Link to="/predict">
            <Button variant="outline" icon={<Leaf size={14} />}>Predict Waste</Button>
          </Link>
          <Link to="/partners">
            <Button variant="outline" icon={<Truck size={14} />}>Find Partners</Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
