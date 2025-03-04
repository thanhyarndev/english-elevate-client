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
  const [vietnameseHint, setVietnameseHint] = useState("");
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
    setVietnameseHint("");
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  };

  const playAudio = () => {
    const word = vocabularies[currentIndex]?.englishWord;
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const handleInputChange = (e, index) => {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z]/g, "").toLowerCase();
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
      if (mistakeCount === 0) {
        const updatedHints = [...hints];
        updatedHints[0] = currentWord[0];
        setHints(updatedHints);
        message.error("Incorrect! Here's the first letter as a hint.");
      } else if (mistakeCount === 1) {
        setVietnameseHint(vocabularies[currentIndex]?.vietnameseMeaning);
        message.error("Incorrect! Here's the meaning in Vietnamese.");
      } else {
        setHints(currentWord.split(""));
        setShowExplanation(true);
        message.info(`Incorrect! The correct word is "${currentWord}".`);
        status = "incorrect";
      }
      setMistakeCount(mistakeCount + 1);
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
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {hints.map((char, index) => (
            <input key={index} type="text" maxLength={1} value={char !== "_" ? char : inputValues[index]} onChange={(e) => handleInputChange(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} ref={(el) => (inputRefs.current[index] = el)} className="w-10 h-10 text-center text-xl font-bold border-b-2 border-blue-500 focus:outline-none" />
          ))}
        </div>
        {vietnameseHint && (
          <p className="text-center text-lg font-semibold text-yellow-600 mb-4">
            Hint: {vietnameseHint}
          </p>
        )}
        <div className="flex justify-center gap-4 mb-6">
          <button onClick={handleSubmit} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Submit</button>
          {showExplanation && <button onClick={handleNext} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Next</button>}
        </div>
      </div>
    </div>
  );
};

export default ListeningMode;