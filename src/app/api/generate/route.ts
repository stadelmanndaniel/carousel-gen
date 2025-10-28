import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";


export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userRes.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userRes.user.id;

    const body = await req.json().catch(() => ({}));
    const { prompt, style_id } = body ?? {};
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
    if (!style_id || typeof style_id !== "string") {
      return NextResponse.json({ error: "Missing style_id" }, { status: 400 });
    }

    // Load the JSON style template
    const jsonPath = path.join(process.cwd(), "src", "data", `${style_id}.json`);
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: `Style not found: ${style_id}` }, { status: 404 });
    }
    const rawJson = fs.readFileSync(jsonPath, "utf8");
    const template = JSON.parse(rawJson);

    // Build payload for Python API
    const payload = {
      prompt,
      global_request: template.global_request,
      requests: template.requests,
    };

    // Call Python API
    const pythonResponse = await fetch("http://127.0.0.1:8000/api/generate_content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!pythonResponse.ok) {
      const errText = await pythonResponse.text();
      throw new Error(`Python API error: ${pythonResponse.status} ${errText}`);
    }

    const generatedData = await pythonResponse.json();

    // --- Supabase Storage ---
    const project_id = uuidv4();
    const folderPath = `${user_id}/${project_id}/`;

    // a) Save style JSON
    await supabase.storage
      .from("carousels")
      .upload(`${folderPath}style.json`, JSON.stringify(template), { contentType: "application/json" });

    // b) Save result JSON
    await supabase.storage
      .from("carousels")
      .upload(`${folderPath}result.json`, JSON.stringify(generatedData), { contentType: "application/json" });

    // c) Save images
    for (const slide of generatedData) {
      for (const [id, base64] of Object.entries(slide)) {
        if (typeof base64 === "string" && base64.startsWith("iVBOR")) {
          const blob = await fetch(`data:image/png;base64,${base64}`).then((res) => res.blob());
          await supabase.storage.from("carousels").upload(`${folderPath}${id}.png`, blob);
        }
      }
    }

    return NextResponse.json({ project_id });

  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
