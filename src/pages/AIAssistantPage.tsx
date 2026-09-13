import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { saveChatMessage, createChatSession } from '../lib/firestore';
import type { ChatMessage } from '../types';
import { clsx } from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getBuiltInAnswer(q: string): string {
  const t = q.toLowerCase();
  if (t.includes('flower') || t.includes('floral')) return `**Flower Waste Management** 🌸

Flowers from events can be repurposed in several ways:
• **Composting** — Fresh flowers break down quickly into rich compost
• **Potpourri & natural dyes** — Dried petals are used in eco-products
• **Temple/donation** — Many temples accept offered flowers for reuse
• **Floral recyclers** — Organisations like FlowerLoop collect post-event flowers

Use the **Find Partners** page to connect with a floral recycler near you!`;

  if (t.includes('food') || t.includes('meal') || t.includes('catering')) return `**Food Waste Reduction** 🍱

Best practices for event food waste:
• **Pre-order accurately** — Use the AI Waste Prediction to estimate food quantities
• **Donate surplus** — Contact local food banks or NGOs before the event ends
• **Compost wet waste** — Cooked food waste can be composted within 24 hours
• **Track quantities** — Record what was left to improve future event planning
• **Serve in phases** — Buffets served in smaller batches reduce overall waste

The **AI Prediction tool** helps you order the right amount!`;

  if (t.includes('plastic')) return `**Plastic Waste Management** ♻️

Handling plastic at events:
• **PET bottles** — Highly recyclable, keep separate and dry
• **HDPE containers** — Recyclable; avoid mixing with food waste
• **Single-use cutlery** — Replace with biodegradable or reusable alternatives
• **Decoration plastic** — Segregate and send to plastic granulation units
• **Avoid** — Balloons, thermocol, PVC items are difficult to recycle

Tip: switching to leaf plates and bamboo cutlery can cut plastic waste by 60%!`;

  if (t.includes('pickup') || t.includes('collect') || t.includes('schedule')) return `**Pickup & Collection Process** 🚛

How the pickup process works on UtsavCycle AI:
1. **Create Event** → Enter your event details
2. **Get Prediction** → AI estimates waste categories and quantities
3. **Find Partners** → Get matched with recovery partners near you
4. **Request Pickup** → Select a partner and schedule the pickup date
5. **Track Status** → Monitor from Pending → Matched → Confirmed → Completed

Use the **Pickup Requests** page to track all your requests!`;

  if (t.includes('partner') || t.includes('match') || t.includes('organisation') || t.includes('ngo')) return `**Partner Matching System** 🤝

UtsavCycle AI matches you with recovery partners based on:
• **Waste type compatibility** — Partners specialize in specific waste categories
• **Capacity** — Partner can handle your estimated waste volume
• **Distance** — Nearby partners reduce transport emissions
• **Availability** — Real-time availability status
• **Match score** — Combined score shown as a percentage

Go to **Find Partners** to see available partners and request a pickup!`;

  if (t.includes('compost') || t.includes('organic') || t.includes('biodegrad')) return `**Composting Guide** 🌿

What can be composted from events:
• ✅ Fruit and vegetable scraps
• ✅ Fresh flower waste and leaves
• ✅ Paper napkins (unbleached)
• ✅ Cooked food (within 24 hours)
• ❌ Plastic, metal, glass
• ❌ Oily/processed food in large quantities

**Hot composting** of event waste takes 4–6 weeks. Many municipalities offer free pickup for organic waste from events.`;

  if (t.includes('segregat') || t.includes('sort') || t.includes('separate') || t.includes('bin')) return `**Waste Segregation at Events** 🗂️

Set up 4 colour-coded bins at your event:
• 🟢 **Green** — Organic/wet waste (food, flowers)
• 🔵 **Blue** — Dry recyclables (paper, plastic, glass, metal)
• ⚫ **Black** — Non-recyclable waste (contaminated materials)
• 🔴 **Red** — Hazardous (batteries, chemicals — rare at events)

**Pro tip:** Place bins at every food station, entrance, and exit. Add picture labels for guests who don't read the language.`;

  if (t.includes('impact') || t.includes('co2') || t.includes('carbon') || t.includes('environment')) return `**Your Environmental Impact** 🌍

When you divert waste through UtsavCycle AI:
• **1 kg food waste composted** = 0.5 kg CO₂ prevented vs landfill
• **100 kg flowers recycled** = ~70 kg CO₂ saved
• **1 tonne waste diverted** = ~700 kg CO₂ equivalent
• **Meals rescued** = direct community nutrition value

Check the **Impact Report** page to see your personal sustainability metrics!`;

  if (t.includes('utsavcycle') || t.includes('how') || t.includes('feature') || t.includes('platform')) return `**UtsavCycle AI Features** 🚀

Here's everything you can do:
• 📅 **Create Events** — Log your event details
• 🤖 **AI Waste Prediction** — Get Gemini-powered waste estimates
• 🤝 **Find Partners** — Match with recovery organisations
• 🚛 **Pickup Requests** — Schedule and track pickups
• 💬 **AI Assistant** — Ask sustainability questions (that's me!)
• 📊 **Impact Report** — See your CO₂ savings and waste diverted

Navigate using the sidebar on the left!`;

  return `Thank you for your question! 🌱

Here are some quick sustainability tips for events:

🌸 **Flowers** → Floral recyclers convert them to compost, dyes, and potpourri
🍱 **Food** → Donate surplus to food banks; compost the rest
♻️ **Plastic** → Segregate PET/HDPE; replace single-use with biodegradable
📄 **Paper** → Keep dry and send to paper recyclers
🎀 **Fabric** → Reuse decoration fabric or donate to textile recyclers

Use the **Find Partners** page to connect with recovery organisations near you, and the **AI Prediction** tool to estimate your event's waste before it happens!

Want to know more about a specific topic? Ask me about flowers, food, plastic, pickups, partner matching, or composting!`;
}

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: `Hello! 👋 I'm the UtsavCycle AI assistant. I can help you with:

• **Event waste planning** — what to expect and how to minimize
• **Waste segregation** — how to sort food, flowers, plastic, paper, fabric
• **Composting & recycling** — options in your city
• **Sustainable event practices** — reduce waste at the source
• **Pickup process** — how to request and coordinate pickups
• **Partner matching** — how to find the right recovery partner

What would you like to know?`,
};

export default function AIAssistantPage() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function getOrCreateSession(): Promise<string> {
    if (sessionId) return sessionId;
    if (!currentUser) return 'anon';
    const id = await createChatSession(currentUser.uid);
    setSessionId(id);
    return id;
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Try backend first (with 6s timeout)
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      try {
        const sid = await getOrCreateSession();
        if (currentUser) {
          saveChatMessage(sid, { role: 'user', content: text, uid: currentUser.uid }).catch(() => {});
        }
        const res = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error('bad status');
        const data = await res.json();
        const reply: ChatMessage = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, reply]);
        if (currentUser) {
          saveChatMessage(sid, { role: 'assistant', content: data.response, uid: currentUser.uid }).catch(() => {});
        }
        return;
      } catch {
        clearTimeout(timer);
        // Fall through to built-in answers below
      }

      // Built-in smart fallback answers
      const reply: ChatMessage = { role: 'assistant', content: getBuiltInAnswer(text) };
      setMessages(prev => [...prev, reply]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function clearChat() {
    setMessages([WELCOME]);
    setSessionId(null);
  }

  function renderContent(content: string) {
    // Simple markdown-like rendering
    return content
      .split('\n')
      .map((line, i) => {
        const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={i} className={clsx('text-sm leading-relaxed', line === '' ? 'mt-2' : '')} dangerouslySetInnerHTML={{ __html: boldLine }} />;
      });
  }

  const SUGGESTIONS = [
    'How do I reduce flower waste at a wedding?',
    'What happens to leftover food at events?',
    'How does partner matching work?',
    'What is the pickup process?',
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Assistant</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Powered by Gemini AI · Ask anything about event waste</p>
          </div>
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={clearChat}>Clear</Button>
        </div>

        <Card padding="none" className="flex flex-col flex-1 min-h-0" style={{ height: 'calc(100vh - 260px)' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={clsx('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  msg.role === 'user' ? 'bg-brand-green text-white' : 'bg-primary-50 dark:bg-green-900/20 text-brand-green dark:text-green-400'
                )}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={clsx(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-brand-green text-white rounded-tr-sm'
                    : 'bg-gray-50 dark:bg-[#1f2d1d] text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-[#2a3828]'
                )}>
                  <div className="space-y-0.5">{renderContent(msg.content)}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-green-900/20 flex items-center justify-center text-brand-green dark:text-green-400">
                    <Bot size={14} />
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1f2d1d] rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100 dark:border-[#2a3828]">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (only when just the welcome message) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); }}
                      className="text-xs bg-primary-50 dark:bg-green-900/20 text-brand-green dark:text-green-400 px-3 py-1.5 rounded-full hover:bg-primary-100 dark:hover:bg-green-900/30 transition-colors border border-primary-100 dark:border-green-900/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-100 dark:border-[#2a3828]">
            <div className="flex gap-2">
              <textarea
                className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-[#2a3828] bg-white dark:bg-[#1a2018] text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent placeholder-gray-400 dark:placeholder-gray-600"
                placeholder="Ask about event waste, sustainability, pickups…"
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button onClick={handleSend} disabled={!input.trim() || loading} icon={<Send size={16} />}>
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
