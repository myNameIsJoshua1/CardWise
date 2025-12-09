import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import FormField from '../../components/shared/FormField';
import Button from '../../components/ui/button';

const EditUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const fetchedRef = useRef(false);

    useEffect(() => {
        // Prevent multiple fetches
        if (fetchedRef.current) return;
        
        const fetchUser = async () => {
            try {
                const response = await userService.getUserById(userId);
                setUser(response);
                fetchedRef.current = true;
            } catch (err) {
                console.error('Error fetching user for editing:', err);
                setError('Failed to fetch user details');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array to only run once

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.updateUser(userId, user);
            alert('User updated successfully');
            navigate('/manage-users');
        } catch (err) {
            alert('Failed to update user');
        }
    };

    if (loading) return <LoadingState text="Loading user details..." />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
            <h1 className="text-2xl font-bold mb-4">Edit User</h1>
            <form onSubmit={handleSubmit}>
                <FormField
                    label="First Name"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleChange}
                />
                
                <FormField
                    label="Last Name"
                    name="lastName"
                    value={user.lastName}
                    onChange={handleChange}
                />
                
                <FormField
                    label="Email"
                    name="email"
                    type="email"
                    value={user.email}
                    onChange={handleChange}
                />
                
                <div className="mb-4">
                    <label className="block text-gray-700 mb-1 font-medium">Role</label>
                    <select
                        name="role"
                        value={user.role}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded"
                    >
                        <option value="STUDENT">Student</option>
                        <option value="EDUCATOR">Educator</option>
                    </select>
                </div>
                
                <Button type="submit">
                    Save Changes
                </Button>
            </form>
        </div>
    );
};

export default EditUser;