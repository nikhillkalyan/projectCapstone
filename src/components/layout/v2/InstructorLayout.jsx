import AppShell from './AppShell';
import { useAuth } from '../../../context/AuthContext';
import {
    LayoutDashboard, BookOpen, PlusCircle, Users, MessageSquare, UserCircle
} from 'lucide-react';

const instructorNavLinks = [
    { to: '/instructor', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/instructor/create-course', icon: PlusCircle, label: 'Create Course' },
    { to: '/instructor/chat', icon: MessageSquare, label: 'Messages' },
    { to: '/instructor/profile', icon: UserCircle, label: 'Profile' },
];

export default function InstructorLayout({ children }) {
    const { user, logout } = useAuth();
    return (
        <AppShell
            role="Instructor"
            navLinks={instructorNavLinks}
            user={user}
            onLogout={logout}
        >
            {children}
        </AppShell>
    );
}
