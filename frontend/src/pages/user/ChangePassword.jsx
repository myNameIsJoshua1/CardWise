import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import api from '../../services/api';
import FormField from '../../components/shared/FormField';
import Button from '../../components/ui/button';

const ChangePassword = () => {
    const navigate = useNavigate();
    const { user: contextUser } = useUser();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [generalError, setGeneralError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear errors when typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }
        
        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        setGeneralError(null);
        setSuccess(false);
        
        try {
            let userId = contextUser?.id || contextUser?.userId;
            if (!userId) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    userId = parsedUser.id || parsedUser.userId;
                }
            }
            
            if (!userId) {
                throw new Error('No user ID available');
            }
            
            // Call the dedicated change password endpoint
            await api.post(`/user/change-password/${userId}`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            
            setSuccess(true);
            
            // Clear the form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            // Navigate back to profile after a delay
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            console.error('Error changing password:', err);
            
            if (err.response?.status === 401) {
                setErrors(prev => ({
                    ...prev,
                    currentPassword: 'Current password is incorrect'
                }));
            } else {
                setGeneralError('Failed to change password. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                    <h1 className="text-2xl font-semibold">Change Password</h1>
                    <p className="opacity-80">Update your account password</p>
                </div>
                
                <div className="p-6">
                    {generalError && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {generalError}
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                            Password changed successfully! Redirecting to profile...
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <FormField
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            error={errors.currentPassword}
                        />
                        
                        <FormField
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            error={errors.newPassword}
                        />
                        
                        <FormField
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            className="mb-6"
                        />
                        
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
                                {isSubmitting ? 'Changing...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword; 
