import React, { useState } from "react";

const SentenceBuilderMode = () => {
  const words = ["is", "this", "a", "test"];
  const [shuffled, setShuffled] = useState(
    [...words].sort(() => Math.random() - 0.5)
  );
  const [selected, setSelected] = useState([]);

  const handleSelect = (word) => {
    setSelected([...selected, word]);
    setShuffled(shuffled.filter((w) => w !== word));
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">Sentence Builder Mode</h1>
      <p>Arrange the words to form a correct sentence:</p>
      <div className="flex space-x-2 mt-4">
        {shuffled.map((word, index) => (
          <button
            key={index}
            onClick={() => handleSelect(word)}
            className="border p-2"
          >
            {word}
          </button>
        ))}
      </div>
      <div className="mt-4 text-xl font-bold">{selected.join(" ")}</div>
    </div>
  );
};

export default SentenceBuilderMode;
