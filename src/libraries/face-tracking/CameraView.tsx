import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import {
  Camera,
  useCameraDevices,
  ReadonlyFrameProcessor,
} from "react-native-vision-camera";
import { useFaceDetection } from "./useFaceDetection";
import { FaceOverlay } from "./FaceOverlay";

export const CameraView: React.FC = () => {
  const devices = useCameraDevices();
  const device = devices[0]; // pick first camera
  const { faces, handleFrame } = useFaceDetection();

  const screenWidth = Dimensions.get("window").width;
  const cameraHeight = (screenWidth * 4) / 3;

  // frameProcessor: do NOT type the frame parameter
  // @ts-ignore
  const frameProcessor: ReadonlyFrameProcessor = (frame) => {
    "worklet";
    handleFrame(frame); // frame is a worklet native handle
  };

  if (!device) return <Text>Loading camera...</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={{ width: screenWidth, height: cameraHeight }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />

      <View
        style={{
          width: screenWidth,
          height: cameraHeight,
          position: "absolute",
        }}
      >
        <FaceOverlay
          faces={faces}
          cameraWidth={screenWidth}
          cameraHeight={cameraHeight}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
});
