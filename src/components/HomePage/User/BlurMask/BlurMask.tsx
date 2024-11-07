import type { ReactNode } from "react";
import { Fill, Shader, vec } from "@shopify/react-native-skia";

import { generateShader } from "./Shader";

const source = generateShader();

interface BlurGradientProps {
  mask: ReactNode | ReactNode[];
  children: ReactNode | ReactNode[];
}

export const BlurMask = ({ mask, children }: BlurGradientProps) => {
  return (
    <Fill>
      <Shader
        source={source}
        uniforms={{
          direction: vec(2, 0),
        }}
      >
        <Shader
          source={source}
          uniforms={{
            direction: vec(0, 2),
          }}
        >
          {children}
          {mask}
        </Shader>
        {mask}
      </Shader>
    </Fill>
  );
};