import React, { useRef, useEffect } from "react";
import { Image } from "react-konva";
import useImage from "use-image";
import { KonvaEventObject } from "konva/lib/Node";
import { Image as KonvaImage } from "konva/lib/shapes/Image";

// 1. Define the shape of your object data
interface LayoutObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  imageUrl?: string;
  [key: string]: any; // Allow other properties
}

// 2. Define the props for this component
interface ImageObjectProps {
  object: LayoutObject;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newObj: LayoutObject) => void;
  resultData?: { [key: string]: string | undefined };
}

export default function ImageObject({
  object,
  isSelected,
  onSelect,
  onChange,
  resultData = {},
}: ImageObjectProps) { // <-- Applied prop types
  const shapeRef = useRef<KonvaImage>(null);

  const originalImageUrl = resultData[object.id];
  const url = object.imageUrl ?? originalImageUrl;
  const [image] = useImage(url || "", "anonymous");

  // This is needed for the Transformer to attach
  useEffect(() => {
    if (isSelected && shapeRef.current) {
      // The parent component <TransformerComponent> will find this node
      // by its ID, but this is a good pattern if you were passing the
      // ref directly. The main thing is the ref is attached below.
    }
  }, [isSelected]);

  const handleUpdate = (e: KonvaEventObject<any>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 to apply it to width/height
    node.scaleX(1);
    node.scaleY(1);

    onChange({
      ...object, // <-- CRITICAL FIX
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  return (
    <Image
      ref={shapeRef} // <-- Added ref for transformer
      id={object.id}
      image={image}
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      rotation={object.rotation} // <-- Added rotation
      draggable={isSelected} // <-- Good practice: only drag when selected
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={handleUpdate} // <-- Use combined handler
      onTransformEnd={handleUpdate} // <-- Use combined handler
      
      // Optional: Add a visual indicator for selection
      stroke={isSelected ? "blue" : "transparent"}
      strokeWidth={isSelected ? 2 : 0}
    />
  );
}