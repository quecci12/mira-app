import { Frame } from "react-native-vision-camera";

// Dummy plugin that would call native MediaPipe later
export const detectFaces = (frame: Frame) => {
  "worklet"; // runs on UI thread
  // Mock: return one face in center
  return [
    {
      frame: { origin: { x: 100, y: 100 }, size: { width: 150, height: 150 } },
      landmarks: [],
      trackingID: 1,
    },
  ];
};
