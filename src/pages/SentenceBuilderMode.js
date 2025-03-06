import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

const SentenceBuilder = () => {
  const [sentences, setSentences] = useState([]);
  const [currentSentence, setCurrentSentence] = useState(null);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRandomVocabularies();
  }, []);

  const fetchRandomVocabularies = async () => {
    try {
      const response = await axios.post(
        "https://english-elevate-server.vercel.app/api/vocabulary/get-random",
        { count: 20 }
      );
      const vocabData = response.data.data || [];
      setSentences(vocabData);
      if (vocabData.length) {
        setupSentence(vocabData[0]);
      }
      setIsLoading(false);
    } catch (error) {
      message.error("Error fetching vocabularies!");
      console.error("Error fetching vocabularies:", error);
      setIsLoading(false);
    }
  };

  const setupSentence = (sentenceObj) => {
    const sentence = sentenceObj.exampleSentence.english;
    const words = sentence.split(" ");
    setCurrentSentence(sentenceObj);
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
    setSelectedWords([]);
  };

  const handleWordClick = (word) => {
    setSelectedWords([...selectedWords, word]);
    setShuffledWords(shuffledWords.filter((w) => w !== word));
  };

  const handleSubmit = () => {
    const userSentence = selectedWords.join(" ");
    const correctSentence = currentSentence.exampleSentence.english;
    const isCorrect = userSentence === correctSentence;
    
    if (isCorrect) {
      setScore(score + 1);
      message.success("Correct!");
    } else {
      message.error("Incorrect! Try again.");
    }
    
    setHistory([...history, {
      sentence: correctSentence,
      translation: currentSentence.exampleSentence.vietnamese,
      userAttempt: userSentence,
      isCorrect,
    }]);
    handleNext();
  };

  const handleNext = () => {
    const nextIndex = sentences.indexOf(currentSentence) + 1;
    if (nextIndex < sentences.length) {
      setupSentence(sentences[nextIndex]);
    } else {
      message.success("You have completed all sentences!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        Back
      </button>
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Sentence Builder</h1>
        {isLoading ? (
          <p className="text-center text-lg">Loading sentences...</p>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {selectedWords.map((word, index) => (
                <span key={index} className="px-4 py-2 bg-blue-500 text-white rounded-lg">{word}</span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {shuffledWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleWordClick(word)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  {word}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg">Score: {score}</p>
            </div>
            <div className="mt-6 w-full">
              <h2 className="text-lg font-bold mb-2">History</h2>
              <ul className="list-disc pl-5">
                {history.map((item, index) => (
                  <li key={index} className={item.isCorrect ? "text-green-500" : "text-red-500"}>
                    <p><strong>Correct Sentence:</strong> {item.sentence}</p>
                    <p><strong>Translation:</strong> {item.translation}</p>
                    {!item.isCorrect && (
                      <p className="text-red-500"><strong>Your Attempt:</strong> {item.userAttempt}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SentenceBuilder;