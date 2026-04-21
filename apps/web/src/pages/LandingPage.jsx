import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, GraduationCap, Zap, BookOpen, Users, Award, Code, TrendingUp, Layers } from 'lucide-react';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Structured Course Studio',
    desc: 'Instructors build rich courses with chapters, assessments, and video content — all in one clean studio.',
    accent: '#6366f1',
  },
  {
    icon: Users,
    title: 'University Space',
    desc: 'Private institutional portals with section-based course allocation, live tests, and internal mark tracking.',
    accent: '#22d3ee',
  },
  {
    icon: TrendingUp,
    title: 'Live Internal Marks',
    desc: 'Students see their running scores across every evaluation category update in real time as they progress.',
    accent: '#a78bfa',
  },
  {
    icon: Code,
    title: 'GitHub-Backed Projects',
    desc: 'Team projects with real GitHub repos, PR tracking, branch trees, and weekly contribution reports.',
    accent: '#34d399',
  },
  {
    icon: Award,
    title: 'Verified Certificates',
    desc: 'University-stamped certificates generated automatically after instructor submits the final marks sheet.',
    accent: '#f59e0b',
  },
  {
    icon: Layers,
    title: 'Multi-Portal Architecture',
    desc: 'Separate portals for students, instructors, and university admins — clean and zero overlap.',
    accent: '#f472b6',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouse = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  const px = (mousePos.x - 0.5) * 20;
  const py = (mousePos.y - 0.5) * 12;

  return (
    <div className="min-h-screen bg-[#04050e] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,400&display=swap');

        .font-display { font-family: 'Fraunces', Georgia, serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes orb {
          0%,100% { transform: translate(0,0); }
          33%      { transform: translate(30px,-20px); }
          66%      { transform: translate(-15px,25px); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 16px rgba(99,102,241,0.35); }
          50%      { box-shadow: 0 0 32px rgba(99,102,241,0.7); }
        }

        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }

        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 45%, #67e8f9 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          transition: all 0.25s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.45);
        }

        .btn-ghost {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          transition: all 0.25s ease;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-2px);
        }

        .feature-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.13);
          transform: translateY(-5px);
        }

        .nav-link {
          color: rgba(255,255,255,0.45);
          transition: color 0.2s;
        }
        .nav-link:hover { color: rgba(255,255,255,0.9); }

        .orb  { animation: orb 14s ease-in-out infinite; }
        .orb2 { animation: orb 18s ease-in-out infinite reverse; }
        .float  { animation: float 6s ease-in-out infinite; }
        .float2 { animation: float 8s ease-in-out infinite; animation-delay: 1.5s; }
        .logo-glow { animation: glow-pulse 3s ease-in-out infinite; }

        .noise {
          position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="noise" />

      {/* NAV */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrollY > 40 ? 'rgba(4,5,14,0.88)' : 'transparent',
          backdropFilter: scrollY > 40 ? 'blur(18px)' : 'none',
          borderBottom: scrollY > 40 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-3">
            <div className="logo-glow flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-[20px] font-bold text-white">EduForge</span>
          </button>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => navigate('/student/login')} className="nav-link px-4 py-2 text-sm font-medium rounded-lg">
              Student Login
            </button>
            <button onClick={() => navigate('/instructor/login')} className="nav-link px-4 py-2 text-sm font-medium rounded-lg">
              Instructor Login
            </button>
            <button onClick={() => navigate('/student/signup')} className="btn-primary ml-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
              Get Started
            </button>
          </div>

          <button onClick={() => navigate('/student/signup')} className="md:hidden btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-white">
            Get Started
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="orb pointer-events-none absolute left-[5%] top-[15%] h-[480px] w-[480px] rounded-full opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(70px)' }} />
        <div className="orb2 pointer-events-none absolute right-[8%] top-[25%] h-[360px] w-[360px] rounded-full opacity-[0.1]"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-20">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* LEFT */}
            <div>
              <div className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-4 py-1.5" style={{ animationDelay: '0.05s' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300">Modern LMS Platform</span>
              </div>

              <h1 className="fade-up font-display text-[56px] font-bold leading-[0.93] tracking-tight lg:text-[68px]" style={{ animationDelay: '0.12s' }}>
                Learn with<br />
                <span className="gradient-text">clarity.</span><br />
                Teach with<br />
                <span className="gradient-text">impact.</span>
              </h1>

              <p className="fade-up mt-6 max-w-md text-[16px] leading-7 text-white/45" style={{ animationDelay: '0.22s' }}>
                A premium learning platform connecting students and instructors — with a full university-grade space for institutional course delivery, live assessments, and project-based evaluation.
              </p>

              <div className="fade-up mt-9 flex flex-wrap gap-3" style={{ animationDelay: '0.32s' }}>
                <button onClick={() => navigate('/student/signup')}
                  className="btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold text-white">
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate('/instructor/signup')}
                  className="btn-ghost inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold text-white/75">
                  <GraduationCap className="h-4 w-4 text-indigo-400" />
                  Become an Instructor
                </button>
              </div>
            </div>

            {/* RIGHT — UI Preview */}
            <div className="relative hidden lg:flex items-center justify-center h-[500px]">
              <div
                className="float relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/10"
                style={{
                  background: 'linear-gradient(145deg, #0d0f22, #0a0c1c)',
                  boxShadow: '0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
                  transform: `perspective(900px) rotateY(${px * 0.25}deg) rotateX(${-py * 0.18}deg)`,
                  transition: 'transform 0.12s ease',
                }}
              >
                <div className="flex items-center gap-2 border-b border-white/6 px-4 py-3">
                  <div className="flex gap-1.5">
                    {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
                  </div>
                  <div className="mx-auto flex h-5 items-center rounded-md bg-white/5 px-3">
                    <span className="text-[10px] text-white/25">University Space</span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  {[
                    { title: 'Data Structures & Algorithms', tag: 'CSE · 2nd Year', pct: 72, color: '#6366f1' },
                    { title: 'Database Management Systems', tag: 'CSE · 3rd Year', pct: 45, color: '#22d3ee' },
                    { title: 'Machine Learning Fundamentals', tag: 'AI/ML · 4th Year', pct: 88, color: '#a78bfa' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.025] p-3"
                      style={{ animation: `fadeUp 0.5s ease both ${0.4 + i * 0.1}s` }}>
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `${c.color}20` }}>
                        <BookOpen className="h-4 w-4" style={{ color: c.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[11px] font-semibold text-white/85">{c.title}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{c.tag}</p>
                        <div className="mt-1.5 h-1 rounded-full bg-white/8">
                          <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold flex-shrink-0" style={{ color: c.color }}>{c.pct}%</span>
                    </div>
                  ))}

                  <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 p-3"
                    style={{ animation: 'fadeUp 0.5s ease both 0.7s' }}>
                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-400 animate-pulse" />
                    <p className="text-[11px] font-medium text-red-300">Live test starting — <span className="font-bold">DBMS Unit 3</span></p>
                    <button className="ml-auto flex-shrink-0 rounded-lg bg-red-500/20 px-2.5 py-1 text-[10px] font-bold text-red-300">Join</button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.025] p-3"
                    style={{ animation: 'fadeUp 0.5s ease both 0.82s' }}>
                    <div>
                      <p className="text-[10px] text-white/35 font-medium">Internal Score</p>
                      <p className="font-display text-2xl font-bold text-white mt-0.5">79.2 <span className="text-sm text-white/30 font-sans font-normal">/ 100</span></p>
                    </div>
                    <div className="flex items-end gap-1">
                      {[65, 80, 72, 88, 79].map((v, i) => (
                        <div key={i} className="w-3 rounded-sm" style={{ height: `${v * 0.36}px`, background: `rgba(99,102,241,${0.3 + (v / 200)})` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="float2 absolute -left-6 top-10 rounded-2xl border border-white/10 bg-[#0d0f22]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <p className="text-[10px] text-white/35 font-medium">Certificate Issued</p>
                <p className="text-xs font-bold text-white mt-0.5">Arjun · DSA Course</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <Award className="h-3 w-3 text-amber-400" />
                  <span className="text-[10px] text-amber-400 font-semibold">Grade A</span>
                </div>
              </div>

              <div className="float absolute -right-5 bottom-16 rounded-2xl border border-emerald-500/20 bg-[#0d0f22]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[11px] font-semibold text-emerald-300">8 PRs merged today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 pb-28 pt-4">
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl font-bold text-white lg:text-5xl">
            Everything in one <span className="gradient-text italic">platform.</span>
          </h2>
          <p className="mt-4 text-white/40 text-[16px] max-w-lg mx-auto">
            From open courses to full university-grade evaluation — EduForge handles it all.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card group cursor-default rounded-2xl p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${f.accent}18` }}>
                <f.icon className="h-5 w-5" style={{ color: f.accent }} />
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm leading-6 text-white/40">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-10 py-16 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold text-white lg:text-5xl mb-3">Ready to get started?</h2>
            <p className="text-indigo-200 text-[16px] mb-9 max-w-md mx-auto">
              Join EduForge as a student or instructor and start building your learning journey today.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate('/student/signup')}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-[15px] font-bold text-indigo-700 transition-transform hover:-translate-y-1">
                Join as Student <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate('/instructor/signup')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-white/18 hover:-translate-y-1">
                <GraduationCap className="h-4 w-4" /> Join as Instructor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/6 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display text-[15px] font-bold text-white/70">EduForge</span>
          </div>
          <p className="text-sm text-white/25">© 2025 EduForge. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <button key={l} className="text-sm text-white/25 hover:text-white/60 transition-colors">{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}