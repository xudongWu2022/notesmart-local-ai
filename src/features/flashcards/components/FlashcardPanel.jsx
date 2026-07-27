import { useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight, FiRotateCw, FiPlay, FiTrash2, FiPlus, FiCopy, FiEdit2 } from 'react-icons/fi';
import { generateFlashcards, saveFlashcards, getFlashcardHistory } from '../services/flashcardGenerationService';

function FlashcardPanel({ noteContent, noteId }) {
  const [flashcards, setFlashcards] = useState([]);
  const [_flashcardHistory, setFlashcardHistory] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [_editingCard, setEditingCard] = useState(null);
  const [editedContent, setEditedContent] = useState({ front: '', back: '' });

  const startFlashcardGeneration = useCallback(async () => {
    if (!noteContent) {
      console.error('No note content available');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Generating new flashcards:', {
        noteId,
        contentLength: noteContent.length,
        preview: noteContent.substring(0, 100)
      });

      const generatedCards = await generateFlashcards(noteContent);
      setFlashcards(prevCards => [...prevCards, ...generatedCards]);

      if (noteId) {
        await saveFlashcards(noteId, generatedCards);
        const updatedHistory = await getFlashcardHistory(noteId);
        setFlashcardHistory(updatedHistory);
      }
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
    } finally {
      setIsLoading(false);
    }
  }, [noteContent, noteId]);

  useEffect(() => {
    const initializeFlashcards = async () => {
      if (noteId) {
        try {
          const history = await getFlashcardHistory(noteId);
          setFlashcardHistory(history);

          if (history && history.length > 0) {
            const mostRecent = history[history.length - 1];
            setFlashcards(mostRecent.flashcards);
          } else {
            await startFlashcardGeneration();
          }
        } catch (error) {
          console.error('Failed to initialize flashcards:', error);
        }
      }
    };

    initializeFlashcards();
  }, [noteId, startFlashcardGeneration]);

  const deleteFlashcard = async (cardId) => {
    try {
      const updatedFlashcards = flashcards.filter(card => card.id !== cardId);
      setFlashcards(updatedFlashcards);

      if (noteId) {
        await saveFlashcards(noteId, updatedFlashcards);
        const updatedHistory = await getFlashcardHistory(noteId);
        setFlashcardHistory(updatedHistory);
      }

      if (currentCardIndex >= updatedFlashcards.length) {
        setCurrentCardIndex(Math.max(0, updatedFlashcards.length - 1));
      }
    } catch (error) {
      console.error('Failed to delete flashcard:', error);
    }
  };

  const copyFlashcard = async (card) => {
    try {
      const newCard = {
        ...card,
        id: Date.now().toString(),
      };
      const updatedFlashcards = [...flashcards, newCard];
      setFlashcards(updatedFlashcards);

      if (noteId) {
        await saveFlashcards(noteId, updatedFlashcards);
        const updatedHistory = await getFlashcardHistory(noteId);
        setFlashcardHistory(updatedHistory);
      }
    } catch (error) {
      console.error('Failed to copy flashcard:', error);
    }
  };

  const updateFlashcard = async (cardId, updatedContent) => {
    try {
      const updatedFlashcards = flashcards.map(card =>
        card.id === cardId ? { ...card, ...updatedContent } : card
      );
      setFlashcards(updatedFlashcards);

      if (noteId) {
        await saveFlashcards(noteId, updatedFlashcards);
        const updatedHistory = await getFlashcardHistory(noteId);
        setFlashcardHistory(updatedHistory);
      }
      setEditingCard(null);
    } catch (error) {
      console.error('Failed to update flashcard:', error);
    }
  };

  const startEditing = (card) => {
    setEditingCard(card.id);
    setEditedContent({ front: card.front, back: card.back });
  };

  const _saveEdit = async (cardId) => {
    await updateFlashcard(cardId, editedContent);
    setEditingCard(null);
    setEditedContent({ front: '', back: '' });
  };

  const handlePrevious = () => {
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setIsFlipped(false);
  };

  const handleNext = () => {
    setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : prev));
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="h-full bg-gradient-flashcard overflow-x-hidden">
      {/* Header */}
      <div className="bg-surface-card/50 backdrop-blur-sm border-b border-border-subtle">
        <div style={{ maxWidth: '56rem' }} className="mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <FiPlay className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-content-primary">
                Flashcards
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={startFlashcardGeneration}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white
                         rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <FiRotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FiPlus className="w-4 h-4" />
                )}
                {isLoading ? 'Generating...' : 'Generate New'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ maxWidth: '56rem' }} className="mx-auto px-4 sm:px-6 py-6">
          {flashcards.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FiPlay className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-content-primary mb-2">No Flashcards Yet</h3>
              <p className="text-content-secondary mb-4">Generate flashcards from your note content to start studying.</p>
              <button
                onClick={startFlashcardGeneration}
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700
                         disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate Flashcards'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Navigation Controls */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentCardIndex === 0}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-content-secondary
                           hover:text-content-primary disabled:opacity-50 transition-colors"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm text-content-tertiary">
                  {currentCardIndex + 1} of {flashcards.length}
                </span>

                <button
                  onClick={handleNext}
                  disabled={currentCardIndex === flashcards.length - 1}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-content-secondary
                           hover:text-content-primary disabled:opacity-50 transition-colors"
                >
                  Next
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Flashcard */}
              <div className="relative">
                <div
                  onClick={handleFlip}
                  className="relative w-full h-64 bg-surface-card rounded-xl shadow-lg cursor-pointer
                           transform transition-transform duration-500 hover:scale-105
                           border border-border-subtle overflow-hidden"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 p-6 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-content-primary mb-2">Question</h3>
                      <p className="text-content-secondary">{flashcards[currentCardIndex]?.front}</p>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 p-6 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20"
                       style={{ transform: 'rotateY(180deg)' }}>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-content-primary mb-2">Answer</h3>
                      <p className="text-content-secondary">{flashcards[currentCardIndex]?.back}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => copyFlashcard(flashcards[currentCardIndex])}
                    className="p-2 text-content-tertiary hover:text-content-secondary transition-colors"
                    title="Copy card"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => startEditing(flashcards[currentCardIndex])}
                    className="p-2 text-content-tertiary hover:text-content-secondary transition-colors"
                    title="Edit card"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteFlashcard(flashcards[currentCardIndex].id)}
                    className="p-2 text-content-tertiary hover:text-red-600 transition-colors"
                    title="Delete card"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Flip Hint */}
              <div className="text-center text-sm text-content-tertiary">
                Click the card to flip it
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlashcardPanel;
