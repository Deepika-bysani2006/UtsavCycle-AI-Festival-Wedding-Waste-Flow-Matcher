import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Truck, BarChart2, Plus, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { getEventsByOrganizer, getPickupRequestsByOrganizer } from '../lib/firestore';
import type { Event, PickupRequest } from '../types';

export default function OrganizerDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    // Load local events immediately as placeholder
    try {
      const localAll = JSON.parse(localStorage.getItem('uc_events') || '[]');
      const localEvs = localAll.filter((e: any) => e.organizerUid === uid);
      if (localEvs.length > 0) setEvents(localEvs);
    } catch { /* ignore */ }

    Promise.all([
      getEventsByOrganizer(uid),
      getPickupRequestsByOrganizer(uid),
    ]).then(([firestoreEvs, pk]) => {
      // Merge Firestore + local-only
      try {
        const localAll = JSON.parse(localStorage.getItem('uc_events') || '[]');
        const fsIds = new Set(firestoreEvs.map((e: any) => e.id));
        const localOnly = localAll.filter((e: any) => e.organizerUid === uid && !fsIds.has(e.id));
        setEvents([...firestoreEvs, ...localOnly]);
      } catch {
        setEvents(firestoreEvs);
      }
      setPickups(pk);
    }).catch(() => {
      // Firestore unavailable — keep local
    }).finally(() => setLoading(false));
  }, [currentUser]);

  const completedPickups = pickups.filter(p => p.status === 'COMPLETED').length;
  const totalWaste = pickups.reduce((s, p) => s + (p.totalKg || 0), 0);
  const co2Saved = Math.round(totalWaste * 0.7);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Hello, {userProfile?.name?.split(' ')[0] || 'Organizer'} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Here's your sustainability overview</p>
          </div>
          <Link to="/events/new">
            <Button icon={<Plus size={16} />}>New Event</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Events" value={events.length} icon={<Calendar size={18} />} color="green" />
          <StatCard label="Waste Diverted" value={`${totalWaste} kg`} icon={<Leaf size={18} />} color="green" />
          <StatCard label="CO₂ Saved" value={`${co2Saved} kg`} icon={<TrendingUp size={18} />} color="blue" />
          <StatCard label="Completed Pickups" value={completedPickups} icon={<Truck size={18} />} color="orange" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { to: '/events/new', icon: '📅', label: 'Create Event', sub: 'Add new event' },
            { to: '/predict', icon: '🤖', label: 'Predict Waste', sub: 'AI-powered analysis' },
            { to: '/partners', icon: '🤝', label: 'Find Partners', sub: 'Match waste to partners' },
            { to: '/assistant', icon: '💬', label: 'AI Assistant', sub: 'Get sustainability advice' },
          ].map(a => (
            <Link key={a.to} to={a.to}>
              <Card hover className="text-center">
                <div className="text-3xl mb-2">{a.icon}</div>
                 <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{a.label}</p>
                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{a.sub}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Events</h2>
              <Link to="/events" className="text-xs text-brand-green dark:text-green-400 hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-3">No events yet</p>
                <Link to="/events/new"><Button size="sm" variant="outline">Create your first event</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 4).map(ev => (
                  <Link key={ev.id} to={`/events/${ev.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1f2d1d] transition-colors">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{ev.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{ev.type} · {ev.guestCount} guests · {ev.date}</p>
                    </div>
                    <StatusBadge status={ev.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Pickups */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Pickup Requests</h2>
              <Link to="/pickups" className="text-xs text-brand-green dark:text-green-400 hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : pickups.length === 0 ? (
              <div className="text-center py-8">
                <Truck size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-3">No pickup requests</p>
                <Link to="/pickups/new"><Button size="sm" variant="outline">Request a pickup</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {pickups.slice(0, 4).map(pk => (
                  <div key={pk.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1f2d1d]">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{pk.wasteTypes?.join(', ')}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{pk.totalKg} kg · {pk.pickupDate}</p>
                    </div>
                    <StatusBadge status={pk.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Impact Summary */}
        <Card className="mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-50 dark:bg-green-900/20 rounded-xl text-brand-green dark:text-green-400"><BarChart2 size={20} /></div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Your Impact Summary</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Waste Diverted', value: `${totalWaste} kg`, icon: '♻️' },
              { label: 'CO₂ Prevented', value: `${co2Saved} kg`, icon: '🌿' },
              { label: 'Meals Rescued', value: `${Math.round(totalWaste * 0.3)}`, icon: '🍱' },
              { label: 'Trees Equivalent', value: `${Math.round(co2Saved / 21)}`, icon: '🌳' },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-[#f8faf5] dark:bg-[#1f2d1d] rounded-2xl">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
