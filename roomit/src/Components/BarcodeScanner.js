import React, { useState } from "react";
import { useZxing } from "react-zxing";

const BarcodeScanner = ({ onDecodeResult }) => {
  const [result, setResult] = useState("");
  const { ref } = useZxing({
    onDecodeResult: (result) => {
      setResult(result.getText());
      // Pass the result to the parent component
      onDecodeResult(result.getText());
    },
  });

  return (
    <>
      <video ref={ref} />

    </>
  );
};

export default BarcodeScanner;