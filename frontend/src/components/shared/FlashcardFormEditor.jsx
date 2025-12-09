import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import Button from '../ui/button';

export const FlashcardFormEditor = ({ 
  flashcards, 
  onChange, 
  onAdd, 
  onRemove, 
  styles = {} 
}) => {
  return (
    <Card className={`${styles.card} ${styles.border}`}>
      <CardHeader>
        <CardTitle className={styles.text}>Flashcards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {flashcards.map((flashcard, index) => (
          <div key={index} className={`p-4 border rounded-md ${styles.card} ${styles.border} shadow-sm`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-lg font-medium ${styles.text}`}>Card {index + 1}</h3>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${styles.textSecondary} mb-1`}>
                  Question
                </label>
                <input
                  type="text"
                  value={flashcard.term}
                  onChange={(e) => onChange(index, 'term', e.target.value)}
                  className={`${styles.input} w-full px-4 py-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow`}
                  placeholder="Enter question"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.textSecondary} mb-1`}>
                  Answer
                </label>
                <textarea
                  value={flashcard.definition}
                  onChange={(e) => onChange(index, 'definition', e.target.value)}
                  className={`${styles.input} w-full px-4 py-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow`}
                  rows="2"
                  placeholder="Enter answer"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className={`w-full py-3 px-4 mt-4 border-2 border-dashed ${styles.border} ${styles.textSecondary} rounded-md hover:border-purple-500 hover:text-purple-500 transition-all duration-200 flex items-center justify-center font-medium`}
        >
          <span className="mr-2 text-xl">+</span> Add Another Card
        </button>
      </CardContent>
    </Card>
  );
};

export const DeckInfoForm = ({ 
  deckData, 
  onChange, 
  styles = {} 
}) => {
  return (
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
            onChange={onChange}
            className={`${styles.input} w-full px-4 py-2 rounded-md focus:ring-purple-500 focus:border-purple-500`}
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
            onChange={onChange}
            rows="3"
            className={`${styles.input} w-full px-4 py-2 rounded-md focus:ring-purple-500 focus:border-purple-500`}
            placeholder="Describe what this deck is about"
          />
        </div>

        <div>
          <label htmlFor="category" className={`block text-sm font-medium ${styles.textSecondary} mb-1`}>
            Category
          </label>
          <select
            id="category"
            name="category"
            value={deckData.category}
            onChange={onChange}
            className={`${styles.input} w-full px-4 py-2 rounded-md focus:ring-purple-500 focus:border-purple-500`}
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
  );
};

export default FlashcardFormEditor;
