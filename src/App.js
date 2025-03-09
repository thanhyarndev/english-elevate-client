import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Card } from "antd";
import { FaKeyboard, FaHeadphones, FaTasks, FaPuzzlePiece } from "react-icons/fa";
import InputMode from "./pages/InputMode";
import MultipleChoiceMode from "./pages/MultipleChoiceMode";
import ListeningMode from "./pages/ListeningMode";
import SentenceBuilderMode from "./pages/SentenceBuilderMode";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-gray-100 p-6">
              <h1 className="text-4xl font-bold mb-8 text-gray-800">Select Mode</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                <Link to="/input-mode">
                  <Card
                    hoverable
                    className="w-72 h-48 flex flex-col items-center justify-center shadow-lg border-2 border-blue-500 rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl"
                  >
                    <FaKeyboard className="text-blue-500 text-4xl mb-3" />
                    <h2 className="text-xl font-bold">Input Mode</h2>
                    <p className="text-gray-600 text-sm text-center">
                      Practice typing vocabulary.
                    </p>
                  </Card>
                </Link>
                <Link to="/multiple-choice-mode">
                  <Card
                    hoverable
                    className="w-72 h-48 flex flex-col items-center justify-center shadow-lg border-2 border-green-500 rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl"
                  >
                    <FaTasks className="text-green-500 text-4xl mb-3" />
                    <h2 className="text-xl font-bold">Multiple Choice</h2>
                    <p className="text-gray-600 text-sm text-center">
                      Choose the correct answer.
                    </p>
                  </Card>
                </Link>
                <Link to="/listening-mode">
                  <Card
                    hoverable
                    className="w-72 h-48 flex flex-col items-center justify-center shadow-lg border-2 border-red-500 rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl"
                  >
                    <FaHeadphones className="text-red-500 text-4xl mb-3" />
                    <h2 className="text-xl font-bold">Listening Mode</h2>
                    <p className="text-gray-600 text-sm text-center">
                      Listen and type the word correctly.
                    </p>
                  </Card>
                </Link>
                <Link to="/sentence-builder-mode">
                  <Card
                    hoverable
                    className="w-72 h-48 flex flex-col items-center justify-center shadow-lg border-2 border-yellow-500 rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl"
                  >
                    <FaPuzzlePiece className="text-yellow-500 text-4xl mb-3" />
                    <h2 className="text-xl font-bold">Sentence Builder</h2>
                    <p className="text-gray-600 text-sm text-center">
                      Arrange words to form a correct sentence.
                    </p>
                  </Card>
                </Link>
              </div>
            </div>
          }
        />
        <Route path="/input-mode" element={<InputMode />} />
        <Route path="/multiple-choice-mode" element={<MultipleChoiceMode />} />
        <Route path="/listening-mode" element={<ListeningMode />} />
        <Route path="/sentence-builder-mode" element={<SentenceBuilderMode />} />
      </Routes>
    </Router>
  );
};

export default App;
