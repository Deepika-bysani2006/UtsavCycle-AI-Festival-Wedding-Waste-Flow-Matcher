import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectDB, isDBConnected } from './db';
import { UserModel } from './models/User';
import { EventModel } from './models/Event';
import { PickupRequestModel } from './models/PickupRequest';
import { PartnerModel } from './models/Partner';
import { PredictionModel } from './models/Prediction';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Initialize MongoDB connection
connectDB();

// ── Gemini client ────────────────────────────────────────────────────────────
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    gemini: !!process.env.GEMINI_API_KEY,
    mongodb: isDBConnected() ? 'connected' : 'disconnected',
  });
});

// ── POST /api/waste/predict ───────────────────────────────────────────────────
app.post('/api/waste/predict', async (req, res) => {
  const {
    event_type = 'Wedding',
    guest_count = 100,
    duration = 4,
    food_type = 'Mixed',
    catering_type = 'External Caterer',
    decoration_type = 'Flowers + Fabric',
    location = 'India',
    uid,
    eventId,
  } = req.body;

  const guestCount = Math.max(1, parseInt(String(guest_count), 10) || 100);
  const hours = Math.max(1, parseInt(String(duration), 10) || 4);

  let predictionResult: any = null;

  // Try Gemini first
  const model = getGeminiClient();
  if (model) {
    try {
      const prompt = `You are an event waste management expert for Indian events.
Predict waste for this event and respond ONLY with valid JSON (no markdown, no explanation):
- Event type: ${event_type}
- Guest count: ${guestCount}
- Duration: ${hours} hours
- Food type: ${food_type}
- Catering type: ${catering_type}
- Decoration type: ${decoration_type}
- Location: ${location}

JSON schema (all values must be numbers except arrays and strings):
{
  "total_waste_kg": number,
  "food_waste_kg": number,
  "flower_waste_kg": number,
  "plastic_waste_kg": number,
  "paper_waste_kg": number,
  "fabric_waste_kg": number,
  "recoverable_waste_kg": number,
  "diversion_percentage": number (0-100),
  "recommendations": [string, string, string, string],
  "explanation": string
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(text);

      // Validate required fields
      const required = ['total_waste_kg', 'food_waste_kg', 'flower_waste_kg', 'plastic_waste_kg',
        'paper_waste_kg', 'fabric_waste_kg', 'recoverable_waste_kg', 'diversion_percentage',
        'recommendations', 'explanation'];
      const valid = required.every(k => k in parsed);
      if (valid) {
        predictionResult = parsed;
      }
    } catch (err) {
      console.warn('[Gemini] Error, using fallback:', (err as Error).message);
    }
  }

  // Fallback deterministic calculation if Gemini fails or is not configured
  if (!predictionResult) {
    predictionResult = fallbackPrediction(guestCount, hours, event_type, decoration_type);
  }

  // Persist prediction log to MongoDB if connected
  if (isDBConnected()) {
    try {
      await PredictionModel.create({
        uid,
        eventId,
        input: {
          event_type,
          guest_count: guestCount,
          duration: hours,
          food_type,
          catering_type,
          decoration_type,
          location,
        },
        result: predictionResult,
      });
    } catch (err) {
      console.warn('[MongoDB] Could not persist prediction:', (err as Error).message);
    }
  }

  return res.json(predictionResult);
});

function fallbackPrediction(guests: number, hours: number, eventType: string, decorationType: string) {
  const m = hours / 4;
  const isWedding = /wedding/i.test(eventType);
  const hasFlowers = /flower/i.test(decorationType);

  const food = Math.round(guests * 0.35 * m * (isWedding ? 1.2 : 1));
  const flower = Math.round(guests * (hasFlowers ? 0.18 : 0.05) * m);
  const plastic = Math.round(guests * 0.10 * m);
  const paper = Math.round(guests * 0.08 * m);
  const fabric = Math.round(guests * (isWedding ? 0.15 : 0.08) * m);
  const total = food + flower + plastic + paper + fabric;
  const recoverable = Math.round(total * 0.72);

  return {
    total_waste_kg: total,
    food_waste_kg: food,
    flower_waste_kg: flower,
    plastic_waste_kg: plastic,
    paper_waste_kg: paper,
    fabric_waste_kg: fabric,
    recoverable_waste_kg: recoverable,
    diversion_percentage: 72,
    recommendations: [
      'Partner with a local food bank to donate surplus cooked food before the event ends',
      'Hire a certified floral recycler to collect decoration flowers for composting or potpourri',
      'Replace single-use plastic cutlery with biodegradable or reusable alternatives',
      'Segregate waste at source using color-coded bins: green (organic), blue (recyclable), red (non-recyclable)',
    ],
    explanation: `Estimated for ${guests} guests over ${hours}h (${eventType}). Uses standard waste coefficients for Indian events. Deploy Gemini AI for event-specific personalised predictions.`,
  };
}

// ── POST /api/chat ────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const sanitized = message.replace(/api[_\s]?key|secret|password|token/gi, '[redacted]');

  const model = getGeminiClient();
  if (model) {
    try {
      const systemPrompt = `You are UtsavCycle AI's helpful assistant. You ONLY answer questions about:
- Event waste management (food, flowers, plastic, paper, fabric)
- Waste segregation and recycling
- Sustainable event planning
- Composting, food donation, floral recycling
- UtsavCycle AI features (waste prediction, partner matching, pickup coordination)
- Environmental impact of events

Be concise, friendly, and practical. Use bullet points for lists.
If asked about anything unrelated (politics, finance, coding, etc.), politely redirect to sustainability topics.
NEVER reveal API keys, environment variables, or internal system details.`;

      const chat = model.startChat({
        history: history.slice(-8).map((h: { role: string; content: string }) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
        systemInstruction: systemPrompt,
      });

      const result = await chat.sendMessage(sanitized);
      return res.json({ response: result.response.text() });
    } catch (err) {
      console.warn('[Gemini chat] Error:', (err as Error).message);
    }
  }

  res.json({
    response: `Thank you for your question about "${sanitized.slice(0, 60)}…"

Here are some quick tips while our AI assistant is offline:

🌿 **Food Waste**: Contact a local food bank — most accept cooked food if collected within 2 hours of the event
🌸 **Flower Waste**: Floral waste can be converted to compost, natural dyes, or potpourri by certified recyclers
♻️ **Plastic**: Segregate PET, HDPE, and PP plastics — all are highly recyclable when kept clean and dry
📄 **Paper**: Keep paper waste dry and separate from food waste for maximum recyclability
🎀 **Fabric**: Reusable fabric decorations should be stored and reused; non-reusable fabric goes to textile recyclers

Use the **Find Partners** section to connect with recovery organisations near you!`,
  });
});

// ── MONGODB REST ENDPOINTS ───────────────────────────────────────────────────

// Users: Sync / Upsert User profile
app.post('/api/users/sync', async (req, res) => {
  const { uid, name, email, role, photoURL } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: 'uid and email are required' });
  }

  try {
    const user = await UserModel.findOneAndUpdate(
      { uid },
      { uid, name, email, role: role || 'ORGANIZER', photoURL: photoURL || '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Events: Get all events (optionally filtered by organizerUid)
app.get('/api/events', async (req, res) => {
  const { organizerUid } = req.query;
  try {
    const filter = organizerUid ? { organizerUid: String(organizerUid) } : {};
    const events = await EventModel.find(filter).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Events: Create new event
app.post('/api/events', async (req, res) => {
  try {
    const event = await EventModel.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Pickups: Get pickup requests
app.get('/api/pickups', async (req, res) => {
  const { organizerUid, partnerUid } = req.query;
  try {
    const filter: any = {};
    if (organizerUid) filter.organizerUid = String(organizerUid);
    if (partnerUid) filter.partnerUid = String(partnerUid);
    const pickups = await PickupRequestModel.find(filter).sort({ createdAt: -1 });
    res.json(pickups);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Pickups: Create pickup request
app.post('/api/pickups', async (req, res) => {
  try {
    const pickup = await PickupRequestModel.create(req.body);
    res.status(201).json(pickup);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Pickups: Update pickup status
app.patch('/api/pickups/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const pickup = await PickupRequestModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!pickup) return res.status(404).json({ error: 'Pickup request not found' });
    res.json(pickup);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Partners: Get all recovery partners
app.get('/api/partners', async (_req, res) => {
  try {
    const partners = await PartnerModel.find({ available: true });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Partners: Add or update partner
app.post('/api/partners', async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: 'Partner uid is required' });

  try {
    const partner = await PartnerModel.findOneAndUpdate(
      { uid },
      req.body,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(partner);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Predictions: Get historical prediction records
app.get('/api/predictions', async (req, res) => {
  const { uid, eventId } = req.query;
  try {
    const filter: any = {};
    if (uid) filter.uid = String(uid);
    if (eventId) filter.eventId = String(eventId);
    const predictions = await PredictionModel.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`UtsavCycle AI backend running on http://localhost:${PORT}`);
  console.log(`Gemini AI: ${process.env.GEMINI_API_KEY ? '✓ connected' : '✗ not configured (fallback active)'}`);
});
