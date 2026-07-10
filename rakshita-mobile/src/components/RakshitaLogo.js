import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop, G, Ellipse, Line } from "react-native-svg";

export default function RakshitaLogo({ size = 140 }) {
  const height = size * (160 / 150);
  return (
    <Svg width={size} height={height} viewBox="0 0 150 160">
      <Defs>
        <LinearGradient id="shieldGrad" x1="0" y1="0" x2="150" y2="160">
          <Stop offset="0" stopColor="#c9b8f0" />
          <Stop offset="1" stopColor="#8b7bd8" />
        </LinearGradient>
        <LinearGradient id="faceGrad" x1="30" y1="20" x2="115" y2="150">
          <Stop offset="0" stopColor="#b39ce8" />
          <Stop offset="1" stopColor="#7a6bc9" />
        </LinearGradient>
      </Defs>
      <Path
        d="M75,8 L138,26 V78 C138,118 112,144 75,156 C38,144 12,118 12,78 V26 Z"
        stroke="url(#shieldGrad)"
        strokeWidth={4}
        fill="none"
      />
      <Path
        d="M74,36 C66,36 59,40 55,47 C53,51 52,55 49,58 C45,60 41,61 38,63
           C42,65 46,66 49,68 C47,71 47,75 50,78 C53,82 58,85 62,89
           C66,94 68,100 69,107 C70,113 70,118 68,123 C71,128 76,132 78,138
           C82,148 80,158 70,163 C61,168 50,165 44,157 C39,150 39,141 43,133
           C39,127 37,120 38,113 C39,105 43,98 49,93 C44,88 41,82 41,75
           C41,64 46,55 54,49 C51,45 51,40 55,37 C61,33 68,33 74,36 Z"
        fill="url(#faceGrad)"
      />
      <G>
        <Ellipse cx="9" cy="13" rx="8" ry="16" fill="#eec3c7" transform="translate(104,86) rotate(50 9 13)" />
        <Ellipse cx="19" cy="29" rx="7" ry="14" fill="#f0a8ad" transform="translate(104,86) rotate(45 19 29)" />
        <Ellipse cx="28" cy="44" rx="6" ry="12" fill="#eec3c7" transform="translate(104,86) rotate(38 28 44)" />
      </G>
    </Svg>
  );
}
