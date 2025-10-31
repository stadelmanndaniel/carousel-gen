import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service";


export async function POST(req: NextRequest) {

  const RUNPOD_URL = process.env.RUNPOD_ENDPOINT_URL;
  const RUNPOD_KEY = process.env.RUNPOD_API_KEY;

  if (!RUNPOD_URL || !RUNPOD_KEY) {
    return NextResponse.json({ 
        error: "Server configuration missing: RUNPOD_ENDPOINT_URL or RUNPOD_API_KEY not set." 
    }, { status: 500 });
  }

  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Debug logging (without exposing secrets)
    console.log("Environment check:", {
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlLength: SUPABASE_URL?.length || 0,
      serviceRoleKeyLength: SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    });

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      const missing = [];
      if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
      if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ 
        error: `Server configuration missing: ${missing.join(", ")} not set. Please check your .env.local file and restart the dev server.` 
      }, { status: 500 });
    }

    // Prefer centralized helper which validates configuration
    const supabase = getSupabaseServiceRoleClient();
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
    // --- Subscription Check ---
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('id', user_id)
        .single();
    
    if (profileError || !profileData) {
        console.error("Profile fetch error:", profileError);
        return NextResponse.json({ error: "Could not verify user profile." }, { status: 500 });
    }

    const subscriptionStatus = profileData.subscription_status;
    const trialEndsAt = profileData.trial_ends_at;
    const GENERATION_LIMIT = 20;


    // Deny access if the user's status is not 'active'
    if (subscriptionStatus !== 'active'){
      console.log(`User ${user_id} subscription status: ${subscriptionStatus}`);
       if (trialEndsAt) {
        const trialEndDate = new Date(trialEndsAt);
        const now = new Date();
        if (trialEndDate > now) {
          const { count, error: countError } = await supabase
            .from('user_projects')
            .select('project_id', { count: 'exact', head: true }) 
            .eq('user_id', user_id);

          if (countError) {
              console.error("Project count fetch error:", countError);
              return NextResponse.json({ error: "Could not retrieve user project count." }, { status: 500 });
          }

          const projectCount = count || 0;

          console.log(`User ${user_id} has created ${projectCount} projects.`);
          
          // 2. Check if the generation limit is exceeded
          if (projectCount >= GENERATION_LIMIT) {
              // Deny access if limit is hit (403 Forbidden)
              return NextResponse.json({
                  error: "Generation limit reached",
                  message: `Free users are limited to ${GENERATION_LIMIT} generations. Please subscribe to continue.`
              }, { status: 403 });
          }
        }
      } else {
        return NextResponse.json({ 
            error: "Subscription required", 
            message: "You must have an active subscription to generate content and your trial period is expired."
        }, { status: 403 });
      }
    }

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

    const runpodResponse = await fetch(`${RUNPOD_URL}/runsync`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Authorization is required for the RunPod endpoint
        "Authorization": `Bearer ${RUNPOD_KEY}`, 
      },
      // The payload must be wrapped under the 'input' key for the Job Handler
      body: JSON.stringify({ input: payload }), 
    });

    if (!runpodResponse.ok) {
      // Handle HTTP errors from RunPod itself
      const errText = await runpodResponse.text();
      throw new Error(`RunPod API HTTP error: ${runpodResponse.status} ${errText}`);
    }

    const runpodResult = await runpodResponse.json();

    // Check RunPod status for errors returned from the handler function
    if (runpodResult.status === "FAILED") {
        // The error field from the Python handler is typically returned here
        throw new Error(`RunPod Job failed: ${runpodResult.error || "Unknown server error."}`);
    }
    
    if (runpodResult.status !== "COMPLETED" || !runpodResult.output) {
        // Should not happen with runsync, but a safety check
        throw new Error(`RunPod Job did not return a completed output. Status: ${runpodResult.status}`);
    }

    // Extract the final generated data from the 'output' field
    const generatedData = runpodResult.output;
    // --- RUNPOD INTEGRATION END ---

    // --- Supabase Storage ---
    const project_id = uuidv4();
    const folderPath = `${user_id}/${project_id}/`;
    const imageFolderPath = `${folderPath}images/`;

    // 🎯 STEP 1: Insert into projects table
    // const projectName = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
    const projectName = generatedData.carousel_name || (prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt);
    const { error: projectInsertError } = await supabase.from('projects').insert([
        { id: project_id, name: projectName },
    ]);
    if (projectInsertError) {
        console.error("Project insertion failed:", projectInsertError);
        throw projectInsertError;
    }

    // 🎯 STEP 2: Link user to project in user_projects table
    const { error: userProjectInsertError } = await supabase.from('user_projects').insert([
        { user_id: user_id, project_id: project_id, role: 'owner' },
    ]);
    if (userProjectInsertError) {
        console.error("User-Project link failed:", userProjectInsertError);
        throw userProjectInsertError;
    }
    
    // a) Save style JSON
    await supabase.storage
      .from("carousels")
      .upload(`${folderPath}style.json`, JSON.stringify(template), {
        contentType: "application/json",
      });

    // --- Prepare updated result ---
    const updatedResult = [];

    // b) Process each slide: upload images & replace base64 with filenames
    for (const slide of generatedData.slides) {
      const updatedSlide: Record<string, any> = {};

      for (const [id, base64] of Object.entries(slide)) {
        if (typeof base64 === "string" && base64.startsWith("iVBOR")) {
          // Upload image
          const imagePath = `${imageFolderPath}${id}.png`;

          // Convert base64 to binary buffer
          const buffer = Buffer.from(base64, "base64");

          const { error: uploadErr } = await supabase.storage
            .from("carousels")
            .upload(imagePath, buffer, { contentType: "image/png" });

          if (uploadErr) {
            console.error("Image upload failed:", uploadErr);
            throw uploadErr;
          }

          // Replace base64 with file path in storage
          updatedSlide[id] = id + ".png";
        } else {
          // Keep non-image fields as-is
          updatedSlide[id] = base64;
        }
      }

      updatedResult.push(updatedSlide);
    }

    // c) Save result JSON (now referencing image paths instead of base64)
    await supabase.storage
      .from("carousels")
      .upload(`${folderPath}result.json`, JSON.stringify(updatedResult, null, 2), {
        contentType: "application/json",
      });

    return NextResponse.json({ project_id });

  } catch (e: any) {
    console.error("/api/generate failed:", e);
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
