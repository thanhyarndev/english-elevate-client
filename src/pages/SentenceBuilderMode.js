import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({ word, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: word + index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "transform 0.1s ease" : "transform 0.3s ease-in-out",
    opacity: isDragging ? 0.8 : 1,
    cursor: "grab",
    zIndex: isDragging ? 1000 : "auto",
    boxShadow: isDragging ? "0px 10px 20px rgba(0,0,0,0.3)" : "none",
    position: "relative",
    backgroundColor: isDragging ? "#fbbf24" : "#3b82f6", // Highlight dragging word
    color: "white",
    padding: "10px",
    borderRadius: "8px",
    fontWeight: "bold",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "60px",
  };

  return (
    <span
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="cursor-pointer select-none"
    >
      {word}
    </span>
  );
};

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
        { count: 10 }
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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = selectedWords.findIndex((word) => word + selectedWords.indexOf(word) === active.id);
    const newIndex = selectedWords.findIndex((word) => word + selectedWords.indexOf(word) === over.id);
    setSelectedWords(arrayMove(selectedWords, oldIndex, newIndex));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

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
      index: history.length + 1,
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedWords} strategy={horizontalListSortingStrategy}>
                <div className="flex flex-wrap justify-center gap-2 mb-6 bg-gray-200 p-3 rounded-lg">
                  {selectedWords.map((word, index) => (
                    <SortableItem key={word + index} word={word} index={index} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {shuffledWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedWords([...selectedWords, word])}
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
          </>
        )}
      </div>
    </div>
  );
};

export default SentenceBuilder;
