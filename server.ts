import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import type { GenerateContentResponse } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local environment files if present during development
for (const envFile of ['.env.local', '.env']) {
  const envPath = path.join(__dirname, envFile);
  if (fs.existsSync(envPath) && typeof (process as any).loadEnvFile === 'function') {
    try {
      (process as any).loadEnvFile(envPath);
    } catch {
      // Ignore parse errors on empty/malformed local files
    }
  }
}

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('Gemini API key is not configured on the server.'), { status: 500 });
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status ?? error?.code;
    const isRateLimit =
      status === 429 ||
      error?.message?.includes('429') ||
      error?.message?.includes('RESOURCE_EXHAUSTED');
    const isServerError = typeof status === 'number' && status >= 500;

    if ((isRateLimit || isServerError) && retries > 0) {
      await wait(delay);
      return withRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.post('/api/gemini/gratitude', async (req: Request, res: Response) => {
    try {
      const { transcript } = req.body ?? {};
      if (typeof transcript !== 'string' || !transcript.trim()) {
        res.status(400).json({ error: 'A journal reflection transcript is required.' });
        return;
      }

      const ai = getAI();
      const response = await withRetry<GenerateContentResponse>(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `You are a wise mindfulness mentor. A tech professional is reflecting on their day: "${transcript}".

Provide a 2-sentence empathetic response that:
1. Validates a specific emotion or detail mentioned.
2. Offers a grounding perspective that moves them from "execution mode" to "peace mode."

Tone: Warm, poetic, and concise. No hashtags or corporate speak.`,
        })
      );

      const text = response.text?.trim();
      if (!text) {
        res.status(502).json({ error: 'Empty response received from Gemini.' });
        return;
      }

      res.json({ success: true, message: text });
    } catch (error: any) {
      console.error('Server gratitude analysis failed:', error);
      const status = typeof error?.status === 'number' && error.status >= 400 ? error.status : 500;
      res.status(status).json({
        success: false,
        error: error?.message || 'Failed to analyze gratitude reflection.',
      });
    }
  });

  app.post('/api/gemini/health-analysis', async (req: Request, res: Response) => {
    try {
      const { sleepHistory = [], journalHistory = [], user = null } = req.body ?? {};

      const sleepContext = JSON.stringify(Array.isArray(sleepHistory) ? sleepHistory.slice(-7) : []);
      const journalContext = Array.isArray(journalHistory) ? journalHistory.slice(0, 5).join(' | ') : '';
      const userContext = user
        ? `User Profile: Stress Level ${user.stressLevel}/10, Goals: ${Array.isArray(user.goals) ? user.goals.join(', ') : ''}`
        : 'User Profile: Not available';

      const ai = getAI();
      const response = await withRetry<GenerateContentResponse>(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `You are a holistic wellness consultant for corporate tech professionals.
Analyze the following data:
${userContext}
Sleep History: ${sleepContext}
Recent Reflections: ${journalContext}

Provide:
1. A wellness score (0-100).
2. A label (Optimal, Restorative, Fair, Fatigued).
3. 3 pattern predictions.
4. 1 actionable advice.
5. A brief 8-10 word mantra.

Return JSON only.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                label: { type: Type.STRING },
                predictions: { type: Type.ARRAY, items: { type: Type.STRING } },
                advice: { type: Type.STRING },
                affirmation: { type: Type.STRING },
              },
              required: ['score', 'label', 'predictions', 'advice', 'affirmation'],
            },
          },
        })
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error: any) {
      console.error('Server health analysis failed:', error);
      const status = typeof error?.status === 'number' && error.status >= 400 ? error.status : 500;
      res.status(status).json({
        error: error?.message || 'Failed to generate wellness insights.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Sanctuary server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
