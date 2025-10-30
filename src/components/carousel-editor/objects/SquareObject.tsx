"use client";
import React from "react";
import { Rect } from "react-konva";

interface SquareObjectProps {
  object: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onChange?: (newObj: any) => void;
}

const SquareObject: React.FC<SquareObjectProps> = ({ object, isSelected, onSelect, onChange }) => {
  return (
    <Rect
      id={object.id}
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      fill={object.fill}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange?.({ ...object, x: e.target.x(), y: e.target.y() });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        onChange?.({
          ...object,
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
        });

        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
};

export default SquareObject;
