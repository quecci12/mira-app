import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Button,
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
  useFrameProcessor,
  VisionCameraProxy,
} from "react-native-vision-camera";

// Use a global emitter (no module argument → avoids warning)
const faceEvents = new NativeEventEmitter();

// Plugin name must match what you registered in Kotlin
const plugin = VisionCameraProxy.initFrameProcessorPlugin("faceDetection", {});

export default function App() {
  const device = useCameraDevice("front");
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
              style={{ width: "100%", height: "100%" }}
              device={camera}
              isActive={true}
              frameProcessor={frameProcessor}
            />
          ) : (
            <Text>No Camera Selected</Text>
          )}

          {faces.length > 0 && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            >
              {faces.map((face, index) => (
                <View
                  key={index}
                  style={{
                    position: "absolute",
                    borderWidth: 2,
                    borderColor: "red",
                    left: face.x,
                    top: face.y,
                    width: face.width,
                    height: face.height,
                  }}
                />
              ))}
            </View>
          )}
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
