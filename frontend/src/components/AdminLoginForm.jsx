import React, { useState } from 'react';
import api from '../services/api';

const AdminLoginForm = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('Submitting admin login form:', { email, password });
            
            // Try session-based login first
            const sessionResponse = await api.post('/session/login', {
                email: email,
                password: password,
                role: 'admin'
            });

            if (sessionResponse && sessionResponse.data) {
                console.log('Admin session login successful');
                await onLogin(email, password);
            } else {
                throw new Error('Invalid server response');
            }
        } catch (err) {
            console.error('Admin login form error:', err);
            
            // Fallback to JWT-based login
            try {
                console.log('Attempting JWT fallback for admin login');
                await onLogin(email, password);
            } catch (jwtError) {
                console.error('Admin JWT login also failed:', jwtError);
                setError(jwtError.message || 'Invalid email or password');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg">
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default AdminLoginForm;
