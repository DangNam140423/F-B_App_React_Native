/* eslint-disable @typescript-eslint/no-var-requires */
import { useFont, Text } from "@shopify/react-native-skia";
import React from "react";
import { useWindowDimensions, View } from "react-native";

const typeface = require("../../../../assets/fonts/MarckScript-Regular.ttf");
const subTypeface = require("../../../../assets/fonts/Raleway-Medium.ttf");

export const Title = () => {
  const { width, height } = useWindowDimensions();
  const font = useFont(typeface, 81);
  const subFont = useFont(subTypeface, 24);
  const text = "Zürich";
  const subText = "Switzerland".toUpperCase();
  if (!font || !subFont) {
    return null;
  }
  const x1 = (width - font.getTextWidth(text)) / 2;
  const x2 = (width - subFont.getTextWidth(subText)) / 2;
  return (
    <View>
      <Text
        font={font}
        x={x1}
        y={height - 150}
        text={text}
        color="white"
        opacity={0.8}
      />
      <Text
        font={subFont}
        x={x2}
        y={height - 100}
        text={subText}
        color="white"
        opacity={0.5}
      />
    </View>
  );
};