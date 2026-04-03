import AppShell from './AppShell';
import { useAuth } from '../../../context/AuthContext';
import {
    LayoutDashboard, Compass, BookOpen, Heart, MessageSquare, UserCircle
} from 'lucide-react';

const studentNavLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/student/explore', icon: Compass, label: 'Explore Courses' },
    { to: '/student/enrolled', icon: BookOpen, label: 'My Courses' },
    { to: '/student/favorites', icon: Heart, label: 'Favorites' },
    { to: '/student/chat', icon: MessageSquare, label: 'Messages' },
    { to: '/student/profile', icon: UserCircle, label: 'Profile' },
];

export default function StudentLayout({ children }) {
    const { user, logout } = useAuth();
    return (
        <AppShell
            role="Student"
            navLinks={studentNavLinks}
            user={user}
            onLogout={logout}
        >
            {children}
        </AppShell>
    );
}
