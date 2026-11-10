import mongoose from 'mongoose';
export async function connectDatabase(uri: string) {
  mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error.message));
  for (let attempt = 1; attempt <= 5; attempt++) {
    try { await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 }); console.info('MongoDB connected.'); return; }
    catch (error) { console.error(`MongoDB connection attempt ${attempt}/5 failed.`); if (attempt === 5) throw error; await new Promise(r => setTimeout(r, attempt * 1500)); }
  }
}
