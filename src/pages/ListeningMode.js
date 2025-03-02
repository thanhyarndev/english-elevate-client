import React, { useState } from "react";

const ListeningMode = () => {
  const [word, setWord] = useState("marketing"); // Ví dụ từ
  const [input, setInput] = useState("");

  const handleCheck = () => {
    alert(input.toLowerCase() === word ? "Correct!" : "Try again!");
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">Listening Mode</h1>
      <button onClick={() => new Audio("/path/to/audio.mp3").play()}>
        🔊 Play Sound
      </button>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type the word..."
        className="border p-2 mt-4"
      />
      <button onClick={handleCheck} className="bg-blue-500 text-white p-2 mt-4">
        Submit
      </button>
    </div>
  );
};

export default ListeningMode;
