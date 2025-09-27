import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  LayoutRectangle,
  NativeEventEmitter,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  CameraDevice,
  useCameraDevice,
  useCameraFormat,
  useFrameProcessor,
  VisionCameraProxy,
} from "react-native-vision-camera";

// Use a global emitter (no module argument → avoids warning)
const faceEvents = new NativeEventEmitter();

// Plugin name must match what you registered in Kotlin
const plugin = VisionCameraProxy.initFrameProcessorPlugin("faceDetection", {});

import { NativeModules } from "react-native";
const { FaceDetectionModule } = NativeModules;

// Initial configuration (call once)
FaceDetectionModule.configure({
  delegate: 0, // 0 = CPU, 1 = GPU
  runningMode: "LIVE_STREAM",
});

export default function App() {
  const cameraViewRef = useRef<LayoutRectangle>(null);
  const device = useCameraDevice("front");
  const format = useCameraFormat(device, [
    { videoResolution: { width: 640, height: 480 } },
  ]);

  const [camera, setCamera] = useState<CameraDevice | undefined>(undefined);
  const [faces, setFaces] = useState<any[]>([]);

  useEffect(() => {
    // Listen for face detection results
    const sub = faceEvents.addListener("onFacesDetected", (data) => {
      console.log("Faces detected:", data);
      setFaces(data); // array of bounding boxes
    });

    const errSub = faceEvents.addListener("onFaceDetectionError", (err) => {
      console.error("Face Detection Error:", err);
    });

    return () => {
      sub.remove();
      errSub.remove();
    };
  }, []);

  // Frame processor
  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";

    if (!plugin) {
      console.warn("Frame Processor Plugin not loaded");
    } else {
      plugin.call(frame);
    }
  }, []);

  const toggleCamera = () => {
    console.log("camera toggled");
    setCamera((prev) => (prev ? undefined : device));
  };

  useEffect(() => {
    if (camera === undefined) setFaces([]);
  }, [camera]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View
          style={{
            flex: 1,
            backgroundColor: "#dfdfdf",
            borderRadius: 16,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {camera ? (
            <Camera
              format={format}
              onLayout={(e) => (cameraViewRef.current = e.nativeEvent.layout)}
              style={{ width: "100%", height: "100%" }}
              device={camera}
              isActive={true}
              frameProcessor={frameProcessor}
              resizeMode="contain"
            />
          ) : (
            <Text>No Camera Selected</Text>
          )}

          {faces.map((face, index) => {
            if (!cameraViewRef.current) return null;

            const detectionWidth = 640; // Model space
            const detectionHeight = 480; // Model space

            const previewWidth = cameraViewRef.current.width;
            const previewHeight = cameraViewRef.current.height;

            const scaleX = previewWidth / detectionWidth;
            const scaleY = previewHeight / detectionHeight;

            let left = face.x * scaleX;
            let top = face.y * scaleY;
            let width = face.width * scaleX;
            let height = face.height * scaleY;

            // Mirror horizontally for front camera
            if (camera?.position === "back") {
              left = previewWidth - (left + width);
            }

            return (
              <View
                key={index}
                style={{
                  position: "absolute",
                  borderWidth: 2,
                  borderColor: "red",
                  left,
                  top,
                  width,
                  height,
                }}
              />
            );
          })}
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Button title="Toggle Camera" onPress={toggleCamera} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    gap: 16,
  },
});
