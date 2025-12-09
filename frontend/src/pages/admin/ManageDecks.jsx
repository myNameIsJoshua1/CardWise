import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import Table from '../../components/shared/Table';
import Button from '../../components/ui/button';

const ManageDecks = () => {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDecks = async () => {
            try {
                const data = await flashcardService.getDecks();
                setDecks(data);
            } catch (err) {
                setError('Failed to fetch decks');
            } finally {
                setLoading(false);
            }
        };

        fetchDecks();
    }, []);

    const handleDelete = async (deckId) => {
        if (!window.confirm('Are you sure you want to delete this deck?')) return;

        try {
            await flashcardService.deleteDeck(deckId);
            setDecks(decks.filter((deck) => deck.id !== deckId));
        } catch (err) {
            alert('Failed to delete deck');
        }
    };

    const handleEdit = (deckId) => {
        navigate(`/edit-deck/${deckId}`);
    };

    const handleViewFlashcards = (deckId) => {
        navigate(`/decks/${deckId}/flashcards`);
    };

    if (loading) return <LoadingState text="Loading decks..." />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="flex justify-center items-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-5xl">
                <h1 className="text-2xl font-bold mb-4 text-center">Manage Decks</h1>
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
                                variant="success" 
                                size="sm" 
                                onClick={() => handleViewFlashcards(deck.id)}
                            >
                                View Flashcards
                            </Button>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => handleEdit(deck.id)}
                            >
                                Edit
                            </Button>
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleDelete(deck.id)}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                    emptyMessage="No decks found."
                />
            </div>
        </div>
    );
};

export default ManageDecks;