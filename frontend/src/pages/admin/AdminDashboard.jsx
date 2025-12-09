import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/button';

const AdminDashboard = ({ admin: propAdmin }) => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const fetchedRef = useRef(false);

    // Set admin data from props or localStorage on mount
    useEffect(() => {
        if (fetchedRef.current) return;

        let adminData = propAdmin;
        
        // If no admin from props, try from localStorage
        if (!adminData) {
            const storedAdmin = localStorage.getItem('admin');
            if (storedAdmin) {
                try {
                    adminData = JSON.parse(storedAdmin);
                    console.log('Loaded admin data from localStorage:', adminData);
                } catch (err) {
                    console.error('Failed to parse admin data from localStorage', err);
                }
            }
        }
        
        if (adminData) {
            setAdmin(adminData);
        }
        
        fetchedRef.current = true;
    }, [propAdmin]);

    if (!admin) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl text-red-500">No admin data available. Please log in again.</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome, {admin.firstName || 'Admin'}
                    </h1>
                    <div className="space-y-1 text-blue-100">
                        <p><span className="font-medium">ID:</span> {admin.id}</p>
                        <p><span className="font-medium">Email:</span> {admin.email}</p>
                    </div>
                </div>
                
                <div className="p-8">
                    <p className="text-center text-gray-600 mb-8">
                        Quick overview of your admin panel
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button
                            onClick={() => navigate('/admin/users')}
                            className="w-full"
                        >
                            Manage Users
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/decks')}
                            className="w-full"
                        >
                            Manage Decks
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/reports')}
                            className="w-full"
                        >
                            View Reports
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/profile')}
                            className="w-full"
                        >
                            Admin Profile
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
