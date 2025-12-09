import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { flashcardService } from '../../services/flashcardService';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import Table from '../../components/shared/Table';
import Button from '../../components/ui/button';

const UserDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const fetchedRef = useRef(false);

    useEffect(() => {
        // Prevent multiple fetches
        if (fetchedRef.current) return;
        
        const fetchData = async () => {
            try {
                const userResponse = await userService.getUserById(userId);
                const decksResponse = await flashcardService.getDecks();
                setUser(userResponse);
                setDecks(decksResponse.filter((deck) => deck.userId === userId)); // Filter decks by owner
                fetchedRef.current = true;
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError('Failed to fetch user details or decks');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // Empty dependency array to only run once

    const handleViewFlashcards = (deckId) => {
        navigate(`/decks/${deckId}/flashcards`);
    };

    const handleDeleteDeck = async (deckId) => {
        if (!window.confirm('Are you sure you want to delete this deck?')) return;

        try {
            await flashcardService.deleteDeck(deckId);
            setDecks(decks.filter((deck) => deck.id !== deckId));
        } catch (err) {
            alert('Failed to delete deck');
        }
    };

    if (loading) return <LoadingState text="Loading user details..." />;
    if (error) return <ErrorState message={error} onBack={() => navigate('/admin/users')} />;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        ← Back
                    </Button>
                    <h1 className="text-2xl font-bold">User Details</h1>
                </div>

                {/* User Info */}
                <div className="p-6 border-b">
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">ID</dt>
                            <dd className="mt-1 text-gray-900">{user.userId}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                            <dd className="mt-1 text-gray-900">{user.firstName} {user.lastName}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-gray-900">{user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                            <dd className="mt-1 text-gray-900">{user.role || 'Empty'}</dd>
                        </div>
                    </dl>
                </div>

                {/* Decks Section */}
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">User's Decks</h2>
                    <Table
                        columns={[
                            { header: 'ID', field: 'id' },
                            { header: 'Subject', field: 'subject' },
                            { header: 'Category', field: 'category' }
                        ]}
                        data={decks}
                        actions={(deck) => (
                            <>
                                <Button 
                                    variant="primary" 
                                    size="sm" 
                                    onClick={() => handleViewFlashcards(deck.id)}
                                >
                                    Flashcards
                                </Button>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    onClick={() => handleDeleteDeck(deck.id)}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                        emptyMessage="No decks found for this user."
                    />
                </div>
            </div>
        </div>
    );
};

export default UserDetails;