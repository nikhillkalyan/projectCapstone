import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import { lookupUniversity, joinUniversitySpace } from '../../api/authApi';
import SectionShell from '../../components/shared/SectionShell';
import { KeyRound, Building2, CheckCircle2, ArrowRight, Loader2, AlertCircle, Bookmark, Compass, BookOpen } from 'lucide-react';
import { TEAL, ACCENT } from '../../theme';

// Inline InputField to prevent dependency loops
const InputField = ({ label, type = "text", value, onChange, placeholder, required = false }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">
      {label} {required && <span className="text-error-400">*</span>}
    </label>
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full h-12 bg-bg-surface/50 border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-text-secondary/50"
    />
  </div>
);

export default function UniversitySpace() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const isStudent = user?.role === 'student';

    const [joinCode, setJoinCode] = useState('');
    const [university, setUniversity] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form fields
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [college, setCollege] = useState('');
    const [yearOfStudy, setYearOfStudy] = useState('');
    
    const [submitting, setSubmitting] = useState(false);
    
    // Joined state
    const hasJoined = !!user?.universityId || !!user?.profile?.universityName;

    const handleVerify = async () => {
        if (!joinCode.trim()) { setError('Please enter a join code'); return; }
        setLookupLoading(true); setError('');
        try {
            const res = await lookupUniversity(joinCode.trim().toUpperCase());
            setUniversity(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid join code.');
            setUniversity(null);
        } finally {
            setLookupLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setSubmitting(true); setError('');
        try {
            const payload = {
                joinCode: joinCode.trim().toUpperCase(),
                branchId: selectedBranch || undefined,
                sectionId: selectedSection || undefined,
                rollNumber: isStudent ? rollNumber : undefined,
                employeeId: !isStudent ? employeeId : undefined,
                college: isStudent ? college : undefined,
                yearOfStudy: isStudent ? yearOfStudy : undefined
            };
            await joinUniversitySpace(payload);
            // Refresh user to update state
            if(refreshUser) await refreshUser();
            else window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join university.');
        } finally {
            setSubmitting(false);
        }
    };

    const Layout = isStudent ? StudentLayout : InstructorLayout;
    const accentGradient = isStudent ? 'from-primary-600 to-indigo-600' : 'from-primary-600 to-accent-500';

    const allSections = university?.branches?.flatMap(b => b.sections || []) || [];

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-8">
                
                {/* HEADERS */}
                <div className="mb-10 text-center animate-fade-in-up">
                    <h1 className="font-syne font-extrabold text-white text-3xl md:text-4xl leading-tight mb-3">
                        {hasJoined ? 'Your University Space' : 'Join Your University Space'}
                    </h1>
                    <p className="text-text-secondary text-base max-w-lg mx-auto">
                        {hasJoined 
                            ? `You are currently linked to ${user.profile?.universityName || 'your university'}.`
                            : 'If your university uses EduForge natively, link your account to unlock private courses and campus-exclusive features.'}
                    </p>
                </div>

                {hasJoined ? (
                    /* ALREADY JOINED UI */
                    <SectionShell title="University Snapshot" icon={Building2} iconColor="text-primary-400 fill-current">
                        <div className="bg-bg-surface/50 border border-border-subtle rounded-2xl p-6 md:p-10 flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${accentGradient} flex items-center justify-center mb-6 shadow-xl`}>
                                <Building2 className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold font-syne text-white mb-2">{user.profile?.universityName || 'University Joined'}</h2>
                            
                            {!isStudent && user.profile?.approvalStatus === 'PENDING' && (
                                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm px-6 py-3 rounded-xl flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>Your account is waiting for approval by the University Admin.</span>
                                </div>
                            )}

                            {!isStudent && user.profile?.approvalStatus === 'APPROVED' && (
                                <div className="mt-6 flex flex-col items-center gap-4 w-full">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-6 py-3 rounded-xl flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>You are a verified faculty member.</span>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/instructor/create-university-course')}
                                        className="h-12 w-full max-w-sm bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <BookOpen className="w-5 h-5" />
                                        Create University Course
                                    </button>
                                </div>
                            )}

                            {isStudent && (
                                <div className="mt-4 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm px-6 py-3 rounded-xl flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>You are successfully enrolled via your university.</span>
                                </div>
                            )}
                        </div>
                    </SectionShell>
                ) : (
                    /* NOT JOINED YET UI */
                    <div className="bg-bg-surface/50 border border-border-subtle rounded-lg p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-fade-in-up max-w-2xl mx-auto">
                        
                        {!university ? (
                            <>
                                <div className="flex flex-col gap-1.5 mb-6">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">
                                        University Join Code
                                    </label>
                                    <div className="flex gap-3 relative">
                                        <input
                                            type="text"
                                            value={joinCode}
                                            onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                                            placeholder="e.g. UNI-A3K7X"
                                            maxLength={10}
                                            className="flex-1 h-14 bg-bg-base border border-border-subtle rounded-xl px-4 text-base font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all tracking-widest uppercase"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerify}
                                            disabled={lookupLoading || !joinCode.trim()}
                                            className={`h-14 px-6 sm:px-8 bg-gradient-to-r ${accentGradient} text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2`}
                                        >
                                            {lookupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                                        </button>
                                    </div>
                                </div>
                                {error && (
                                    <div className="bg-error-500/10 border border-error-400/20 text-error-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <form onSubmit={handleJoin} className="flex flex-col gap-5 animate-fade-in">
                                <div className="flex items-center justify-between px-5 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-2">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                        <div>
                                            <span className="text-sm font-bold text-emerald-300 block">{university.name}</span>
                                            <span className="text-xs text-emerald-400/80">Valid Join Code</span>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setUniversity(null)} className="text-xs text-text-muted hover:text-white underline">Change</button>
                                </div>

                                {isStudent ? (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">
                                                Your Section <span className="text-error-400">*</span>
                                            </label>
                                            <select
                                                required
                                                value={selectedSection}
                                                onChange={e => setSelectedSection(e.target.value)}
                                                className="w-full h-12 bg-bg-base border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                                            >
                                                <option value="" disabled hidden>Select your assigned section</option>
                                                {university.branches?.map(branch => (
                                                <optgroup key={branch.id} label={branch.name}>
                                                    {(branch.sections || []).map(sec => (
                                                        <option key={sec.id} value={sec.id} className="bg-bg-elevated">{sec.year} — {sec.name}</option>
                                                    ))}
                                                </optgroup>
                                                ))}
                                            </select>
                                        </div>
                                        <InputField label="Roll Number" required value={rollNumber} onChange={e=>setRollNumber(e.target.value)} placeholder="e.g. 21CS101" />
                                        <InputField label="College / Institute" value={college} onChange={e=>setCollege(e.target.value)} placeholder="Optional" />
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">Year of Study</label>
                                            <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} className="w-full h-12 bg-bg-base border border-border-subtle rounded-xl px-4 text-sm focus:outline-none">
                                                <option value="">Select Year (Optional)</option>
                                                {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate'].map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">
                                                Your Branch <span className="text-text-muted font-normal normal-case">(optional)</span>
                                            </label>
                                            <select
                                                value={selectedBranch}
                                                onChange={e => setSelectedBranch(e.target.value)}
                                                className="w-full h-12 bg-bg-base border border-border-subtle rounded-xl px-4 text-sm focus:outline-none appearance-none"
                                            >
                                                <option value="">Select your branch</option>
                                                {university.branches?.map(b => (
                                                    <option key={b.id} value={b.id} className="bg-bg-elevated">{b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <InputField label="Employee ID" value={employeeId} onChange={e=>setEmployeeId(e.target.value)} placeholder="Optional" />
                                    </>
                                )}

                                {error && (
                                    <div className="bg-error-500/10 border border-error-400/20 text-error-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting || (isStudent && (!selectedSection || !rollNumber))}
                                    className={`w-full h-14 mt-4 bg-gradient-to-r ${accentGradient} text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Integration'} <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        )}
                        
                    </div>
                )}
            </div>
        </Layout>
    );
}
