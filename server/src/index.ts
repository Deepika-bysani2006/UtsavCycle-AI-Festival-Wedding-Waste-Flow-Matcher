import { app } from './app';

const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, () => {
  console.log(`UtsavCycle AI backend running on http://localhost:${PORT}`);
  console.log(`Gemini AI: ${process.env.GEMINI_API_KEY ? '✓ connected' : '✗ not configured (fallback active)'}`);
});
