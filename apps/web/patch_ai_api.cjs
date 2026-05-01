const fs = require('fs');
const path = require('path');

const file = path.join('c:', 'Projects', 'CapstoneProject', 'apps', 'web', 'src', 'api', 'aiApi.js');
let content = fs.readFileSync(file, 'utf8');

const oldCode = `import api from '../lib/api';

export const aiApi = {
  generateCourse: async (prompt, context) => {
    const res = await api.post('/ai/generate-course', { prompt, context });
    // result is returned as a string that we need to parse into JSON
    return JSON.parse(res.data.result);
  },

  generateQuiz: async (prompt, context) => {
    const res = await api.post('/ai/generate-quiz', { prompt, context });
    return JSON.parse(res.data.result);
  },`;

const newCode = `import api from '../lib/api';

// Helper to strip markdown code blocks before parsing
const parseJsonResponse = (result) => {
  if (typeof result !== 'string') return result;
  let cleaned = result.trim();
  if (cleaned.startsWith('\`\`\`json')) {
    cleaned = cleaned.replace(/^\`\`\`json\\n/, '').replace(/\\n\`\`\`$/, '');
  } else if (cleaned.startsWith('\`\`\`')) {
    cleaned = cleaned.replace(/^\`\`\`\\n/, '').replace(/\\n\`\`\`$/, '');
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
  },`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(file, content);
console.log('Patch complete.');
