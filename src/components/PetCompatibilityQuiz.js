import React, { useState } from 'react';

const PetCompatibilityQuiz = ({ onQuizComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  const questions = [
    {
      id: 'experience',
      question: 'What is your experience level with pets?',
      type: 'single',
      options: [
        { value: 'first-time', label: 'First-time pet owner', weight: { beginner: 3 } },
        { value: 'some', label: 'Some experience with pets', weight: { intermediate: 2, beginner: 1 } },
        { value: 'experienced', label: 'Very experienced with pets', weight: { advanced: 3, intermediate: 1 } }
      ]
    },
    {
      id: 'housing',
      question: 'What type of home do you live in?',
      type: 'single',
      options: [
        { value: 'apartment', label: 'Apartment', weight: { cats: 2, small: 2, birds: 2 } },
        { value: 'house-small-yard', label: 'House with small yard', weight: { dogs: 1, cats: 2, small: 1 } },
        { value: 'house-large-yard', label: 'House with large yard', weight: { dogs: 3, farm: 2 } },
        { value: 'farm', label: 'Farm or large property', weight: { farm: 3, dogs: 2 } }
      ]
    },
    {
      id: 'time',
      question: 'How much time can you dedicate to pet care daily?',
      type: 'single',
      options: [
        { value: 'minimal', label: 'Less than 1 hour', weight: { cats: 2, birds: 1, small: 2 } },
        { value: 'moderate', label: '1-3 hours', weight: { cats: 2, dogs: 1, small: 3, birds: 2 } },
        { value: 'lots', label: 'More than 3 hours', weight: { dogs: 3, farm: 2, birds: 2 } }
      ]
    },
    {
      id: 'activity',
      question: 'What is your activity level?',
      type: 'single',
      options: [
        { value: 'low', label: 'Prefer quiet activities', weight: { cats: 3, small: 2, birds: 2 } },
        { value: 'moderate', label: 'Moderately active', weight: { cats: 2, dogs: 2, small: 1 } },
        { value: 'high', label: 'Very active, love outdoor activities', weight: { dogs: 3, farm: 1 } }
      ]
    },
    {
      id: 'children',
      question: 'Do you have children at home?',
      type: 'single',
      options: [
        { value: 'none', label: 'No children', weight: { cats: 1, dogs: 1, small: 1, birds: 1 } },
        { value: 'young', label: 'Young children (under 8)', weight: { dogs: 2, cats: 1 } },
        { value: 'older', label: 'Older children (8+)', weight: { dogs: 2, cats: 2, small: 2, birds: 2 } }
      ]
    },
    {
      id: 'budget',
      question: 'What is your monthly budget for pet care?',
      type: 'single',
      options: [
        { value: 'low', label: 'Under $50', weight: { small: 3, birds: 2 } },
        { value: 'medium', label: '$50-150', weight: { cats: 3, small: 2, birds: 3 } },
        { value: 'high', label: 'Over $150', weight: { dogs: 3, cats: 2, farm: 2 } }
      ]
    },
    {
      id: 'space',
      question: 'How much indoor space do you have for a pet?',
      type: 'single',
      options: [
        { value: 'small', label: 'Limited space', weight: { small: 3, birds: 3, cats: 1 } },
        { value: 'medium', label: 'Moderate space', weight: { cats: 3, small: 2, dogs: 1 } },
        { value: 'large', label: 'Plenty of space', weight: { dogs: 3, cats: 2, farm: 2 } }
      ]
    },
    {
      id: 'maintenance',
      question: 'How do you feel about grooming and maintenance?',
      type: 'single',
      options: [
        { value: 'minimal', label: 'Prefer low-maintenance pets', weight: { birds: 2, small: 3 } },
        { value: 'some', label: 'Okay with regular grooming', weight: { cats: 3, dogs: 2, small: 1 } },
        { value: 'enjoy', label: 'Enjoy grooming and care routines', weight: { dogs: 3, cats: 2, farm: 1 } }
      ]
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    const scores = {
      dogs: 0,
      cats: 0,
      small: 0, // rabbits, guinea pigs, ferrets
      birds: 0,
      farm: 0 // goats
    };

    // Calculate weighted scores
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      const option = question.options.find(opt => opt.value === answer);
      
      if (option && option.weight) {
        Object.entries(option.weight).forEach(([category, weight]) => {
          scores[category] += weight;
        });
      }
    });

    // Determine top recommendations
    const sortedScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const recommendations = sortedScores.map(([category, score]) => {
      const categoryInfo = {
        dogs: {
          name: 'Dogs',
          description: 'Dogs are loyal companions that thrive on interaction and exercise. They require daily walks, training, and social interaction.',
          species: 'Dog',
          commitment: 'High',
          icon: '🐕'
        },
        cats: {
          name: 'Cats',
          description: 'Cats are independent yet affectionate pets. They require less daily maintenance but still need regular care and attention.',
          species: 'Cat',
          commitment: 'Medium',
          icon: '🐱'
        },
        small: {
          name: 'Small Pets',
          description: 'Rabbits, guinea pigs, and ferrets make wonderful companions. They require specialized care but are great for smaller spaces.',
          species: ['Rabbit', 'Guinea Pig', 'Ferret'],
          commitment: 'Medium',
          icon: '🐰'
        },
        birds: {
          name: 'Birds',
          description: 'Birds are intelligent and social creatures. They can learn to talk and form strong bonds with their owners.',
          species: 'Bird',
          commitment: 'Medium',
          icon: '🦜'
        },
        farm: {
          name: 'Farm Animals',
          description: 'Goats and other farm animals require outdoor space and specialized care but can be incredibly rewarding pets.',
          species: 'Goat',
          commitment: 'High',
          icon: '🐐'
        }
      };

      return {
        ...categoryInfo[category],
        score,
        percentage: Math.round((score / Math.max(...Object.values(scores))) * 100)
      };
    });

    setQuizResults({ recommendations, scores });
    setShowResults(true);
    if (onQuizComplete) {
      onQuizComplete(recommendations, answers);
    }
  };

  const retakeQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setQuizResults(null);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Pet Compatibility Results</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 text-center mb-4">
              Based on your answers, here are the types of pets that would be most compatible with your lifestyle:
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {quizResults?.recommendations.map((recommendation, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 text-xl">{recommendation.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">{recommendation.percentage}% Match</span>
                    <span className="text-2xl">{recommendation.icon}</span>
                  </div>
                  <p className="text-blue-800 text-sm">{recommendation.description}</p>
                  <div className="bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${recommendation.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-600">
                    <span className="font-medium">Commitment Level:</span> {recommendation.commitment}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">🎯 Ready for the Next Step?</h3>
            <p className="text-green-800 mb-4">
              Now that you know what type of pet suits your lifestyle, you can browse our available animals 
              that match your preferences. Our team can also provide personalized recommendations and discuss 
              adoption fees during your consultation.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (onQuizComplete) {
                    const mockRecommendations = [
                      { name: 'Dogs', species: 'Dog', percentage: 85, commitment: 'High', icon: '🐕' },
                      { name: 'Cats', species: 'Cat', percentage: 70, commitment: 'Medium', icon: '🐱' },
                      { name: 'Small Pets', species: ['Rabbit', 'Guinea Pig'], percentage: 60, commitment: 'Medium', icon: '🐰' }
                    ];
                    onQuizComplete(mockRecommendations, answers);
                  }
                  onClose();
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Browse Recommended Animals
              </button>
              <button
                onClick={retakeQuiz}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Retake Quiz
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">📋 Next Steps:</h4>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Review our available animals that match your preferences</li>
              <li>• Schedule a meet-and-greet with potential pets</li>
              <li>• Discuss adoption requirements and fees with our team</li>
              <li>• Prepare your home for your new companion</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Pet Compatibility Quiz</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentQ.question}</h3>
          <div className="space-y-3">
            {currentQ.options.map((option) => (
              <label
                key={option.value}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[currentQ.id] === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name={currentQ.id}
                  value={option.value}
                  checked={answers[currentQ.id] === option.value}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  className="sr-only"
                />
                <span className="text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className={`py-2 px-4 rounded font-medium ${
              currentQuestion === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            Previous
          </button>
          <button
            onClick={nextQuestion}
            disabled={!answers[currentQ.id]}
            className={`py-2 px-4 rounded font-medium ${
              !answers[currentQ.id]
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {currentQuestion === questions.length - 1 ? 'See Results' : 'Next'}
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            This quiz helps us understand your lifestyle to recommend the best pet match for you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PetCompatibilityQuiz;
