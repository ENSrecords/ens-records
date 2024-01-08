import React, { useState } from 'react';

interface TextRecordProps {
  updateTextRecord: (key: string, value: string) => void;
}

const TextRecord: React.FC<TextRecordProps> = ({ updateTextRecord }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  const handleButtonClick = () => {
    updateTextRecord(key, value);
    setKey('');
    setValue('');
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <input
        type="text"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="border border-gray-300 p-2 rounded-md w-full"
        placeholder="Enter key"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border border-gray-300 p-2 rounded-md w-full mt-2"
        placeholder="Enter value"
      />
      <button
        onClick={handleButtonClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 w-full"
      >
        Set Text Record
      </button>
    </div>
  );
};

export default TextRecord;
