import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Download, Explore, Share2, Award, ArrowLeft, Star, ShieldCheck } from 'lucide-react';

export default function Certificate() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { db } = useApp();
  const certRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const course = db.courses.find(c => c.id === courseId);
  const completedData = user?.completedCourses?.find(c => c.courseId === courseId);

  if (!course || !completedData) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-24 h-24 bg-bg-surface rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Award className="w-12 h-12 text-text-secondary" />
          </div>
          <h2 className="font-syne text-2xl font-bold text-text-primary mb-2">Certificate Unavailable</h2>
          <p className="text-text-secondary max-w-md mb-8">
            You need to complete all modules and pass the final assessment for <span className="text-primary-400 font-medium">{course?.title || 'this course'}</span> to earn your certificate.
          </p>
          <button
            onClick={() => navigate(`/student/course/${courseId}`)}
            className="btn-primary px-8"
          >
            Go to Course
          </button>
        </div>
      </StudentLayout>
    );
  }

  const completedDate = new Date(completedData.completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
                  <html><head><title>Certificate - ${course.title}</title>
                  <style>
                    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@1,600&display=swap');
                    body { margin:0; padding:40px; background:#09090b; font-family:'DM Sans',sans-serif; display:flex; justify-content:center; }
                    .cert { width:1000px; min-height:700px; background:#0e0e11; border:1px solid #27272a; position:relative; padding:80px; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; position:relative; overflow:hidden;}
                    .inner-border { position:absolute; top:24px; bottom:24px; left:24px; right:24px; border:1px solid rgba(226,217,190,0.1); border-radius:12px; pointer-events:none;}
                    .watermark { position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); opacity:0.02; font-size:400px; pointer-events:none;}
                    .brand { font-family:'Syne',sans-serif; font-size:16px; font-weight:800; color:#4ECDC4; letter-spacing:4px; text-transform:uppercase; margin-bottom:40px; display:flex; align-items:center; gap:12px;}
                    .cert-title { font-family:'Syne',sans-serif; font-size:54px; font-weight:800; color:#F0EED8; margin:0 0 10px; letter-spacing:-1px;}
                    .cert-sub { color:#8B9BB4; font-size:14px; letter-spacing:6px; text-transform:uppercase; margin-bottom:50px; }
                    .cert-body { color:rgba(240,238,216,0.6); font-size:16px; margin-bottom:12px; }
                    .cert-name { font-family:'Syne',sans-serif; font-size:64px; font-weight:800; background:linear-gradient(135deg,#F0EED8,#E2D9BE,#D4A843); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:16px 0 24px; letter-spacing:-2px;}
                    .cert-course { font-family:'Playfair Display',serif; font-style:italic; font-size:32px; font-weight:600; color:#F0EED8; margin:8px 0 32px; }
                    .cert-score-wrap { display:inline-flex; align-items:center; gap:16px; background:rgba(78,205,196,0.05); border:1px solid rgba(78,205,196,0.2); padding:16px 32px; border-radius:100px; margin-bottom:60px;}
                    .cert-score-label { color:#8B9BB4; font-size:14px; text-transform:uppercase; letter-spacing:2px;}
                    .cert-score { font-family:'Syne',sans-serif; font-size:36px; font-weight:800; color:#4ECDC4; }
                    .cert-footer { display:flex; justify-content:space-between; width:100%; border-top:1px solid rgba(255,255,255,0.05); padding-top:32px; margin-top:auto;}
                    .footer-block { display:flex; flex-direction:column; align-items:center; width:200px;}
                    .footer-label { color:#8B9BB4; font-size:10px; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px; }
                    .footer-val { color:#F0EED8; font-size:16px; font-weight:700; font-family:'Syne',sans-serif; }
                    .footer-signature { font-family:'Playfair Display',serif; font-style:italic; font-size:24px; color:#E2D9BE; margin-bottom:4px;}
                    @media print { 
                        body { background:white; padding:0; display:block;}
                        .cert { width:100%; height:100vh; max-height:100vh; background:white; border:12px solid #09090b; padding:80px; box-sizing:border-box; border-radius:0;}
                        .cert-title { color:#09090b; }
                        .cert-course { color:#09090b; }
                        .cert-body { color:#52525b; }
                        .cert-sub, .footer-label, .cert-score-label { color:#71717a; }
                        .brand, .cert-score { color:#09090b; }
                        .cert-name { background:#09090b; -webkit-background-clip:text; -webkit-text-fill-color:transparent;}
                        .footer-val { color:#09090b; }
                        .footer-signature { color:#09090b; }
                        .inner-border { border-color:#e4e4e7; }
                        .cert-score-wrap { background:#f4f4f5; border-color:#e4e4e7; }
                        .cert-footer { border-color:#e4e4e7; }
                    }
                  </style></head>
                  <body>
                  <div class="cert">
                    <div class="inner-border"></div>
                    <div class="watermark">🏆</div>
                    
                    <div class="brand">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path></svg>
                        EDUFORGE
                    </div>
                    
                    <h1 class="cert-title">CERTIFICATE</h1>
                    <div class="cert-sub">of Completion</div>
                    
                    <div class="cert-body">This strictly verifies that</div>
                    <div class="cert-name">${user.name}</div>
                    
                    <div class="cert-body">has successfully completed the curriculum for</div>
                    <div class="cert-course">"${course.title}"</div>
                    
                    <div class="cert-score-wrap">
                        <span class="cert-score-label">Final Assessment Score</span>
                        <span class="cert-score">${completedData.score}%</span>
                    </div>
                    
                    <div class="cert-footer">
                      <div class="footer-block">
                        <div class="footer-signature">${course.instructorName}</div>
                        <div class="footer-label">Lead Instructor</div>
                      </div>
                      <div class="footer-block" style="justify-content:flex-end">
                        <div class="footer-label">Certificate ID</div>
                        <div class="footer-val" style="font-family:monospace; font-size:12px; font-weight:400; color:#8B9BB4; letter-spacing:1px;">EF-${user.id.substring(0, 8)}-${courseId.substring(0, 6)}</div>
                      </div>
                      <div class="footer-block" style="justify-content:flex-end">
                        <div class="footer-val">${completedDate}</div>
                        <div class="footer-label" style="margin-top:8px; margin-bottom:0;">Date of Issue</div>
                      </div>
                    </div>
                  </div>
                  </body></html>
                `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          setIsDownloading(false);
        }, 500);
      } else {
        setIsDownloading(false);
        alert("Please allow popups to download your certificate.");
      }
    }, 600);
  };

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto w-full flex flex-col items-center justify-center py-4 sm:py-8 print:py-0">

        {/* Top Nav (Hidden on print) */}
        <div className="w-full flex items-center justify-between mb-8 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-bg-surface"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </button>
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Verified Credential
          </div>
        </div>

        {/* Main Certificate Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full relative group"
        >
          {/* Decorative Background Glow (Hidden on print) */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-primary-500/20 to-teal-500/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000 print:hidden" />

          {/* Certificate Card */}
          <div
            ref={certRef}
            className="relative w-full bg-[#0e0e11] border border-border-subtle rounded-[2rem] p-8 sm:p-16 md:p-20 flex flex-col items-center text-center overflow-hidden shadow-2xl print:shadow-none print:border-8 print:border-black print:rounded-none print:bg-white print:text-black"
          >
            {/* Background Watermark */}
            <Award className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] text-white/[0.02] pointer-events-none print:text-black/[0.03]" />

            {/* Top Branding */}
            <div className="flex flex-col items-center mb-10 sm:mb-12 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-black mb-6 shadow-lg print:hidden">
                <Award className="w-8 h-8" />
              </div>
              <Award className="hidden print:block w-16 h-16 text-black mb-6" />

              <h1 className="font-syne font-extrabold text-4xl sm:text-5xl md:text-6xl text-text-primary tracking-tight mb-2 print:text-black">
                CERTIFICATE
              </h1>
              <span className="text-text-secondary text-xs sm:text-sm tracking-[0.3em] uppercase print:text-gray-600">
                of Completion
              </span>
            </div>

            {/* Middle Text Content */}
            <div className="flex flex-col items-center max-w-2xl relative z-10 space-y-4 sm:space-y-6 mb-12 sm:mb-16">
              <p className="text-text-secondary text-base sm:text-lg print:text-gray-600">
                This strictly verifies that
              </p>

              {/* Student Name */}
              <h2 className="font-syne font-extrabold text-4xl sm:text-5xl md:text-6xl xl:text-7xl bg-gradient-to-br from-[#F0EED8] via-[#E2D9BE] to-[#D4A843] bg-clip-text text-transparent pb-2 print:text-black print:bg-none tracking-tight">
                {user.name}
              </h2>

              <p className="text-text-secondary text-base sm:text-lg print:text-gray-600">
                has successfully completed the curriculum for
              </p>

              {/* Course Title */}
              <h3 className="font-serif italic font-semibold text-2xl sm:text-3xl md:text-4xl text-text-primary print:text-black leading-tight">
                "{course.title}"
              </h3>
            </div>

            {/* Score Block */}
            <div className="relative z-10 inline-flex items-center gap-4 sm:gap-6 bg-teal-500/5 border border-teal-500/20 px-6 sm:px-8 py-3 sm:py-4 rounded-full mb-16 sm:mb-24 print:bg-gray-100 print:border-gray-300">
              <span className="text-text-secondary text-xs sm:text-sm uppercase tracking-widest font-medium print:text-gray-600">
                Final Assessment Score
              </span>
              <span className="font-syne font-extrabold text-2xl sm:text-3xl text-teal-400 print:text-black">
                {completedData.score}%
              </span>
            </div>

            {/* Bottom Signatures / Meta Info */}
            <div className="w-full relative z-10 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-10 sm:gap-4 pt-10 border-t border-border-subtle/50 print:border-gray-300 mt-auto">

              {/* Instructor Name (Signature logic) */}
              <div className="flex flex-col items-center text-center w-full sm:w-1/3">
                <div className="font-serif italic text-2xl sm:text-3xl text-primary-200 mb-2 print:text-black">
                  {course.instructorName}
                </div>
                <div className="w-32 h-px bg-border-subtle mb-3 print:bg-gray-400" />
                <span className="text-[0.65rem] sm:text-xs text-text-secondary uppercase tracking-widest print:text-gray-600">
                  Lead Instructor
                </span>
              </div>

              {/* ID Meta */}
              <div className="flex flex-col items-center text-center w-full sm:w-1/3 order-first sm:order-none">
                <span className="text-[0.65rem] sm:text-xs text-text-secondary uppercase tracking-widest mb-2 print:text-gray-600">
                  Certificate ID
                </span>
                <span className="font-mono text-xs sm:text-sm text-text-secondary/60 print:text-gray-500">
                  EF-{user.id.substring(0, 8)}-{courseId.substring(0, 6)}
                </span>
              </div>

              {/* Date Meta */}
              <div className="flex flex-col items-center text-center w-full sm:w-1/3">
                <div className="font-syne font-bold text-lg sm:text-xl text-text-primary mb-2 print:text-black">
                  {completedDate}
                </div>
                <div className="w-32 h-px bg-border-subtle mb-3 print:bg-gray-400" />
                <span className="text-[0.65rem] sm:text-xs text-text-secondary uppercase tracking-widest print:text-gray-600">
                  Date of Issue
                </span>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Floating Bottom Action Dock (Hidden on Print) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-50 print:hidden"
        >
          <div className="flex items-center gap-3 p-2 bg-bg-surface/80 backdrop-blur-xl border border-border-subtle rounded-3xl shadow-2xl">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-syne font-bold text-sm transition-all ${isDownloading
                ? 'bg-primary-500/50 text-white/70 cursor-wait'
                : 'bg-primary-500 text-white hover:bg-primary-400 hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/25'
                }`}
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Preparing PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>

            <div className="w-px h-8 bg-border-subtle mx-1" />

            <button
              onClick={() => {
                alert("Share functionality would open a native share dialog here.");
              }}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-bg-base border border-transparent hover:border-border-subtle text-text-secondary hover:text-text-primary transition-all hover:scale-105 active:scale-95 group"
              title="Share Certificate"
            >
              <Share2 className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* Extra spacing at the bottom to ensure the floating dock doesn't overlap content when scrolling to bottom */}
        <div className="h-24 print:hidden" />

      </div>
    </StudentLayout>
  );
}