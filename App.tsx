// import React, { useState } from "react";
// import { Button, StyleSheet, Text, View } from "react-native";
// import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
// import { StatusBar } from "expo-status-bar";
// import {
//   Camera,
//   CameraDevice,
//   useCameraDevice,
//   useFrameProcessor,
// } from "react-native-vision-camera";
// export default function App() {
//   const device = useCameraDevice("front");
//   const [camera, setCamera] = useState<undefined | CameraDevice>(undefined);

//   const frameProcessor = useFrameProcessor((frame) => {
//     "worklet";
//   }, []);

//   const toggleCamera = () => {
//     setCamera((_) => (_ ? undefined : device));
//   };

//   return (
//     <SafeAreaProvider>
//       <SafeAreaView style={styles.container}>
//         <StatusBar style="auto" />
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "#dfdfdfff",
//             borderRadius: 16,
//             overflow: "hidden",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           {camera ? (
//             <Camera
//               style={{ width: "100%", height: "100%" }}
//               device={camera}
//               isActive={true}
//               frameProcessor={frameProcessor}
//             />
//           ) : (
//             <Text>No Camera Seletected</Text>
//           )}
//         </View>
//         <View
//           style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
//         >
//           <Button title="Toggle Camera" onPress={toggleCamera} />
//         </View>
//       </SafeAreaView>
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//     padding: 16,
//     gap: 16,
//   },
// });

import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Button,
  NativeEventEmitter,
  NativeModules,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { runOnJS } from "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  CameraDevice,
  useCameraDevice,
  useFrameProcessor,
  VisionCameraProxy,
} from "react-native-vision-camera";

// Native module
const { FaceDetectionModule } = NativeModules;
const faceEvents = new NativeEventEmitter(FaceDetectionModule);
const plugin = VisionCameraProxy.initFrameProcessorPlugin("faceDetection", {});

export default function App() {
  const device = useCameraDevice("front");
  const [camera, setCamera] = useState<CameraDevice | undefined>(undefined);
  const [faces, setFaces] = useState<any[]>([]);

  useEffect(() => {
    // Listen for face detection results
    const sub = faceEvents.addListener("onFacesDetected", (data) => {
      console.log(data);

      setFaces(data); // data = array of bounding boxes / landmarks
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
      console.warn("Failed to load Frame Processor Plugin");
    } else {
      plugin.call(frame);
    }
  }, []);

  const toggleCamera = () => {
    setCamera((prev) => (prev ? undefined : device));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View
          style={{
            flex: 1,
            backgroundColor: "#dfdfdfff",
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
