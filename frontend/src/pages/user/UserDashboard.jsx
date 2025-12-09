import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { WelcomeHeader, StatsGrid, DecksSection, ActivitySidebar } from '../../components/dashboard/DashboardComponents';

// Simple reusable loading spinner for this page
const LoadingState = () => (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

const UserDashboard = () => {
    const { styles } = useTheme();
    const { user, loading, stats, decks, error } = useDashboardData();

    if (loading) return <LoadingState />;

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-64">
                <p className={styles.textSecondary}>Please log in.</p>
                <Link to="/login" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className={`${styles.background} container mx-auto px-4 py-8`}>
            <WelcomeHeader user={user} />
            <StatsGrid stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DecksSection decks={decks} error={error} />
                <ActivitySidebar recentActivity={stats.recentActivity} firstDeckId={decks[0]?.id} />
            </div>
        </div>
    );
};

export default UserDashboard;