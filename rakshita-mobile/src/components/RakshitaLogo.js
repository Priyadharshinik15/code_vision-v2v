import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop, Ellipse } from "react-native-svg";

/**
 * Rakshita mark: shield outline containing a woman's profile silhouette
 * with flowing hair, plus a small leaf sprig on the lower right of the
 * shield — matching the reference landing screen design.
 */
export default function RakshitaLogo({ size = 140 }) {
  const height = size * (170 / 150);
  return (
    <Svg width={size} height={height} viewBox="0 0 150 170">
      <Defs>
        <LinearGradient id="shieldGrad" x1="0" y1="0" x2="150" y2="170">
          <Stop offset="0" stopColor="#c9b8f0" />
          <Stop offset="1" stopColor="#9c8ae0" />
        </LinearGradient>
        <LinearGradient id="faceGrad" x1="35" y1="15" x2="105" y2="150">
          <Stop offset="0" stopColor="#b39ce8" />
          <Stop offset="1" stopColor="#8a7ad4" />
        </LinearGradient>
      </Defs>

      {/* Shield outline */}
      <Path
        d="M75,6 L136,24 V76 C136,116 111,142 75,158 C39,142 14,116 14,76 V24 Z"
        stroke="url(#shieldGrad)"
        strokeWidth={3.5}
        fill="none"
      />

      {/* Woman's profile silhouette with flowing hair */}
      <Path
        d="M72,34 C64,34 57,38 53,45 C51,49 51,53 48,56
           C50,59 53,60 55,62 C52,65 51,69 53,73
           C48,77 44,83 43,90 C42,97 43,104 46,110
           C42,116 40,124 41,132 C42,141 47,149 55,153
           C63,157 72,155 78,149 C83,144 85,137 84,130
           C89,126 92,119 91,112 C90,105 86,99 80,96
           C84,91 86,84 84,78 C82,72 78,68 72,66
           C76,62 77,56 74,51 C71,46 65,44 60,46
           C62,42 66,38 72,34 Z"
        fill="url(#faceGrad)"
      />

      {/* Small leaf sprig, lower-right of the shield */}
      <Ellipse cx="103" cy="98" rx="7" ry="14" fill="#eec3c7" transform="rotate(50 103 98)" />
      <Ellipse cx="112" cy="112" rx="6" ry="12" fill="#f0a8ad" transform="rotate(42 112 112)" />
      <Ellipse cx="120" cy="126" rx="5" ry="10" fill="#eec3c7" transform="rotate(35 120 126)" />
    </Svg>
  );
}