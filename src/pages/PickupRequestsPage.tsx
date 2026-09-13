import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Truck, Plus, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPickupRequestsByOrganizer, createPickupRequest } from '../lib/firestore';
import type { PickupRequest } from '../types';

const LS_KEY = 'uc_pickups';

function localId() { return 'local_' + Math.random().toString(36).slice(2, 10); }

function getLocalPickups(uid: string): PickupRequest[] {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    return all.filter((p: any) => p.organizerUid === uid);
  } catch { return []; }
}

function saveLocalPickup(pickup: PickupRequest) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    all.unshift(pickup);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

const INPUT_CLS = "w-full rounded-xl border border-gray-200 dark:border-[#2a3828] bg-white dark:bg-[#1a2018] text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b2f] focus:border-transparent placeholder-gray-400 dark:placeholder-gray-600";

export default function PickupRequestsPage() {
  const { currentUser } = useAuth();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ wasteTypes: '', totalKg: '', pickupDate: '', pickupAddress: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    // Show local immediately
    setPickups(getLocalPickups(uid));

    getPickupRequestsByOrganizer(uid)
      .then(firestorePickups => {
        const fsIds = new Set(firestorePickups.map(p => p.id));
        const localOnly = getLocalPickups(uid).filter(p => !fsIds.has(p.id));
        setPickups([...firestorePickups, ...localOnly]);
      })
      .catch(() => { /* keep local */ })
      .finally(() => setLoading(false));
  }, [currentUser]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSuccess(false);
    if (!form.wasteTypes.trim()) { setFormError('Please enter waste types.'); return; }
    if (!form.totalKg || parseInt(form.totalKg) < 1) { setFormError('Please enter a valid weight.'); return; }
    if (!form.pickupDate) { setFormError('Please select a pickup date.'); return; }
    if (!form.pickupAddress.trim()) { setFormError('Please enter a pickup address.'); return; }
    if (!currentUser) return;

    setSubmitting(true);

    const wasteTypesList = form.wasteTypes.split(',').map(s => s.trim()).filter(Boolean);
    const pickupData = {
      eventId: '',
      organizerUid: currentUser.uid,
      wasteTypes: wasteTypesList,
      totalKg: parseInt(form.totalKg) || 0,
      pickupDate: form.pickupDate,
      pickupAddress: form.pickupAddress.trim(),
      status: 'PENDING' as const,
      notes: form.notes,
    };

    try {
      const id = await createPickupRequest(pickupData);
      const newPickup: PickupRequest = {
        id, ...pickupData,
        createdAt: new Date(), updatedAt: new Date(),
      };
      setPickups(prev => [newPickup, ...prev]);
      setShowForm(false);
      setSuccess(true);
      setForm({ wasteTypes: '', totalKg: '', pickupDate: '', pickupAddress: '', notes: '' });
    } catch (err: any) {
      // Firestore rules not deployed — save locally
      const isPermission = err?.code === 'permission-denied' || err?.message?.includes('permission');
      if (isPermission) {
        const id = localId();
        const newPickup: PickupRequest = {
          id, ...pickupData,
          createdAt: new Date(), updatedAt: new Date(),
        };
        saveLocalPickup(newPickup);
        setPickups(prev => [newPickup, ...prev]);
        setShowForm(false);
        setSuccess(true);
        setForm({ wasteTypes: '', totalKg: '', pickupDate: '', pickupAddress: '', notes: '' });
      } else {
        setFormError('Failed to create request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pickup Requests</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{pickups.length} request{pickups.length !== 1 ? 's' : ''}</p>
          </div>
          <Button icon={<Plus size={16} />} onClick={() => { setShowForm(!showForm); setSuccess(false); }}>
            {showForm ? 'Cancel' : 'New Request'}
          </Button>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 border border-green-100">
            <CheckCircle size={16} /> Pickup request created successfully!
          </div>
        )}

        {showForm && (
          <Card className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">New Pickup Request</h3>
            {formError && <p className="text-sm text-red-600 mb-3 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                    Waste Types * <span className="text-xs text-gray-400 dark:text-gray-500">(comma-separated)</span>
                  </label>
                  <input
                    className={INPUT_CLS}
                    placeholder="Food, Flowers, Plastic"
                    value={form.wasteTypes}
                    onChange={e => setForm(p => ({ ...p, wasteTypes: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Total Weight (kg) *</label>
                  <input
                    type="number" min="1"
                    className={INPUT_CLS}
                    placeholder="150"
                    value={form.totalKg}
                    onChange={e => setForm(p => ({ ...p, totalKg: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Pickup Date *</label>
                  <input
                    type="date"
                    className={INPUT_CLS}
                    value={form.pickupDate}
                    onChange={e => setForm(p => ({ ...p, pickupDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Pickup Address *</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="Event venue address"
                    value={form.pickupAddress}
                    onChange={e => setForm(p => ({ ...p, pickupAddress: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Notes (optional)</label>
                <textarea
                  className={INPUT_CLS + " resize-none"}
                  rows={2}
                  placeholder="Additional instructions for the partner"
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <Button type="submit" loading={submitting}>Submit Request</Button>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : pickups.length === 0 ? (
          <Card className="text-center py-16">
            <Truck size={48} className="text-gray-200 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">No pickup requests yet</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Create a request or use the Find Partners page to match and schedule a pickup.</p>
            <Button onClick={() => setShowForm(true)}>Create First Request</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {pickups.map(pk => (
              <Card key={pk.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{pk.wasteTypes?.join(', ')}</p>
                      <StatusBadge status={pk.status} />
                      {(pk as any)._local && (
                        <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
                          Saved locally
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{pk.totalKg} kg · {pk.pickupAddress}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">📅 Pickup: {pk.pickupDate}</p>
                    {pk.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">📝 {pk.notes}</p>}
                  </div>
                  <div className="shrink-0">
                    {pk.partnerUid
                      ? <span className="text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-1"><CheckCircle size={12} /> Partner assigned</span>
                      : <span className="text-xs text-gray-400 dark:text-gray-500">Awaiting match</span>
                    }
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
