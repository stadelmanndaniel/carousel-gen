import { Text } from "react-konva";

export default function TextObject({ object, resultData, isSelected, onSelect, onChange }: any) {
  const { id, x, y, width, height, font, fontSize, fill } = object;
  const text = resultData?.[id] || "Text";

  return (
    <Text
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      text={text}
      fontFamily={font}
      fontSize={fontSize}
      fill={fill}
      wrap="word"
      align="left"
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ ...object, x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);
        onChange({
          ...object,
          x: node.x(),
          y: node.y(),
          width: Math.max(10, node.width() * scaleX),
          height: Math.max(10, node.height() * scaleY),
        });
      }}
    />
  );
}
