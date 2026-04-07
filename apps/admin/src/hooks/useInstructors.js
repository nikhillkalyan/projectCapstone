import { useState, useEffect } from 'react';
import { getInstructors, getInstructorStats } from '../services/instructorService';

export const useInstructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, flagged: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');

    const fetchStats = async () => {
        try {
            const data = await getInstructorStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const fetchInstructors = async () => {
        try {
            setLoading(true);
            const data = await getInstructors(statusFilter, search);
            setInstructors(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchInstructors();
    }, [statusFilter, search]);

    return {
        instructors,
        stats,
        loading,
        error,
        statusFilter,
        setStatusFilter,
        search,
        setSearch,
        refetch: fetchInstructors,
    };
};