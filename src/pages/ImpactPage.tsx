import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, StatCard } from '../components/ui/Card';
import { BarChart2, Leaf, TrendingUp, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPickupRequestsByOrganizer } from '../lib/firestore';
import type { PickupRequest } from '../types';

function mergeLocalPickups(firestorePickups: PickupRequest[], uid: string): PickupRequest[] {
  try {
    const all = JSON.parse(localStorage.getItem('uc_pickups') || '[]');
    const local = all.filter((p: any) => p.organizerUid === uid);
    const fsIds = new Set(firestorePickups.map(p => p.id));
    const localOnly = local.filter((p: any) => !fsIds.has(p.id));
    return [...firestorePickups, ...localOnly];
  } catch { return firestorePickups; }
}

export default function ImpactPage() {
  const { currentUser } = useAuth();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    // Show local immediately
    try {
      const all = JSON.parse(localStorage.getItem('uc_pickups') || '[]');
      setPickups(all.filter((p: any) => p.organizerUid === uid));
    } catch { /* ignore */ }

    getPickupRequestsByOrganizer(uid)
      .then(fp => setPickups(mergeLocalPickups(fp, uid)))
      .catch(() => { /* keep local */ })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const completed = pickups.filter(p => p.status === 'COMPLETED');
  const totalKg = completed.reduce((s, p) => s + (p.totalKg || 0), 0);
  const co2 = Math.round(totalKg * 0.7);
  const meals = Math.round(totalKg * 0.3);
  const trees = Math.round(co2 / 21);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Impact Report</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Your sustainability impact across all events</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Waste Diverted" value={`${totalKg} kg`} icon={<Leaf size={18} />} color="green" />
          <StatCard label="CO₂ Prevented" value={`${co2} kg`} icon={<TrendingUp size={18} />} color="blue" />
          <StatCard label="Meals Rescued" value={meals} icon={<Heart size={18} />} color="orange" />
          <StatCard label="Trees Equivalent" value={trees} icon={<BarChart2 size={18} />} color="purple" />
        </div>

        <Card className="mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Completed Pickups</h2>
          {loading ? (
            <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : completed.length === 0 ? (
            <div className="text-center py-12">
              <BarChart2 size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-500">No completed pickups yet.</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Complete a pickup to see your impact here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completed.map(pk => (
                <div key={pk.id} className="flex items-center justify-between p-4 bg-primary-50 dark:bg-green-900/20 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{pk.wasteTypes?.join(', ')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{pk.pickupDate} · {pk.pickupAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-green dark:text-green-400">{pk.totalKg} kg</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">diverted</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Impact equivalence */}
        <Card>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">What This Means</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '🌳', title: 'Carbon Equivalent', value: `${trees} trees planted`, desc: `${co2} kg CO₂ prevented from landfill decomposition` },
              { icon: '🍱', title: 'Food Rescued', value: `${meals} meals`, desc: 'Redirected to local food banks and shelters' },
              { icon: '💧', title: 'Water Saved', value: `${Math.round(totalKg * 1.5)} L`, desc: 'Water saved by composting vs landfill' },
            ].map((item, i) => (
              <div key={i} className="bg-[#f8faf5] dark:bg-[#1f2d1d] rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2">{item.icon}</div>
                <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">{item.value}</p>
                <p className="text-xs font-semibold text-brand-green dark:text-green-400 mb-1">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
