import { useEffect, useState } from 'react';
import { Truck, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, StatCard } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { getPickupRequestsByPartner, updatePickupStatus } from '../lib/firestore';
import type { PickupRequest } from '../types';

export default function PartnerDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getPickupRequestsByPartner(currentUser.uid)
      .then(setPickups)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser]);

  async function handleAccept(id: string) {
    if (!currentUser) return;
    await updatePickupStatus(id, 'CONFIRMED', currentUser.uid);
    setPickups(prev => prev.map(p => p.id === id ? { ...p, status: 'CONFIRMED' } : p));
  }

  async function handleComplete(id: string) {
    if (!currentUser) return;
    await updatePickupStatus(id, 'COMPLETED', currentUser.uid);
    setPickups(prev => prev.map(p => p.id === id ? { ...p, status: 'COMPLETED' } : p));
  }

  const pending = pickups.filter(p => p.status === 'PENDING' || p.status === 'MATCHED').length;
  const confirmed = pickups.filter(p => p.status === 'CONFIRMED' || p.status === 'IN_PROGRESS').length;
  const completed = pickups.filter(p => p.status === 'COMPLETED').length;
  const totalKg = pickups.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + (p.totalKg || 0), 0);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Hello, {userProfile?.name?.split(' ')[0] || 'Partner'} ♻️
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Your recovery partner dashboard</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Pending Requests" value={pending} icon={<Clock size={18} />} color="orange" />
          <StatCard label="In Progress" value={confirmed} icon={<Truck size={18} />} color="blue" />
          <StatCard label="Completed" value={completed} icon={<CheckCircle size={18} />} color="green" />
          <StatCard label="Total Recovered" value={`${totalKg} kg`} icon={<TrendingUp size={18} />} color="purple" />
        </div>

        <Card>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Pickup Requests Assigned to You</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : pickups.length === 0 ? (
            <div className="text-center py-12">
              <Truck size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-500">No pickup requests assigned yet.</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">You'll appear here once organisers match you.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pickups.map(pk => (
                <div key={pk.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 dark:border-[#2a3828] hover:bg-gray-50 dark:hover:bg-[#1f2d1d] transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{pk.wasteTypes?.join(', ')}</p>
                      <StatusBadge status={pk.status} />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{pk.totalKg} kg · {pk.pickupAddress} · {pk.pickupDate}</p>
                  </div>
                  <div className="flex gap-2">
                    {(pk.status === 'PENDING' || pk.status === 'MATCHED') && (
                      <Button size="sm" onClick={() => handleAccept(pk.id)}>Accept</Button>
                    )}
                    {pk.status === 'CONFIRMED' && (
                      <Button size="sm" variant="secondary" onClick={() => handleComplete(pk.id)}>Mark Complete</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
