// import React, { useState } from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   Button,
//   Image,
//   ScrollView,
//   Dimensions,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import {
//   FaceDetectionProvider,
//   useFacesInPhoto,
// } from "@infinitered/react-native-mlkit-face-detection";

// export default function App() {
//   const [imageUri, setImageUri] = useState<any>(null);
//   const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

//   // Face detection hook
//   const { faces, error, status } = useFacesInPhoto(imageUri);

//   // Pick image from gallery
//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: "images",
//       quality: 1,
//     });

//     if (!result.canceled) {
//       const uri = result.assets[0].uri;
//       setImageUri(uri);

//       // Get actual image dimensions
//       Image.getSize(uri, (width, height) => setImageSize({ width, height }));
//     }
//   };

//   // Scale factor to fit image in 300x300 box
//   const scaleX = imageSize.width ? 300 / imageSize.width : 1;
//   const scaleY = imageSize.height ? 300 / imageSize.height : 1;

//   return (
//     <FaceDetectionProvider>
//       <View style={styles.container}>
//         <Button title="Pick an Image" onPress={pickImage} />

//         {imageUri && (
//           <View style={{ marginTop: 20, alignItems: "center" }}>
//             <View style={{ width: 300, height: 300 }}>
//               <Image
//                 source={{ uri: imageUri }}
//                 style={{ width: 300, height: 300 }}
//               />

//               {faces.map((face, index) => {
//                 const { origin, size } = face.frame;
//                 return (
//                   <View
//                     key={index}
//                     style={{
//                       position: "absolute",
//                       left: origin.x * scaleX,
//                       top: origin.y * scaleY,
//                       width: size.x * scaleX,
//                       height: size.y * scaleY,
//                       borderWidth: 2,
//                       borderColor: "red",
//                       borderStyle: "solid",
//                     }}
//                   />
//                 );
//               })}
//             </View>

//             {status === "detecting" && <Text>Detecting faces...</Text>}
//             {error && <Text style={{ color: "red" }}>Error: {error}</Text>}

//             <ScrollView style={{ maxHeight: 200, marginTop: 10 }}>
//               {faces.map((face, i) => (
//                 <View key={i} style={{ marginBottom: 10 }}>
//                   <Text>{JSON.stringify(face, null, 2)}</Text>
//                 </View>
//               ))}
//               {faces.length === 0 && status === "done" && (
//                 <Text>No faces detected</Text>
//               )}
//             </ScrollView>
//           </View>
//         )}
//       </View>
//     </FaceDetectionProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//   },
// });

import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { CameraView } from "./src/libraries/face-tracking/CameraView";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <CameraView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
