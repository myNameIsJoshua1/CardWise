import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import { achievementService } from '../../services/achievementService';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import AchievementNotification from '../../components/AchievementNotification';
import { FlashcardFormEditor, DeckInfoForm } from '../../components/shared/FlashcardFormEditor';
import AlertMessage from '../../components/shared/AlertMessage';
import Button from '../../components/ui/button';

// Flashcard structure comment
// { term: string, definition: string }

const CreateDeck = () => {
    const navigate = useNavigate();
    const { user: contextUser } = useUser();
    const { styles } = useTheme();
    const [user, setUser] = useState(contextUser);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [achievement, setAchievement] = useState(null);

    // Initialize deck data with empty flashcards
    const [deckData, setDeckData] = useState({
        title: '',
        description: '',
        category: '',
        flashcards: [
            { term: '', definition: '' },
            { term: '', definition: '' }
        ]
    });

    // Ensure we have user data - fallback to localStorage if needed
    useEffect(() => {
        console.log("CreateDeck - Context user:", contextUser);
        if (!contextUser) {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    console.log('CreateDeck - Loaded user from localStorage:', userData);
                    setUser(userData);
                }
            } catch (err) {
                console.error('Failed to parse user from localStorage:', err);
            }
        } else {
            setUser(contextUser);
        }
    }, [contextUser]);

    // Verify authentication on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log("CreateDeck - Authentication check:", { 
            hasToken: !!token, 
            hasUserData: !!userData,
            user 
        });
        
        if (!token || !userData) {
            console.error("CreateDeck - Not authenticated, redirecting to login");
            navigate('/login');
        }
    }, [navigate, user]);

    // Handle input change for deck information
    const handleDeckChange = (e) => {
        const { name, value } = e.target;
        setDeckData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle flashcard changes
    const handleFlashcardChange = (index, field, value) => {
        const updatedFlashcards = [...deckData.flashcards];
        updatedFlashcards[index] = {
            ...updatedFlashcards[index],
            [field]: value
        };
        setDeckData(prev => ({
            ...prev,
            flashcards: updatedFlashcards
        }));
    };

    // Add a new empty flashcard
    const addFlashcard = () => {
        setDeckData(prev => ({
            ...prev,
            flashcards: [...prev.flashcards, { term: '', definition: '' }]
        }));
    };

    // Remove a flashcard
    const removeFlashcard = (index) => {
        if (deckData.flashcards.length <= 1) {
            setError('You need at least one flashcard');
            return;
        }

        const updatedFlashcards = deckData.flashcards.filter((_, i) => i !== index);
        setDeckData(prev => ({
            ...prev,
            flashcards: updatedFlashcards
        }));
    };

    // Submit the deck with flashcards
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            // Validate deck data
            if (!deckData.title.trim()) {
                throw new Error('Title is required');
            }

            // Validate flashcards - filter valid ones
            const validFlashcards = deckData.flashcards.filter(card => 
                card.term.trim() && card.definition.trim()
            );

            if (validFlashcards.length === 0) {
                throw new Error('Please create at least one flashcard with both question and answer');
            }

            // Get user ID - try multiple sources
            let userId;
            if (user?.id || user?.userId) {
                userId = user.id || user.userId;
            } else {
                // Fallback to localStorage
                try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const userData = JSON.parse(storedUser);
                        userId = userData.id || userData.userId;
                    }
                } catch (err) {
                    console.error('Failed to get userId from localStorage:', err);
                }
            }

            if (!userId) {
                throw new Error('You need to be logged in to create a deck');
            }

            console.log('Creating deck for user ID:', userId);
            
            // Add token to request headers for authentication (should be handled by api.js interceptor)
            // Check token is available
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found. Please log in again.');
            }

            // Create the deck with minimum required fields matching your Spring backend
            const deckPayload = {
                title: deckData.title,
                description: deckData.description || "",
                category: deckData.category || "General",
                userId: userId,
                cardCount: validFlashcards.length
            };
            
            console.log('Sending deck payload:', deckPayload);
            
            // Create the deck in the backend
            const newDeck = await flashcardService.createDeck(deckPayload);
            console.log('Created new deck:', newDeck);

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
            
            // Check if this is a deck milestone achievement
            try {
              const userDecks = await flashcardService.getDecksByUserId(userId);
              console.log('User decks:', userDecks);
              
              if (userDecks) {
                const deckCount = userDecks.length;
                let achievement = null;
                
                // Check for first deck
                if (deckCount === 1) {
                  achievement = {
                    title: 'First Deck Creator',
                    description: 'Created your first flashcard deck!'
                  };
                }
                // Check for 5 decks achievement
                else if (deckCount === 5) {
                  achievement = {
                    title: 'Deck Builder',
                    description: 'Create 5 flashcard decks'
                  };
                }
                // Check for 10 decks achievement
                else if (deckCount === 10) {
                  achievement = {
                    title: 'Master Creator',
                    description: 'Create 10 flashcard decks'
                  };
                }
                
                if (achievement) {
                  console.log('Unlocking achievement for userId:', userId);
                  
                  // Always save to localStorage
                  const savedResult = achievementService.saveAchievementsLocally(userId, achievement);
                  console.log('Achievement saved locally:', savedResult);
                  
                  // Try to unlock via backend and check if it's newly unlocked
                  try {
                    const result = await achievementService.unlockAchievement(
                      userId,
                      achievement.title,
                      achievement.description
                    );
                    
                    // Only show notification if this is a new unlock
                    if (result.newlyUnlocked) {
                      setAchievement(achievement);
                    }
                  } catch (err) {
                    console.log('Backend achievement unlock failed, using localStorage:', err);
                    // Show notification for localStorage fallback
                    setAchievement(achievement);
                  }
                }
              }
            } catch (err) {
              console.error('Error checking deck count for achievement:', err);
            }
            
            // Navigate to the new deck after a short delay
            setTimeout(() => {
                navigate(`/decks/${newDeck.id}`);
            }, 1500);
        } catch (err) {
            console.error('Failed to create deck:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                // Authentication error
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
                        onRemove={removeFlashcard}
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
