import { useAuth } from '../../context/AuthContext';

const Topbar = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="h-16 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between px-6">
            <h1 className="text-white font-semibold text-lg">{title}</h1>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-white/80 text-sm font-medium">{user?.name}</p>
                    <p className="text-white/30 text-xs">Administrator</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0)}
                </div>
            </div>
        </header>
    );
};

export default Topbar;