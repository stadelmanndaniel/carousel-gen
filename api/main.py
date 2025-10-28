import os
import re
import base64
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Any, Dict 
from google import genai
from google.genai import types

# --- Initialization ---
try:
    # Initialize client, which requires the API key to be set
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    if not os.environ.get("GEMINI_API_KEY"):
         raise ConnectionError("GEMINI_API_KEY environment variable is not set.")
except Exception as e:
    print(f"WARNING: AI Client initialization failed: {e}")
    client = None

app = FastAPI()

# --- Pydantic Models for Structured Input ---

# LayoutItem class has been removed as it is no longer part of the API input structure.

# ContentRequest is updated to include the optional aspect_ratio for images
class ContentRequest(BaseModel):
    id: str
    type: Literal["text", "image"]
    instruction: str
    aspect_ratio: Optional[str] = "16:9" # Default aspect ratio for images

class RequestInput(BaseModel):
    local_context: Optional[str] = None
    content: List[ContentRequest]

class PromptInput(BaseModel):
    # The core concept of the carousel 
    prompt: str
    # The overall instruction template 
    global_request: str
    
    # The decoupled array of slides, where each item is a list of content requests for that slide.
    requests: List[RequestInput]


# 2. Function to generate image based on description
def generate_image(image_description: str, aspect_ratio: str = "16:9") -> str | None:
    """
    Generates an image based on the provided description and returns the 
    Base64 encoded image string.
    """
    if not client:
        raise ConnectionError("AI Client not initialized or API Key missing.")

    try:
        print(f"Generating image with prompt: '{image_description}...' (Ratio: {aspect_ratio})")
        
        response = client.models.generate_content(
            model="gemini-2.5-flash-image-preview", 
            contents=[image_description],
            config=types.GenerateContentConfig(
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio,
                ),
            )
        )

        for part in response.candidates[0].content.parts:
            if part.inline_data is not None and part.inline_data.data:
                raw_image_data = part.inline_data.data
                
                # Base64 encode the raw binary data and decode to a string for JSON serialization
                if isinstance(raw_image_data, bytes):
                    encoded_bytes = base64.b64encode(raw_image_data)
                    return encoded_bytes.decode('utf-8') 
                
                return raw_image_data
        
        print("No image data found in the response.")
        return None

    except Exception as e:
        print(f"Error generating image: {e}")
        raise RuntimeError(f"Image generation failed: {e}")

# 3. Function to generate a single piece of text content
def generate_text_content(text_generation_prompt) -> str:
    """
    Generates a single, specific text string based on the full context and a specific instruction.
    """
    if not client:
        raise ConnectionError("AI Client not initialized or API Key missing.")

    try:
        # Combine the global context with the specific instruction
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[text_generation_prompt]
        )

        # Simply return the raw text output, stripped of whitespace
        return response.candidates[0].content.parts[0].text

    except Exception as e:
        print(f"Error generating text content: {e}")
        raise Exception(f"AI content generation failed: {e}")



# 4. Define the main API endpoint
# The response returns content indexed by slide, without the layout information.
@app.post("/api/generate_content", response_model=List[Dict[str, Any]])
async def handle_content_generation(input_data: PromptInput):
    """
    Accepts a structured carousel input, iterates through slides and content requests,
    generates content (text and images), and returns the results decoupled from layout.
    """
    try:
        # Step 1: Prepare the global LLM prompt by substituting the user's prompt

        full_llm_prompt = input_data.global_request.replace("{prompt}", input_data.prompt)
        full_llm_prompt += "\n\n"
        for slide_index, slide_requests in enumerate(input_data.requests):
            full_llm_prompt += f"--- Slide {slide_index + 1} Requests ---\n"
            if slide_requests.local_context:
                full_llm_prompt += f"Context: {slide_requests.local_context}\n"
            else:
                full_llm_prompt += "Generate the content for a slide that adheres to the global theme\n"
            
            local_instructions = ""
            local_formatting = ""
            for request_index, request in enumerate(slide_requests.content):
                local_instructions += f"{request_index + 1}. For element ID '{request.id}', {request.instruction}\n"
                if request.type == "text":
                    local_formatting += f"{request.id}: <generated text here>\n"
                elif request.type == "image":
                    local_formatting += f"{request.id}: <generated image description>\n"

            full_llm_prompt += "\nPlease generate:\n"
            full_llm_prompt += local_instructions
            full_llm_prompt += "\nFormat your answer strictly as follows, ensuring each instruction are contained on a single line:\n"
            full_llm_prompt += local_formatting
            full_llm_prompt += "\n\n"

        print("Full LLM Prompt prepared:")
        print(full_llm_prompt)

        LLM_response = generate_text_content(full_llm_prompt)
        print("LLM Response received:")
        print(LLM_response)

        final_response = []

        for slide_index, slide_requests in enumerate(input_data.requests):
            local_final_response = dict()
            print(f"\n--- Processing Slide {slide_index + 1} ---")
            for request_index, request in enumerate(slide_requests.content):
                if request.type == "text":
                    # Extract the generated text for this element from the LLM response
                    pattern = rf"{request.id}:\s*(.*)"
                    match = re.search(pattern, LLM_response)
                    generated_text = match.group(1).strip() if match else "Text generation failed."
                    local_final_response[request.id] = generated_text
                elif request.type == "image":
                    # Extract the image description for this element from the LLM response
                    pattern = rf"{request.id}:\s*(.*)"
                    match = re.search(pattern, LLM_response)
                    image_description_prompt = match.group(1).strip() if match else "A vibrant image for the carousel slide following the content theme: {prompt}".replace("{prompt}", input_data.prompt)
                        
                    base64_image = generate_image(image_description_prompt, aspect_ratio=request.aspect_ratio)
                    local_final_response[request.id] = base64_image
            final_response.append(local_final_response)

            
        return final_response
        
    except ConnectionError as e:
        raise HTTPException(
            status_code=503, 
            detail="AI Service Unavailable: API Key missing or client initialization failed."
        )
    except RuntimeError as e:
         raise HTTPException(
            status_code=500,
            detail=f"Image Generation Error: {e}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Content Generation Error: {e}"
        )

# Optional: A root endpoint to confirm the server is running
@app.get("/")
def read_root():
    return {"status": "API is ready. Use POST /api/generate_content to test AI functionality."}
