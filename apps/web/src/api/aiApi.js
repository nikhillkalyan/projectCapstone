import api from '../lib/api';

// Helper to strip markdown code blocks before parsing
const parseJsonResponse = (result) => {
  if (typeof result !== 'string') return result;
  let cleaned = result.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  return JSON.parse(cleaned);
};

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
    const res = await api.post('/ai/summarize-project', { prompt, context });
    return res.data.result;
  },

  analyzePerformance: async (prompt, context) => {
    const res = await api.post('/ai/analyze-performance', { prompt, context });
    return res.data.result;
  }
};
