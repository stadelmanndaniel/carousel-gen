"use client";
import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Transformer, Rect } from "react-konva";
import TextObject from "./objects/TextObject";
import ImageObject from "./objects/ImageObject";

interface LayoutObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: any;
}

interface CarouselEditorProps {
  layout: {
    scene: { width: number; height: number; background: string };
    objects: LayoutObject[];
  };
  result: { [key: string]: any };
  images?: { name: string; url: string }[];
  scale?: number; // optional scale for smaller preview
}

function downloadURI(uri: string, name: string) {
  var link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function CarouselEditor({
  layout,
  result,
  images = [],
  scale = 0.5,
}: CarouselEditorProps) {
  const [objects, setObjects] = useState<LayoutObject[]>(layout.objects || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<any>(null);

  // Update objects when layout changes (slide switch)
  useEffect(() => {
    setObjects(layout.objects || []);
    setSelectedId(null);
  }, [layout]);

  const handleSelect = (id: string) => setSelectedId(id);

  const handleChange = (newObj: LayoutObject) => {
    setObjects((prev) =>
      prev.map((obj) => (obj.id === newObj.id ? newObj : obj))
    );
  };

  const getImageUrl = (id: string): string | undefined => {
    const match = images.find(
      (img) => img.name === `${id}.png` || img.name === `${id}.jpg`
    );
    return match?.url;
  };

  const exportToPng = async () => {
    if (!stageRef.current) return;
    // Export at full resolution
    const uri = stageRef.current.toDataURL({
      pixelRatio: 1 / scale,
    });
    downloadURI(uri, "carousel-slide.png");
  };

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={exportToPng}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Export as PNG
        </button>
      </div>

      <Stage
        ref={stageRef}
        width={layout.scene.width * scale}
        height={layout.scene.height * scale}
        scaleX={scale}
        scaleY={scale}
        style={{
          border: "1px solid #ccc",
          background: layout.scene.background,
        }}
      >
        <Layer>
            {/* Scene background */}
            <Rect
                x={0}
                y={0}
                width={layout.scene.width}
                height={layout.scene.height}
                fill={layout.scene.background}
                draggable={false}
                listening={false} // so it doesn't interfere with selection
            />
          {objects.map((obj) => {
            const commonProps = {
              key: obj.id,
              object: obj,
              resultData: result,
              isSelected: obj.id === selectedId,
              onSelect: () => handleSelect(obj.id),
              onChange: handleChange,
            };

            switch (obj.type) {
              case "text":
                return <TextObject {...commonProps} />;
              case "image":
              case "logo":
                return (
                  <ImageObject
                    {...commonProps}
                    resultData={{ [obj.id]: getImageUrl(obj.id) }}
                  />
                );
              default:
                return null;
            }
          })}

          <TransformerComponent selectedId={selectedId} stageRef={stageRef} />
        </Layer>
      </Stage>
    </div>
  );
}

function TransformerComponent({
  selectedId,
  stageRef,
}: {
  selectedId: string | null;
  stageRef: React.RefObject<any>;
}) {
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const tr = transformerRef.current;
    const selectedNode = stage.findOne(`#${selectedId}`);
    if (selectedNode) {
      tr.nodes([selectedNode]);
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selectedId, stageRef]);

  return <Transformer ref={transformerRef} rotateEnabled={true} />;
}
