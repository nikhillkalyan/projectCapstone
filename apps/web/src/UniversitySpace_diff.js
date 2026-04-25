// ─── CHANGES TO MAKE IN UniversitySpace.jsx ───────────────────────────────────
//
// 1. ADD import at top (alongside LiveTestsPanel import):
import ProjectSpacePanel from '../instructor/ProjectSpacePanel';

// 2. ADD "Project Space" tab to studentTabs array (after 'marks'):
const studentTabs = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'marks', label: 'My Marks', icon: Award },
  { id: 'project', label: 'Project Space', icon: FolderOpen },  // ADD THIS
];

// 3. INSIDE StudioTab component, after the LiveTestsPanel block, ADD:
<div className="border-t border-border-subtle pt-5">
  <ProjectSpacePanel courseId={courseId} />
</div>

// 4. ADD student 'project' case in renderContent() switch:
case 'project':
  // We need the active courseId — student picks from their enrolled courses
  return <StudentProjectSpacePicker allocations={allocations} />;

// 5. ADD this small helper component (outside UniversitySpace, near StudentMarksTab):
function StudentProjectSpacePicker({ allocations }) {
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState(
    allocations.length === 1 ? allocations[0].courseId : null
  );

  if (!selectedCourseId) {
    return (
      <div className="space-y-3 py-2">
        <p className="text-sm text-text-secondary">Select a course to view your project group:</p>
        {allocations.map(a => (
          <button key={a.courseId}
            onClick={() => setSelectedCourseId(a.courseId)}
            className="w-full flex items-center gap-3 p-4 bg-bg-surface border border-border-subtle rounded-2xl hover:border-border-strong transition-all text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">{a.courseTitle}</p>
              <p className="text-xs text-text-muted">{a.instructorName}</p>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {allocations.length > 1 && (
        <button onClick={() => setSelectedCourseId(null)}
          className="text-xs text-text-muted hover:text-text-secondary flex items-center gap-1 font-semibold transition-colors">
          ← Back to course list
        </button>
      )}
      <ProjectSpacePanel courseId={selectedCourseId} />
    </div>
  );
}

// 6. ADD FolderGit2 to the lucide-react imports in UniversitySpace.jsx
//    (it's already imported in ProjectSpacePanel but UniversitySpace needs FolderOpen which is there already)
