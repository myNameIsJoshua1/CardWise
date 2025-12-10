import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

/**
 * Custom hook for handling user authentication and loading user data
 * Ensures user data is available from context or localStorage
 * Redirects to login if not authenticated
 */
export const useAuthUser = () => {
    const navigate = useNavigate();
    const { user: contextUser } = useUser();
    const [user, setUser] = useState(contextUser);

    // Load user from context or localStorage
    useEffect(() => {
        if (!contextUser) {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                }
            } catch (err) {
                console.error('Failed to parse user from localStorage:', err);
            }
        } else {
            setUser(contextUser);
        }
    }, [contextUser]);

    // Verify authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
            console.error("Not authenticated, redirecting to login");
            navigate('/login');
        }
    }, [navigate, user]);

    // Get user ID from multiple sources
    const getUserId = () => {
        if (user?.id || user?.userId) {
            return user.id || user.userId;
        }
        
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                return userData.id || userData.userId;
            }
        } catch (err) {
            console.error('Failed to get userId from localStorage:', err);
        }
        
        return null;
    };

    return { user, getUserId };
};
