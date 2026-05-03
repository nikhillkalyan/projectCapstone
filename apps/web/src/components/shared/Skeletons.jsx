function Pulse({ className = '', style }) {
  return <div className={`animate-pulse rounded-xl bg-bg-elevated ${className}`} style={style} />;
}

function PulseText({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className}`} />;
}

export function CourseCardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-border-subtle bg-bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Pulse className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="space-y-2 pt-1">
            <PulseText className="h-3.5 w-40" />
            <PulseText className="h-2.5 w-24" />
          </div>
        </div>
        <Pulse className="h-6 w-16 rounded-full" />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between">
          <PulseText className="h-2.5 w-20" />
          <PulseText className="h-2.5 w-8" />
        </div>
        <Pulse className="h-1.5 w-full rounded-full" />
      </div>

      <div className="flex gap-1.5">
        {[48, 52, 44, 56].map((width) => (
          <Pulse key={width} className="h-5 rounded-full" style={{ width: `${width}px` }} />
        ))}
      </div>

      <Pulse className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function MarksCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
      <div className="flex items-center justify-between border-b border-border-subtle p-5">
        <div className="flex items-center gap-3">
          <Pulse className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="space-y-2">
            <PulseText className="h-3.5 w-36" />
            <PulseText className="h-2.5 w-24" />
          </div>
        </div>
        <div className="space-y-1 text-center">
          <Pulse className="mx-auto h-8 w-10 rounded-lg" />
          <PulseText className="h-2.5 w-10" />
        </div>
      </div>

      <div className="space-y-4 p-5">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pulse className="h-2 w-2 rounded-full" />
                <PulseText className="h-2.5 w-24" />
                <Pulse className="h-4 w-8 rounded-full" />
              </div>
              <div className="flex gap-2">
                <PulseText className="h-2.5 w-12" />
                <PulseText className="h-2.5 w-8" />
              </div>
            </div>
            <Pulse className="h-1.5 w-full rounded-full" />
          </div>
        ))}

        <div className="space-y-2 border-t border-border-subtle pt-3">
          <div className="flex justify-between">
            <PulseText className="h-3 w-20" />
            <PulseText className="h-5 w-24" />
          </div>
          <Pulse className="h-2.5 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StudentRowSkeleton({ count = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-surface p-4">
          <Pulse className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <PulseText className="h-3 w-32" />
            <PulseText className="h-2.5 w-20" />
          </div>
          <div className="hidden gap-3 sm:flex">
            <Pulse className="h-8 w-10 rounded-lg" />
            <Pulse className="h-8 w-10 rounded-lg" />
          </div>
          <div className="hidden w-24 space-y-1 md:block">
            <Pulse className="h-1 w-full rounded-full" />
          </div>
          <div className="w-16 space-y-1 text-right">
            <Pulse className="ml-auto h-5 w-12 rounded-lg" />
            <Pulse className="ml-auto h-3 w-6 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatGridSkeleton({ cols = 3 }) {
  return (
    <div className={`grid gap-4 ${cols === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
      {Array.from({ length: cols }).map((_, index) => (
        <div key={index} className="space-y-2 rounded-2xl border border-border-subtle bg-bg-surface p-5">
          <Pulse className="mx-auto h-8 w-12 rounded-lg" />
          <PulseText className="mx-auto h-2.5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ChapterCardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-bg-surface p-4">
          <Pulse className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <PulseText className="h-3 w-48" />
              <Pulse className="h-4 w-12 rounded-md" />
            </div>
            <div className="flex gap-3">
              <PulseText className="h-2.5 w-16" />
              <PulseText className="h-2.5 w-20" />
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Pulse className="h-8 w-8 rounded-lg" />
            <Pulse className="h-8 w-8 rounded-lg" />
            <Pulse className="h-6 w-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InstructorCourseCardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-start gap-4 rounded-2xl border border-border-subtle bg-bg-surface p-5">
          <Pulse className="h-11 w-11 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <PulseText className="h-3.5 w-48" />
              <Pulse className="h-5 w-16 rounded-full" />
            </div>
            <PulseText className="h-2.5 w-64" />
            <div className="flex gap-3 pt-1">
              <PulseText className="h-2.5 w-20" />
              <PulseText className="h-2.5 w-16" />
              <PulseText className="h-2.5 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function GroupCardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-bg-surface p-5">
          <Pulse className="h-11 w-11 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <PulseText className="h-3.5 w-32" />
              <Pulse className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex gap-3">
              <PulseText className="h-2.5 w-16" />
              <PulseText className="h-2.5 w-32" />
            </div>
          </div>
          <Pulse className="h-7 w-24 rounded-xl" />
          <Pulse className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function FinalMarksSheetSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Pulse className="h-4 w-4 rounded" />
              <PulseText className="h-3.5 w-32" />
              <Pulse className="h-5 w-16 rounded-full" />
            </div>
            <PulseText className="h-2.5 w-80" />
          </div>
          <div className="flex gap-2">
            <Pulse className="h-8 w-24 rounded-xl" />
            <Pulse className="h-8 w-20 rounded-xl" />
            <Pulse className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="space-y-2 rounded-2xl border border-border-subtle bg-bg-surface p-4">
            <Pulse className="h-7 w-12 rounded-lg" />
            <PulseText className="h-2.5 w-14" />
          </div>
        ))}
      </div>

      <StudentRowSkeleton count={5} />
    </div>
  );
}
