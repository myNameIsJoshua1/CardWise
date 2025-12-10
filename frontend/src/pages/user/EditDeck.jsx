import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthUser } from '../../hooks/useAuthUser';
import { useDeckEditor } from '../../hooks/useDeckEditor';
import { updateDeckWithFlashcards } from '../../utils/deckUpdateHelper';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { FlashcardFormEditor } from '../../components/shared/FlashcardFormEditor';
import LoadingState from '../../components/shared/LoadingState';
import AlertMessage from '../../components/shared/AlertMessage';
import Button from '../../components/ui/button';

const EditDeck = () => {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const { styles } = useTheme();
    const { getUserId } = useAuthUser();
    const userId = getUserId();
    
    const {
        isLoading,
        deckData,
        originalFlashcards,
        error: loadError,
        handleDeckChange,
        handleFlashcardChange,
        addFlashcard,
        removeFlashcard,
        validateDeck
    } = useDeckEditor(deckId, userId);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const isDarkMode = styles.background && (styles.background.includes('slate-900') || styles.background.includes('gray-900'));

    // Redirect if load error indicates permission issue
    useEffect(() => {
        if (loadError && loadError.includes("permission")) {
            setTimeout(() => navigate('/dashboard'), 2000);
        }
    }, [loadError, navigate]);

    // Save the updated deck
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (!userId) {
                throw new Error('User ID not available');
            }

            // Validate deck and get valid flashcards
            const validFlashcards = validateDeck();

            // Update deck and flashcards
            await updateDeckWithFlashcards(
                deckId,
                deckData,
                validFlashcards,
                originalFlashcards,
                userId
            );
            
            setSuccess('Your flashcard deck has been updated successfully!');
            
            // Navigate back after a short delay
            setTimeout(() => {
                navigate(`/decks/${deckId}`);
            }, 1500);
        } catch (err) {
            console.error('Failed to update deck:', err);
            setError(err.message || 'Failed to update deck. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveFlashcard = (index) => {
        try {
            removeFlashcard(index);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancel = () => {
        navigate(`/decks/${deckId}`);
    };

    if (isLoading) {
        return <LoadingState text="Loading deck data..." />;
    }

    return (
        <div className={`min-h-screen ${styles.backgroundSecondary}`}>
            <div className="max-w-5xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-2xl font-bold ${styles.text}`}>Edit Flashcard Deck</h1>
                </div>

                {error && <AlertMessage type="error" message={error} />}
                {loadError && <AlertMessage type="error" message={loadError} />}
                {success && <AlertMessage type="success" message={success} />}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Deck Information Card */}
                    <Card className={`${styles.card} ${styles.border}`}>
                        <CardHeader>
                            <CardTitle className={styles.text}>Deck Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label htmlFor="title" className={`block text-sm font-medium ${styles.textSecondary} mb-1`}>
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={deckData.title}
                                    onChange={handleDeckChange}
                                    className={`w-full px-4 py-2 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                                        isDarkMode 
                                            ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    placeholder="Enter deck title"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="description" className={`block text-sm font-medium ${styles.textSecondary} mb-1`}>
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={deckData.description}
                                    onChange={handleDeckChange}
                                    rows="3"
                                    className={`w-full px-4 py-2 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                                        isDarkMode 
                                            ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    placeholder="Describe what this deck is about"
                                ></textarea>
                            </div>
                            
                            <div>
                                <label htmlFor="category" className={`block text-sm font-medium ${styles.textSecondary} mb-1`}>
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={deckData.category}
                                    onChange={handleDeckChange}
                                    className={`w-full px-4 py-2 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                                        isDarkMode 
                                            ? 'bg-slate-800 border-slate-700 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                >
                                    <option value="">Select a category</option>
                                    <option value="Language">Language</option>
                                    <option value="Science">Science</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="History">History</option>
                                    <option value="Geography">Geography</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Flashcards Editor Card */}
                    <FlashcardFormEditor
                        flashcards={deckData.flashcards}
                        onChange={handleFlashcardChange}
                        onAdd={addFlashcard}
                        onRemove={handleRemoveFlashcard}
                        styles={styles}
                    />

                    <div className="flex justify-end gap-4 pt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            variant="gradient"
                            size="lg"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDeck;
