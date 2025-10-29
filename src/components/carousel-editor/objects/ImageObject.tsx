import { Image } from "react-konva";
import useImage from "use-image";

export default function ImageObject({ object, resultData, isSelected, onSelect, onChange }: any) {
  const { id, x, y, width, height } = object;
  const url = resultData?.[id] || "";
  const [image] = useImage(url, "anonymous");

  return (
    <Image
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      image={image}
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
