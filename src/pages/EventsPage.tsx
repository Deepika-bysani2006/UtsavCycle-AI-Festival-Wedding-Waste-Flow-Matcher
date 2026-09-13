import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, ArrowRight } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { getEventsByOrganizer } from '../lib/firestore';
import type { Event } from '../types';

function getLocalEvents(uid: string): Event[] {
  try {
    const all = JSON.parse(localStorage.getItem('uc_events') || '[]');
    return all.filter((e: any) => e.organizerUid === uid);
  } catch { return []; }
}

export default function EventsPage() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    // Load local events immediately
    const local = getLocalEvents(currentUser.uid);
    if (local.length > 0) setEvents(local);

    getEventsByOrganizer(currentUser.uid)
      .then(firestoreEvents => {
        // Merge: Firestore events take priority; keep local-only ones
        const firestoreIds = new Set(firestoreEvents.map(e => e.id));
        const localOnly = getLocalEvents(currentUser.uid).filter(e => !firestoreIds.has(e.id));
        setEvents([...firestoreEvents, ...localOnly]);
      })
      .catch(() => {
        // Firestore unavailable — use local only
        setEvents(getLocalEvents(currentUser.uid));
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Events</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''} created</p>
          </div>
          <Link to="/events/new"><Button icon={<Plus size={16} />}>New Event</Button></Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : events.length === 0 ? (
          <Card className="text-center py-16">
            <Calendar size={48} className="text-gray-200 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">No events yet</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Create your first event to start predicting waste and finding partners.</p>
            <Link to="/events/new"><Button>Create Your First Event</Button></Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map(ev => (
              <Link key={ev.id} to={`/events/${ev.id}`}>
                <Card hover className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-green-900/20 flex items-center justify-center text-brand-green text-xl">
                      {ev.type === 'Wedding' ? '💍' : ev.type === 'Corporate' ? '🏢' : '🎉'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{ev.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{ev.type} · {ev.guestCount} guests · {ev.date}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{ev.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={ev.status} />
                    <ArrowRight size={16} className="text-gray-300 dark:text-gray-600" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
