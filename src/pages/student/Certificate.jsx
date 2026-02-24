import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Rating from '@mui/material/Rating';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, NAVY } from '../../theme';

const SIDEBAR_W = 248;

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
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
        <StudentSidebar />
        <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pt: { xs: 7, md: 0 } }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '3rem', mb: 2 }}>🎓</Typography>
            <Typography variant="h6" sx={{ color: CREAM, mb: 1.5 }}>Certificate not available</Typography>
            <Typography sx={{ color: STEEL, mb: 3, fontSize: '0.9rem' }}>Complete the course to earn your certificate</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate(`/student/course/${courseId}`)}>Go to Course</Button>
          </Box>
        </Box>
      </Box>
    );
  }

  const completedDate = new Date(completedData.completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const starCount = Math.round(completedData.score / 20);

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Certificate - ${course.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        body { margin:0; padding:40px; background:#0D1117; font-family:'DM Sans',sans-serif; display:flex; justify-content:center; }
        .cert { width:860px; min-height:580px; background:linear-gradient(135deg,#0D1117 0%,#161B27 50%,#0D1117 100%); border:2.5px solid #E2D9BE; position:relative; padding:60px; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
        .inner { position:absolute; top:12px; bottom:12px; left:12px; right:12px; border:1px solid rgba(226,217,190,0.25); }
        h1 { font-family:'Syne',sans-serif; font-size:40px; font-weight:800; color:#E2D9BE; margin:0 0 6px; }
        .sub { color:#8B9BB4; font-size:13px; letter-spacing:4px; text-transform:uppercase; margin-bottom:36px; }
        .name { font-family:'Syne',sans-serif; font-size:48px; font-weight:800; background:linear-gradient(135deg,#F0EED8,#E2D9BE,#8FA4E8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:12px 0; }
        .body { color:rgba(240,238,216,0.8); font-size:15px; margin-bottom:10px; }
        .course { font-family:'Syne',sans-serif; font-size:24px; font-weight:700; color:#F0EED8; margin:6px 0; }
        .score { font-family:'Syne',sans-serif; font-size:30px; font-weight:800; color:#4ECDC4; margin:14px 0; }
        .footer { display:flex; justify-content:space-between; width:100%; margin-top:44px; padding-top:20px; border-top:1px solid rgba(226,217,190,0.2); }
        .fl { color:#8B9BB4; font-size:10px; text-transform:uppercase; letter-spacing:2px; margin-bottom:5px; }
        .fv { color:#F0EED8; font-size:12px; font-weight:600; font-family:'Syne',sans-serif; }
        @media print { body { background:white; } }
      </style></head>
      <body><div class="cert"><div class="inner"></div>
        <div style="font-size:44px;margin-bottom:14px">🏆</div>
        <h1>CERTIFICATE</h1><div class="sub">of completion</div>
        <div class="body">This is to certify that</div>
        <div class="name">${user.name}</div>
        <div class="body">has successfully completed</div>
        <div class="course">${course.title}</div>
        <div class="body" style="margin-top:6px">with a grand assessment score of</div>
        <div class="score">${completedData.score}%</div>
        <div class="footer">
          <div><div class="fl">Instructor</div><div class="fv">${course.instructorName}</div></div>
          <div><div class="fl">EduForge LMS</div><div class="fv">eduforge.in</div></div>
          <div><div class="fl">Completed On</div><div class="fv">${completedDate}</div></div>
        </div>
      </div></body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <StudentSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, md: 4 } }}>
        <Box sx={{ maxWidth: 860, mx: 'auto' }}>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(-1)}
            sx={{ color: STEEL, mb: 3, '&:hover': { color: CREAM, background: 'rgba(139,155,180,0.08)' } }}>
            Back
          </Button>

          <Box className="anim-fadeInUp" sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: CREAM, mb: 0.7 }}>Your Certificate</Typography>
            <Typography sx={{ color: STEEL }}>Congratulations on completing {course.title}!</Typography>
          </Box>

          {/* Certificate */}
          <Box ref={certRef} className="certificate-bg anim-scaleIn"
            sx={{ borderRadius: 4, p: { xs: 5, sm: 8, md: 10 }, textAlign: 'center', mb: 4, position: 'relative', zIndex: 0 }}>
            <Typography className="anim-float" sx={{ fontSize: '4rem', mb: 3, position: 'relative', zIndex: 1 }}>🏆</Typography>

            <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: { xs: '1.8rem', sm: '2.6rem' }, color: SAND, letterSpacing: '-1px', position: 'relative', zIndex: 1 }}>
              CERTIFICATE
            </Typography>
            <Typography sx={{ color: STEEL, letterSpacing: 4, fontSize: '0.72rem', textTransform: 'uppercase', mt: 0.5, mb: 4, position: 'relative', zIndex: 1 }}>
              of Completion
            </Typography>

            <Typography sx={{ color: STEEL, mb: 1.5, position: 'relative', zIndex: 1 }}>This is to certify that</Typography>

            <Typography className="gradient-text" sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' }, letterSpacing: '-1.5px', lineHeight: 1.1, mb: 2, position: 'relative', zIndex: 1 }}>
              {user.name}
            </Typography>

            <Typography sx={{ color: 'rgba(240,238,216,0.8)', mb: 1.5, position: 'relative', zIndex: 1 }}>has successfully completed</Typography>
            <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: CREAM, fontSize: { xs: '1.1rem', sm: '1.4rem' }, mb: 1, position: 'relative', zIndex: 1 }}>{course.title}</Typography>
            <Typography sx={{ color: STEEL, mb: 2.5, fontSize: '0.9rem', position: 'relative', zIndex: 1 }}>with a grand assessment score of</Typography>

            <Typography className="gradient-text-teal" sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: { xs: '3rem', sm: '4rem' }, mb: 3, position: 'relative', zIndex: 1 }}>
              {completedData.score}%
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
              <Rating value={starCount} readOnly max={5} sx={{ '& .MuiRating-iconFilled': { color: GOLD }, '& .MuiRating-iconEmpty': { color: 'rgba(212,168,67,0.25)' } }} />
            </Box>

            <Divider sx={{ borderColor: 'rgba(226,217,190,0.15)', mb: 3, position: 'relative', zIndex: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: STEEL, fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', mb: 0.5 }}>Instructor</Typography>
                <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 600, color: CREAM, fontSize: '0.85rem' }}>{course.instructorName}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, justifyContent: 'center', mb: 0.3 }}>
                  <EmojiEventsRoundedIcon sx={{ color: GOLD, fontSize: 16 }} />
                  <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: GOLD, fontSize: '0.82rem' }}>EduForge LMS</Typography>
                </Box>
                <Typography sx={{ color: STEEL, fontSize: '0.72rem' }}>eduforge.in</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: STEEL, fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', mb: 0.5 }}>Completed On</Typography>
                <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 600, color: CREAM, fontSize: '0.85rem' }}>{completedDate}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" startIcon={<DownloadRoundedIcon />} onClick={handleDownload}
              sx={{ px: 4, py: 1.5, background: `linear-gradient(135deg, ${SAND} 0%, #D4C9A5 100%)`, color: NAVY, fontWeight: 700 }}>
              Download Certificate
            </Button>
            <Button variant="outlined" color="primary" size="large" startIcon={<ExploreRoundedIcon />}
              onClick={() => navigate('/student/explore')} sx={{ px: 4, py: 1.5 }}>
              Explore More Courses
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}