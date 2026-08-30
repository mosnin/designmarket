"use client";

import { type CSSProperties, type ReactNode, useMemo } from "react";

type GradualBlurProps = {
  position?: "top" | "bottom" | "left" | "right";
  strength?: number;
  height?: string;
  divCount?: number;
  exponential?: boolean;
  zIndex?: number;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
};

const CURVE_FUNCTION = (p: number): number => 1 - Math.pow(1 - p, 2); // ease-out

const getGradientDirection = (position: string): string => {
  const directions: Record<string, string> = {
    top: "to top",
    bottom: "to bottom",
    left: "to left",
    right: "to right",
  };
  return directions[position] || "to bottom";
};

export function GradualBlur({
  position = "bottom",
  strength = 2,
  height = "6rem",
  divCount = 5,
  exponential = false,
  zIndex = 50,
  opacity = 1,
  className = "",
  style,
}: GradualBlurProps): ReactNode {
  const blurDivs = useMemo(() => {
    const divs: ReactNode[] = [];
    const increment = 100 / divCount;

    for (let i = 1; i <= divCount; i++) {
      let progress = i / divCount;
      progress = CURVE_FUNCTION(progress);

      let blurValue: number;
      if (exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * strength;
      } else {
        blurValue = 0.0625 * (progress * divCount + 1) * strength;
      }

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const direction = getGradientDirection(position);

      const divStyle: CSSProperties = {
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity,
      };

      divs.push(<div key={i} className="absolute inset-0" style={divStyle} />);
    }

    return divs;
  }, [divCount, exponential, opacity, position, strength]);

  const containerStyle: CSSProperties = useMemo(() => {
    const isVertical = ["top", "bottom"].includes(position);

    const baseStyle: CSSProperties = {
      position: "absolute",
      pointerEvents: "none",
      zIndex,
      ...style,
    };

    if (isVertical) {
      baseStyle.height = height;
      baseStyle.width = "100%";
      baseStyle[position] = 0;
      baseStyle.left = 0;
      baseStyle.right = 0;
    } else {
      baseStyle.width = height;
      baseStyle.height = "100%";
      baseStyle[position] = 0;
      baseStyle.top = 0;
      baseStyle.bottom = 0;
    }

    return baseStyle;
  }, [height, position, style, zIndex]);

  return (
    <div
      className={`gradual-blur relative ${className}`}
      style={containerStyle}
      aria-hidden="true"
    >
      <div className="relative w-full h-full">{blurDivs}</div>
    </div>
  );
}
