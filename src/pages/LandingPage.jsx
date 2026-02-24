import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Award, ArrowRight, Zap, Star, ChevronDown, Code, Cloud, Shield, BarChart3 } from 'lucide-react';

const categories = [
  { name: 'AI & Machine Learning', icon: '🤖', color: 'badge-aiml', courses: 12, key: 'AIML' },
  { name: 'Cloud Computing', icon: '☁️', color: 'badge-cloud', courses: 8, key: 'Cloud' },
  { name: 'Data Science', icon: '📊', color: 'badge-datascience', courses: 10, key: 'DataScience' },
  { name: 'Cybersecurity', icon: '🔒', color: 'badge-cybersecurity', courses: 7, key: 'Cybersecurity' },
];

const stats = [
  { value: '10,000+', label: 'Students Enrolled' },
  { value: '200+', label: 'Expert Instructors' },
  { value: '500+', label: 'Courses Available' },
  { value: '95%', label: 'Completion Rate' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hero-gradient grid-bg relative overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5" style={{ background: 'rgba(20, 25, 40, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(172, 186, 196, 0.1)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-glow" style={{ background: 'linear-gradient(135deg, #6B7FD4, #4ECDC4)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text" style={{ fontFamily: 'Syne' }}>EduForge</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student/login')} className="btn-outline px-5 py-2 rounded-xl text-sm">
              Student Login
            </button>
            <button onClick={() => navigate('/instructor/login')} className="btn-outline px-5 py-2 rounded-xl text-sm">
              Instructor Login
            </button>
            <button onClick={() => navigate('/student/signup')} className="btn-sand px-5 py-2 rounded-xl text-sm">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-8 relative">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fadeInUp" style={{ background: 'rgba(107, 127, 212, 0.15)', border: '1px solid rgba(107, 127, 212, 0.3)' }}>
            <Star size={14} style={{ color: '#D4A843' }} fill="#D4A843" />
            <span className="text-sm font-semibold" style={{ color: 'var(--accent-light)' }}>India's Top Tech Learning Platform</span>
          </div>

          <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-none animate-fadeInUp delay-100" style={{ fontFamily: 'Syne', letterSpacing: '-2px' }}>
            <span className="gradient-text">Forge Your</span>
            <br />
            <span style={{ color: 'var(--cream)' }}>Tech Career</span>
          </h1>

          <p className="text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fadeInUp delay-200" style={{ color: 'var(--steel)' }}>
            Learn from industry experts in AI/ML, Cloud, Data Science & Cybersecurity. 
            Earn certificates that matter. Build projects that impress.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fadeInUp delay-300">
            <button
              onClick={() => navigate('/student/signup')}
              className="btn-sand px-8 py-4 rounded-2xl text-lg flex items-center gap-3 group"
            >
              Start Learning Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/instructor/signup')}
              className="btn-outline px-8 py-4 rounded-2xl text-lg"
            >
              Become an Instructor
            </button>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute left-16 top-1/2 animate-float" style={{ animationDelay: '0.5s', opacity: 0.6 }}>
          <div className="glass rounded-2xl p-4 w-48">
            <div className="text-xs mb-1" style={{ color: 'var(--steel)' }}>Course Completed</div>
            <div className="font-bold text-sm" style={{ color: 'var(--cream)', fontFamily: 'Syne' }}>ML Fundamentals</div>
            <div className="progress-bar mt-2"><div className="progress-fill" style={{ width: '100%' }} /></div>
          </div>
        </div>
        <div className="absolute right-16 top-1/3 animate-float" style={{ animationDelay: '1s', opacity: 0.6 }}>
          <div className="glass rounded-2xl p-4 w-44">
            <div className="flex items-center gap-2 mb-2">
              <Award size={18} style={{ color: '#D4A843' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--sand)', fontFamily: 'Syne' }}>Certificate Earned!</span>
            </div>
            <div className="text-xs" style={{ color: 'var(--steel)' }}>AWS Cloud Architect</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-8 border-t border-b" style={{ borderColor: 'rgba(172, 186, 196, 0.1)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-4xl font-black mb-2 gradient-text" style={{ fontFamily: 'Syne' }}>{s.value}</div>
              <div className="text-sm" style={{ color: 'var(--steel)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
              What You'll Learn
            </h2>
            <p style={{ color: 'var(--steel)' }}>Industry-focused courses designed for the future of tech</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <div key={cat.key} className="glass rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300 cursor-pointer animate-fadeInUp"
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => navigate('/student/signup')}>
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="font-bold text-sm mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{cat.name}</h3>
                <span className={`badge ${cat.color}`}>{cat.courses} Courses</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-16">
          <div className="text-5xl mb-6 animate-float">🚀</div>
          <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
            Ready to Forge Your Future?
          </h2>
          <p className="mb-10" style={{ color: 'var(--steel)' }}>
            Join thousands of students learning cutting-edge tech skills
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/student/signup')} className="btn-sand px-8 py-4 rounded-2xl flex items-center gap-2">
              <BookOpen size={20} /> Join as Student
            </button>
            <button onClick={() => navigate('/instructor/signup')} className="btn-primary px-8 py-4 rounded-2xl flex items-center gap-2">
              <Users size={20} /> Join as Instructor
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t text-center" style={{ borderColor: 'rgba(172, 186, 196, 0.1)' }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6B7FD4, #4ECDC4)' }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold gradient-text" style={{ fontFamily: 'Syne' }}>EduForge</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--steel)' }}>© 2024 EduForge. Built for the next generation of tech professionals.</p>
      </footer>
    </div>
  );
}