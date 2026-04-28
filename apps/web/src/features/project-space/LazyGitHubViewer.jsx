import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const GitHubViewer = lazy(() => import('./GitHubViewer'));

function GitHubViewerFallback() {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-text-muted">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading repository workspace...
    </div>
  );
}

export default function LazyGitHubViewer(props) {
  return (
    <Suspense fallback={<GitHubViewerFallback />}>
      <GitHubViewer {...props} />
    </Suspense>
  );
}
