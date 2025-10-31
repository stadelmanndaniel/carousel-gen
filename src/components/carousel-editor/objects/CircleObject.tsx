"use client";
import React from "react";
import { Circle } from "react-konva";

interface CircleObjectProps {
  object: {
    id: string;
    x: number;
    y: number;
    fill?: string;
    radius?: number;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onChange?: (newObj: any) => void;
}

const CircleObject: React.FC<CircleObjectProps> = ({ object, isSelected, onSelect, onChange }) => {
  const radius = object.radius || 10;
  
  return (
    <Circle
      id={object.id}
      // Position the circle using its center (x, y)
      x={object.x}
      y={object.y}
      radius={radius}
      fill={object.fill}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        // When dragging, we update the object's top-left corner (x, y)
        onChange?.({ 
          ...object, 
          // Re-calculate the top-left corner based on the new center position
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const nodeRotation = node.rotation();

        const newWidth = Math.max(10, radius * 2 * scaleX);
        const newHeight = Math.max(10, radius * 2 * scaleY);
        const newRadiusForState = (newWidth / 2 + newHeight / 2) / 2;


        // When transforming, we calculate the new dimensions (width/height)
        // and adjust the (x, y) to maintain its position relative to the Konva group.
        
        onChange?.({
          ...object,
          // New x/y are based on the circle's center
          x: node.x(), // Calculate new top-left x
          y: node.y(), // Calculate new top-left y
          radius: newRadiusForState, // Update the radius in state
          rotation: nodeRotation,
        });

        // Reset scaling for the Transformer tool
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
};

export default CircleObject;
