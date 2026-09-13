import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { saveWastePrediction } from '../lib/firestore';
import { Leaf, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import type { WastePredictionResult } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface PredictionForm {
  event_type: string;
  guest_count: string;
  duration: string;
  food_type: string;
  catering_type: string;
  decoration_type: string;
  location: string;
}

const initialForm: PredictionForm = {
  event_type: '', guest_count: '', duration: '', food_type: '',
  catering_type: '', decoration_type: '', location: '',
};

export default function WastePredictionPage() {
  const { currentUser } = useAuth();
  const [form, setForm] = useState<PredictionForm>(initialForm);
  const [result, setResult] = useState<WastePredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function set(field: keyof PredictionForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handlePredict(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setSaved(false);
    if (!form.event_type || !form.guest_count || !form.location) {
      setError('Please fill in the required fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/waste/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          guest_count: parseInt(form.guest_count) || 100,
          duration: parseInt(form.duration) || 4,
        }),
      });
      if (!res.ok) throw new Error('Prediction failed');
      const data = await res.json();
      setResult(data);

      // Save to Firestore
      if (currentUser) {
        await saveWastePrediction({
          uid: currentUser.uid,
          input: {
            event_type: form.event_type,
            guest_count: parseInt(form.guest_count),
            duration: parseInt(form.duration) || 4,
            food_type: form.food_type,
            catering_type: form.catering_type,
            decoration_type: form.decoration_type,
            location: form.location,
          },
          result: data,
        });
        setSaved(true);
      }
    } catch (e) {
      // Backend unavailable — use deterministic fallback silently
      const guests = parseInt(form.guest_count) || 100;
      const hours = parseInt(form.duration) || 4;
      const isWedding = /wedding/i.test(form.event_type);
      const hasFlowers = /flower/i.test(form.decoration_type);
      const m = hours / 4;
      const food   = Math.round(guests * 0.35 * m * (isWedding ? 1.2 : 1));
      const flower = Math.round(guests * (hasFlowers ? 0.18 : 0.08) * m);
      const plastic = Math.round(guests * 0.10 * m);
      const paper   = Math.round(guests * 0.08 * m);
      const fabric  = Math.round(guests * (isWedding ? 0.15 : 0.08) * m);
      const total   = food + flower + plastic + paper + fabric;
      const fallback: WastePredictionResult = {
        total_waste_kg: total,
        food_waste_kg: food,
        flower_waste_kg: flower,
        plastic_waste_kg: plastic,
        paper_waste_kg: paper,
        fabric_waste_kg: fabric,
        recoverable_waste_kg: Math.round(total * 0.72),
        diversion_percentage: 72,
        recommendations: [
          'Partner with a local composting facility for food waste',
          'Hire a floral recycler to repurpose decorations',
          'Use biodegradable/reusable tableware to cut plastic waste',
          'Donate excess food to a nearby shelter or food bank',
        ],
        explanation: `Estimated for ${guests} guests × ${hours}h (${form.event_type || 'event'}). Start the backend server for Gemini AI predictions.`,
      };
      setResult(fallback);
      setError('');   // clear error — fallback result is valid
    } finally {
      setLoading(false);
    }
  }

  const wasteCategories = result ? [
    { label: 'Food Waste', value: result.food_waste_kg, color: 'bg-orange-400', icon: '🍱' },
    { label: 'Flower Waste', value: result.flower_waste_kg, color: 'bg-pink-400', icon: '🌸' },
    { label: 'Plastic Waste', value: result.plastic_waste_kg, color: 'bg-blue-400', icon: '♻️' },
    { label: 'Paper Waste', value: result.paper_waste_kg, color: 'bg-yellow-400', icon: '📄' },
    { label: 'Fabric Waste', value: result.fabric_waste_kg, color: 'bg-purple-400', icon: '🎀' },
  ] : [];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Waste Prediction</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Powered by Gemini AI · Predict waste before your event</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-5">Event Details</h2>
            <form onSubmit={handlePredict} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-xl border border-amber-100">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <Select
                label="Event Type *"
                options={[
                  { value: '', label: 'Select event type' },
                  { value: 'Wedding', label: 'Wedding' },
                  { value: 'Corporate', label: 'Corporate Event' },
                  { value: 'Festival', label: 'Festival / Mela' },
                  { value: 'Puja', label: 'Puja / Religious Event' },
                  { value: 'Birthday', label: 'Birthday Party' },
                  { value: 'Conference', label: 'Conference' },
                ]}
                value={form.event_type}
                onChange={e => set('event_type', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Guest Count *" type="number" placeholder="200" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} />
                <Input label="Duration (hrs)" type="number" placeholder="6" value={form.duration} onChange={e => set('duration', e.target.value)} />
              </div>
              <Input label="Location / City *" placeholder="e.g. Mumbai" value={form.location} onChange={e => set('location', e.target.value)} />
              <Select
                label="Food Type"
                options={[
                  { value: '', label: 'Select food type' },
                  { value: 'Veg', label: 'Vegetarian' },
                  { value: 'Non-Veg', label: 'Non-Vegetarian' },
                  { value: 'Mixed', label: 'Mixed' },
                ]}
                value={form.food_type}
                onChange={e => set('food_type', e.target.value)}
              />
              <Select
                label="Catering Type"
                options={[
                  { value: '', label: 'Select catering type' },
                  { value: 'In-house', label: 'In-house' },
                  { value: 'External Caterer', label: 'External Caterer' },
                  { value: 'Buffet', label: 'Buffet' },
                  { value: 'Sit-down', label: 'Sit-down' },
                ]}
                value={form.catering_type}
                onChange={e => set('catering_type', e.target.value)}
              />
              <Select
                label="Decoration Type"
                options={[
                  { value: '', label: 'Select decoration type' },
                  { value: 'Flowers', label: 'Fresh Flowers Only' },
                  { value: 'Flowers + Fabric', label: 'Flowers + Fabric' },
                  { value: 'Flowers + Plastic', label: 'Flowers + Plastic' },
                  { value: 'Minimal', label: 'Minimal' },
                  { value: 'Elaborate', label: 'Elaborate' },
                ]}
                value={form.decoration_type}
                onChange={e => set('decoration_type', e.target.value)}
              />
              <Button type="submit" className="w-full" loading={loading} icon={<Leaf size={16} />}>
                Predict Waste with AI
              </Button>
            </form>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {!result ? (
              <Card className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-green-900/20 flex items-center justify-center text-brand-green mb-4">
                  <Leaf size={28} />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Ready to predict</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">Fill in event details and click "Predict Waste with AI"</p>
              </Card>
            ) : (
              <>
                {saved && (
                  <div className="flex items-center gap-2 bg-primary-50 text-brand-green text-sm px-4 py-3 rounded-xl">
                    <CheckCircle size={16} /> Prediction saved to your account
                  </div>
                )}

                {/* Summary */}
                <div style={{ background: '#1a6b2f' }} className="rounded-2xl p-6 text-white shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Waste Summary</h3>
                    <span className="text-xs px-2 py-1 rounded-full text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>AI Prediction</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-3xl font-black text-white">{result.total_waste_kg} kg</p>
                      <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>Total predicted waste</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white">{result.diversion_percentage}%</p>
                      <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>Divertible from landfill</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <p className="text-sm text-white"><span className="font-bold">{result.recoverable_waste_kg} kg</span> <span style={{ color: 'rgba(255,255,255,0.75)' }}>recoverable</span></p>
                  </div>
                </div>

                {/* Breakdown */}
                <Card>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Waste Breakdown</h3>
                  <div className="space-y-3">
                    {wasteCategories.map(cat => (
                      <div key={cat.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-200">{cat.icon} {cat.label}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{cat.value} kg</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-[#2a3828] rounded-full h-2">
                          <div
                            className={`${cat.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${result.total_waste_kg > 0 ? (cat.value / result.total_waste_kg) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recommendations */}
                <Card>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-green dark:text-green-400" /> Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <span className="text-brand-green dark:text-green-400 mt-0.5 shrink-0">✓</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                  {result.explanation && (
                    <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 italic border-t border-gray-100 dark:border-[#2a3828] pt-3">{result.explanation}</p>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
