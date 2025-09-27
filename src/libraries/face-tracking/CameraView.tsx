import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import {
  Camera,
  useCameraDevices,
  ReadonlyFrameProcessor,
} from "react-native-vision-camera";
import { runOnJS } from "react-native-reanimated";
import { useFaceDetection } from "./useFaceDetection";
import { FaceOverlay } from "./FaceOverlay";

export const CameraView: React.FC = () => {
  const [permission, setPermission] = useState<
    "granted" | "denied" | "not-determined"
  >("not-determined");
  const devices = useCameraDevices();
  const device = devices[1]; // pick first camera
  const { faces, handleFrame } = useFaceDetection();

  const screenWidth = Dimensions.get("window").width;
  const cameraHeight = (screenWidth * 4) / 3;

  // Request camera permission on mount
  useEffect(() => {
    const requestPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setPermission(status);
    };
    requestPermission();
  }, []);

  // frameProcessor: do NOT type the frame parameter
  // @ts-ignore
  const frameProcessor: ReadonlyFrameProcessor = (frame) => {
    "worklet";
    runOnJS(handleFrame)(frame); // safely call JS function from worklet
  };

  if (permission !== "granted") return <Text>Camera permission required</Text>;
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
    alignItems: "center",
    justifyContent: "center",
  },
});
