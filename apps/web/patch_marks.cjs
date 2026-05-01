const fs = require('fs');
const path = require('path');

const file = path.join('c:', 'Projects', 'CapstoneProject', 'apps', 'web', 'src', 'features', 'university-space', 'FinalMarksSheetPanel.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(
  "import {",
  "import { aiApi } from '../../api/aiApi';\nimport Modal from '../../components/ui/Modal';\nimport {"
);
content = content.replace(
  "Send,",
  "Send,\n  Sparkles,"
);

// 2. State & Logic
const oldState = `  const [notice, setNotice] = useState('');

  const fetchSheet = async (showLoader = true) => {`;

const newState = `  const [notice, setNotice] = useState('');

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const fetchSheet = async (showLoader = true) => {`;
content = content.replace(oldState, newState);

const oldLogic = `  const validateDrafts = () => {`;

const newLogic = `  const handleAnalyzePerformance = async () => {
    setIsAiAnalyzing(true);
    try {
      const summaryData = locked ? sheet?.summary : summariseRows(previewRows);
      const rowData = previewRows.map(r => ({
        studentName: r.studentName,
        attendance: r.attendanceScore,
        tests: r.testsScore,
        liveTests: r.liveTestsScore,
        projectScore: r.projectScore,
        finalScore: r.finalScore,
        grade: r.grade
      }));
      const contextData = {
        summary: summaryData,
        students: rowData
      };
      
      const result = await aiApi.analyzePerformance(
        "Analyze the class performance, highlight trends, outliers, and areas of improvement.", 
        JSON.stringify(contextData)
      );
      setAiAnalysis(result);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze performance with AI.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const validateDrafts = () => {`;
content = content.replace(oldLogic, newLogic);

// 3. AI Insights Button
const oldButtonArea = `        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchSheet(false)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>`;

const newButtonArea = `        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setShowAiModal(true); handleAnalyzePerformance(); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all shadow-glow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Analysis
          </button>
          <button
            onClick={() => fetchSheet(false)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>`;
content = content.replace(oldButtonArea, newButtonArea);

// 4. Modal
const oldFooter = `      </div>
    </div>
  );
}`;

const newFooter = `      </div>
      
      <Modal open={showAiModal} onClose={() => setShowAiModal(false)} title="AI Class Performance Analysis">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            AI-generated analysis of the overall class performance based on attendance, tests, and project scores.
          </p>
          <div className="p-4 bg-bg-elevated/50 border border-border-subtle rounded-xl min-h-[200px]">
            {isAiAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-amber-400 py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Analyzing class data...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="text-sm text-text-primary whitespace-pre-wrap">{aiAnalysis}</div>
            ) : (
              <div className="text-sm text-text-muted italic">No analysis available.</div>
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

    </div>
  );
}`;
content = content.replace(oldFooter, newFooter);

fs.writeFileSync(file, content);
console.log('Patch complete.');
