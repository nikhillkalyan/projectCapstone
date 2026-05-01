const fs = require('fs');
const path = require('path');

const file = path.join('c:', 'Projects', 'CapstoneProject', 'apps', 'web', 'src', 'pages', 'instructor', 'CreateUniversityCourse.jsx');
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// 1. Imports
content = content.replace(
  "import api from '../../lib/api';",
  "import api from '../../lib/api';\nimport { aiApi } from '../../api/aiApi';\nimport Modal from '../../components/ui/Modal';"
);

// 2. State & Generate logic
const oldState = `  const isWeightValid = totalWeight === 100;

  const handleSubmit = async (e) => {`;

const newState = `  const isWeightValid = totalWeight === 100;

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleGenerateCourse = async () => {
    if (!aiPrompt) return;
    setIsAiGenerating(true);
    try {
       const result = await aiApi.generateCourse(aiPrompt, "University level course");
       setForm(prev => ({
           ...prev,
           title: result.title || prev.title,
           description: result.description || prev.description,
           longDescription: result.description || prev.longDescription,
       }));
       if (result.suggestedWeightages) {
           setWeights({
               weightTests: result.suggestedWeightages.tests || 30,
               weightAttendance: result.suggestedWeightages.attendance || 10,
               weightLiveTests: result.suggestedWeightages.liveTests || 20,
               weightProject: result.suggestedWeightages.project || 40,
           });
       }
       setShowAiModal(false);
       setAiPrompt('');
    } catch (err) {
       console.error(err);
       setError('Failed to generate course with AI.');
    } finally {
       setIsAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {`;
content = content.replace(oldState, newState);

// 3. Header button
const oldHeader = `        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-3xl font-syne font-bold text-text-primary">Create University Course</h1>
          </div>
          <p className="text-text-secondary ml-13">
            This course will be submitted to your University Admin for review before it can be allocated to sections.
          </p>
        </motion.div>`;
const newHeader = `        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                </div>
                <h1 className="text-3xl font-syne font-bold text-text-primary">Create University Course</h1>
              </div>
              <p className="text-text-secondary ml-13">
                This course will be submitted to your University Admin for review before it can be allocated to sections.
              </p>
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
        </form>
      </div>
    </InstructorLayout>
  );
}`;
const newFooter = `          </div>
        </form>
      </div>

      <Modal open={showAiModal} onClose={() => !isAiGenerating && setShowAiModal(false)} title="AI Course Generator">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Describe the university course you want to teach. The AI will generate a title, description, and suggested weightages.
          </p>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isAiGenerating}
            rows={4}
            className="glass-input w-full rounded-lg px-4 py-3 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
            placeholder="e.g. A comprehensive course on React 18 for 3rd-year students, including project-based learning."
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
