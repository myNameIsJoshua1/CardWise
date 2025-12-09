import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import Table from '../../components/shared/Table';
import Button from '../../components/ui/button';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const fetchedRef = useRef(false);

    useEffect(() => {
        // Prevent multiple fetches
        if (fetchedRef.current) return;
        
        const fetchUsers = async () => {
            try {
                const data = await userService.getUsers();
                setUsers(data);
                setFilteredUsers(data);
                fetchedRef.current = true;
            } catch (err) {
                console.error('Error fetching users list:', err);
                setError('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - intentional to only run once

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await userService.deleteUser(userId);
            const updatedUsers = users.filter((user) => user.userId !== userId);
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleMore = (userId) => {
        navigate(`/admin/users/${userId}`);
    };

    const handleRoleFilterChange = (e) => {
        const role = e.target.value;
        setSelectedRole(role);

        if (role === '') {
            setFilteredUsers(users);
        } else if (role === 'Empty') {
            setFilteredUsers(users.filter((user) => !user.role || user.role === ''));
        } else {
            setFilteredUsers(users.filter((user) => user.role === role));
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = users.filter(
            (user) =>
                user.userId.toLowerCase().includes(query) ||
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(query)
        );

        setFilteredUsers(filtered);
    };

    if (loading) return <LoadingState text="Loading users..." />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="flex justify-center items-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-5xl">
                <h1 className="text-2xl font-bold mb-4 text-center">Manage Users</h1>

                <div className="mb-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <label htmlFor="search" className="mr-2 text-gray-700 font-medium">
                            Search:
                        </label>
                        <input
                            id="search"
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search by name or ID"
                            className="border border-gray-300 rounded px-3 py-1"
                        />
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="roleFilter" className="mr-2 text-gray-700 font-medium">
                            Filter by Role:
                        </label>
                        <select
                            id="roleFilter"
                            value={selectedRole}
                            onChange={handleRoleFilterChange}
                            className="border border-gray-300 rounded px-3 py-1"
                        >
                            <option value="">All</option>
                            <option value="TEACHER">TEACHER</option>
                            <option value="STUDENT">STUDENT</option>
                            <option value="Empty">Empty</option>
                        </select>
                    </div>
                </div>

                <Table
                    columns={[
                        { header: 'ID', field: 'userId' },
                        { 
                            header: 'Name', 
                            render: (user) => `${user.firstName} ${user.lastName}` 
                        },
                        { header: 'Email', field: 'email' },
                        { 
                            header: 'Role', 
                            render: (user) => user.role || 'Empty' 
                        }
                    ]}
                    data={filteredUsers}
                    actions={(user) => (
                        <>
                            <Button 
                                variant="success" 
                                size="sm" 
                                onClick={() => handleMore(user.userId)}
                            >
                                More
                            </Button>
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleDelete(user.userId)}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                    emptyMessage="No users found."
                />
            </div>
        </div>
    );
};

export default ManageUsers;