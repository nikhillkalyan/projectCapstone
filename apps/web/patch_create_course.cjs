const fs = require('fs');
const path = require('path');

const file = path.join('c:', 'Projects', 'CapstoneProject', 'apps', 'web', 'src', 'pages', 'instructor', 'CreateCourse.jsx');
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// 1. Imports
content = content.replace(
  "import { createCourse, addChapter, addChapterAssessment, addGrandAssessment } from '../../api/courseApi';",
  "import { createCourse, addChapter, addChapterAssessment, addGrandAssessment } from '../../api/courseApi';\nimport { aiApi } from '../../api/aiApi';\nimport Modal from '../../components/ui/Modal';"
);

// 2. State & Generate logic
const oldState = `  const step3Valid = grandAssessment.questions.every(q => q.question && q.options.every(o => o));

  const handleNext = () => {`;
const newState = `  const step3Valid = grandAssessment.questions.every(q => q.question && q.options.every(o => o));

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleGenerateCourse = async () => {
    if (!aiPrompt) return;
    setIsAiGenerating(true);
    try {
       const result = await aiApi.generateCourse(aiPrompt, "Standard public course");
       setCourseData(prev => ({
           ...prev,
           title: result.title || prev.title,
           description: result.description || prev.description,
           longDescription: result.description || prev.longDescription,
       }));
       if (result.chapters && result.chapters.length > 0) {
           const newChapters = result.chapters.map((ch, i) => ({
               ...emptyChapter(),
               id: \`ch_ai_\${Date.now()}_\${i}\`,
               title: ch.title,
               content: { videoUrl: '', textContent: \`# \${ch.title}\\n\\n\${ch.description || ''}\` }
           }));
           setChapters(newChapters);
       }
       setShowAiModal(false);
       setAiPrompt('');
       showNotification('✅ Course generated successfully!');
    } catch (err) {
       console.error(err);
       showNotification('❌ Failed to generate course with AI.');
    } finally {
       setIsAiGenerating(false);
    }
  };

  const handleNext = () => {`;
content = content.replace(oldState, newState);

// 3. Header button
const oldHeader = `        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="heading-2 mb-2 text-gradient">
            Create Course
          </h1>
          <p className="text-text-secondary">Build and publish your course step by step</p>
        </motion.div>`;
const newHeader = `        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-2 mb-2 text-gradient">
                Create Course
              </h1>
              <p className="text-text-secondary">Build and publish your course step by step</p>
            </div>
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary-500/10 px-4 py-2 text-primary-400 font-semibold border border-primary-500/20 hover:bg-primary-500 hover:text-white transition-all shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
          </div>
        </motion.div>`;
content = content.replace(oldHeader, newHeader);

// 4. Modal
const oldFooter = `          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}`;
const newFooter = `          </div>
        </div>
      </div>

      <Modal open={showAiModal} onClose={() => !isAiGenerating && setShowAiModal(false)} title="AI Course Generator">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Describe the topic you want to teach. The AI will generate a title, description, and chapter outline.
          </p>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isAiGenerating}
            rows={4}
            className="glass-input w-full rounded-lg px-4 py-3 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
            placeholder="e.g. A comprehensive course on React 18, starting from basics and covering hooks, routing, and state management."
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowAiModal(false)}
              disabled={isAiGenerating}
              className="px-4 py-2 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateCourse}
              disabled={!aiPrompt.trim() || isAiGenerating}
              className="flex items-center gap-2 rounded-lg bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAiGenerating ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
        </div>
      </Modal>
    </InstructorLayout>
  );
}`;
content = content.replace(oldFooter, newFooter);

fs.writeFileSync(file, content);
console.log('Patch complete.');
