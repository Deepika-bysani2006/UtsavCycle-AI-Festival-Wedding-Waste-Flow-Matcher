import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Users, Truck, BarChart2, ChevronDown, Star, Recycle, Heart, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

const stats = [
  { value: '2.4T', label: 'Waste Diverted', icon: <Recycle size={20} />, color: 'text-brand-green' },
  { value: '850+', label: 'Events Managed', icon: <Star size={20} />, color: 'text-brand-orange' },
  { value: '120+', label: 'Recovery Partners', icon: <Heart size={20} />, color: 'text-pink-500' },
  { value: '18', label: 'Cities Active', icon: <Globe size={20} />, color: 'text-blue-500' },
];

const features = [
  {
    icon: <Leaf size={24} />,
    title: 'AI Waste Prediction',
    desc: 'Predict waste quantities before your event with Gemini AI-powered analysis across food, flowers, plastic, fabric, and paper.',
    color: 'bg-primary-50 text-brand-green',
  },
  {
    icon: <Users size={24} />,
    title: 'Smart Partner Matching',
    desc: 'Get instantly matched with verified recovery partners based on waste type, capacity, proximity, and availability.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: <Truck size={24} />,
    title: 'Pickup Coordination',
    desc: 'Schedule and track pickups end-to-end. Get real-time status updates from request to completion.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <BarChart2 size={24} />,
    title: 'Impact Dashboard',
    desc: 'Measure your sustainability impact: CO₂ saved, meals rescued, waste diverted — all in one beautiful dashboard.',
    color: 'bg-purple-50 text-purple-600',
  },
];

const howItWorks = [
  { step: '01', title: 'Create Your Event', desc: 'Enter event details: type, guest count, duration, food and decoration preferences.' },
  { step: '02', title: 'Get AI Predictions', desc: 'Our Gemini-powered engine predicts waste categories and recommends reduction strategies.' },
  { step: '03', title: 'Match with Partners', desc: 'Get matched with nearby verified recovery partners that handle your specific waste types.' },
  { step: '04', title: 'Schedule Pickup', desc: 'Coordinate pickup logistics and track status from confirmed to completed in real time.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Wedding Organizer, Mumbai', text: 'UtsavCycle AI helped us divert 380 kg of floral waste from our wedding. The partner matching was seamless!', rating: 5 },
  { name: 'Rahul Mehta', role: 'Corporate Events, Bangalore', text: 'We now run zero-waste corporate events. The AI predictions are incredibly accurate — within 5% every time.', rating: 5 },
  { name: 'Anita Nair', role: 'FlowerLoop Recycling', text: 'As a recovery partner, UtsavCycle AI brings us quality leads and well-organised pickups. Highly recommended.', rating: 5 },
];

export default function LandingPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  function handleGetStarted() {
    if (currentUser) navigate('/dashboard');
    else navigate('/signup');
  }

  const faqs = [
    { q: 'What types of events does UtsavCycle AI support?', a: 'Weddings, corporate events, festivals, conferences, pujas, birthday parties, and any large gatherings that generate significant waste.' },
    { q: 'How accurate are the waste predictions?', a: 'Our Gemini AI model is trained on thousands of Indian events and delivers predictions within 5–10% accuracy for most event types.' },
    { q: 'Are the recovery partners verified?', a: 'Yes. All partner organisations go through a verification process before appearing in the matching system.' },
    { q: 'Is UtsavCycle AI free to use?', a: 'The core platform is free for event organisers. Premium analytics and advanced features are available on paid plans.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1510] font-sans transition-colors duration-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-[#1a2018]/95 backdrop-blur border-b border-gray-100 dark:border-[#2a3828] shadow-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/utsavcycle-logo.png" alt="UtsavCycle AI" className="w-10 h-10 rounded-full object-cover" />
              <span className="font-bold text-brand-green dark:text-green-400 text-lg">UtsavCycle AI</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
              <a href="#features" className="hover:text-brand-green dark:hover:text-green-400 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-brand-green dark:hover:text-green-400 transition-colors">How It Works</a>
              <a href="#testimonials" className="hover:text-brand-green dark:hover:text-green-400 transition-colors">Stories</a>
              <a href="#faq" className="hover:text-brand-green dark:hover:text-green-400 transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {currentUser ? (
                <Button onClick={() => navigate('/dashboard')} size="sm">Go to Dashboard</Button>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-green dark:hover:text-green-400 font-medium transition-colors">Sign in</Link>
                  <Button onClick={() => navigate('/signup')} size="sm">Get Started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-cream via-primary-50 to-white dark:from-[#132015] dark:via-[#0d1510] dark:to-[#162418] pt-20 pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-green-950/70 text-brand-green dark:text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-transparent dark:border-green-800/40">
                <Leaf size={12} /> AI-Powered Sustainability Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
                Turn Event Waste into{' '}
                <span className="text-brand-green dark:text-green-400">Community Resources</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                UtsavCycle AI uses Gemini-powered prediction and smart partner matching to divert event waste from landfills — feeding communities, recycling flowers, and building a circular economy across India.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={handleGetStarted} icon={<ArrowRight size={18} />}>
                  Start for Free
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                  See How It Works
                </Button>
              </div>
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">No credit card required · Free for organisers</p>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-green-900/40 dark:to-green-950/60 flex items-center justify-center shadow-2xl">
                  <img src="/utsavcycle-logo.png" alt="UtsavCycle AI" className="w-56 h-56 md:w-64 md:h-64 rounded-full object-cover" />
                </div>
                {/* floating cards */}
                <div className="absolute -top-4 -right-8 bg-white dark:bg-[#1a2018] rounded-2xl shadow-card-hover dark:shadow-none border border-gray-100 dark:border-[#2a3828] p-3 flex items-center gap-2">
                  <span className="text-lg">♻️</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">2.4 Tons</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Diverted today</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-8 bg-white dark:bg-[#1a2018] rounded-2xl shadow-card-hover dark:shadow-none border border-gray-100 dark:border-[#2a3828] p-3 flex items-center gap-2">
                  <span className="text-lg">🌱</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">96% Match</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Partner found</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-[#1a2018] py-12 border-y border-gray-100 dark:border-[#2a3828]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className={`flex justify-center mb-2 ${s.color}`}>{s.icon}</div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[#f8faf5] dark:bg-[#0d1510]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Everything You Need</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">A complete platform to manage event waste from prediction to pickup, powered by AI.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white dark:bg-[#1a2018] rounded-2xl p-6 shadow-card hover:shadow-card-hover dark:shadow-none border border-transparent dark:border-[#2a3828] transition-all duration-200">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>{f.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-[#1a2018]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">How It Works</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">From event creation to completed pickup in four simple steps.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-[#f8faf5] dark:bg-[#1f2d1d] rounded-2xl p-6 h-full border border-transparent dark:border-[#2a3828]">
                  <span className="text-4xl font-black text-primary-200 dark:text-green-800/80 block mb-3">{step.step}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10 text-gray-300 dark:text-gray-600">
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-brand-cream dark:bg-[#0d1510]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Loved by Organisers & Partners</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white dark:bg-[#1a2018] rounded-2xl p-6 shadow-card border border-transparent dark:border-[#2a3828]">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-brand-amber text-brand-amber" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white dark:bg-[#1a2018]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-100 dark:border-[#2a3828] rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#1f2d1d] transition-colors"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  {faq.q}
                  <ChevronDown size={16} className={`text-gray-400 dark:text-gray-500 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-[#2a3828] pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-green">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Make Your Event Sustainable?</h2>
          <p className="text-primary-200 mb-8">Join 850+ event organisers who are already turning waste into community resources.</p>
          <Button
            size="lg"
            className="bg-white text-brand-green hover:bg-primary-50"
            onClick={handleGetStarted}
            icon={<ArrowRight size={18} />}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/utsavcycle-logo.png" alt="" className="w-8 h-8 rounded-full object-cover opacity-80" />
              <span className="text-white font-bold text-sm">UtsavCycle AI</span>
            </div>
            <p className="text-xs">© 2025 UtsavCycle AI · Turn Event Waste into Community Resources</p>
            <div className="flex gap-4 text-xs">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
