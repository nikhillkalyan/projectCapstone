import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome, {user?.name} 👋
                </h1>
                <p className="text-white/40 mb-8">Admin Dashboard — coming soon</p>
                <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm transition-all"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard;