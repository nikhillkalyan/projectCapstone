/**
 * geminiService.js
 * Utility to call Gemini 1.5 Flash API for AI-powered course topic insights.
 * Set VITE_GEMINI_API_KEY in your .env file.
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Fetches AI-generated insights for a given course topic.
 * @param {string} title - The course title entered by the instructor
 * @param {string} category - The selected category (AIML, Cloud, DataScience, Cybersecurity)
 * @returns {Promise<{overview: string, chapters: string[], skills: string[], audience: string, description: string, tags: string[]}>}
 */
export async function getCourseTopicInsights(title, category) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('NO_API_KEY');
  }

  const prompt = `You are an expert EdTech curriculum designer. A new online course is being created with the following details:
- Course Title: "${title}"
- Category: "${category}"

Return a JSON object (no markdown, no code fences, just raw JSON) with these fields:
{
  "overview": "A 2-3 sentence engaging summary of what this course covers and why it matters.",
  "chapters": ["Chapter idea 1", "Chapter idea 2", "Chapter idea 3", "Chapter idea 4", "Chapter idea 5"],
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  "audience": "One sentence describing who this course is perfect for.",
  "description": "A catchy 1-2 sentence hook for the course card.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Keep everything concise, practical, and specific to the course title and category.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Strip any accidental markdown code fences
  const cleaned = rawText.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
