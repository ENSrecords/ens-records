import React, { useState } from 'react';

interface ContenthashProps {
    onSetString: (value: string) => void;
  }

const Contenthash: React.FC<ContenthashProps> = ({ onSetString }) => {
  const [inputValue, setInputValue] = useState('');

  const handleButtonClick = () => {
    onSetString(inputValue);
    setInputValue('');
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="border border-gray-300 p-2 rounded-md w-full"
        placeholder="Enter string here"
      />
      <button
        onClick={handleButtonClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 w-full"
      >
        Set Contenthash
      </button>
    </div>
  );
};

export default Contenthash;
