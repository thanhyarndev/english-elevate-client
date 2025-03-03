import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

const ListeningMode = () => {
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hints, setHints] = useState([]);
  const [inputValues, setInputValues] = useState([]);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const inputRefs = useRef([]);
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
      setVocabularies(vocabData);
      if (vocabData.length) {
        resetQuestion(0, vocabData[0].englishWord);
      }
    } catch (error) {
      message.error("Error fetching vocabularies!");
      console.error("Error fetching vocabularies:", error);
    }
  };

  const resetQuestion = (index, word) => {
    setCurrentIndex(index);
    setHints(Array(word.length).fill("_"));
    setInputValues(Array(word.length).fill(""));
    setMistakeCount(0);
    setShowExplanation(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  };

  const playAudio = () => {
    const word = vocabularies[currentIndex]?.englishWord;
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const handleInputChange = (value, index) => {
    const updatedInputs = [...inputValues];
    updatedInputs[index] = value;
    setInputValues(updatedInputs);

    if (value && index < hints.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && inputValues[index] === "") {
      if (index > 0) {
        const updatedInputs = [...inputValues];
        updatedInputs[index - 1] = "";
        setInputValues(updatedInputs);
        setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
      }
    }
  };

  const handleSubmit = () => {
    const currentWord = vocabularies[currentIndex].englishWord.toLowerCase();
    const userAnswer = inputValues.join("" ).toLowerCase();
    let status = "correct";

    if (userAnswer === currentWord) {
      setScore((prev) => prev + 1);
      message.success("Correct!");
      if (mistakeCount > 0) {
        status = "hinted";
      }
      setShowExplanation(true);
    } else {
      if (mistakeCount < 2) {
        const updatedHints = [...hints];
        updatedHints[mistakeCount] = currentWord[mistakeCount];
        setHints(updatedHints);
        setInputValues(Array(currentWord.length).fill(""));
        setMistakeCount(mistakeCount + 1);
        message.error("Incorrect! Here's a hint, try again.");
        return;
      } else {
        setHints(currentWord.split(""));
        setShowExplanation(true);
        message.info(`Incorrect! The correct word is "${currentWord}".`);
        status = "incorrect";
      }
    }

    setHistory([...history, { word: currentWord, status }]);
  };

  const handleNext = () => {
    if (currentIndex < vocabularies.length - 1) {
      resetQuestion(currentIndex + 1, vocabularies[currentIndex + 1].englishWord);
    } else {
      message.success("You have completed all questions!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <button onClick={() => navigate("/")} className="absolute top-4 left-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Back</button>
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Listening Mode</h1>
        <button onClick={playAudio} className="text-blue-500 text-3xl mb-4">🔊 Play Audio</button>
        <div className="flex justify-center gap-1 mb-6 flex-wrap">
          {hints.map((char, index) => (
            <input key={index} type="text" maxLength={1} value={char !== "_" ? char : inputValues[index]} onChange={(e) => handleInputChange(e.target.value, index)} onKeyDown={(e) => handleKeyDown(e, index)} ref={(el) => (inputRefs.current[index] = el)} className="w-10 h-10 text-center text-xl font-bold border-b-2 border-blue-500 focus:outline-none" />
          ))}
        </div>
        <button onClick={handleSubmit} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Submit</button>
        {showExplanation && <button onClick={handleNext} className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Next</button>}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">History</h2>
          <ul className="list-disc pl-5">
            {history.map((item, index) => (
              <li key={index} className={item.status === "correct" ? "text-green-500" : item.status === "hinted" ? "text-yellow-500" : "text-red-500"}>
                {item.word} - {item.status === "correct" ? "✔️ Correct" : item.status === "hinted" ? "⚠️ Used Hint" : "❌ Incorrect"}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 text-center">
          <p className="text-lg">Score: {score}</p>
        </div>
      </div>
    </div>
  );
};

export default ListeningMode;
