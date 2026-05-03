import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Download, Home, Share2, ShieldCheck } from 'lucide-react';
import { getCourseById } from '../../api/courseApi';
import {
  getApprovedFinalMarks,
  getPublicCertificateVerification,
} from '../../api/marksApi';

const formatIssueDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const buildPublicCertificateUrl = (certificateId) => {
  if (typeof window === 'undefined' || !certificateId) {
    return '';
  }

  return `${window.location.origin}/certificate/verify/${encodeURIComponent(certificateId)}`;
};

export default function Certificate() {
  const { courseId, certificateId: publicCertificateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useApp();
  const isPublicView = Boolean(publicCertificateId);

  const [course, setCourse] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchPrivateCertificate = async () => {
      try {
        const [courseRes, marksRes] = await Promise.allSettled([
          getCourseById(courseId),
          getApprovedFinalMarks(courseId),
        ]);

        if (cancelled) {
          return;
        }

        if (courseRes.status === 'fulfilled') {
          setCourse(courseRes.value.data);
        } else {
          console.error('Failed to load course data', courseRes.reason);
          setCourse(null);
        }

        if (marksRes.status === 'fulfilled') {
          setCertificate(marksRes.value.data);
        } else {
          console.error('Approved final marks not available', marksRes.reason);
          setCertificate(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const fetchPublicCertificate = async () => {
      try {
        const response = await getPublicCertificateVerification(publicCertificateId);
        if (!cancelled) {
          setCertificate(response.data);
        }
      } catch (error) {
        console.error('Failed to verify public certificate', error);
        if (!cancelled) {
          setLoadError(error.response?.data?.error || 'Certificate verification failed.');
          setCertificate(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    setCourse(null);
    setCertificate(null);
    setLoadError('');
    setLoading(true);

    if (isPublicView) {
      fetchPublicCertificate();
    } else if (courseId) {
      fetchPrivateCertificate();
    } else {
      setLoading(false);
      setLoadError('Certificate details are unavailable.');
    }

    return () => {
      cancelled = true;
    };
  }, [courseId, isPublicView, publicCertificateId]);

  const PageShell = ({ children }) => (
    isPublicView ? (
      <div className="min-h-screen bg-bg-base px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </div>
    ) : (
      <StudentLayout>{children}</StudentLayout>
    )
  );

  const isEligible = certificate?.status === 'APPROVED';
  const recipientName = certificate?.studentName || user?.name || 'Student';
  const courseTitle = course?.title || certificate?.courseTitle || 'Course';
  const instructorName = course?.instructor?.name || certificate?.instructorName || 'Instructor';
  const universityName = certificate?.universityName || '';
  const completedDate = formatIssueDate(certificate?.approvedAt);
  const finalScore = certificate?.finalScore || 0;
  const finalGrade = certificate?.grade || 'F';
  const resolvedCertificateId = certificate?.certificateId || '';
  const shareUrl = isPublicView
    ? (typeof window !== 'undefined' ? window.location.href : '')
    : buildPublicCertificateUrl(resolvedCertificateId);
  const shareTitle = `${recipientName}'s EduForge Certificate`;
  const shareText = [
    `${recipientName} completed "${courseTitle}" on EduForge.`,
    `Final score: ${finalScore}%`,
    `Grade: ${finalGrade}`,
    resolvedCertificateId ? `Certificate ID: ${resolvedCertificateId}` : null,
    universityName ? `Verified by: ${universityName}` : null,
  ].filter(Boolean).join('\n');

  const handleBackNavigation = () => {
    if (isPublicView) {
      navigate('/');
      return;
    }

    navigate(`/student/course/${courseId}`);
  };

  const handleDownload = () => {
    setIsDownloading(true);

    window.setTimeout(() => {
      const printWindow = window.open('', '_blank');

      if (!printWindow) {
        setIsDownloading(false);
        showNotification('Please allow popups to download your certificate.', 'error');
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate - ${courseTitle}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@1,600&display=swap');
              body { margin:0; padding:40px; background:#09090b; font-family:'DM Sans',sans-serif; display:flex; justify-content:center; }
              .cert { width:1000px; min-height:700px; background:#0e0e11; border:1px solid #27272a; padding:80px; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; position:relative; overflow:hidden; }
              .inner-border { position:absolute; top:24px; bottom:24px; left:24px; right:24px; border:1px solid rgba(226,217,190,0.1); border-radius:12px; pointer-events:none; }
              .watermark { position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); opacity:0.02; font-size:400px; pointer-events:none; }
              .brand { font-family:'Syne',sans-serif; font-size:16px; font-weight:800; color:#4ECDC4; letter-spacing:4px; text-transform:uppercase; margin-bottom:40px; display:flex; align-items:center; gap:12px; }
              .cert-title { font-family:'Syne',sans-serif; font-size:54px; font-weight:800; color:#F0EED8; margin:0 0 10px; letter-spacing:-1px; }
              .cert-sub { color:#8B9BB4; font-size:14px; letter-spacing:6px; text-transform:uppercase; margin-bottom:50px; }
              .cert-body { color:rgba(240,238,216,0.6); font-size:16px; margin-bottom:12px; }
              .cert-name { font-family:'Syne',sans-serif; font-size:64px; font-weight:800; background:linear-gradient(135deg,#F0EED8,#E2D9BE,#D4A843); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:16px 0 24px; letter-spacing:-2px; }
              .cert-course { font-family:'Playfair Display',serif; font-style:italic; font-size:32px; font-weight:600; color:#F0EED8; margin:8px 0 32px; }
              .cert-score-wrap { display:inline-flex; align-items:center; gap:16px; background:rgba(78,205,196,0.05); border:1px solid rgba(78,205,196,0.2); padding:16px 32px; border-radius:100px; margin-bottom:24px; }
              .cert-score-label { color:#8B9BB4; font-size:14px; text-transform:uppercase; letter-spacing:2px; }
              .cert-score { font-family:'Syne',sans-serif; font-size:36px; font-weight:800; color:#4ECDC4; }
              .cert-grade { display:inline-flex; gap:12px; align-items:center; background:rgba(212,168,67,0.08); border:1px solid rgba(212,168,67,0.18); padding:12px 24px; border-radius:999px; margin-bottom:20px; }
              .cert-grade-label { color:#8B9BB4; font-size:12px; letter-spacing:2px; text-transform:uppercase; }
              .cert-grade-value { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#F0EED8; }
              .cert-university { color:#E2D9BE; font-size:14px; letter-spacing:1px; margin-bottom:60px; }
              .cert-footer { display:flex; justify-content:space-between; width:100%; border-top:1px solid rgba(255,255,255,0.05); padding-top:32px; margin-top:auto; }
              .footer-block { display:flex; flex-direction:column; align-items:center; width:200px; }
              .footer-label { color:#8B9BB4; font-size:10px; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px; }
              .footer-val { color:#F0EED8; font-size:16px; font-weight:700; font-family:'Syne',sans-serif; }
              .footer-signature { font-family:'Playfair Display',serif; font-style:italic; font-size:24px; color:#E2D9BE; margin-bottom:4px; }
              @media print {
                body { background:white; padding:0; display:block; }
                .cert { width:100%; height:100vh; max-height:100vh; background:white; border:12px solid #09090b; border-radius:0; }
                .cert-title, .cert-course, .brand, .cert-score, .footer-val, .footer-signature, .cert-grade-value { color:#09090b; }
                .cert-body, .cert-sub, .footer-label, .cert-score-label, .cert-grade-label { color:#71717a; }
                .cert-name { background:#09090b; -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
                .inner-border, .cert-footer, .cert-score-wrap, .cert-grade { border-color:#e4e4e7; }
                .cert-score-wrap, .cert-grade { background:#f4f4f5; }
                .cert-university { color:#52525b; }
              }
            </style>
          </head>
          <body>
            <div class="cert">
              <div class="inner-border"></div>
              <div class="watermark">AWARD</div>
              <div class="brand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path></svg>
                EDUFORGE
              </div>
              <h1 class="cert-title">CERTIFICATE</h1>
              <div class="cert-sub">of Completion</div>
              <div class="cert-body">This strictly verifies that</div>
              <div class="cert-name">${recipientName}</div>
              <div class="cert-body">has successfully completed the approved requirements for</div>
              <div class="cert-course">"${courseTitle}"</div>
              <div class="cert-score-wrap">
                <span class="cert-score-label">Approved Final Score</span>
                <span class="cert-score">${finalScore}%</span>
              </div>
              <div class="cert-grade">
                <span class="cert-grade-label">Grade</span>
                <span class="cert-grade-value">${finalGrade}</span>
              </div>
              ${universityName ? `<div class="cert-university">Verified by ${universityName}</div>` : ''}
              <div class="cert-footer">
                <div class="footer-block">
                  <div class="footer-signature">${instructorName}</div>
                  <div class="footer-label">Lead Instructor</div>
                </div>
                <div class="footer-block" style="justify-content:flex-end">
                  <div class="footer-label">Certificate ID</div>
                  <div class="footer-val" style="font-family:monospace; font-size:12px; font-weight:400; color:#8B9BB4; letter-spacing:1px;">${resolvedCertificateId || 'Pending'}</div>
                </div>
                <div class="footer-block" style="justify-content:flex-end">
                  <div class="footer-val">${completedDate}</div>
                  <div class="footer-label" style="margin-top:8px; margin-bottom:0;">Date of Issue</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();

      window.setTimeout(() => {
        printWindow.print();
        setIsDownloading(false);
      }, 500);
    }, 400);
  };

  const copyShareText = async () => {
    const textToCopy = `${shareText}${shareUrl ? `\n${shareUrl}` : ''}`;

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const handleShare = async () => {
    if (isSharing) {
      return;
    }

    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        showNotification('Certificate shared successfully!');
        return;
      }

      await copyShareText();
      showNotification('Certificate details copied to clipboard!');
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }

      console.error('Failed to share certificate', error);
      showNotification('Unable to share certificate right now', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500/30 border-t-primary-500"></div>
        </div>
      </PageShell>
    );
  }

  if (isPublicView && (!certificate || loadError)) {
    return (
      <PageShell>
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-bg-surface shadow-lg">
            <Award className="h-12 w-12 text-text-secondary" />
          </div>
          <h2 className="mb-2 font-syne text-2xl font-bold text-text-primary">Certificate Not Found</h2>
          <p className="mb-8 max-w-xl text-text-secondary">
            {loadError || 'This certificate link is invalid or no longer available for verification.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary flex items-center gap-2 px-8"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </button>
        </div>
      </PageShell>
    );
  }

  if (!isPublicView && (!course || !isEligible)) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-bg-surface shadow-lg">
            <Award className="h-12 w-12 text-text-secondary" />
          </div>
          <h2 className="mb-2 font-syne text-2xl font-bold text-text-primary">Certificate Unavailable</h2>
          <p className="mb-8 max-w-md text-text-secondary">
            Your certificate for <span className="font-medium text-primary-400">{course?.title || 'this course'}</span> will unlock once the university admin approves the final marks sheet.
          </p>
          <button
            onClick={() => navigate(`/student/course/${courseId}`)}
            className="btn-primary px-8"
          >
            Go to Course
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center py-4 sm:py-8 print:py-0">
        <div className="mb-8 flex w-full items-center justify-between print:hidden">
          <button
            onClick={handleBackNavigation}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
          >
            {isPublicView ? <Home className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {isPublicView ? 'Back to Home' : 'Back to Course'}
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-success-400/20 bg-success-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-success-400 sm:flex">
            <ShieldCheck className="h-4 w-4" />
            {isPublicView ? 'Publicly Verified' : 'Verified Credential'}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="group relative w-full"
        >
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-amber-500/20 via-primary-500/20 to-accent-500/20 opacity-50 blur-2xl transition-opacity duration-1000 group-hover:opacity-75 print:hidden" />

          <div className="relative flex w-full flex-col items-center overflow-hidden rounded-lg border border-border-subtle bg-bg-surface p-8 text-center shadow-2xl print:rounded-none print:border-8 print:border-black print:bg-white print:p-16 print:text-black print:shadow-none sm:p-16 md:p-20">
            <Award className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 text-white/[0.02] print:text-black/[0.03]" />

            <div className="relative z-10 mb-10 flex flex-col items-center sm:mb-12">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-200 text-black shadow-lg print:hidden">
                <Award className="h-8 w-8" />
              </div>
              <Award className="mb-6 hidden h-16 w-16 text-black print:block" />

              <h1 className="mb-2 font-syne text-4xl font-extrabold tracking-tight text-text-primary print:text-black sm:text-5xl md:text-6xl">
                CERTIFICATE
              </h1>
              <span className="text-xs uppercase tracking-[0.3em] text-text-secondary print:text-gray-600 sm:text-sm">
                of Completion
              </span>
            </div>

            <div className="relative z-10 mb-12 flex max-w-2xl flex-col items-center space-y-4 sm:mb-16 sm:space-y-6">
              <p className="text-base text-text-secondary print:text-gray-600 sm:text-lg">
                This strictly verifies that
              </p>

              <h2 className="bg-gradient-to-br from-[#F0EED8] via-[#E2D9BE] to-[#D4A843] bg-clip-text pb-2 font-syne text-4xl font-extrabold tracking-tight text-transparent print:bg-none print:text-black sm:text-5xl md:text-6xl xl:text-7xl">
                {recipientName}
              </h2>

              <p className="text-base text-text-secondary print:text-gray-600 sm:text-lg">
                has successfully completed the approved requirements for
              </p>

              <h3 className="font-serif text-2xl font-semibold italic leading-tight text-text-primary print:text-black sm:text-3xl md:text-4xl">
                "{courseTitle}"
              </h3>
            </div>

            <div className="relative z-10 mb-6 inline-flex items-center gap-4 rounded-full border border-success-400/20 bg-success-500/8 px-6 py-3 print:border-gray-300 print:bg-gray-100 sm:mb-8 sm:gap-6 sm:px-8 sm:py-4">
              <span className="text-xs font-medium uppercase tracking-widest text-text-secondary print:text-gray-600 sm:text-sm">
                Approved Final Score
              </span>
              <span className="font-syne text-2xl font-extrabold text-success-400 print:text-black sm:text-3xl">
                {finalScore}%
              </span>
            </div>

            <div className="relative z-10 mb-6 inline-flex items-center gap-4 rounded-full border border-primary-500/20 bg-primary-500/8 px-5 py-2 print:border-gray-300 print:bg-gray-100 sm:mb-8">
              <span className="text-xs font-medium uppercase tracking-widest text-text-secondary print:text-gray-600 sm:text-sm">
                Grade
              </span>
              <span className="font-syne text-xl font-extrabold text-primary-300 print:text-black sm:text-2xl">
                {finalGrade}
              </span>
            </div>

            {universityName ? (
              <div className="relative z-10 mb-10 inline-flex items-center rounded-full border border-amber-300/20 bg-amber-400/8 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-100 print:border-gray-300 print:bg-gray-100 print:text-gray-700 sm:mb-12">
                Verified by {universityName}
              </div>
            ) : null}

            <div className="relative z-10 mt-auto flex w-full flex-col items-center justify-between gap-10 border-t border-border-subtle/50 pt-10 print:border-gray-300 sm:flex-row sm:items-end sm:gap-4">
              <div className="flex w-full flex-col items-center text-center sm:w-1/3">
                <div className="mb-2 font-serif text-2xl italic text-primary-200 print:text-black sm:text-3xl">
                  {instructorName}
                </div>
                <div className="mb-3 h-px w-32 bg-border-subtle print:bg-gray-400" />
                <span className="text-[0.65rem] uppercase tracking-widest text-text-secondary print:text-gray-600 sm:text-xs">
                  Lead Instructor
                </span>
              </div>

              <div className="order-first flex w-full flex-col items-center text-center sm:order-none sm:w-1/3">
                <span className="mb-2 text-[0.65rem] uppercase tracking-widest text-text-secondary print:text-gray-600 sm:text-xs">
                  Certificate ID
                </span>
                <span className="font-mono text-xs text-text-secondary/60 print:text-gray-500 sm:text-sm">
                  {resolvedCertificateId}
                </span>
              </div>

              <div className="flex w-full flex-col items-center text-center sm:w-1/3">
                <div className="mb-2 font-syne text-lg font-bold text-text-primary print:text-black sm:text-xl">
                  {completedDate}
                </div>
                <div className="mb-3 h-px w-32 bg-border-subtle print:bg-gray-400" />
                <span className="text-[0.65rem] uppercase tracking-widest text-text-secondary print:text-gray-600 sm:text-xs">
                  Date of Issue
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 print:hidden sm:bottom-10"
        >
          <div className="flex items-center gap-3 rounded-3xl border border-border-subtle bg-bg-surface/80 p-2 shadow-2xl backdrop-blur-xl">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-syne text-sm font-bold transition-all ${
                isDownloading
                  ? 'cursor-wait bg-primary-500/50 text-white/70'
                  : 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:scale-105 hover:bg-primary-400 active:scale-95'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Preparing PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </button>

            <div className="mx-1 h-8 w-px bg-border-subtle" />

            <button
              onClick={handleShare}
              disabled={isSharing}
              className={`group flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                isSharing
                  ? 'cursor-wait border-border-subtle bg-bg-base text-text-secondary'
                  : 'border-transparent bg-bg-base text-text-secondary hover:scale-105 hover:border-border-subtle hover:text-text-primary active:scale-95'
              }`}
              title="Share Certificate"
            >
              <Share2 className={`h-5 w-5 transition-colors ${isSharing ? 'animate-pulse text-amber-400' : 'group-hover:text-amber-400'}`} />
            </button>
          </div>
        </motion.div>

        <div className="h-24 print:hidden" />
      </div>
    </PageShell>
  );
}
