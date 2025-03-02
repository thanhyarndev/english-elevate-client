import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Card } from "antd";
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
              <h1 className="text-3xl font-bold mb-8">Select Mode</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                <Link to="/input-mode">
                  <Card
                    hoverable
                    className="w-64 h-40 flex flex-col items-center justify-center shadow-lg border-blue-500"
                  >
                    <h2 className="text-xl font-bold">Input Mode</h2>
                    <p className="text-gray-600 text-sm">
                      Practice typing vocabulary.
                    </p>
                  </Card>
                </Link>
                <Link to="/multiple-choice-mode">
                  <Card
                    hoverable
                    className="w-64 h-40 flex flex-col items-center justify-center shadow-lg border-green-500"
                  >
                    <h2 className="text-xl font-bold">Multiple Choice</h2>
                    <p className="text-gray-600 text-sm">
                      Choose the correct answer.
                    </p>
                  </Card>
                </Link>
                <Link to="/listening-mode">
                  <Card
                    hoverable
                    className="w-64 h-40 flex flex-col items-center justify-center shadow-lg border-red-500"
                  >
                    <h2 className="text-xl font-bold">Listening Mode</h2>
                    <p className="text-gray-600 text-sm">
                      Listen and type the word correctly.
                    </p>
                  </Card>
                </Link>
                <Link to="/sentence-builder-mode">
                  <Card
                    hoverable
                    className="w-64 h-40 flex flex-col items-center justify-center shadow-lg border-yellow-500"
                  >
                    <h2 className="text-xl font-bold">Sentence Builder</h2>
                    <p className="text-gray-600 text-sm">
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
        <Route
          path="/sentence-builder-mode"
          element={<SentenceBuilderMode />}
        />
      </Routes>
    </Router>
  );
};

export default App;
