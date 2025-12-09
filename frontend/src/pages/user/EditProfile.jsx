import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { userService } from '../../services/userService';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import FormField from '../../components/shared/FormField';
import Button from '../../components/ui/button';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user: contextUser, setUser: updateUserContext } = useUser();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const fetchedRef = useRef(false);
    
    useEffect(() => {
        // Prevent multiple fetches
        if (fetchedRef.current) return;
        
        const fetchUserData = async () => {
            try {
                let userId = null;

                // Try to get ID from context first
                if (contextUser?.id || contextUser?.userId) {
                    userId = contextUser.id || contextUser.userId;
                } else {
                    // Then from localStorage
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const parsedUser = JSON.parse(storedUser);
                        userId = parsedUser.id || parsedUser.userId;
                    }
                }

                if (!userId) {
                    throw new Error('No user ID available');
                }

                // Get fresh data from the API
                const userData = await userService.getUserById(userId);
                
                // Initialize form with user data
                setFormData({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    role: userData.role || ''
                });
                
                setError(null);
                fetchedRef.current = true;
            } catch (err) {
                console.error('Error fetching user data for edit:', err);
                setError('Failed to load user data. Please try again.');
                
                // Fallback to context data
                if (contextUser) {
                    setFormData({
                        firstName: contextUser.firstName || '',
                        lastName: contextUser.lastName || '',
                        email: contextUser.email || '',
                        role: contextUser.role || ''
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);
        
        try {
            // Get the current stored user data with all fields
            const storedUserData = JSON.parse(localStorage.getItem('user') || '{}');
            let userId = storedUserData.id || storedUserData.userId || contextUser?.id || contextUser?.userId;
            
            if (!userId) {
                throw new Error('No user ID available for update');
            }
            
            // Extract the authentication token before updating
            const token = storedUserData.token;
            
            // *** IMPORTANT FIX FOR PASSWORD LOSS ISSUE ***
            // Create a focused update payload that ONLY includes the fields we want to change
            // This helps prevent the backend from setting other fields to null or empty values
            const nameUpdateOnly = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                // Keep the original email (but don't change it)
                email: formData.email,
                // Essential flag to tell the backend NOT to update the password
                _preservePassword: true
            };
            
            console.log('Update payload (name-only):', nameUpdateOnly);
            
            // Call the API to update profile but don't assign the result since we're not using it
            await userService.updateUser(userId, nameUpdateOnly);
            
            // Ensure we preserve the token and important fields
            const mergedUser = { 
                ...storedUserData,              // Keep all original data
                firstName: formData.firstName,  // Only update the first name
                lastName: formData.lastName,    // Only update the last name
                token: token,                   // Ensure token is preserved
                id: storedUserData.id,          // Keep the original ID
                userId: storedUserData.userId   // Keep the original userId
            };
            
            // Update local storage and context with merged data
            localStorage.setItem('user', JSON.stringify(mergedUser));
            updateUserContext(mergedUser);
            
            setSuccess(true);
            
            // Navigate back to profile after a delay
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <LoadingState text="Loading profile..." />;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                    <h1 className="text-2xl font-semibold">Edit Profile</h1>
                    <p className="opacity-80">Update your personal information</p>
                </div>
                
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                            Profile updated successfully!
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <FormField
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                        
                        <FormField
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                        
                        <div className="mb-4">
                            <FormField
                                label="Email (Read Only)"
                                name="email"
                                type="email"
                                value={formData.email}
                                disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Please contact support if you need to update your email.</p>
                        </div>
                        
                        <div className="mb-6">
                            <FormField
                                label="Role (Read Only)"
                                name="role"
                                value={formData.role || "Student"}
                                disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">Role cannot be changed. Please contact an administrator if you need a role change.</p>
                        </div>
                        
                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/profile')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile; 
