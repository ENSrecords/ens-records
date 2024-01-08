import { useWriteContract } from "wagmi";
import abi from "../abi/Resolver.json";
import Contenthash from "./contenthash";
import { useState } from "react";
import TextRecord from "./text-record";

export function Resolver() {
  const [contentHash, setContentHash] = useState("");
  const [textRecords, setTextRecords] = useState({});

    // Function to update the dictionary
    const updateDictionary = (key: string, value: string) => {
        setTextRecords(prevDict => ({
          ...prevDict,  // Spread the previous dictionary
          [key]: value  // Update the key with the new value
        }));
      };

  return (
    <>
      <div>{contentHash}</div>
      <Contenthash onSetString={setContentHash} />
      <TextRecord updateTextRecord={updateDictionary} />
    </>
  );
}
