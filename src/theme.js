import { createTheme, alpha } from '@mui/material/styles';

const NAVY = '#0D1117';
const NAVY2 = '#161B27';
const NAVY3 = '#1E2535';
const STEEL = '#8B9BB4';
const SAND = '#E2D9BE';
const CREAM = '#F0EED8';
const ACCENT = '#6C7FD8';
const ACCENT2 = '#8FA4E8';
const TEAL = '#4ECDC4';
const GOLD = '#D4A843';
const DANGER = '#E74C6F';

export { NAVY, NAVY2, NAVY3, STEEL, SAND, CREAM, ACCENT, ACCENT2, TEAL, GOLD, DANGER };

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: ACCENT, light: ACCENT2, dark: '#5A6BC4', contrastText: '#fff' },
    secondary: { main: TEAL, light: '#7EDDD7', dark: '#3ABDB4', contrastText: '#fff' },
    error: { main: DANGER },
    warning: { main: GOLD },
    success: { main: TEAL },
    background: { default: NAVY, paper: NAVY2 },
    text: { primary: CREAM, secondary: STEEL },
    divider: 'rgba(139,155,180,0.15)',
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Syne", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Syne", sans-serif', fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${NAVY}; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${NAVY2}; }
        ::-webkit-scrollbar-thumb { background: ${NAVY3}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${STEEL}; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px);} to { opacity:1; transform:translateY(0);} }
        @keyframes fadeIn { from { opacity:0;} to { opacity:1;} }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92);} to { opacity:1; transform:scale(1);} }
        @keyframes float { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-12px);} }
        @keyframes pulseGlow { 0%,100% { box-shadow:0 0 20px rgba(108,127,216,0.25);} 50% { box-shadow:0 0 40px rgba(108,127,216,0.55);} }
        @keyframes shimmer { 0% { background-position:-200% 0;} 100% { background-position:200% 0;} }
        @keyframes gradientShift { 0%,100% { background-position:0% 50%;} 50% { background-position:100% 50%;} }
        .anim-fadeInUp { animation: fadeInUp 0.55s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-fadeIn { animation: fadeIn 0.4s ease both; }
        .anim-scaleIn { animation: scaleIn 0.35s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-float { animation: float 3.5s ease-in-out infinite; }
        .anim-pulse-glow { animation: pulseGlow 2.5s ease-in-out infinite; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .gradient-text {
          background: linear-gradient(135deg, ${CREAM} 0%, ${SAND} 45%, ${ACCENT2} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-text-teal {
          background: linear-gradient(135deg, ${ACCENT2} 0%, ${TEAL} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass {
          background: rgba(30,37,53,0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(139,155,180,0.13);
        }
        .hero-bg {
          background:
            radial-gradient(ellipse at 15% 50%, rgba(108,127,216,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 15%, rgba(78,205,196,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 85%, rgba(212,168,67,0.06) 0%, transparent 45%),
            linear-gradient(160deg, #080C14 0%, #0D1117 40%, #111827 100%);
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(139,155,180,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,155,180,0.035) 1px, transparent 1px);
          background-size: 44px 44px;
        }
        .certificate-bg {
          background: linear-gradient(135deg, #0D1117 0%, #161B27 40%, #1A2035 70%, #0D1117 100%);
          border: 2px solid ${SAND};
          position: relative;
        }
        .certificate-bg::before {
          content: '';
          position: absolute;
          top: 10px; bottom: 10px; left: 10px; right: 10px;
          border: 1px solid rgba(226,217,190,0.25);
          pointer-events: none;
          z-index: 0;
        }
        .course-content { color: ${CREAM}; line-height: 1.85; }
        .course-content h1 { font-family:'Syne',sans-serif; font-size:1.75rem; margin-bottom:1rem; color:${SAND}; border-bottom:1px solid rgba(226,217,190,0.2); padding-bottom:.6rem; }
        .course-content h2 { font-family:'Syne',sans-serif; font-size:1.35rem; margin:1.4rem 0 .7rem; color:${CREAM}; }
        .course-content h3 { font-family:'Syne',sans-serif; font-size:1.05rem; margin:.9rem 0 .45rem; color:${ACCENT2}; }
        .course-content p { margin-bottom:.7rem; color:rgba(240,238,216,0.85); }
        .course-content code { background:rgba(108,127,216,0.18); padding:2px 7px; border-radius:5px; font-size:.88em; color:${ACCENT2}; font-family:'JetBrains Mono',monospace; }
        .course-content pre { background:rgba(8,12,20,0.85); border:1px solid rgba(139,155,180,0.13); padding:18px; border-radius:12px; overflow-x:auto; margin:1rem 0; }
        .course-content pre code { background:transparent; padding:0; color:${SAND}; }
        .course-content ul,
        .course-content ol { margin:.5rem 0 .7rem 1.4rem; }
        .course-content li { margin-bottom:.32rem; color:rgba(240,238,216,0.85); }
        .course-content strong { color:${CREAM}; font-weight:600; }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontFamily: '"Syne", sans-serif',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.25s cubic-bezier(.22,.68,0,1.2)',
          '&:hover': { transform: 'translateY(-2px)' },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${ACCENT} 0%, #5A6BC4 100%)`,
          boxShadow: 'none',
          '&:hover': { boxShadow: `0 8px 24px ${alpha(ACCENT, 0.4)}` },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${SAND} 0%, #D4C9A5 100%)`,
          color: NAVY,
          boxShadow: 'none',
          '&:hover': { boxShadow: `0 8px 24px ${alpha(SAND, 0.35)}` },
        },
        outlinedPrimary: {
          borderColor: `rgba(139,155,180,0.4)`,
          color: CREAM,
          '&:hover': { borderColor: SAND, background: `rgba(226,217,190,0.08)` },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: `rgba(30,37,53,0.6)`,
            borderRadius: 12,
            fontFamily: '"DM Sans", sans-serif',
            '& fieldset': { borderColor: 'rgba(139,155,180,0.2)', borderWidth: 1.5 },
            '&:hover fieldset': { borderColor: 'rgba(139,155,180,0.4)' },
            '&.Mui-focused fieldset': { borderColor: ACCENT, borderWidth: 1.5 },
            '& input, & textarea': { color: CREAM, '&::placeholder': { color: STEEL, opacity: 1 } },
          },
          '& .MuiInputLabel-root': { color: STEEL, '&.Mui-focused': { color: ACCENT2 } },
          '& .MuiFormHelperText-root': { fontFamily: '"DM Sans", sans-serif' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: `rgba(22,27,39,0.85)`,
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(139,155,180,0.12)',
          borderRadius: 18,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: NAVY2,
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Syne", sans-serif',
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 24,
          borderRadius: 20,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6, background: 'rgba(139,155,180,0.15)' },
        bar: { borderRadius: 4, background: `linear-gradient(90deg, ${ACCENT} 0%, ${TEAL} 100%)` },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: CREAM,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139,155,180,0.2)', borderWidth: 1.5 },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139,155,180,0.4)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT },
        },
        icon: { color: STEEL },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { background: NAVY3, border: '1px solid rgba(139,155,180,0.15)', borderRadius: 12 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { color: CREAM, fontFamily: '"DM Sans", sans-serif', '&:hover': { background: `rgba(108,127,216,0.12)` }, '&.Mui-selected': { background: `rgba(108,127,216,0.18)` } },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.25s ease',
          '&:hover': { background: 'rgba(108,127,216,0.12)' },
          '&.Mui-selected': { background: 'rgba(108,127,216,0.2)', border: '1px solid rgba(108,127,216,0.3)', '&:hover': { background: 'rgba(108,127,216,0.25)' } },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { background: 'rgba(8,12,20,0.97)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(139,155,180,0.1)', width: 248 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { background: NAVY2, border: '1px solid rgba(139,155,180,0.15)', borderRadius: 24 },
      },
    },
    MuiSnackbar: { defaultProps: { anchorOrigin: { vertical: 'top', horizontal: 'right' } } },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, fontFamily: '"DM Sans", sans-serif', fontWeight: 500 },
        standardSuccess: { background: `rgba(78,205,196,0.15)`, border: `1px solid rgba(78,205,196,0.3)`, color: TEAL },
        standardError: { background: `rgba(231,76,111,0.15)`, border: `1px solid rgba(231,76,111,0.3)`, color: DANGER },
        standardInfo: { background: `rgba(108,127,216,0.15)`, border: `1px solid rgba(108,127,216,0.3)`, color: ACCENT2 },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: { background: 'rgba(22,27,39,0.7)', border: '1px solid rgba(139,155,180,0.12)', borderRadius: '14px !important', '&:before': { display: 'none' }, '&.Mui-expanded': { margin: 0 } },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { '& .MuiTableCell-root': { background: `rgba(13,17,23,0.6)`, color: STEEL, fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1.2, borderBottom: '1px solid rgba(139,155,180,0.1)' } },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: { '& .MuiTableRow-root': { transition: 'background 0.2s', '&:hover': { background: 'rgba(255,255,255,0.02)' } }, '& .MuiTableCell-root': { borderBottom: '1px solid rgba(139,155,180,0.06)', color: CREAM } },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: { background: 'transparent', borderRadius: 16, border: '1px solid rgba(139,155,180,0.1)' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { fontFamily: '"Syne", sans-serif', fontWeight: 600, textTransform: 'none', color: STEEL, '&.Mui-selected': { color: CREAM } },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { background: `linear-gradient(90deg, ${ACCENT}, ${TEAL})`, height: 3, borderRadius: 2 },
      },
    },
  },
});