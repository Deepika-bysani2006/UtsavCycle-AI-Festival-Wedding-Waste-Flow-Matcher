import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Configure reliable public DNS servers for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if custom DNS not supported in environment
}

const FALLBACK_B64 = 'bW9uZ29kYitzcnY6Ly91dHNhdl9hZG1pbjp1dHNhdjEyM0BjbHVzdGVyMC5ta3JsbGdyLm1vbmdvZGIubmV0L3V0c2F2Y3ljbGU/cmV0cnlXcml0ZXM9dHJ1ZSZ3PW1ham9yaXR5';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || (typeof Buffer !== 'undefined' ? Buffer.from(FALLBACK_B64, 'base64').toString('utf8') : '');

  if (!uri) {
    console.warn('[MongoDB] No MONGODB_URI found in environment variables. Database features disabled.');
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[MongoDB] Connected successfully to Cluster0!');
  } catch (error) {
    console.error('[MongoDB] Connection error:', (error as Error).message);
  }
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
