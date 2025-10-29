"use client";

import { useSearchParams } from "next/navigation";

export default function CarouselPage() {
  const searchParams = useSearchParams();
  const project_id = searchParams.get("project_id");

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>Carousel Viewer</h1>
      <p>Project ID: {project_id}</p>
      <p>Loading carousel content here… (to be implemented)</p>
    </div>
  );
}