import React, { useState, useEffect, useCallback } from 'react';
import { FiChevronRight, FiPlay, FiCheck, FiX, FiClock, FiRotateCcw, FiArrowLeft, FiBook, FiFlag, FiPercent, FiHelpCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { generateQuiz, saveQuizResult, getQuizHistory } from '../services/quizGenerationService';

const QuizPanel = ({ noteContent, noteId }) => {
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [_isTransitioning, _setIsTransitioning] = useState(false);

  const loadQuizHistory = useCallback(async () => {
    try {
      console.log('Loading quiz history for noteId:', noteId);
      const history = await getQuizHistory(noteId);
      console.log('Loaded quiz history:', history);
      setQuizHistory(history);
    } catch (error) {
      console.error('Failed to load quiz history:', error);
    }
  }, [noteId]);

  useEffect(() => {
    if (noteId) {
      console.log('Initial load of quiz history for noteId:', noteId);
      loadQuizHistory();
    }
  }, [noteId, loadQuizHistory]);

  useEffect(() => {
    console.log('QuizPanel received noteId:', noteId);
    if (!noteId) {
      console.warn('QuizPanel: noteId is missing or invalid');
    }
  }, [noteId]);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const quizQuestions = await generateQuiz(noteContent);
      setQuestions(quizQuestions);
      setIsQuizStarted(true);
      setUserAnswers(new Array(quizQuestions.length).fill(null));
      setCurrentQuestion(0);
      setShowHistory(false);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = async (answer) => {
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = answer;
    setUserAnswers(newUserAnswers);
    setSelectedAnswer(answer);
    setShowExplanation(true);

    if (currentQuestion === questions.length - 1) {
      try {
        if (!noteId) {
          throw new Error('Cannot save quiz result: noteId is missing');
        }

        console.log('Saving quiz result...', {
          noteId,
          questionsCount: questions.length,
          answers: newUserAnswers,
        });

        const quizId = await saveQuizResult(noteId, questions, newUserAnswers);
        console.log('Quiz saved with ID:', quizId);
        setCurrentQuizId(quizId);
        await loadQuizHistory();
      } catch (error) {
        console.error('Failed to save quiz result:', error);
        alert('Failed to save quiz result. Please try again.');
      }
    }
  };

  const viewQuizHistory = (quizRecord) => {
    setQuestions(quizRecord.questions);
    setUserAnswers(quizRecord.userAnswers);
    setIsQuizStarted(true);
    setCurrentQuestion(0);
    setShowHistory(false);
    setCurrentQuizId(quizRecord.id);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  useEffect(() => {
    const mainContent = document.querySelector('.quiz-main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [currentQuestion]);

  const StartQuizView = () => (
    <div className="h-full flex items-center justify-center py-12">
      <div className="w-full max-w-xl mx-auto text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600
                       flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6
                       ring-4 ring-surface-card/50">
            <FiPlay className="w-10 h-10 text-white transform translate-x-0.5" />
          </div>
          <h3 className="text-2xl font-bold text-content-primary mb-4">
            Ready to Test Your Knowledge?
          </h3>
          <p className="text-content-secondary text-lg max-w-md mx-auto">
            Take a quiz to reinforce your understanding of this note.
          </p>
        </div>

        <button
          onClick={startQuiz}
          disabled={isLoading}
          className={`group relative flex items-center gap-3 px-8 py-4 rounded-xl mx-auto
            bg-primary-600 hover:bg-primary-700
            text-white shadow-lg shadow-blue-500/20 transition-all duration-200
            hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiPlay className="w-5 h-5 text-white" />
          )}
          <span className="font-medium text-lg">Start Quiz</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-quiz overflow-hidden">
      {/* Header */}
      <div className="bg-surface-card/50 backdrop-blur-sm border-b border-border-subtle">
        <div style={{ maxWidth: '56rem' }} className="mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {(showHistory || (isQuizStarted && currentQuizId)) && (
                <button
                  onClick={() => {
                    setIsQuizStarted(false);
                    setShowHistory(false);
                    setCurrentQuizId(null);
                    setQuestions([]);
                    setUserAnswers([]);
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                  }}
                  className="p-2 hover:bg-surface-hover rounded-full transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5 text-content-secondary" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <FiBook className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-content-primary">
                  Quiz
                </h2>
              </div>
            </div>

            {!showHistory && !isQuizStarted && (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-surface-card/50 hover:bg-surface-hover border border-border-subtle
                         text-content-secondary transition-colors shadow-sm"
                onClick={() => setShowHistory(true)}
              >
                <FiClock className="w-4 h-4" />
                <span>Quiz History</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {!isQuizStarted ? (
          <div className="glass-card rounded-xl p-6">
            <StartQuizView />
          </div>
        ) : (
          <div className="glass-card rounded-lg p-6">
            {showHistory ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-content-primary">Quiz History</h3>
                {quizHistory.map((quiz) => (
                  <div key={quiz.id} className="card-content p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-sm text-content-tertiary">
                          {new Date(quiz.date).toLocaleDateString()}
                        </p>
                        <p className="font-medium text-content-primary">
                          Score: {quiz.score}/{quiz.questions.length}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => viewQuizHistory(quiz)}
                          className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        >
                          <FiClock className="inline mr-1" />
                          View
                        </button>
                        <button
                          onClick={startQuiz}
                          className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                          <FiRotateCcw className="inline mr-1" />
                          Retake
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="quiz-main-content card-content rounded-2xl">
                {/* Progress bar */}
                <div className="p-6 border-b border-border-subtle">
                  <div className="flex justify-between text-sm text-content-secondary mb-3">
                    <span className="flex items-center gap-2">
                      <FiFlag className="w-4 h-4 text-blue-500" />
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <span className="flex items-center gap-2">
                      <FiPercent className="w-4 h-4 text-green-500" />
                      {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden backdrop-blur-sm">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question content */}
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-semibold text-content-primary flex items-start gap-3 flex-1">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                        <FiHelpCircle className="w-5 h-5" />
                      </span>
                      <span>{questions[currentQuestion].question}</span>
                    </h3>

                    {showExplanation && currentQuestion < questions.length - 1 && (
                      <button
                        onClick={handleNextQuestion}
                        className="flex-shrink-0 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg
                                 flex items-center gap-2 shadow-sm"
                      >
                        <span>Next</span>
                        <FiChevronRight />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 mt-6">
                    {questions[currentQuestion].options.map((option, index) => {
                      const optionLetter = option.charAt(0);
                      const isCorrect = optionLetter === questions[currentQuestion].correctAnswer;
                      const isSelected = selectedAnswer === optionLetter;

                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(optionLetter)}
                          disabled={showExplanation}
                          className={`w-full p-4 text-left rounded-xl border transition-colors
                            backdrop-blur-sm
                            ${showExplanation
                              ? isCorrect
                                ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20 text-content-primary'
                                : isSelected
                                  ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 text-content-secondary'
                                  : 'border-border-subtle bg-surface-card/30 opacity-50'
                              : isSelected
                                ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20'
                                : 'border-border-subtle bg-surface-card/30 hover:bg-surface-hover'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {showExplanation && (
                              <span className="flex-shrink-0">
                                {isCorrect ? (
                                  <FiCheck className="w-5 h-5 text-green-500" />
                                ) : isSelected ? (
                                  <FiX className="w-5 h-5 text-red-500" />
                                ) : null}
                              </span>
                            )}
                            <span className={`${showExplanation && !isCorrect && isSelected ? 'text-red-500' : 'text-content-secondary'}`}>
                              {option}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {showExplanation && (
                    <div className="mt-6">
                      <div className="p-4 backdrop-blur-sm bg-surface-card/30 rounded-xl border border-border-subtle">
                        <p className="font-medium text-content-primary mb-2 flex items-center gap-2">
                          {selectedAnswer === questions[currentQuestion].correctAnswer ? (
                            <>
                              <FiCheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-green-500">Correct!</span>
                            </>
                          ) : (
                            <>
                              <FiXCircle className="w-5 h-5 text-red-500" />
                              <span className="text-red-500">Incorrect</span>
                            </>
                          )}
                        </p>
                        <p className="text-content-secondary">
                          {questions[currentQuestion].explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPanel;
