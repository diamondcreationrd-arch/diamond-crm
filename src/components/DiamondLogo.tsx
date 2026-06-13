import React from "react";

interface Props {
  size?: number;
  className?: string;
  color?: string;
}

export function DiamondLogo({ size = 40, className = "", color = "#BD9F50" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer octagon (flat-top) */}
      <polygon
        points="16,3 32,3 45,16 45,32 32,45 16,45 3,32 3,16"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner diamond facets */}
      <polygon
        points="24,11 37,24 24,37 11,24"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Outer vertex to inner diamond — top-left zone */}
      <line x1="16" y1="3" x2="11" y2="24" stroke={color} strokeWidth="1" opacity="0.7"/>
      <line x1="3" y1="16" x2="24" y2="11" stroke={color} strokeWidth="1" opacity="0.7"/>
      {/* top-right zone */}
      <line x1="32" y1="3" x2="37" y2="24" stroke={color} strokeWidth="1" opacity="0.7"/>
      <line x1="45" y1="16" x2="24" y2="11" stroke={color} strokeWidth="1" opacity="0.7"/>
      {/* bottom-right zone */}
      <line x1="45" y1="32" x2="24" y2="37" stroke={color} strokeWidth="1" opacity="0.7"/>
      <line x1="32" y1="45" x2="37" y2="24" stroke={color} strokeWidth="1" opacity="0.7"/>
      {/* bottom-left zone */}
      <line x1="16" y1="45" x2="11" y2="24" stroke={color} strokeWidth="1" opacity="0.7"/>
      <line x1="3" y1="32" x2="24" y2="37" stroke={color} strokeWidth="1" opacity="0.7"/>
      {/* Center cross */}
      <line x1="11" y1="24" x2="37" y2="24" stroke={color} strokeWidth="1" opacity="0.5"/>
      <line x1="24" y1="11" x2="24" y2="37" stroke={color} strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}
