import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import { Download, ArrowLeft, Award, Star } from 'lucide-react';

export default function Certificate() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { db } = useApp();
  const certRef = useRef(null);

  const course = db.courses.find(c => c.id === courseId);
  const completedData = user?.completedCourses?.find(c => c.courseId === courseId);

  if (!course || !completedData) {
    return (
      <div className="flex">
        <StudentSidebar />
        <div className="main-content flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4" style={{ color: 'var(--steel)' }}>Certificate not available</p>
            <p className="text-sm mb-6" style={{ color: 'var(--steel)' }}>Complete the course to earn your certificate</p>
            <button onClick={() => navigate(`/student/course/${courseId}`)} className="btn-primary px-6 py-3 rounded-2xl">
              Go to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completedDate = new Date(completedData.completedAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleDownload = () => {
    // Create a canvas-based download
    const cert = certRef.current;
    if (!cert) return;
    
    // Use html2canvas-like approach with window.print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Certificate - ${course.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
          body { margin: 0; padding: 40px; background: #1a1f35; font-family: 'DM Sans', sans-serif; }
          .cert { width: 900px; min-height: 620px; background: linear-gradient(135deg, #1a1f35 0%, #252d4a 50%, #1a1f35 100%); 
                  border: 3px solid #E1D9BC; position: relative; padding: 60px; box-sizing: border-box;
                  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
          .inner-border { position: absolute; top: 12px; bottom: 12px; left: 12px; right: 12px; border: 1px solid rgba(225,217,188,0.3); pointer-events: none; }
          h1 { font-family: 'Syne', sans-serif; font-size: 42px; font-weight: 800; color: #E1D9BC; margin: 0 0 8px; }
          .subtitle { color: #ACBAC4; font-size: 16px; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 4px; }
          .student-name { font-family: 'Syne', sans-serif; font-size: 52px; font-weight: 800; 
                          background: linear-gradient(135deg, #F0F0DB, #E1D9BC, #8FA4E8);
                          -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 16px 0; }
          .body-text { color: rgba(240,240,219,0.8); font-size: 16px; margin-bottom: 12px; }
          .course-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700; color: #F0F0DB; margin: 8px 0; }
          .score { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: #4ECDC4; margin: 16px 0; }
          .footer { display: flex; justify-content: space-between; width: 100%; margin-top: 50px; padding-top: 24px; border-top: 1px solid rgba(225,217,188,0.2); }
          .footer-item { text-align: center; }
          .footer-label { color: #ACBAC4; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
          .footer-value { color: #F0F0DB; font-size: 13px; font-weight: 600; }
          .emoji { font-size: 48px; margin-bottom: 16px; }
          @media print { body { background: white; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="inner-border"></div>
          <div class="emoji">🏆</div>
          <h1>CERTIFICATE</h1>
          <div class="subtitle">of completion</div>
          <div class="body-text">This is to certify that</div>
          <div class="student-name">${user.name}</div>
          <div class="body-text">has successfully completed the course</div>
          <div class="course-title">${course.title}</div>
          <div class="body-text" style="margin-top:8px">with a grand assessment score of</div>
          <div class="score">${completedData.score}%</div>
          <div class="footer">
            <div class="footer-item">
              <div class="footer-label">Instructor</div>
              <div class="footer-value">${course.instructorName}</div>
            </div>
            <div class="footer-item">
              <div class="footer-label">EduForge LMS</div>
              <div class="footer-value">eduforge.in</div>
            </div>
            <div class="footer-item">
              <div class="footer-label">Completed On</div>
              <div class="footer-value">${completedDate}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="main-content p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 text-sm" style={{ color: 'var(--steel)' }}>
            <ArrowLeft size={18} /> Back
          </button>

          <div className="text-center mb-8 animate-fadeInUp">
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Your Certificate</h1>
            <p style={{ color: 'var(--steel)' }}>Congratulations on completing {course.title}!</p>
          </div>

          {/* Certificate */}
          <div ref={certRef} className="certificate rounded-3xl p-16 text-center animate-scaleIn mb-8" style={{ minHeight: '480px' }}>
            <div className="text-6xl mb-6 animate-float">🏆</div>
            <h2 className="text-4xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--sand)', letterSpacing: '-1px' }}>CERTIFICATE</h2>
            <p className="text-sm tracking-widest uppercase mb-10" style={{ color: 'var(--steel)' }}>of Completion</p>

            <p className="text-base mb-4" style={{ color: 'var(--steel)' }}>This is to certify that</p>
            <h3 className="text-5xl font-black mb-4 gradient-text" style={{ fontFamily: 'Syne', letterSpacing: '-1px' }}>
              {user.name}
            </h3>
            <p className="text-base mb-3" style={{ color: 'rgba(240, 240, 219, 0.8)' }}>has successfully completed</p>
            <h4 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{course.title}</h4>
            <p className="text-sm mb-8" style={{ color: 'var(--steel)' }}>with a grand assessment score of</p>

            <div className="text-5xl font-black mb-8 gradient-text-accent" style={{ fontFamily: 'Syne' }}>
              {completedData.score}%
            </div>

            {/* Decorative stars */}
            <div className="flex justify-center gap-2 mb-10">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill={i < Math.round(completedData.score / 20) ? '#D4A843' : 'none'} 
                  style={{ color: '#D4A843' }} />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t pt-8 flex justify-between" style={{ borderColor: 'rgba(225, 217, 188, 0.2)' }}>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--steel)', fontSize: '10px' }}>Instructor</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--cream)', fontFamily: 'Syne' }}>{course.instructorName}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Award size={16} style={{ color: 'var(--sand)' }} />
                  <p className="text-xs font-bold" style={{ color: 'var(--sand)', fontFamily: 'Syne', fontSize: '11px' }}>EduForge LMS</p>
                </div>
                <p className="text-xs" style={{ color: 'var(--steel)' }}>eduforge.in</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--steel)', fontSize: '10px' }}>Completed On</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--cream)', fontFamily: 'Syne' }}>{completedDate}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button onClick={handleDownload} className="btn-sand px-8 py-4 rounded-2xl flex items-center gap-3 text-base">
              <Download size={20} /> Download Certificate
            </button>
            <button onClick={() => navigate('/student/explore')} className="btn-outline px-8 py-4 rounded-2xl">
              Explore More Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}