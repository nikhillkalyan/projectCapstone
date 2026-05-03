import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Info,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

const isStructured = (result) =>
  result &&
  typeof result === 'object' &&
  !Array.isArray(result) &&
  (
    result.summary ||
    result.highlights ||
    result.risks ||
    result.recommendations
  );

const parseIfString = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;

  try {
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);
    if (isStructured(parsed)) return parsed;
  } catch {
    // Fall back to plain text rendering below.
  }

  return {
    summary: raw,
    highlights: [],
    risks: [],
    recommendations: [],
  };
};

function InsightSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 w-3/4 rounded-lg bg-bg-elevated" />
      <div className="h-4 w-full rounded-lg bg-bg-elevated" />
      <div className="h-4 w-5/6 rounded-lg bg-bg-elevated" />
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-16 rounded-xl bg-bg-elevated" />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {[1, 2].map((item) => (
          <div key={item} className="h-12 rounded-xl bg-bg-elevated" />
        ))}
      </div>
    </div>
  );
}

const CHIP_STYLES = {
  strength: {
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: TrendingUp,
    iconColor: 'text-emerald-400',
  },
  risk: {
    bg: 'bg-red-500/10 border-red-500/20',
    icon: AlertTriangle,
    iconColor: 'text-red-400',
  },
  watch: {
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: Info,
    iconColor: 'text-amber-400',
  },
  action: {
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    icon: Target,
    iconColor: 'text-indigo-400',
  },
};

function InsightChip({ type = 'strength', children, index = 0 }) {
  const style = CHIP_STYLES[type] || CHIP_STYLES.strength;
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className={`flex items-start gap-3 rounded-xl border p-3.5 ${style.bg}`}
    >
      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${style.bg}`}>
        <Icon className={`h-3.5 w-3.5 ${style.iconColor}`} />
      </div>
      <p className="text-sm leading-relaxed text-text-primary">{children}</p>
    </motion.div>
  );
}

function GradeDistributionBar({ distribution }) {
  if (!distribution || !Object.keys(distribution).length) return null;

  const grades = ['S', 'A', 'B', 'C', 'D', 'F'];
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  if (!total) return null;

  const gradeColors = {
    S: { bar: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    A: { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    B: { bar: 'bg-indigo-400', text: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    C: { bar: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    D: { bar: 'bg-orange-400', text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    F: { bar: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-3 rounded-2xl border border-border-subtle/60 bg-bg-elevated/40 p-4"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Grade Distribution</p>

      <div className="flex h-2.5 overflow-hidden rounded-full gap-px">
        {grades.map((grade) => {
          const count = distribution[grade] || 0;
          const percentage = total ? (count / total) * 100 : 0;
          if (!percentage) return null;

          return (
            <motion.div
              key={grade}
              className={`h-full ${gradeColors[grade]?.bar || 'bg-text-muted'}`}
              style={{ width: `${percentage}%` }}
              initial={{ scaleX: 0, transformOrigin: 'left' }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {grades.map((grade) => {
          const count = distribution[grade] || 0;
          if (!count) return null;

          const color = gradeColors[grade] || {};
          return (
            <span
              key={grade}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${color.bg} ${color.text}`}
            >
              {grade} · {count}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}

function PerformerSpotlight({ performers = [], type = 'top' }) {
  if (!performers.length) return null;

  const isTop = type === 'top';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className={`rounded-2xl border p-4 ${
        isTop
          ? 'bg-emerald-500/5 border-emerald-500/15'
          : 'bg-amber-500/5 border-amber-500/15'
      }`}
    >
      <p className={`mb-3 text-[10px] font-bold uppercase tracking-widest ${isTop ? 'text-emerald-400' : 'text-amber-400'}`}>
        {isTop ? 'Top Performers' : 'Needs Attention'}
      </p>
      <div className="space-y-2">
        {performers.slice(0, 3).map((performer, index) => {
          const isObject = typeof performer === 'object' && performer !== null;
          const name = isObject ? performer.name : performer;
          const score = isObject ? performer.score : undefined;

          return (
            <div key={`${name || 'performer'}-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                    isTop ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {name?.charAt(0) || '?'}
                </div>
                <span className="truncate text-xs text-text-primary">{name}</span>
              </div>
              {score !== undefined && (
                <span className={`shrink-0 text-xs font-bold ${isTop ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {Number(score).toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-bold text-text-muted transition-all hover:border-border-default hover:text-text-secondary"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function Section({ title, icon: Icon, color, children, defaultOpen = true, delay = 0 }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <button onClick={() => setOpen((value) => !value)} className="group mb-3 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated">
            <Icon className={`h-3.5 w-3.5 ${color}`} />
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-text-muted transition-colors group-hover:text-text-secondary" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-text-muted transition-colors group-hover:text-text-secondary" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AIInsightPanel({
  result,
  loading = false,
  error = '',
  onRetry,
  title = 'AI Insights',
  context = '',
  variant = 'generic',
}) {
  const parsed = parseIfString(result);
  const structured = isStructured(parsed);

  const rawText = structured
    ? [
        parsed.summary || '',
        ...(parsed.highlights || []),
        ...(parsed.risks || []),
        ...(parsed.recommendations || []),
      ].join('\n')
    : (typeof result === 'string' ? result : '');

  if (loading) {
    return (
      <div className="space-y-4 p-5">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded bg-bg-elevated" />
            <div className="h-2.5 w-48 animate-pulse rounded bg-bg-elevated" />
          </div>
        </div>
        <InsightSkeleton />
        <p className="mt-4 animate-pulse text-center text-xs text-text-muted">
          Analyzing data with AI · This takes a moment...
        </p>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <div className="text-center">
          <p className="mb-1 text-sm font-bold text-text-primary">Analysis failed</p>
          <p className="text-xs text-text-muted">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-xl border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-xs font-bold text-primary-400 transition-all hover:bg-primary-500/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <Sparkles className="h-8 w-8 text-text-muted opacity-30" />
        <p className="text-sm italic text-text-muted">No analysis available.</p>
      </div>
    );
  }

  if (structured) {
    return (
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 to-orange-500/10">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">{title}</p>
              {context && <p className="text-[10px] text-text-muted">{context}</p>}
            </div>
          </div>
          <CopyButton text={rawText} />
        </div>

        {parsed.summary && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-border-subtle/60 bg-bg-elevated/50 p-4"
          >
            <p className="text-sm leading-relaxed text-text-primary">{parsed.summary}</p>
          </motion.div>
        )}

        {variant === 'performance' && parsed.gradeDistribution && (
          <GradeDistributionBar distribution={parsed.gradeDistribution} />
        )}

        {variant === 'performance' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {parsed.topPerformers?.length > 0 && (
              <PerformerSpotlight performers={parsed.topPerformers} type="top" />
            )}
            {parsed.needsAttention?.length > 0 && (
              <PerformerSpotlight performers={parsed.needsAttention} type="watch" />
            )}
          </div>
        )}

        {parsed.highlights?.length > 0 && (
          <Section title="Strengths" icon={TrendingUp} color="text-emerald-400" delay={0.1}>
            <div className="space-y-2">
              {parsed.highlights.map((item, index) => (
                <InsightChip key={`highlight-${index}`} type="strength" index={index}>
                  {item}
                </InsightChip>
              ))}
            </div>
          </Section>
        )}

        {parsed.risks?.length > 0 && (
          <Section title="Risks & Concerns" icon={AlertTriangle} color="text-red-400" delay={0.18}>
            <div className="space-y-2">
              {parsed.risks.map((item, index) => (
                <InsightChip key={`risk-${index}`} type="risk" index={index}>
                  {item}
                </InsightChip>
              ))}
            </div>
          </Section>
        )}

        {parsed.recommendations?.length > 0 && (
          <Section title="Recommendations" icon={Lightbulb} color="text-indigo-400" delay={0.25}>
            <div className="space-y-2">
              {parsed.recommendations.map((item, index) => (
                <InsightChip key={`recommendation-${index}`} type="action" index={index}>
                  {item}
                </InsightChip>
              ))}
            </div>
          </Section>
        )}

        {onRetry && (
          <div className="flex justify-end pt-1">
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-xs font-semibold text-text-muted transition-colors hover:text-text-secondary"
            >
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-text-muted">{title}</span>
        </div>
        <CopyButton text={rawText} />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border-subtle/60 bg-bg-elevated/50 p-4"
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">{rawText}</p>
      </motion.div>
      {onRetry && (
        <div className="flex justify-end">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted transition-colors hover:text-text-secondary"
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
