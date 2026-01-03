import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, X, RotateCcw, Award, LayoutGrid } from 'lucide-react';
import crosswordData from '../crossword_data.json';
import confetti from 'canvas-confetti';

const CrosswordTrivia = ({ onSelectAncestor }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userGuess, setUserGuess] = useState('');
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', 'revealed'
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [shuffledData, setShuffledData] = useState([]);

    useEffect(() => {
        // Shuffle data on mount
        const shuffled = [...crosswordData].sort(() => 0.5 - Math.random());
        setShuffledData(shuffled);
    }, []);

    const currentItem = shuffledData[currentIndex];

    const normalize = (str) => {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    const handleCheck = () => {
        if (!currentItem) return;

        const normalizedGuess = normalize(userGuess);
        const normalizedAnswer = normalize(currentItem.answer);

        if (normalizedGuess === normalizedAnswer) {
            setFeedback('correct');
            setScore(prev => prev + 10 + (streak * 2));
            setStreak(prev => prev + 1);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            setFeedback('incorrect');
            setStreak(0);
        }
    };

    const handleReveal = () => {
        setFeedback('revealed');
        setStreak(0);
    };

    const handleNext = () => {
        setFeedback(null);
        setUserGuess('');
        setCurrentIndex(prev => (prev + 1) % shuffledData.length);
    };

    if (!currentItem) return <div className="p-8 text-center text-gray-500">Loading trivia...</div>;

    // Helper to format the answer slot (e.g. "_ _ _ _ _  _ _ _")
    // Use the raw answer string but mask letters
    const maskedAnswer = currentItem.answer.split('').map(char => {
        if (/[a-zA-Z0-9]/.test(char)) return '_';
        return char; // Keep spaces and punctuation
    }).join(' ');

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-[#F9F5F0]">
            <div className="max-w-2xl w-full">

                {/* Header / Scoreboard */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                            <LayoutGrid size={24} className="text-[#E67E22]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-gray-900">Crossword Trivia</h1>
                            <p className="text-sm text-gray-500">Guess the ancestor from the clue</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Streak</div>
                            <div className="text-xl font-mono font-bold text-[#E67E22]">{streak} 🔥</div>
                        </div>
                        <div className="text-center pl-4 border-l border-gray-200">
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Score</div>
                            <div className="text-xl font-mono font-bold text-gray-800">{score}</div>
                        </div>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
                    {/* Status Bar */}
                    <div className={`h-2 w-full ${feedback === 'correct' ? 'bg-green-500' : feedback === 'incorrect' ? 'bg-red-500' : 'bg-[#E67E22]'}`}></div>

                    <div className="p-6 text-center">
                        <div className="mb-4 inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {currentItem.length} Characters
                        </div>

                        <h2 className="text-xl md:text-2xl font-serif text-gray-800 leading-snug mb-6">
                            "{currentItem.clue}"
                        </h2>

                        {/* Answer Input */}
                        <div className="mb-6">
                            {feedback === 'correct' || feedback === 'revealed' ? (
                                <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                                    <div className="text-2xl md:text-3xl font-mono font-bold text-[#E67E22] tracking-widest">
                                        {currentItem.answer}
                                    </div>
                                    {currentItem.id && (
                                        <button
                                            onClick={() => onSelectAncestor(currentItem.id)}
                                            className="text-xs font-bold text-gray-400 hover:text-[#E67E22] uppercase tracking-widest underline decoration-dotted underline-offset-4 transition-colors"
                                        >
                                            View Profile
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={userGuess}
                                    onChange={(e) => {
                                        setUserGuess(e.target.value);
                                        if (feedback === 'incorrect') setFeedback(null);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                                    placeholder="Type your answer..."
                                    className="w-full max-w-md text-center text-xl md:text-2xl font-mono border-b-2 border-gray-300 focus:border-[#E67E22] outline-none py-2 bg-transparent placeholder-gray-200 uppercase tracking-widest"
                                    autoFocus
                                />
                            )}

                            {/* Mask hint if not revealed */}
                            {feedback !== 'correct' && feedback !== 'revealed' && (
                                <div className="mt-2 text-gray-300 font-mono text-sm tracking-widest">
                                    {maskedAnswer}
                                </div>
                            )}
                        </div>

                        {/* Feedback Message */}
                        {feedback === 'incorrect' && (
                            <div className="mb-6 text-red-500 font-bold flex items-center justify-center gap-2 animate-bounce">
                                <X size={18} /> Incorrect, try again!
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-center gap-4">
                            {(feedback !== 'correct' && feedback !== 'revealed') && (
                                <>
                                    <button
                                        onClick={handleReveal}
                                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <HelpCircle size={18} /> Give Up
                                    </button>
                                    <button
                                        onClick={handleCheck}
                                        className="px-6 py-3 bg-[#E67E22] hover:bg-[#D35400] text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        Check Answer
                                    </button>
                                </>
                            )}

                            {(feedback === 'correct' || feedback === 'revealed') && (
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                                >
                                    Next Clue <RotateCcw size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="mt-6 text-center text-gray-400 text-xs">
                    Tip: Answers are names of your ancestors.
                </div>

            </div>
        </div>
    );
};

export default CrosswordTrivia;
