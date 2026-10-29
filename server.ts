import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to clean potential markdown wrapper from JSON
function parseJsonSafely(raw: string) {
  let clean = raw.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/i, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/i, '');
  }
  if (clean.endsWith('```')) {
    clean = clean.replace(/```\s*$/, '');
  }
  return JSON.parse(clean);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Main PYQ Analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { files, subject, branch } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one question paper (PDF or text).' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in environment. Please check the Secrets panel.',
      });
    }

    // Build multimodal contents for Gemini 3.8 Flash
    const parts: any[] = [];

    // System prompt and instructions for the extraction
    const promptInstruction = `
You are an expert Engineering University Exam Controller and Academic Professor.
Your job is to analyze the provided Previous Year Question (PYQ) papers for the engineering subject: "${subject || 'Engineering Subject'}".

TASK:
1. EXTRACT EVERY SINGLE QUESTION & SUB-QUESTION from all the provided question papers.
   - For each question identify: question number (e.g. Q1(a), Q2(b)), full question text, topic, unit/module name (e.g. Unit 1, Unit 2), marks awarded, paper year, Bloom's taxonomy level (Remember, Understand, Apply, Analyze, Evaluate, Create), and type (Theory, Numerical, Derivation, Code/Algorithm, Design).
2. TOPIC RANKING & FREQUENCY ANALYSIS:
   - Aggregate questions by topic across all years.
   - Calculate appearance count, total marks, percentage of total marks across all papers, and list years it appeared in.
   - Categorize importance as "High Yield" (appears in >= 75% of papers or high marks), "Medium Yield" (50-74%), or "Low Yield" (< 50%).
3. REPEATING QUESTIONS IDENTIFICATION:
   - Identify questions that repeat across different exam years with identical or very similar wording/concept (e.g., same numerical format with different numbers, same algorithm explanation, same core theory/derivation).
   - Group them into clusters with a similarity score (0-100), core concept, frequency count, and brief pattern explanation describing why this question keeps appearing.
4. ACTIONABLE REVISION PLAN:
   - Generate a prioritized revision plan based on the highest-frequency topics and recurring question patterns.
   - Include allocated study hours, guaranteed must-solve questions, key formulas/derivations checklist, and exam tips.

CRITICAL: Return the response strictly as valid, well-formed JSON matching this schema:
{
  "subject": "Name of Subject (e.g. Operating Systems)",
  "branch": "Engineering Branch (e.g. Computer Science & Engineering)",
  "papersCount": 4,
  "totalQuestions": 24,
  "totalMarksAnalyzed": 280,
  "years": ["2021", "2022", "2023", "2024"],
  "summary": "2-3 sentences overview of the high-yield topics and repeat patterns found",
  "extractedQuestions": [
    {
      "id": "q-1",
      "paperYear": "2024",
      "paperTitle": "End Sem Exam 2024",
      "qNumber": "Q1(a)",
      "questionText": "Full text of question",
      "topic": "Name of Topic",
      "unit": "Unit 1: Title",
      "marks": 8,
      "bloomLevel": "Apply",
      "type": "Numerical"
    }
  ],
  "topicRanking": [
    {
      "topic": "Name of Topic",
      "unit": "Unit 2: ...",
      "appearanceCount": 4,
      "totalMarks": 40,
      "marksPercentage": 22.5,
      "years": ["2021", "2022", "2023", "2024"],
      "importance": "High Yield",
      "questionIndices": ["q-1", "q-5"]
    }
  ],
  "repeatQuestions": [
    {
      "clusterId": "rep-1",
      "coreConcept": "Core Concept (e.g. Banker's Algorithm Safe Sequence)",
      "patternSummary": "Explanation of how and why this repeats across years",
      "frequency": 4,
      "years": ["2021", "2022", "2023", "2024"],
      "averageMarks": 10,
      "similarityScore": 95,
      "variants": [
        {
          "paperYear": "2024",
          "qNumber": "Q2(b)",
          "questionText": "...",
          "marks": 10
        }
      ]
    }
  ],
  "revisionPlan": {
    "title": "High-Yield Prioritized Revision Plan",
    "timeframe": "3-Day Intensive Sprint",
    "targetFocus": "Score 80%+ by mastering guaranteed high-frequency questions",
    "strategyOverview": "Detailed strategic overview of where to invest revision time",
    "priorityModules": [
      {
        "priority": 1,
        "unitOrTopic": "Name of Topic/Unit",
        "expectedWeightage": "12-14 Marks",
        "allocatedHours": "2.5 Hours",
        "keyPointsToRevise": ["Point 1", "Point 2"],
        "mustSolveQuestions": ["Year Q(x) question description"]
      }
    ],
    "quickTips": ["Tip 1", "Tip 2"],
    "formulaOrDiagramChecklist": ["Formula 1", "Diagram 2"]
  }
}
`;

    parts.push({ text: promptInstruction });

    // Attach user files
    for (const f of files) {
      if (f.base64 && f.mimeType) {
        parts.push({
          inlineData: {
            mimeType: f.mimeType,
            data: f.base64,
          },
        });
        parts.push({
          text: `Paper metadata: Filename: "${f.name}", Year/Exam hint: "${f.year || 'Unknown'}".`,
        });
      } else if (f.text) {
        parts.push({
          text: `--- BEGIN QUESTION PAPER CONTENT: "${f.name}" (Year: ${f.year || 'Unknown'}) ---\n${f.text}\n--- END QUESTION PAPER CONTENT ---`,
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsedData = parseJsonSafely(responseText);

    // Assign a unique ID if not present
    parsedData.id = 'pyq-analysis-' + Date.now();
    parsedData.analyzedAt = new Date().toISOString();

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error during PYQ analysis:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze question papers. Please try again with valid PDF or text papers.',
    });
  }
});

// Interactive follow-up Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, analysisContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in environment.',
      });
    }

    const systemPrompt = `
You are the AI Academic Advisor built into PYQ Analyzer for engineering students.
You have access to the complete Previous Year Question (PYQ) analysis data for the subject: "${analysisContext?.subject || 'Engineering'}".

CURRENT ANALYSIS CONTEXT:
- Total Papers: ${analysisContext?.papersCount || 4}
- Analyzed Years: ${(analysisContext?.years || []).join(', ')}
- Total Questions Extracted: ${analysisContext?.totalQuestions || 0}
- High-Yield Topics: ${(analysisContext?.topicRanking || [])
  .slice(0, 5)
  .map((t: any) => `${t.topic} (${t.appearanceCount} appearances, ${t.totalMarks} marks)`)
  .join('; ')}
- Top Repeating Question Patterns: ${(analysisContext?.repeatQuestions || [])
  .slice(0, 4)
  .map((r: any) => `${r.coreConcept} (${r.frequency} years, ~${r.averageMarks}M)`)
  .join('; ')}

GUIDELINES FOR YOUR RESPONSE:
1. Directly and realistically help the engineering student with their specific exam situation (e.g. "I have 3 hours left tonight", "How to just pass 40 marks", "Explain the repeating question on X", "Which unit can I skip?").
2. ALWAYS cite actual extracted questions, marks, and years from the analysis to back up your recommendations (e.g. "In 2023 Q2(b) and 2024 Q3(a)...").
3. When asked for a 3-hour or last-minute plan, give an hour-by-hour breakdown with exact numerical/theory questions to memorize or practice.
4. Provide structured, crisp markdown with bold headings, bullet points, formula boxes, and step-by-step guidance.
5. Suggest 2-3 short, relevant follow-up questions at the end that the student can click to ask next.
`;

    // Construct conversation messages
    const contents: any[] = [];
    contents.push({ text: systemPrompt });

    if (Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
    });

    const answer = response.text || 'I apologize, but I could not generate an answer at this moment.';

    // Generate 3 suggested follow-up questions
    const followUps = [
      'What are the top 3 numericals guaranteed to pass?',
      'If I have only 3 hours before the exam, what exact questions should I do?',
      'Which unit has the lowest marks and is safest to skip?',
    ];

    res.json({
      answer,
      suggestedQuestions: followUps,
    });
  } catch (error: any) {
    console.error('Error during chat:', error);
    res.status(500).json({
      error: error.message || 'Chat service encountered an error.',
    });
  }
});

// Custom Revision Plan Generator endpoint
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { timeframe, targetGoal, analysisContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `
Create an updated, highly customized revision plan for the engineering subject "${analysisContext?.subject || 'Engineering'}" based on the PYQ analysis.

TIMEFRAME: ${timeframe || '3_hours'} (e.g. 3 Hours Emergency, 1 Day Sprint, 3 Days Deep Revision, 7 Days Mastery)
TARGET GOAL: ${targetGoal || 'first_class'} (e.g. pass_only [40-50 marks], first_class [60-70 marks], distinction [85%+ marks])

ANALYSIS SUMMARY:
- Top Topics by frequency: ${JSON.stringify((analysisContext?.topicRanking || []).slice(0, 6))}
- Repeated Question Clusters: ${JSON.stringify((analysisContext?.repeatQuestions || []).slice(0, 4))}

Generate a structured JSON revision plan matching this schema:
{
  "title": "Title of customized plan",
  "timeframe": "${timeframe}",
  "targetFocus": "Clear target description",
  "strategyOverview": "Detailed strategic overview of how to spend each block of time",
  "priorityModules": [
    {
      "priority": 1,
      "unitOrTopic": "Topic Name",
      "expectedWeightage": "10-12 Marks",
      "allocatedHours": "1.5 Hours",
      "keyPointsToRevise": ["Key formula/algorithm step", "Essential diagram"],
      "mustSolveQuestions": ["Specific PYQ question from repeat clusters"]
    }
  ],
  "quickTips": ["Examiner presentation tip", "Time allocation tip"],
  "formulaOrDiagramChecklist": ["Formula/Derivation 1", "Diagram 2"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedPlan = parseJsonSafely(response.text || '{}');
    res.json(parsedPlan);
  } catch (error: any) {
    console.error('Error creating revision plan:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate custom revision plan.',
    });
  }
});

// Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PYQ Analyzer server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
