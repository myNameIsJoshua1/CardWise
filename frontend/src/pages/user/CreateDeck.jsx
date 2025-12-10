import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthUser } from '../../hooks/useAuthUser';
import { useDeckForm } from '../../hooks/useDeckForm';
import { checkDeckAchievement } from '../../utils/achievementHelper';
import AchievementNotification from '../../components/AchievementNotification';
import { FlashcardFormEditor, DeckInfoForm } from '../../components/shared/FlashcardFormEditor';
import AlertMessage from '../../components/shared/AlertMessage';
import Button from '../../components/ui/button';

const CreateDeck = () => {
    const navigate = useNavigate();
    const { styles } = useTheme();
    const { getUserId } = useAuthUser();
    const { 
        deckData, 
        handleDeckChange, 
        handleFlashcardChange, 
        addFlashcard, 
        removeFlashcard, 
        validateDeck 
    } = useDeckForm();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [achievement, setAchievement] = useState(null);

    // Submit the deck with flashcards
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const userId = getUserId();
            if (!userId) {
                throw new Error('You need to be logged in to create a deck');
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found. Please log in again.');
            }

            // Validate deck and get valid flashcards
            const validFlashcards = validateDeck();

            // Create deck payload
            const deckPayload = {
                title: deckData.title,
                description: deckData.description || "",
                category: deckData.category || "General",
                userId: userId,
                cardCount: validFlashcards.length
            };
            
            // Create the deck in the backend
            const newDeck = await flashcardService.createDeck(deckPayload);

            // Create flashcards for the deck
            const flashcardPromises = validFlashcards.map(card => 
                flashcardService.createFlashcard({
                    deckId: newDeck.id,
                    term: card.term,
                    definition: card.definition,
                    learned: false,
                    userId: userId
                })
            );

            await Promise.all(flashcardPromises);
            
            setSuccess('Your flashcard deck has been created successfully!');
            
            // Check and unlock deck achievement
            const unlockedAchievement = await checkDeckAchievement(userId);
            if (unlockedAchievement) {
                setAchievement(unlockedAchievement);
            }
            
            // Navigate to the new deck after a short delay
            setTimeout(() => {
                navigate(`/decks/${newDeck.id}`);
            }, 1500);
        } catch (err) {
            console.error('Failed to create deck:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Authentication error. Please log in again.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(err.message || 'Failed to create deck. Please try again.');
            }
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
        navigate('/dashboard');
    };

    return (
        <div className={`min-h-screen ${styles.border}`}>
            
            {achievement && (
                <AchievementNotification 
                    achievement={achievement}
                    onClose={() => setAchievement(null)}
                />
            )}
            
            <div className="max-w-5xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-2xl font-bold ${styles.text}`}>Create New Flashcard Deck</h1>
                </div>

                {error && <AlertMessage type="error" message={error} />}
                {success && <AlertMessage type="success" message={success} />}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Deck Information Card */}
                    <DeckInfoForm 
                        deckData={deckData} 
                        onChange={handleDeckChange} 
                        styles={styles} 
                    />

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
                            {isSubmitting ? 'Creating...' : 'Create Deck'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDeck; 
