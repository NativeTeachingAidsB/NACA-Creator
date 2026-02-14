import React, { useMemo } from "react";
import type { GameObjectMetadata } from "@shared/schema";

interface SVGObjectRendererProps {
  width: number;
  height: number;
  metadata: GameObjectMetadata | null;
  objectId: string;
}

export function SVGObjectRenderer({ width, height, metadata, objectId }: SVGObjectRendererProps) {
  if (!metadata) return null;
  
  const { gradientDef, fill, pathData, stroke } = metadata;
  
  const hasVisualContent = gradientDef || fill || pathData;
  if (!hasVisualContent) return null;
  
  const gradientId = `gradient-${objectId}`;
  
  const renderGradient = useMemo(() => {
    if (!gradientDef) return null;
    
    if (gradientDef.type === 'linear') {
      return (
        <linearGradient
          id={gradientId}
          x1={gradientDef.x1 || "0%"}
          y1={gradientDef.y1 || "0%"}
          x2={gradientDef.x2 || "100%"}
          y2={gradientDef.y2 || "0%"}
        >
          {gradientDef.stops.map((stop, i) => (
            <stop key={i} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      );
    }
    
    if (gradientDef.type === 'radial') {
      return (
        <radialGradient
          id={gradientId}
          cx={gradientDef.cx || "50%"}
          cy={gradientDef.cy || "50%"}
          r={gradientDef.r || "50%"}
        >
          {gradientDef.stops.map((stop, i) => (
            <stop key={i} offset={stop.offset} stopColor={stop.color} />
          ))}
        </radialGradient>
      );
    }
    
    return null;
  }, [gradientDef, gradientId]);
  
  const getFill = () => {
    if (gradientDef) return `url(#${gradientId})`;
    if (fill) return fill;
    return "transparent";
  };
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 pointer-events-none"
      preserveAspectRatio="none"
    >
      {renderGradient && <defs>{renderGradient}</defs>}
      
      {pathData ? (
        <path
          d={pathData}
          fill={getFill()}
          stroke={stroke || "none"}
          strokeWidth={stroke ? 1 : 0}
        />
      ) : (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={getFill()}
          stroke={stroke || "none"}
          strokeWidth={stroke ? 1 : 0}
        />
      )}
    </svg>
  );
}
