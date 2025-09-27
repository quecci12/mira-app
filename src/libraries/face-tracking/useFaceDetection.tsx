import { useState, useCallback } from "react";
import { runOnJS } from "react-native-reanimated";

// Dummy face type
export type Face = {
  frame: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  landmarks: any[];
  trackingID: number | null;
};

// Mock detection function for now
const detectFaces = (frame: any): Face[] => {
  "worklet";
  return [
    {
      frame: { origin: { x: 100, y: 100 }, size: { width: 150, height: 150 } },
      landmarks: [],
      trackingID: 1,
    },
  ];
};

export const useFaceDetection = () => {
  const [faces, setFaces] = useState<Face[]>([]);

  const handleFrame = useCallback((frame: any) => {
    "worklet";
    const detectedFaces = detectFaces(frame);
    runOnJS(setFaces)(detectedFaces);
  }, []);

  return { faces, handleFrame };
};
