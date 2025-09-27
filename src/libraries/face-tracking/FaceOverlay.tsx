import React from "react";
import { View } from "react-native";
import { Face } from "./useFaceDetection";

type Props = {
  faces: Face[];
  cameraWidth: number;
  cameraHeight: number;
};

export const FaceOverlay: React.FC<Props> = ({
  faces,
  cameraWidth,
  cameraHeight,
}) => {
  return (
    <>
      {faces.map((face, index) => {
        const { origin, size } = face.frame;

        // Scale factor to map from native frame coordinates to preview
        const scaleX = cameraWidth / 480; // replace 480 with your frame width
        const scaleY = cameraHeight / 640; // replace 640 with your frame height

        return (
          <View
            key={index}
            style={{
              position: "absolute",
              left: origin.x * scaleX,
              top: origin.y * scaleY,
              width: size.width * scaleX,
              height: size.height * scaleY,
              borderWidth: 2,
              borderColor: "red",
            }}
          />
        );
      })}
    </>
  );
};
