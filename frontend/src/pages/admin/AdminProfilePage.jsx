import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../../components/shared/LoadingState';
import Button from '../../components/ui/button';

const AdminProfilePage = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Retrieve admin data from localStorage
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin) {
            const adminData = JSON.parse(storedAdmin);
            setAdmin(adminData);
        }
        setIsLoading(false);
    }, []);

    if (isLoading) return <LoadingState text="Loading profile..." />;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <h1 className="text-2xl font-semibold">Admin Profile</h1>
                    <p className="opacity-90 mt-1">Manage your account information</p>
                </div>

                <div className="p-6">
                    <div className="flex items-center mb-6 pb-6 border-b">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {admin.firstName?.charAt(0)}{admin.lastName?.charAt(0)}
                        </div>
                        <div className="ml-4">
                            <h2 className="text-xl font-semibold">{admin.firstName} {admin.lastName}</h2>
                            <p className="text-gray-600">{admin.role || 'Administrator'}</p>
                        </div>
                    </div>

                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-gray-900">{admin.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="mt-1 text-gray-900">{admin.phone || 'Not provided'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                            <dd className="mt-1 text-gray-900">{admin.role || 'Administrator'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                            <dd className="mt-1 text-gray-900">{admin.id}</dd>
                        </div>
                    </dl>

                    <div className="mt-8 pt-6 border-t">
                        <h3 className="text-lg font-medium mb-4">Security</h3>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/admin/change-password')}
                        >
                            Change Password
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
