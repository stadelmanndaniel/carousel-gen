// components/carousel-editor/CarouselEditor.tsx
"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Stage, Layer, Transformer, Rect } from "react-konva";
import { Stage as KonvaStage } from 'konva/lib/Stage';
import { Transformer as KonvaTransformer } from 'konva/lib/shapes/Transformer';
import { Loader2, AlertCircle, Save, Download, Eye } from "lucide-react";
import TextObject from "./objects/TextObject";
import ImageObject from "./objects/ImageObject";
import CircleObject from "./objects/CircleObject";
import RectangleObject from "./objects/RectangleObject";
import ReplaceImageModal from "./ReplaceImageModal";
import { getSupabaseClient } from '@/lib/supabase/client';
import { saveJsonToSupabase } from "@/lib/supabase/saveProject";

// --- Type Definitions (Centralized) ---

interface LayoutObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  fontFamily?: string; 
  imageUrl?: string; 
  imageFileName?: string;
  radius?: number;
  [key: string]: any;
}

interface Layout {
  scene: { width: number; height: number; background: string };
  objects: LayoutObject[];
}

interface Result {
  [key: string]: any;
}

interface FullStyle {
    global_request: string;
    layouts: Layout[];
    requests: any[]; 
    [key: string]: any;
}

interface ImageAsset {
    name: string;
    url: string;
}

interface CarouselEditorProps {
  userId: string;
  projectId: string;
  scale?: number;
}

// --- Constants ---
const AVAILABLE_FONTS = [
  { name: "Default (Arial)", value: "" }, 
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" }
];
const PROPERTIES_PANEL_WIDTH = 300;


// --- Component ---

export default function CarouselEditor({
  userId,
  projectId,
  scale = 0.5,
}: CarouselEditorProps) {
  
  // ✅ 1. Project State (Holds ALL slides' data)
  const [fullStyle, setFullStyle] = useState<FullStyle | null>(null);
  const [fullResult, setFullResult] = useState<Result[] | null>(null);
  const [imageList, setImageList] = useState<ImageAsset[]>([]);
  
  // ✅ 2. UI State
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [initialPreviewGenerated, setInitialPreviewGenerated] = useState(false);

  const stageRef = useRef<KonvaStage | null>(null);
  const supabase = getSupabaseClient();

  
  // --- Data Fetching Effect (Step 1 & 2) ---

  useEffect(() => {
    const loadProjectData = async () => {
      setLoading(true);
      try {
        const basePath = `${userId}/${projectId}/`;
        const imagesPath = `${basePath}images/`;

        // Utility function to fetch JSON
        const fetchJson = async (fileName: string) => {
          const { data, error } = await supabase.storage
            .from("carousels")
            .download(`${basePath}${fileName}`);
          if (error) throw error;
          return JSON.parse(await data.text());
        };

        const [style, result] = await Promise.all([
          fetchJson("style.json"),
          fetchJson("result.json"),
        ]);
        
        // List and sign image URLs
        const { data: imageListRaw, error: listErr } = await supabase.storage
          .from("carousels")
          .list(imagesPath, { limit: 100 });
        if (listErr) throw listErr;

        const imageFileNames = (imageListRaw ?? [])
          .filter((f) => f.name.match(/\.(png|jpg|jpeg)$/))
          .map((f) => `${imagesPath}${f.name}`);

        const { data: signedUrls, error: batchErr } = await supabase.storage
          .from("carousels")
          .createSignedUrls(imageFileNames, 60 * 60); 
        if (batchErr) throw batchErr;

        const imageAssets = signedUrls.map((u, i) => ({
          name: imageFileNames[i].replace(imagesPath, ''), // Clean filename
          url: u.signedUrl,
        }));
        
        // ✅ Set the entire project state
        setFullStyle(style as FullStyle);
        setFullResult(result as Result[]);
        setImageList(imageAssets);
        
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to load project.");
      } finally {
        setLoading(false);
      }
    };
    loadProjectData();
  }, [userId, projectId]);

  
  // --- Derived State (Step 4: No sync problem) ---
  
  const currentLayout = useMemo(() => {
    return fullStyle?.layouts[activeSlide];
  }, [fullStyle, activeSlide]);

  const currentResult = useMemo(() => {
    return fullResult?.[activeSlide];
  }, [fullResult, activeSlide]);
  
  const currentObjects = currentLayout?.objects || [];
  const selectedObject = currentObjects.find((o) => o.id === selectedId);


  // --- Handlers (Step 3: Modify the global state) ---
  
  const handleChange = useCallback((id: string, updates: Partial<LayoutObject>) => {
    setFullStyle(prevStyle => {
        if (!prevStyle) return prevStyle;

        // Deep clone to ensure immutability
        const newStyle = JSON.parse(JSON.stringify(prevStyle)) as FullStyle;
        
        // Find the current slide's objects array
        const slideObjects = newStyle.layouts[activeSlide].objects;
        
        // Apply changes to the specific object
        newStyle.layouts[activeSlide].objects = slideObjects.map(obj => 
            obj.id === id ? { ...obj, ...updates } : obj
        );

        return newStyle;
    });
  }, [activeSlide]); // Dependency on activeSlide ensures we update the correct slide


  const handleReplaceImage = (url: string, name: string) => {
    if (selectedObject) {
        handleChange(selectedObject.id, { 
            imageUrl: url, 
            imageFileName: name 
        });
        setShowReplaceModal(false);
    }
  }; 

  const handleUploadComplete = (file: ImageAsset) => {
    setImageList((prev) => [...prev, file]);
  };
  
  const getImageUrl = (id: string) =>
    imageList.find((img) => img.name === `${id}.png` || img.name === `${id}.jpg`)?.url;

  const handleCheckDeselect = (e: any) => {
      if (e.target === e.target.getStage()) {
          setSelectedId(null);
          return;
      }
  };

  const handleSaveProject = async () => {
    if (!fullStyle || !fullResult) return;
    
    try {
        // 1. Save the JSON data
        const savePromise = Promise.all([
            saveJsonToSupabase(userId, projectId, "style.json", fullStyle),
            saveJsonToSupabase(userId, projectId, "result.json", fullResult),
        ]);
        
        // 2. Generate and save the previews (or all slides) to Supabase Storage
        const exportPromise = handleExportAllSlides(false); // Change to 'true' to save all slides

        await Promise.all([savePromise, exportPromise]);
        
        alert("✅ Project saved successfully!");
    } catch (err: any) {
        console.error(err);
        alert("❌ Failed to save project: " + err.message);
    }
  };


  const handleExportAllSlides = useCallback(async (saveToDisk = false) => {
    if (!stageRef.current || !fullStyle || !fullResult) return;

    setIsExporting(true);
    const originalSlide = activeSlide;
    const projectPath = `${userId}/${projectId}/`;
    const exportPromises: Promise<any>[] = [];
    setSelectedId(null);
    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay to ensure deselection

    try {
        const stage = stageRef.current;
        const totalSlides = fullStyle.layouts.length;

        for (let i = 0; i < totalSlides; i++) {
            // 1. Temporarily change active slide (this triggers state update/re-render)
            setActiveSlide(i); 

            // Wait for the next tick to ensure Konva re-rendered the new slide content
            await new Promise(resolve => setTimeout(resolve, 2000)); 
            
            // 2. Export the current stage content (the newly rendered slide)
            const dataURL = stage.toDataURL({
                mimeType: 'image/png',
                // The current stage scale is 0.5, so we scale it up to full resolution (x2)
                pixelRatio: 1 / scale, 
            });

            if (saveToDisk) {
                // Option 1: Save to Supabase Storage (e.g., as 'preview_0.png', 'slide_1.png')
                const base64Data = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
                const blob = await fetch(dataURL).then(res => res.blob());

                exportPromises.push(
                    supabase.storage
                        .from('carousels')
                        .upload(`${projectPath}slides/slide_${i}.png`, blob, {
                            upsert: true,
                            contentType: 'image/png'
                        })
                );

            }
            if (i === 0) {
                // Option 2: Just show the first slide for immediate visual confirmation (or download)
                // If the goal is just *preview*, you might show it in a modal or new tab.
                // For simplicity, we'll just save the first slide as 'preview.png' in Supabase.
                const base64Data = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
                const blob = await fetch(dataURL).then(res => res.blob());

                console.log("Uploading preview.png to Supabase Storage...");

                exportPromises.push(
                    supabase.storage
                        .from('carousels')
                        .upload(`${projectPath}preview.png`, blob, {
                            upsert: true,
                            contentType: 'image/png'
                        })
                );
            }
        }
        
        await Promise.all(exportPromises);

    } catch (e) {
        console.error("Export failed:", e);
        alert("❌ Export failed. Check console for details.");
    } finally {
        // 3. Restore the original active slide
        setActiveSlide(originalSlide);
        setIsExporting(false);
    }
  }, [fullStyle, fullResult, userId, projectId, scale]);

    const handleGenerateAndDownloadZip = async () => {
        if (isExporting) return;
        try {
            // 1. Ensure all latest slides are rendered and uploaded to the 'slides/' subfolder
            // Note: The handleExportAllSlides(true) function now saves to:
            // 'carousels/${userId}/${projectId}/slides/slide_N.png'
            await handleExportAllSlides(true);

            // 2. Call the API route to zip and download the files
            const response = await fetch(`/api/slides-download?userId=${userId}&projectId=${projectId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Failed to start ZIP download.');
            }

            // 3. Trigger the file download in the browser
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `carousel-${projectId.substring(0, 8)}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            alert("✅ Download initiated successfully!");
            
        } catch (err: any) {
            console.error(err);
            alert("❌ Failed to download ZIP: " + err.message);
        }
    };

    const handleExportCurrentSlide = async () => {
        if (!stageRef.current) return;

        setSelectedId(null);
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay to ensure deselection

        // 1. Get the Konva stage node
        const stage = stageRef.current;

        // 2. Export the current stage content at full resolution
        const dataURL = stage.toDataURL({
            mimeType: 'image/png',
            pixelRatio: 1 / scale, 
        });

        // 3. Trigger immediate browser download (using the DataURL)
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `carousel-${projectId.substring(0, 8)}_slide-${activeSlide + 1}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    useEffect(() => {
        // 1. Check if all required dependencies are present
        if (stageRef.current && fullStyle && !loading && !initialPreviewGenerated) {
            // We only want to export the first slide for the 'preview.png' file.
            // The handleExportAllSlides(false) function does exactly this.
            
            // Use a slight delay to ensure Konva finishes its draw cycle
            const timer = setTimeout(() => {
                handleExportAllSlides(true)
                    .then(() => {
                        console.log("Initial preview.png successfully generated and all slides saved.");
                        setInitialPreviewGenerated(true); // Mark as done
                    })
                    .catch((e) => {
                        console.error("Failed to generate initial preview:", e);
                    });
            }, 1000); // 1000ms should be safe for initial Konva rendering
            
            return () => clearTimeout(timer); // Cleanup timer if component unmounts
        }
    }, [fullStyle, loading, initialPreviewGenerated, handleExportAllSlides]); // Dependencies

  // --- UI Loading/Error Checks ---

  if (loading || !fullStyle || !fullResult) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center bg-white text-gray-700 rounded-lg shadow mt-4">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-600" />
        <p>Loading project data...</p>
      </div>
    );
  }

  if (error || !currentLayout || !currentResult) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center bg-white text-center text-gray-700 px-4 rounded-lg shadow mt-4">
        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
        <h1 className="text-xl font-semibold mb-2">Error</h1>
        <p className="text-gray-600">{error || "No data found for this slide."}</p>
      </div>
    );
  }
  
  // --- Rendering ---
  
  return (
    <div className="flex flex-col md:flex-row gap-4 mt-4">
      {/* Slide Selector (Moved from Parent) */}
      <div className="bg-white rounded-2xl shadow p-6 mb-4 md:order-1 order-2 w-full md:w-auto">
          <label className="text-gray-700 font-medium mr-2">Select Slide:</label>
          <select
            className="border border-gray-300 rounded-md p-2"
            value={activeSlide}
            onChange={(e) => {
                setActiveSlide(Number(e.target.value));
                setSelectedId(null); // Deselect when changing slides
            }}
          >
            {fullStyle.layouts.map((_: any, idx: number) => (
              <option key={idx} value={idx}>
                Slide {idx + 1}
              </option>
            ))}
          </select>
      </div>
      
      {/* Left Panel (Properties) */}
      <div
        className="bg-gray-50 p-4 rounded-lg border flex flex-col gap-4 md:order-2 order-3"
        style={{ width: PROPERTIES_PANEL_WIDTH, minWidth: PROPERTIES_PANEL_WIDTH }}
      >
        <h3 className="font-semibold text-gray-700">Properties</h3>
        {selectedObject ? (
          <>
            {/* ... Inputs use currentObjects for state ... */}
            <p className="text-sm text-gray-600 font-medium">{selectedObject.id}</p>

            <div className="flex gap-4">
                <div className="flex flex-col">
                    <label className="text-sm text-gray-600">X:</label>
                    <input 
                        type="number" 
                        value={Math.round(selectedObject.x)} 
                        onChange={(e) => handleChange(selectedObject.id, { x: Number(e.target.value) })} 
                        // Constrain width and center text for numerical input
                        className="border p-1 rounded w-20 text-center" 
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm text-gray-600">Y:</label>
                    <input 
                        type="number" 
                        value={Math.round(selectedObject.y)} 
                        onChange={(e) => handleChange(selectedObject.id, { y: Number(e.target.value) })} 
                         // Constrain width and center text for numerical input
                        className="border p-1 rounded w-20 text-center" 
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex flex-col">
                    <label className="text-sm text-gray-600">Width:</label>
                    <input 
                        type="number" 
                        value={Math.round(selectedObject.width || 0)} 
                        onChange={(e) => handleChange(selectedObject.id, { width: Number(e.target.value) })} 
                        // Constrain width and center text for numerical input
                        className="border p-1 rounded w-20 text-center" 
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm text-gray-600">Height:</label>
                    <input 
                        type="number" 
                        value={Math.round(selectedObject.height || 0)} 
                        onChange={(e) => handleChange(selectedObject.id, { height: Number(e.target.value) })} 
                        // Constrain width and center text for numerical input
                        className="border p-1 rounded w-20 text-center" 
                    />
                </div>
            </div>

           {
            selectedObject.type === "circle" && (
            <div className="flex gap-10">
                <label className="text-sm text-gray-600">Radius:</label>
                <input 
                    type="number" 
                    value={Math.round(selectedObject.radius || 0)} 
                    onChange={(e) => handleChange(selectedObject.id, { radius: Number(e.target.value) })} 
                    // Constrain width and center text for numerical input
                    className="border p-1 rounded w-20 text-center" 
                />
            </div>
            )
           } 

            {["text", "rectangle"].includes(selectedObject.type) && (
            <>
            <div className="flex gap-10">
            <label className="text-sm text-gray-600">Color:</label>
                <input
                type="color"
                value={selectedObject.fill || "#000000"}
                onChange={(e) =>
                    handleChange(selectedObject.id, { fill: e.target.value })
                }
                className="border p-1 rounded w-16 h-8"
                />
            </div>
            </>
            )}

            {selectedObject.type === "text" && (
            <>
                <label className="text-sm text-gray-600">Text:</label>
                <input
                type="text"
                // Fallback to result if text is not defined in the object
                value={selectedObject.text || currentResult[selectedObject.id] || ""} 
                onChange={(e) =>
                    handleChange(selectedObject.id, { text: e.target.value })
                }
                className="border p-1 rounded w-full"
                />

                <div className="flex gap-10">
                    <label className="text-sm text-gray-600">Font Size:</label>
                    <input
                    type="number"
                    value={selectedObject.fontSize || 0}
                    onChange={(e) =>
                        handleChange(selectedObject.id, { fontSize: Number(e.target.value) })
                    }
                    className="border p-1 rounded w-14 text-center"
                    />
                </div>
                <div className="flex gap-10">
                  <label className="text-sm text-gray-600">Font:</label>
                  <select
                      value={selectedObject.fontFamily || ""}
                      onChange={(e) =>
                          handleChange(selectedObject.id, { fontFamily: e.target.value })
                      }
                      className="border p-1 rounded w-full"
                      style={{ fontFamily: selectedObject.fontFamily || "Arial" }}
                  >
                      {AVAILABLE_FONTS.map((font) => (
                          <option key={font.value} value={font.value}>
                              {font.name}
                          </option>
                      ))}
                  </select>
                </div>
                
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

        <div className="flex flex-col gap-2 mt-auto">
            <button
                onClick={handleSaveProject}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                💾 Save Project
            </button>
            <div className="flex flex-col gap-2 mt-auto">
            <button
                onClick={handleExportCurrentSlide}
                className="flex items-center justify-center space-x-2 px-4 py-2 rounded font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
                <Download className="w-5 h-5" />
                <span>Export Current Slide (PNG)</span>
            </button>
            <button
                // Use the new combined handler
                onClick={handleGenerateAndDownloadZip} 
                disabled={isExporting}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded font-medium transition-colors border ${
                isExporting 
                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
                <Download className="w-5 h-5" />
                <span>Export All Slides (ZIP)</span>
            </button>
        </div>
        </div>
      </div>

      {/* Right panel: Konva stage (Order 3) */}
      <div
        className="md:order-3 order-1"
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stage
          ref={stageRef}
          width={currentLayout.scene.width * scale}
          height={currentLayout.scene.height * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleCheckDeselect}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={currentLayout.scene.width}
              height={currentLayout.scene.height}
              fill={currentLayout.scene.background}
              listening={false}
              draggable={false}
            />
          </Layer>
          <Layer>
            {currentObjects.map((obj) => {
              const commonProps = {
                key: obj.id,
                object: obj,
                resultData: currentResult,
                isSelected: obj.id === selectedId,
                onSelect: () => setSelectedId(obj.id),
                onChange: (updates: Partial<LayoutObject>) =>
                  handleChange(obj.id, updates),
              };
              switch (obj.type) {
                case "text":
                  return <TextObject {...commonProps} />;
                case "rectangle":
                  return <RectangleObject {...commonProps} />;
                case "circle":
                  return <CircleObject {...commonProps} />;
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

            {/* Transformer Component (needs currentObjects to find the node) */}
            <TransformerComponent 
                selectedId={selectedId} 
                stageRef={stageRef} 
            />
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

// TransformerComponent remains the same...
function TransformerComponent({
  selectedId,
  stageRef,
}: {
  selectedId: string | null;
  stageRef: React.RefObject<KonvaStage>;
}) {
  const transformerRef = useRef<KonvaTransformer | null>(null);

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