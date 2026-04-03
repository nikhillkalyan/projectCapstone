import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  GraduationCap,
  Users,
  Trophy,
  Zap,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

const categories = [
  { name: 'AI & Machine Learning', icon: '🤖', key: 'AIML', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', courses: 12 },
  { name: 'Cloud Computing', icon: '☁️', key: 'Cloud', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', courses: 8 },
  { name: 'Data Science', icon: '📊', key: 'DataScience', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', courses: 10 },
  { name: 'Cybersecurity', icon: '🔒', key: 'Cybersecurity', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', courses: 7 },
];

const stats = [
  { value: '10,000+', label: 'Students Enrolled', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { value: '200+', label: 'Expert Instructors', icon: GraduationCap, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { value: '500+', label: 'Courses Available', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: '95%', label: 'Completion Rate', icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-base overflow-x-hidden text-text-primary selection:bg-primary-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-xl border-b border-border-subtle/50 px-4 md:px-8 h-20 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-syne font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            EduForge
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/student/login')}
            className="hidden sm:inline-flex px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors"
          >
            Student Login
          </button>
          <button
            onClick={() => navigate('/instructor/login')}
            className="hidden sm:inline-flex px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors"
          >
            Instructor Login
          </button>
          <button
            onClick={() => navigate('/student/signup')}
            className="px-5 py-2.5 text-sm font-bold bg-white text-black rounded-xl hover:bg-white/90 transition-colors shadow-lg shadow-white/10"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide mb-8">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>India's Top Tech Learning Platform</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up font-syne font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[1.05] mb-6" style={{ animationDelay: '0.1s' }}>
            <span className="bg-gradient-to-r from-primary-400 via-teal-300 to-teal-500 bg-clip-text text-transparent">Forge Your</span>
            <br />
            <span className="text-white">Tech Career</span>
          </h1>

          <p className="animate-fade-in-up text-text-secondary md:text-lg max-w-2xl mx-auto leading-relaxed mb-10" style={{ animationDelay: '0.2s' }}>
            Learn from industry experts in AI/ML, Cloud, Data Science & Cybersecurity.
            Earn certificates that matter. Build projects that impress.
          </p>

          <div className="animate-fade-in-up flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => navigate('/student/signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all"
            >
              Start Learning Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/instructor/signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-bg-surface border border-border-subtle text-text-primary rounded-2xl font-bold text-lg hover:bg-bg-elevated transition-colors"
            >
              Become an Instructor
            </button>
          </div>

          {/* Floating Cards (Desktop Only) */}
          <div className="hidden lg:block absolute left-4 xl:left-12 top-[60%] -translate-y-1/2 animate-fade-in-up w-56 p-4 rounded-3xl bg-bg-surface/80 backdrop-blur-xl border border-border-subtle shadow-2xl" style={{ animationDelay: '0.4s' }}>
            <div className="text-xs font-bold text-text-muted mb-1">Course Completed</div>
            <div className="font-syne font-bold text-text-primary mb-3">ML Fundamentals</div>
            <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden mb-2">
              <div className="h-full w-full bg-teal-400 rounded-full" />
            </div>
            <div className="text-xs font-bold text-teal-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Complete
            </div>
          </div>

          <div className="hidden lg:block absolute right-4 xl:right-12 top-[45%] lg:top-[35%] xl:top-[35%] animate-fade-in-up w-56 p-4 rounded-3xl bg-bg-surface/80 backdrop-blur-xl border border-border-subtle shadow-2xl" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div className="font-syne font-bold text-amber-400 text-sm">Certificate Earned!</div>
            </div>
            <div className="text-xs text-text-secondary">AWS Cloud Architect</div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border-subtle/50 bg-bg-surface/30">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
              {stats.map((stat, idx) => (
                <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${0.1 * idx}s` }}>
                  <div className={`w-12 h-12 rounded-xl mx-auto ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="font-syne font-extrabold text-3xl md:text-4xl text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-text-secondary">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 px-4 max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="font-syne font-bold text-3xl md:text-5xl text-white mb-4">What You'll Learn</h2>
            <p className="text-text-secondary text-lg">Industry-focused courses designed for the future of tech</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <div
                key={cat.key}
                onClick={() => navigate('/student/signup')}
                className={`animate-fade-in-up cursor-pointer group relative p-6 rounded-3xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all duration-300 hover:-translate-y-2`}
                style={{ animationDelay: `${0.1 * idx}s` }}
              >
                {/* Subtle gradient hover background */}
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none layout-bg ${cat.bg}`} />

                <div className="relative z-10 text-center flex flex-col items-center">
                  <span className="text-5xl block mb-4 transform group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                  <h3 className="font-syne font-bold text-lg text-white mb-3">{cat.name}</h3>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${cat.bg} ${cat.color} ${cat.border} border`}>
                    {cat.courses} Courses
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 max-w-4xl mx-auto">
          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-bg-surface to-bg-elevated p-10 md:p-16 text-center border border-border-subtle overflow-hidden">
            {/* Decorative Glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary-500/20 blur-[80px]" />

            <div className="relative z-10">
              <span className="text-5xl block mb-6 transform hover:scale-110 transition-transform cursor-default">🚀</span>
              <h2 className="font-syne font-bold text-3xl md:text-5xl text-white mb-4">Ready to Forge Your Future?</h2>
              <p className="text-text-secondary text-lg mb-10">Join thousands of students learning cutting-edge tech skills.</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/student/signup')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-white/90 transition-colors"
                >
                  <GraduationCap className="w-5 h-5" />
                  Join as Student
                </button>
                <button
                  onClick={() => navigate('/instructor/signup')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600/20 border border-primary-500/30 text-primary-400 rounded-2xl font-bold text-lg hover:bg-primary-600/30 transition-colors"
                >
                  <Users className="w-5 h-5" />
                  Join as Instructor
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border-subtle/50 py-10 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-teal-400 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-syne font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              EduForge
            </span>
          </div>
          <p className="text-text-muted text-sm">&copy; {new Date().getFullYear()} EduForge. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}