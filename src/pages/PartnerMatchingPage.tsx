import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MapPin, Truck, CheckCircle, Info } from 'lucide-react';
import { createPickupRequest } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';

// Demo partners — clearly marked
const DEMO_PARTNERS = [
  {
    id: 'demo-1',
    orgName: 'FlowerLoop Recycling',
    wasteTypes: ['Flowers', 'Fabric'],
    capacityKg: 500,
    location: 'Andheri West, Mumbai',
    distance: 4.2,
    matchScore: 96,
    available: true,
    isDemo: true,
    description: 'Converts floral waste into compost, potpourri, and organic dyes.',
    tags: ['🌸 Flowers', '🎀 Fabric'],
  },
  {
    id: 'demo-2',
    orgName: 'GreenMeal Foundation',
    wasteTypes: ['Food'],
    capacityKg: 300,
    location: 'Dadar, Mumbai',
    distance: 6.8,
    matchScore: 91,
    available: true,
    isDemo: true,
    description: 'Rescues surplus cooked food and distributes to urban shelters.',
    tags: ['🍱 Food'],
  },
  {
    id: 'demo-3',
    orgName: 'PaperCycle India',
    wasteTypes: ['Paper', 'Cardboard'],
    capacityKg: 800,
    location: 'Goregaon, Mumbai',
    distance: 9.1,
    matchScore: 84,
    available: true,
    isDemo: true,
    description: 'Paper and cardboard recycling with certified weight receipts.',
    tags: ['📄 Paper', '📦 Cardboard'],
  },
  {
    id: 'demo-4',
    orgName: 'CleanPlast Recyclers',
    wasteTypes: ['Plastic'],
    capacityKg: 400,
    location: 'Malad East, Mumbai',
    distance: 11.3,
    matchScore: 78,
    available: false,
    isDemo: true,
    description: 'PET and HDPE plastic granulation unit. Currently at capacity.',
    tags: ['♻️ Plastic'],
  },
];

export default function PartnerMatchingPage() {
  const { currentUser } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [wasteKg, setWasteKg] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');

  async function handleRequestPickup(partnerId: string) {
    if (!currentUser) return;
    if (!pickupDate || !wasteKg || !address) {
      setFormError('Please fill in pickup date, waste kg, and address.');
      return;
    }
    setFormError('');
    setRequesting(true);
    const partner = DEMO_PARTNERS.find(p => p.id === partnerId);
    const requestData = {
      eventId: '',
      organizerUid: currentUser.uid,
      partnerUid: partnerId,
      wasteTypes: partner?.wasteTypes || [],
      totalKg: parseInt(wasteKg) || 0,
      pickupDate,
      pickupAddress: address,
      status: 'PENDING' as const,
      notes: `Matched with ${partner?.orgName} (demo)`,
    };
    try {
      await createPickupRequest(requestData);
      setRequested(partnerId);
      setSelected(null);
    } catch (err: any) {
      const isPermission = err?.code === 'permission-denied' || err?.message?.includes('permission');
      if (isPermission) {
        // Save locally — Firestore rules not deployed yet
        try {
          const id = 'local_' + Math.random().toString(36).slice(2, 10);
          const all = JSON.parse(localStorage.getItem('uc_pickups') || '[]');
          all.unshift({ id, ...requestData, status: 'MATCHED', _local: true, createdAt: new Date().toISOString() });
          localStorage.setItem('uc_pickups', JSON.stringify(all));
        } catch { /* ignore */ }
        setRequested(partnerId);
        setSelected(null);
      } else {
        setFormError('Failed to create pickup request. Please try again.');
      }
    } finally {
      setRequesting(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Find Recovery Partners</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Smart matching based on waste type, capacity, and proximity</p>
          <div className="mt-3 flex items-center gap-2 bg-amber-50 text-amber-700 text-xs px-3 py-2 rounded-xl border border-amber-100 w-fit">
            <Info size={12} /> Demo partners shown — replace with real verified organisations
          </div>
        </div>

        <div className="space-y-4">
          {DEMO_PARTNERS.map(partner => (
            <Card key={partner.id} className={`transition-all duration-150 ${requested === partner.id ? 'border-brand-green' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{partner.orgName}</h3>
                    <Badge color={partner.available ? 'green' : 'red'}>
                      {partner.available ? '● Available' : '● Full'}
                    </Badge>
                    {partner.isDemo && <Badge color="gray" size="sm">Demo</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{partner.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {partner.tags.map(tag => (
                      <span key={tag} className="text-xs bg-primary-50 dark:bg-green-900/20 text-brand-green dark:text-green-400 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {partner.location}</span>
                    <span>📏 {partner.distance} km away</span>
                    <span>⚖️ Capacity: {partner.capacityKg} kg</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-black text-brand-green dark:text-green-400">{partner.matchScore}%</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Match score</p>
                  </div>
                  {requested === partner.id ? (
                    <div className="flex items-center gap-1 text-sm text-brand-green font-medium">
                      <CheckCircle size={16} /> Requested
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      disabled={!partner.available}
                      onClick={() => setSelected(selected === partner.id ? null : partner.id)}
                      variant={selected === partner.id ? 'secondary' : 'primary'}
                    >
                      {selected === partner.id ? 'Cancel' : 'Request Pickup'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Pickup form */}
              {selected === partner.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#2a3828]">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2"><Truck size={14} /> Schedule Pickup</h4>
                  {formError && <p className="text-xs text-red-600 mb-2">{formError}</p>}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Pickup Date *</label>
                      <input type="date" className="w-full rounded-xl border border-gray-200 dark:border-[#2a3828] bg-white dark:bg-[#1a2018] text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" value={pickupDate} onChange={e => setPickupDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Waste (kg) *</label>
                      <input type="number" placeholder="55" className="w-full rounded-xl border border-gray-200 dark:border-[#2a3828] bg-white dark:bg-[#1a2018] text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" value={wasteKg} onChange={e => setWasteKg(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Pickup Address *</label>
                      <input type="text" placeholder="Event venue address" className="w-full rounded-xl border border-gray-200 dark:border-[#2a3828] bg-white dark:bg-[#1a2018] text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                  </div>
                  <Button className="mt-3" size="sm" loading={requesting} onClick={() => handleRequestPickup(partner.id)}>
                    Confirm Request
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
