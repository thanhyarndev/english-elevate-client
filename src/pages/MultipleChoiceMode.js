import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const MultipleChoiceMode = () => {
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionType, setQuestionType] = useState("vi-to-en"); // "vi-to-en" hoặc "en-to-vi"

  const navigate = useNavigate();

  useEffect(() => {
    fetchRandomVocabularies();
  }, []);

  useEffect(() => {
    if (vocabularies.length > 0) {
      generateOptions();
    }
  }, [currentIndex, vocabularies]);

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US"; // Ngôn ngữ tiếng Anh
    utterance.rate = 1; // Tốc độ phát âm
    window.speechSynthesis.speak(utterance);
  };

  const fetchRandomVocabularies = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://english-elevate-server.vercel.app/api/vocabulary/get-random",
        { count: 20 }
      );
      setVocabularies(response.data.data || []);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching vocabularies!");
      setLoading(false);
    }
  };

  const generateOptions = () => {
    const currentWord = vocabularies[currentIndex];

    // Ngẫu nhiên hóa danh sách từ
    const shuffledVocabularies = [...vocabularies].sort(
      () => Math.random() - 0.5
    );

    // Lọc từ đúng (đáp án) ra khỏi danh sách từ
    const otherOptions = shuffledVocabularies
      .filter((item) => item.englishWord !== currentWord.englishWord)
      .slice(0, 3); // Chọn 3 từ sai

    // Random kiểu câu hỏi (vi-to-en hoặc en-to-vi)
    const isViToEn = Math.random() > 0.5;
    setQuestionType(isViToEn ? "vi-to-en" : "en-to-vi");

    // Kết hợp từ đúng với các từ sai
    const combinedOptions = isViToEn
      ? [
          currentWord.englishWord,
          ...otherOptions.map((item) => item.englishWord),
        ]
      : [
          currentWord.vietnameseMeaning,
          ...otherOptions.map((item) => item.vietnameseMeaning),
        ];

    // Ngẫu nhiên hóa thứ tự các đáp án
    setOptions(
      combinedOptions
        .sort(() => Math.random() - 0.5)
        .map((option, idx) => ({
          label: ["A", "B", "C", "D"][idx],
          value: option,
        }))
    );
  };

  const handleSelectOption = (option) => {
    if (!showAnswer) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    const currentWord = vocabularies[currentIndex];
    const correctAnswer =
      questionType === "vi-to-en"
        ? currentWord.englishWord.toLowerCase()
        : currentWord.vietnameseMeaning;

    if (selectedOption === correctAnswer) {
      toast.success("Correct!");
      setScore((prev) => prev + 1);
    } else {
      toast.error(`Incorrect! The correct answer is "${correctAnswer}".`);
    }
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      toast.info("You have completed all questions!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <ClipLoader size={60} color={"#1890ff"} />
        <p className="text-lg mt-4">Loading your quiz...</p>
      </div>
    );
  }

  const currentWord = vocabularies[currentIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      {/* Nút Back */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        Back
      </button>

      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6 pt-10">
        <h1 className="text-2xl font-bold text-center mb-4">
          Multiple Choice Quiz
        </h1>
        <p
          className={`text-lg text-center mb-6 ${
            window.innerWidth < 768 ? "text-sm" : "text-lg"
          }`}
        >
          {questionType === "vi-to-en" ? (
            <>
              What does this mean?{" "}
              <span className="font-semibold text-blue-500">
                {currentWord.vietnameseMeaning}
              </span>
            </>
          ) : (
            <>
              Translate this word:{" "}
              <span className="font-semibold text-blue-500 flex items-center justify-center gap-2">
                {currentWord.englishWord}
                <button
                  onClick={() => speakWord(currentWord.englishWord)}
                  className="bg-blue-500 text-white rounded-full px-2 py-1 text-sm hover:bg-blue-600"
                >
                  🔊
                </button>
              </span>
            </>
          )}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => {
                handleSelectOption(option.value);
                if (
                  questionType === "vi-to-en" &&
                  /^[a-zA-Z\s]+$/.test(option.value)
                ) {
                  speakWord(option.value);
                }
              }}
              className={`cursor-pointer p-4 border-2 rounded-lg text-center ${
                window.innerWidth < 768 ? "text-sm" : "text-lg"
              } font-semibold ${
                showAnswer
                  ? option.value ===
                    (questionType === "vi-to-en"
                      ? currentWord.englishWord
                      : currentWord.vietnameseMeaning)
                    ? "bg-green-200 border-green-500"
                    : selectedOption === option.value
                    ? "bg-red-200 border-red-500"
                    : "bg-white border-gray-300"
                  : selectedOption === option.value
                  ? "bg-blue-200 border-blue-500"
                  : "bg-white border-gray-300 hover:bg-gray-100"
              }`}
            >
              <span className="text-gray-600">{option.label}</span>:{" "}
              {option.value}
            </div>
          ))}
        </div>
        {showAnswer && (
          <div className="mt-6 bg-gray-100 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Example:</h3>
            <p className="text-gray-800">
              <strong>English:</strong> {currentWord.exampleSentence.english}
            </p>
            <p className="text-gray-800">
              <strong>Vietnamese:</strong>{" "}
              {currentWord.exampleSentence.vietnamese}
            </p>
          </div>
        )}
        <div className="flex justify-between mt-4">
          <Button
            onClick={handleSubmit}
            disabled={showAnswer || selectedOption === null}
            type="primary"
            className={`px-6 py-2 ${
              window.innerWidth < 768 ? "text-sm" : "text-base"
            }`}
          >
            Submit
          </Button>
          <Button
            onClick={handleNext}
            disabled={!showAnswer}
            className={`px-6 py-2 ${
              window.innerWidth < 768 ? "text-sm" : "text-base"
            }`}
          >
            Next
          </Button>
        </div>
        <div className="mt-6 text-center">
          <p
            className={`text-lg ${
              window.innerWidth < 768 ? "text-sm" : "text-lg"
            }`}
          >
            Score: {score}
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MultipleChoiceMode;
