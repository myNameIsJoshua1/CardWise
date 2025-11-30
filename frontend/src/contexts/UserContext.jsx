import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';
import api from '../services/api';

// Create context with default values to prevent undefined errors
const UserContext = createContext({
    user: null,
    setUser: () => {}
});

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load user from localStorage and fetch complete profile if needed
    useEffect(() => {
        const fetchCompleteUserProfile = async (basicUserData) => {
            try {
                // Extract user ID
                const userId = basicUserData.id || basicUserData.userId;
                if (!userId) {
                    console.warn('Cannot fetch complete profile: No user ID found');
                    return basicUserData;
                }
                
                console.log('Fetching complete user profile from API for userId:', userId);
                const completeUserData = await userService.getUserById(userId);
                
                // Preserve the auth token from the original data
                completeUserData.token = basicUserData.token;
                
                console.log('Got complete user data:', completeUserData);
                
                // Update localStorage with complete data
                localStorage.setItem('user', JSON.stringify(completeUserData));
                
                return completeUserData;
            } catch (error) {
                console.error('Failed to fetch complete user profile:', error);
                return basicUserData; // Fall back to basic data
            }
        };

        const validateSession = async () => {
            try {
                console.log('Validating session with server...');
                const response = await api.get('/session/validate');
                if (response.data && response.data.valid) {
                    console.log('Session is valid:', response.data);
                    return true;
                }
                // If validation returns false, still trust localStorage if we have a token or user
                return false;
            } catch (error) {
                console.log('Session validation failed (non-critical):', error.message);
                // Don't sign out on validation failure - session validation is optional
                // The token/JWT will handle authentication if needed
                return true; // Return true to allow localStorage data to persist
            }
        };
        
        const initializeUser = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    
                    // Check if we have a token (JWT) or stored user data
                    const hasToken = !!localStorage.getItem('token');
                    
                    // If we have a token, trust it and don't validate with server
                    if (hasToken) {
                        console.log('JWT token found, restoring user without server validation');
                        setUser(parsedUser);
                    } else {
                        // Only validate session if we don't have a JWT token
                        console.log('No JWT token found, validating session with server...');
                        const isSessionValid = await validateSession();
                        
                        if (!isSessionValid) {
                            console.log('Session validation failed, clearing user data');
                            localStorage.removeItem('user');
                            localStorage.removeItem('token');
                            setUser(null);
                        } else {
                            // Set initial user state
                            setUser(parsedUser);
                        }
                    }
                    
                    // Optionally fetch complete profile if we have a user ID
                    const userId = parsedUser.id || parsedUser.userId;
                    if (userId && hasToken) {
                        try {
                            const completeUserData = await fetchCompleteUserProfile(parsedUser);
                            setUser(completeUserData);
                        } catch (profileError) {
                            console.log('Profile fetch optional - using stored data');
                        }
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                setUser(null);
            } finally {
                setIsInitialized(true);
            }
        };
        
        initializeUser();
    }, []);

    // Listen for changes to localStorage (for multi-tab sync)
    useEffect(() => {
        const handleStorage = (event) => {
            if (event.key === 'user') {
                try {
                    if (event.newValue) {
                        setUser(JSON.parse(event.newValue));
                    } else {
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error parsing user data from storage event:', error);
                }
            }
        };
        
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Helper to update both localStorage and context
    const updateUser = (userData) => {
        try {
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            } else {
                localStorage.removeItem('user');
                setUser(null);
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    // Only render children when initialization is complete
    if (!isInitialized) {
        return <div>Loading...</div>;
    }

    return (
        <UserContext.Provider value={{ user, setUser: updateUser }}>
            {children}
        </UserContext.Provider>
    );
}; 