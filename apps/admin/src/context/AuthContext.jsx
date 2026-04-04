import { createContext, useContext, useState } from 'react';
import { loginAdmin, logoutAdmin } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('adminUser');
        return stored ? JSON.parse(stored) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem('adminToken') || null;
    });

    const login = async (email, password) => {
        const data = await loginAdmin(email, password);

        // Reject if not ADMIN role
        if (data.role !== 'ADMIN') {
            throw new Error('Access denied. Not an admin account.');
        }

        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data));
        setToken(data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        logoutAdmin();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};