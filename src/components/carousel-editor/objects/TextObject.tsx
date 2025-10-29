import React from "react";
import { Text } from "react-konva";

interface TextObjectProps {
  object: any;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: any) => void;
  resultData?: any;
}

export default function TextObject({
  object,
  isSelected,
  onSelect,
  onChange,
  resultData = {},
}: TextObjectProps) {
  return (
    <Text
      id={object.id}
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      text={object.text ?? resultData[object.id] ?? ""}
      fontSize={object.fontSize}
      fontFamily={object.font || "Arial"}
      fill={object.fill || "#000"}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) =>
        onChange({ x: e.target.x(), y: e.target.y() })
      }
      onTransformEnd={(e) => {
        const node = e.target;
        onChange({
          x: node.x(),
          y: node.y(),
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}
