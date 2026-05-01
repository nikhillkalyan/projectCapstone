const fs = require('fs');
const path = require('path');

const file = path.join('c:', 'Projects', 'CapstoneProject', 'apps', 'web', 'src', 'features', 'project-space', 'InstructorGroupCard.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(
  "import { assignProject, linkRepo, reviewProposal } from './api';",
  "import { assignProject, linkRepo, reviewProposal } from './api';\nimport { aiApi } from '../../api/aiApi';\nimport Modal from '../../components/ui/Modal';"
);
content = content.replace(
  "AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Eye, ExternalLink, FileText, Github, Link, Loader2, MessageSquareText, Send, Users, X,",
  "AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Eye, ExternalLink, FileText, Github, Link, Loader2, MessageSquareText, Send, Users, X, Sparkles,"
);

// 2. State & Logic
const oldState = `  const missingReports = Math.max((group.members?.length || 0) - (group.reports?.length || 0), 0);

  const handleLinkRepo = async () => {`;

const newState = `  const missingReports = Math.max((group.members?.length || 0) - (group.reports?.length || 0), 0);

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleGenerateSummary = async () => {
    setIsAiGenerating(true);
    try {
      const contextData = {
        name: group.name,
        members: group.members?.map(m => m.name),
        projectTitle: group.projectTitle || group.proposal?.projectTitle || 'N/A',
        proposalStatus: group.proposal?.status || 'Not submitted',
        repoLinked: !!group.repo,
        reportsSubmitted: group.reports?.length || 0,
        missingReports: missingReports,
        lastMessage: group.lastMessage?.messageText || 'No messages'
      };
      const result = await aiApi.summarizeProject("Summarize the progress of this group and identify any blockers.", JSON.stringify(contextData));
      setAiSummary(result);
    } catch (err) {
      console.error(err);
      setError('Failed to generate AI summary.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleLinkRepo = async () => {`;
content = content.replace(oldState, newState);

// 3. AI Insights Button
const oldButtonArea = `      <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpanded(value => !value)}>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/20 to-sky-500/15 border border-white/10 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-violet-300" />
        </div>
        <div className="flex-1 min-w-0">`;

const newButtonArea = `      <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpanded(value => !value)}>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/20 to-sky-500/15 border border-white/10 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-violet-300" />
        </div>
        <div className="flex-1 min-w-0">`;
// Wait, actually I will put the button in the expanded section, maybe near the grid.
const oldGridArea = `              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">`;
const newGridArea = `              <div className="flex justify-end mb-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAiModal(true); handleGenerateSummary(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold rounded-lg hover:bg-violet-500/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Insights
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">`;
content = content.replace(oldGridArea, newGridArea);

// 4. Modal
const oldFooter = `          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}`;

const newFooter = `          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={showAiModal} onClose={() => setShowAiModal(false)} title="AI Group Insights">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            AI-generated summary of <strong>{group.name}</strong> based on their proposal, repo status, and reports.
          </p>
          <div className="p-4 bg-bg-elevated/50 border border-border-subtle rounded-xl min-h-[150px]">
            {isAiGenerating ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-primary-400 py-6">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Analyzing group data...</span>
              </div>
            ) : aiSummary ? (
              <div className="text-sm text-text-primary whitespace-pre-wrap">{aiSummary}</div>
            ) : (
              <div className="text-sm text-text-muted italic">No summary available.</div>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowAiModal(false)}
              className="px-5 py-2 rounded-lg bg-bg-elevated border border-border-subtle text-text-primary font-medium hover:bg-bg-elevated-hover transition-colors"
            >
              Close
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
