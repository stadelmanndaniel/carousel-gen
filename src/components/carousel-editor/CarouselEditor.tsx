"use client";
import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Transformer, Rect } from "react-konva";
import Konva from "konva";
import TextObject from "./objects/TextObject";
import ImageObject from "./objects/ImageObject";
import ReplaceImageModal from "./ReplaceImageModal";
import { getSupabaseClient } from '@/lib/supabase/client';

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
  scale?: number; // optional scale for preview
  userId: string;
  projectId: string;
}

export default function CarouselEditor({
  layout,
  result,
  images = [],
  scale = 0.5,
  userId,
  projectId,
}: CarouselEditorProps) {
  const [objects, setObjects] = useState<LayoutObject[]>(layout.objects || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [imageList, setImageList] = useState(images);
  const supabase = getSupabaseClient();

  const handleReplaceImage = (url: string, name: string) => {
    if (selectedObject) {
        handleChange(selectedObject.id, { 
            imageUrl: url, 
            imageFileName: name // Optional, for display/tracking
        });
        setShowReplaceModal(false);
    }
  }; 

  const handleUploadComplete = (file: { name: string; url: string }) => {
    setImageList((prev) => [...prev, file]);
  };

  const PROPERTIES_PANEL_WIDTH = 300;

  useEffect(() => {
    setObjects(layout.objects || []);
    setSelectedId(null);
  }, [layout]);

  const handleSelect = (id: string) => setSelectedId(id);

  const handleChange = (id: string, updates: Partial<LayoutObject>) => {
    setObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj))
    );
  };

  const getImageUrl = (id: string) =>
    images.find((img) => img.name === `${id}.png` || img.name === `${id}.jpg`)?.url;

  const downloadURI = (uri: string, name: string) => {
    const link = document.createElement("a");
    link.href = uri;
    link.download = name;
    link.click();
  };

  const exportToPng = () => {
    if (!stageRef.current) return;

    const dataURL = stageRef.current.toDataURL({ pixelRatio: 1 / scale });
    downloadURI(dataURL, "carousel-slide.png");
  };

  const selectedObject = selectedId ? objects.find((o) => o.id === selectedId) : null;

  return (
    <div className="flex gap-4">
      {/* Left panel */}
      <div
        className="bg-gray-50 p-4 rounded-lg border flex flex-col gap-4"
        style={{ width: PROPERTIES_PANEL_WIDTH, minWidth: PROPERTIES_PANEL_WIDTH }}
      >
        <h3 className="font-semibold text-gray-700">Properties</h3>
        {selectedObject ? (
          <>
            <p className="text-sm text-gray-600 font-medium">{selectedObject.id}</p>

            <label className="text-sm text-gray-600">X:</label>
            <input
              type="number"
              value={selectedObject.x}
              onChange={(e) =>
                handleChange(selectedObject.id, { x: Number(e.target.value) })
              }
              className="border p-1 rounded"
            />

            <label className="text-sm text-gray-600">Y:</label>
            <input
              type="number"
              value={selectedObject.y}
              onChange={(e) =>
                handleChange(selectedObject.id, { y: Number(e.target.value) })
              }
              className="border p-1 rounded"
            />

            <label className="text-sm text-gray-600">Width:</label>
            <input
              type="number"
              value={selectedObject.width || 0}
              onChange={(e) =>
                handleChange(selectedObject.id, { width: Number(e.target.value) })
              }
              className="border p-1 rounded"
            />

            <label className="text-sm text-gray-600">Height:</label>
            <input
              type="number"
              value={selectedObject.height || 0}
              onChange={(e) =>
                handleChange(selectedObject.id, { height: Number(e.target.value) })
              }
              className="border p-1 rounded"
            />

            {selectedObject.type === "text" && (
            <>
                <label className="text-sm text-gray-600">Text:</label>
                <input
                type="text"
                value={selectedObject.text || result[selectedObject.id] || ""}
                onChange={(e) =>
                    handleChange(selectedObject.id, { text: e.target.value })
                }
                className="border p-1 rounded w-full"
                />

                <label className="text-sm text-gray-600">Color:</label>
                <input
                type="color"
                value={selectedObject.fill || "#000000"}
                onChange={(e) =>
                    handleChange(selectedObject.id, { fill: e.target.value })
                }
                className="border p-1 rounded w-16 h-8"
                />
            </>
            )}
            {selectedObject.type === "image" || selectedObject.type === "logo" ? (
            <>
                <button
                onClick={() => setShowReplaceModal(true)}
                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                >
                Replace Image
                </button>
            </>
            ) : null}

          </>
        ) : (
          <p className="text-gray-500 text-sm">Select an object to edit its properties</p>
        )}

        {/* Export button */}
        <button
          onClick={exportToPng}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mt-auto"
        >
          Export as PNG
        </button>
      </div>

      {/* Right panel: Konva stage */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stage
          ref={stageRef}
          width={layout.scene.width * scale}
          height={layout.scene.height * scale}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={layout.scene.width}
              height={layout.scene.height}
              fill={layout.scene.background}
              listening={false}
              draggable={false}
            />
          </Layer>
          <Layer>
            {objects.map((obj) => {
              const commonProps = {
                key: obj.id,
                object: obj,
                resultData: result,
                isSelected: obj.id === selectedId,
                onSelect: () => handleSelect(obj.id),
                onChange: (updates: Partial<LayoutObject>) =>
                  handleChange(obj.id, updates),
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
      {showReplaceModal && (
        <ReplaceImageModal
            images={imageList}
            projectPath={`${userId}/${projectId}/`}
            onClose={() => setShowReplaceModal(false)}
            onSelectImage={handleReplaceImage}
            onUploadComplete={handleUploadComplete}
            />
      )}
    </div>
  );
}

function TransformerComponent({
  selectedId,
  stageRef,
}: {
  selectedId: string | null;
  stageRef: React.RefObject<Konva.Stage>;
}) {
  const transformerRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const tr = transformerRef.current;
    const selectedNode = stage.findOne(`#${selectedId}`);
    if (selectedNode) {
      tr?.nodes([selectedNode]);
    } else {
      tr?.nodes([]);
    }
    tr?.getLayer()?.batchDraw();
  }, [selectedId, stageRef]);

  return <Transformer ref={transformerRef} rotateEnabled={true} />;
}
