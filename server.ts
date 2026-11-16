import express from 'express';
import type { Request, Response } from 'express';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, ThinkingLevel, Type } from '@google/genai';
import type { GenerateContentResponse, LiveServerMessage } from '@google/genai';

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

const getLiveAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('Gemini API key is not configured on the server.'), { status: 500 });
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      apiVersion: 'v1beta',
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

  app.post('/api/gemini/mindfulness', async (req: Request, res: Response) => {
    try {
      const { journalHistory = [], user = null } = req.body ?? {};

      const journalContext = Array.isArray(journalHistory) ? journalHistory.slice(0, 5).join(' | ') : '';
      const userContext = user
        ? `User Profile: Stress Level ${user.stressLevel}/10, Intentions: ${Array.isArray(user.goals) ? user.goals.join(', ') : ''}`
        : 'User Profile: Not available';

      const ai = getAI();
      const response = await withRetry<GenerateContentResponse>(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `You are a thoughtful mindfulness mentor for busy knowledge workers.
Analyze the following context without assuming or mentioning sleep metrics:
${userContext}
Recent Gratitude Reflections: ${journalContext || 'No journal entries yet.'}

Provide:
1. A general mindfulness score (0-100) reflecting calm and reflective consistency.
2. A concise 1-word calm state label (e.g., Grounded, Balanced, Steady, Unwinding).
3. 3 brief mindful observations or focus themes.
4. 1 concise, practical mindfulness guidance sentence.
5. A brief 8-10 word daily mantra.

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
      console.error('Server mindfulness analysis failed:', error);
      const status = typeof error?.status === 'number' && error.status >= 400 ? error.status : 500;
      res.status(status).json({
        error: error?.message || 'Failed to generate mindfulness insights.',
      });
    }
  });

  app.post('/api/gemini/mantras', async (req: Request, res: Response) => {
    try {
      const { journalHistory = [], user = null, dateLabel = '' } = req.body ?? {};

      const journalContext = Array.isArray(journalHistory)
        ? journalHistory.filter((entry) => typeof entry === 'string' && entry.trim()).slice(0, 4).join(' | ')
        : '';

      const userContext = user
        ? `Name: ${user.name || 'Friend'}, Stress Level: ${user.stressLevel ?? 5}/10, Intentions: ${
            Array.isArray(user.goals) && user.goals.length > 0 ? user.goals.join(', ') : 'Present-moment calm'
          }`
        : 'Name: Friend, Stress Level: 5/10, Intentions: Present-moment calm';

      const ai = getAI();
      const response = await withRetry<GenerateContentResponse>(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Create 5 distinct, calming daily mindfulness affirmations for a user signing into their mindfulness workspace${
            dateLabel ? ` on ${dateLabel}` : ''
          }.
Context: ${userContext}
Recent Gratitude Reflections: ${journalContext || 'No recent reflections yet.'}

Requirements:
- Each affirmation must be 8 to 15 words, poetic yet grounded in everyday human clarity (first-person "I" or quiet second-person).
- Each item needs a 2-3 word theme label (e.g., "Quiet Clarity", "Steady Breath", "Unhurried Pace").
- Each item needs 1 concise grounding breath or attention cue (10-16 words).
- Do not include hashtags, emojis, exclamation marks, or sleep metrics.
Return JSON only.`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                mantras: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      affirmation: { type: Type.STRING },
                      theme: { type: Type.STRING },
                      breathCue: { type: Type.STRING },
                    },
                    required: ['affirmation', 'theme', 'breathCue'],
                  },
                },
              },
              required: ['mantras'],
            },
          },
        })
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const rawList = Array.isArray(parsed?.mantras) ? parsed.mantras : [];

      if (rawList.length === 0) {
        res.status(502).json({ error: 'Empty mantra set received from Gemini.' });
        return;
      }

      const mantras = rawList
        .slice(0, 5)
        .filter((item: any) => typeof item?.affirmation === 'string' && item.affirmation.trim())
        .map((item: any, idx: number) => ({
          id: `mantra-${Date.now()}-${idx}`,
          affirmation: item.affirmation.trim().replace(/^["']|["']$/g, ''),
          theme: typeof item.theme === 'string' && item.theme.trim() ? item.theme.trim() : 'Mindful Anchor',
          breathCue:
            typeof item.breathCue === 'string' && item.breathCue.trim()
              ? item.breathCue.trim()
              : 'Take one slow inhale and soften your shoulders as you exhale.',
        }));

      res.json({ mantras, generatedAt: new Date().toISOString() });
    } catch (error: any) {
      console.error('Server daily mantras generation failed:', error);
      const status = typeof error?.status === 'number' && error.status >= 400 ? error.status : 500;
      res.status(status).json({
        error: error?.message || 'Failed to generate daily mindfulness affirmations.',
      });
    }
  });

  app.post('/api/gemini/journal-summary', async (req: Request, res: Response) => {
    try {
      const { turns = [], user = null } = req.body ?? {};
      const validTurns = Array.isArray(turns)
        ? turns.filter(
            (t: any) =>
              t &&
              (t.speaker === 'user' || t.speaker === 'mentor') &&
              typeof t.text === 'string' &&
              t.text.trim().length > 0
          )
        : [];

      if (validTurns.length === 0) {
        res.status(400).json({ error: 'No conversation turns were provided to summarize.' });
        return;
      }

      const dialogueText = validTurns
        .map((t: any) => `${t.speaker === 'user' ? user?.name || 'User' : 'Mentor'}: ${t.text.trim()}`)
        .join('\n');

      const ai = getAI();
      const response = await withRetry<GenerateContentResponse>(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Distill this spoken Gratitude Journal conversation into a clean archive entry for ${user?.name || 'the user'}.

Conversation:
${dialogueText}

Requirements:
1. "summary": 1 to 3 concise, natural first-person sentences ("Today I...") capturing the gratitude, feelings, and observations the user shared.
2. "mentorReflection": 1 to 2 warm, poetic sentences from the mindfulness mentor validating what stood out and offering a grounded closing perspective.
Return JSON only.`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                mentorReflection: { type: Type.STRING },
              },
              required: ['summary', 'mentorReflection'],
            },
          },
        })
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      if (!parsed?.summary || !parsed?.mentorReflection) {
        res.status(502).json({ error: 'Incomplete summary received from Gemini.' });
        return;
      }

      res.json({
        success: true,
        summary: parsed.summary.trim(),
        mentorReflection: parsed.mentorReflection.trim(),
      });
    } catch (error: any) {
      console.error('Server journal summary failed:', error);
      const status = typeof error?.status === 'number' && error.status >= 400 ? error.status : 500;
      res.status(status).json({
        success: false,
        error: error?.message || 'Failed to summarize gratitude dialogue.',
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

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/api/live-journal' });

  wss.on('connection', (clientWs, req) => {
    let liveSession: any = null;
    let isClosed = false;

    const sendToClient = (payload: Record<string, unknown>) => {
      if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    const reqUrl = new URL(req.url || '/', 'http://localhost');
    const userName = reqUrl.searchParams.get('name') || 'Friend';
    const stressLevel = reqUrl.searchParams.get('stress') || '5';
    const goals = reqUrl.searchParams.get('goals') || 'Present-moment calm, Gratitude Practice';

    let sessionPromise: Promise<any>;
    try {
      const ai = getLiveAI();
      sessionPromise = ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are Sanctuary, a warm, calm mindfulness mentor having a real-time spoken Gratitude Journal conversation with ${userName} (current stress level ${stressLevel}/10; intentions: ${goals}).
Speak gently and naturally in a human, unhurried voice:
1. Listen closely and respond warmly in 1 to 2 empathetic sentences validating what they shared.
2. End each response with one gentle, open-ended follow-up question to help them explore gratitude, relief, or quiet clarity further.
3. Keep replies concise and conversational rather than lecturing. Never mention hashtags or sleep tracking.`,
        },
        callbacks: {
          onopen: () => {
            sendToClient({ type: 'ready' });
          },
          onmessage: (message: LiveServerMessage) => {
            const content = message.serverContent;

            if (content?.inputTranscription?.text) {
              sendToClient({
                type: 'inputTranscript',
                text: content.inputTranscription.text,
              });
            }

            if (content?.outputTranscription?.text) {
              sendToClient({
                type: 'outputTranscript',
                text: content.outputTranscription.text,
              });
            }

            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                sendToClient({
                  type: 'audio',
                  data: part.inlineData.data,
                });
              }
            }

            if (content?.interrupted) {
              sendToClient({ type: 'interrupted' });
            }

            if (content?.turnComplete) {
              sendToClient({ type: 'turnComplete' });
            }
          },
          onerror: (err: any) => {
            console.error('Gemini Live session error:', err);
            sendToClient({
              type: 'error',
              message: err?.message || 'Live voice connection encountered an error.',
            });
          },
          onclose: () => {
            sendToClient({ type: 'closed' });
          },
        },
      });

      sessionPromise
        .then((session) => {
          if (isClosed) {
            try {
              session.close();
            } catch {
              // Ignore close errors
            }
            return;
          }
          liveSession = session;
        })
        .catch((err: any) => {
          console.error('Failed to connect Gemini Live session:', err);
          sendToClient({
            type: 'error',
            message: err?.message || 'Could not start live voice conversation.',
          });
        });
    } catch (err: any) {
      sendToClient({
        type: 'error',
        message: err?.message || 'Live voice session unavailable.',
      });
      return;
    }

    clientWs.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg?.type === 'audio' && typeof msg.data === 'string') {
          sessionPromise
            .then((session) => {
              if (!isClosed) {
                session.sendRealtimeInput({
                  audio: { data: msg.data, mimeType: 'audio/pcm;rate=16000' },
                });
              }
            })
            .catch(() => {
              // Handled in sessionPromise catch
            });
        } else if (msg?.type === 'text' && typeof msg.text === 'string' && msg.text.trim()) {
          sessionPromise
            .then((session) => {
              if (!isClosed) {
                session.sendRealtimeInput({ text: msg.text.trim() });
              }
            })
            .catch(() => {
              // Handled in sessionPromise catch
            });
        }
      } catch {
        // Ignore malformed client payloads
      }
    });

    clientWs.on('close', () => {
      isClosed = true;
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
          // Ignore close errors
        }
      }
    });
  });

  const port = Number(process.env.PORT) || 3000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`Sanctuary server listening on http://0.0.0.0:${port}`);
  });
}

startServer();

