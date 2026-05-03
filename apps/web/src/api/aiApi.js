import api from '../lib/api';

const parseJsonResponse = (result) => {
  if (typeof result !== 'string') return result;

  let cleaned = result.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    return cleaned;
  }
};

const PERFORMANCE_PROMPT_SUFFIX = `
IMPORTANT: Respond ONLY with a valid JSON object - no markdown, no preamble, no trailing text.
The JSON must exactly follow this schema:
{
  "summary": "<2-3 sentence overview of class performance>",
  "highlights": ["<strength 1>", "<strength 2>"],
  "risks": ["<concern 1>", "<concern 2>"],
  "recommendations": ["<action 1>", "<action 2>", "<action 3>"],
  "gradeDistribution": { "S": 0, "A": 0, "B": 0, "C": 0, "D": 0, "F": 0 },
  "topPerformers": [{ "name": "<student name>", "score": 0.0 }],
  "needsAttention": [{ "name": "<student name>", "score": 0.0 }]
}
Fill gradeDistribution with actual counts from the data.
topPerformers: top 3 by finalScore. needsAttention: bottom 3 by finalScore (score < 50 preferred).
`;

const PROJECT_PROMPT_SUFFIX = `
IMPORTANT: Respond ONLY with a valid JSON object - no markdown, no preamble, no trailing text.
The JSON must exactly follow this schema:
{
  "summary": "<2-3 sentence group progress overview>",
  "highlights": ["<positive observation 1>", "<positive observation 2>"],
  "risks": ["<blocker or concern 1>", "<blocker or concern 2>"],
  "recommendations": ["<next action 1>", "<next action 2>"]
}
`;

export const aiApi = {
  generateCourse: async (prompt, context) => {
    const res = await api.post('/ai/generate-course', { prompt, context });
    return parseJsonResponse(res.data.result);
  },

  generateQuiz: async (prompt, context) => {
    const res = await api.post('/ai/generate-quiz', { prompt, context });
    return parseJsonResponse(res.data.result);
  },

  summarizeProject: async (prompt, context) => {
    const res = await api.post('/ai/summarize-project', {
      prompt: prompt + PROJECT_PROMPT_SUFFIX,
      context,
    });
    return parseJsonResponse(res.data.result);
  },

  analyzePerformance: async (prompt, context) => {
    const res = await api.post('/ai/analyze-performance', {
      prompt: prompt + PERFORMANCE_PROMPT_SUFFIX,
      context,
    });
    return parseJsonResponse(res.data.result);
  },
};
