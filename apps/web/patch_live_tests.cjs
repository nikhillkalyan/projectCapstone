const fs = require('fs');
const path = require('path');

const file = path.join('c:', 'Projects', 'CapstoneProject', 'apps', 'web', 'src', 'pages', 'instructor', 'LiveTestsPanel.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(
  "import api from '../../lib/api';",
  "import api from '../../lib/api';\nimport { aiApi } from '../../api/aiApi';\nimport Modal from '../../components/ui/Modal';"
);

// 2. State & Generate logic
const oldState = `function CreateLiveTestForm({ courseId, onCreated, onCancel }) {
  const [form, setForm] = useState({ title: '', durationMinutes: 30, passingScore: 70, scheduledAt: '' });
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const scheduleInputRef = useRef(null);
  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleCreate = async () => {`;

const newState = `function CreateLiveTestForm({ courseId, onCreated, onCancel }) {
  const [form, setForm] = useState({ title: '', durationMinutes: 30, passingScore: 70, scheduledAt: '' });
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const scheduleInputRef = useRef(null);
  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!aiPrompt) return;
    setIsAiGenerating(true);
    try {
      const result = await aiApi.generateQuiz(aiPrompt, form.title || "Live Test Topic");
      if (result && Array.isArray(result)) {
         setQuestions(result.map(q => ({
            questionText: q.questionText || '',
            options: q.options || ['', '', '', ''],
            correctOptionIndex: q.correctOptionIndex || 0
         })));
      }
      setShowAiModal(false);
      setAiPrompt('');
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz with AI.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreate = async () => {`;
content = content.replace(oldState, newState);

// 3. Header button in Question Builder section of CreateLiveTestForm
const oldHeader = `      <div>
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-text-primary">Questions</span>
          <span className="text-xs text-text-muted">({questions.length})</span>
        </div>
        <QuestionBuilder questions={questions} onChange={setQuestions} />
      </div>`;

const newHeader = `      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-text-primary">Questions</span>
            <span className="text-xs text-text-muted">({questions.length})</span>
          </div>
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Auto-Generate
          </button>
        </div>
        <QuestionBuilder questions={questions} onChange={setQuestions} />
      </div>`;
content = content.replace(oldHeader, newHeader);

// 4. Modal at end of CreateLiveTestForm
const oldFooter = `      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-xl hover:border-border-strong transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={submitting}
          className="flex items-center gap-1.5 px-5 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-all disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Create Test
        </button>
      </div>
    </motion.div>
  );
}`;

const newFooter = `      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-xl hover:border-border-strong transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={submitting}
          className="flex items-center gap-1.5 px-5 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-all disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Create Test
        </button>
      </div>

      <Modal open={showAiModal} onClose={() => !isAiGenerating && setShowAiModal(false)} title="AI Quiz Generator">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Provide a topic or paste chapter content. The AI will generate multiple choice questions for you.
          </p>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isAiGenerating}
            rows={4}
            className="glass-input w-full rounded-lg px-4 py-3 text-text-primary outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
            placeholder="e.g. Generate 5 questions about React Hooks..."
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
              onClick={handleGenerateQuiz}
              disabled={!aiPrompt.trim() || isAiGenerating}
              className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-5 py-2 text-sm font-semibold text-amber-400 shadow-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/30 hover:bg-amber-500 hover:text-bg-base"
            >
              {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAiGenerating ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </div>
      </Modal>

    </motion.div>
  );
}`;
content = content.replace(oldFooter, newFooter);

fs.writeFileSync(file, content);
console.log('Patch complete.');
