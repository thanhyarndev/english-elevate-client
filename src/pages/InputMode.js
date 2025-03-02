import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const InputMode = () => {
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hints, setHints] = useState([]);
  const [inputValues, setInputValues] = useState([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [exampleVisible, setExampleVisible] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRefs = useRef([]);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch random vocabulary on page load
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
      setIsLoading(false);
    } catch (error) {
      message.error("Error fetching vocabularies!");
      console.error("Error fetching vocabularies:", error);
      setIsLoading(false);
    }
  };

  const resetQuestion = (index, word) => {
    setCurrentIndex(index);
    setHints(Array(word.length).fill("_"));
    setInputValues(Array(word.length).fill(""));
    setHintLevel(0);
    setExampleVisible(false);
    setSubmitDisabled(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 0); // Focus on the first input
  };

  const handleInputChange = (value, index) => {
    const updatedInputs = [...inputValues];
    updatedInputs[index] = value;
    setInputValues(updatedInputs);

    // Focus to the next input if value is entered
    if (value && index < hints.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // const handleKeyDown = (e, index) => {
  //   if (e.key === "Backspace") {
  //     // Allow backspace for current input
  //     if (inputValues[index]) {
  //       const updatedInputs = [...inputValues];
  //       updatedInputs[index] = ""; // Clear current input value
  //       setInputValues(updatedInputs);
  //     } else if (index > 0 && hints[index] === "_") {
  //       // Move to the previous input if the current one is empty
  //       inputRefs.current[index - 1]?.focus();
  //     }
  //   } else if (e.key === "Enter" && !submitDisabled) {
  //     handleSubmit();
  //   }
  // };

  const handleSubmit = () => {
    const currentWord = vocabularies[currentIndex].englishWord.toLowerCase();
    const userAnswer = hints
      .map((char, index) => (char !== "_" ? char : inputValues[index]))
      .join("")
      .toLowerCase();

    if (userAnswer === currentWord) {
      if (hintLevel === 0) {
        setScore((prev) => prev + 1); // +1 nếu không cần gợi ý
      } else {
        setScore((prev) => prev + 0.5); // +0.5 nếu cần gợi ý
      }
      message.success("Correct!");
      setHistory((prev) => [
        ...prev,
        {
          word: currentWord,
          meaning: vocabularies[currentIndex].vietnameseMeaning,
          correct: true,
        },
      ]);
      setExampleVisible(true);
      setSubmitDisabled(true); // Disable submit after correct answer
    } else {
      if (hintLevel < 3) {
        const updatedHints = [...hints];
        updatedHints[hintLevel] = currentWord[hintLevel];
        setHints(updatedHints);
        setHintLevel((prev) => prev + 1);
        setInputValues(Array(currentWord.length).fill("")); // Clear all user inputs
        message.error(
          `Incorrect! Here's a hint: "${updatedHints.join(" ")}". Try again.`
        );
        inputRefs.current[1]?.focus(); // Focus on the second input
      } else {
        setHints(currentWord.split("")); // Show the full word
        setExampleVisible(true);
        setSubmitDisabled(true); // Disable submit after 3 incorrect tries
        setHistory((prev) => [
          ...prev,
          {
            word: currentWord,
            meaning: vocabularies[currentIndex].vietnameseMeaning,
            correct: false,
          },
        ]);
        message.info(`Incorrect! The correct word is "${currentWord}".`);
      }
    }
  };

  const handleSkip = () => {
    if (currentIndex < vocabularies.length - 1) {
      resetQuestion(
        currentIndex + 1,
        vocabularies[currentIndex + 1].englishWord
      );
    } else {
      message.success("You have completed all questions!");
    }
  };

  const renderInputs = () => {
    return hints.map((hint, index) => (
      <div key={index} className="relative w-6 h-10 sm:w-8 sm:h-14">
        <input
          type="text"
          maxLength={1}
          value={hint !== "_" ? hint : inputValues[index]}
          onChange={(e) => handleInputChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => (inputRefs.current[index] = el)}
          disabled={hint !== "_"}
          autoCapitalize="none" // Tắt in hoa mặc định
          style={{
            textTransform: "none", // Tắt chữ in hoa mặc định
          }}
          className={`absolute w-full h-full text-center text-lg sm:text-2xl font-bold border-b-2 ${
            hint !== "_"
              ? "border-gray-400 text-gray-700 bg-gray-100 pointer-events-none"
              : "border-blue-500 focus:outline-none"
          }`}
        />
      </div>
    ));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      // Xử lý Backspace trên mobile
      if (inputValues[index]) {
        const updatedInputs = [...inputValues];
        updatedInputs[index] = ""; // Clear current input value
        setInputValues(updatedInputs);
      } else if (index > 0 && hints[index] === "_") {
        setTimeout(() => inputRefs.current[index - 1]?.focus(), 0); // Focus lại ô trước
      }
    } else if (e.key === "Enter" && !submitDisabled) {
      handleSubmit();
    }
  };

  if (isLoading) {
    const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spin indicator={antIcon} />
        <p className="text-lg mt-4">Loading your quiz...</p>
      </div>
    );
  }

  const currentExample = vocabularies[currentIndex]?.exampleSentence || {};
  const currentPartOfSpeech = vocabularies[currentIndex]?.partOfSpeech;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        Back
      </button>
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">English Quiz</h1>
        <p className="text-lg text-center mb-2">
          Translate the word:{" "}
          <span className="font-semibold text-blue-500">
            {vocabularies[currentIndex].vietnameseMeaning}
          </span>
        </p>
        <p className="text-center text-sm text-gray-500 mb-6">
          Part of speech: {currentPartOfSpeech || "unknown"}
        </p>
        <div className="flex justify-center gap-1 mb-6 flex-wrap">
          {renderInputs()}
        </div>
        {exampleVisible && (
          <div className="text-center text-gray-600 mb-4">
            <p>
              <strong>Example:</strong> {currentExample.english} -{" "}
              <i>{currentExample.vietnamese}</i>
            </p>
          </div>
        )}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={submitDisabled}
            className={`px-6 py-2 ${
              submitDisabled
                ? "bg-gray-300 text-gray-500 pointer-events-none"
                : "bg-blue-500 text-white hover:bg-blue-600 transition"
            } rounded-lg`}
          >
            Submit
          </button>
          <button
            onClick={handleSkip}
            disabled={!exampleVisible}
            className={`px-6 py-2 ${
              exampleVisible
                ? "bg-gray-500 text-white hover:bg-gray-600 transition"
                : "bg-gray-300 text-gray-500 pointer-events-none"
            } rounded-lg`}
          >
            Skip
          </button>
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">History</h2>
          <ul className="list-disc pl-5">
            {history.map((item, index) => (
              <li
                key={index}
                className={`${
                  item.correct ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.word} - {item.meaning}{" "}
                {`(${index + 1}/${vocabularies.length})`}
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

export default InputMode;
