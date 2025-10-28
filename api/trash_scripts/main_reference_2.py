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

class PromptInput(BaseModel):
    # The core concept of the carousel 
    prompt: str 
    # The overall instruction template 
    global_request: str
    
    # The decoupled array of slides, where each item is a list of content requests for that slide.
    requests: List[List[ContentRequest]]


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
def generate_text_content(full_context_prompt: str, instruction: str) -> str:
    """
    Generates a single, specific text string based on the full context and a specific instruction.
    """
    if not client:
        raise ConnectionError("AI Client not initialized or API Key missing.")

    try:
        # Combine the global context with the specific instruction
        text_generation_prompt = f"{full_context_prompt}\n\n**Specific Content Request:** {instruction}\n\n**Output:**"

        print(f"Generating text content for instruction: {instruction[:50]}...")
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[text_generation_prompt]
        )

        # Simply return the raw text output, stripped of whitespace
        return response.candidates[0].content.parts[0].text.strip()

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
        
        final_response = []
        
        # Step 2: Iterate over each slide's list of requests
        for slide_index, slide_requests in enumerate(input_data.requests):
            slide_output = {
                "slide_index": slide_index,
                "content": {} # Content generated for elements by ID
            }
            
            # Step 3: Fulfill content requests for elements on the current slide
            for request in slide_requests:
                
                element_id = request.id
                instruction = request.instruction
                
                if request.type == "text":
                    # Generate text content
                    generated_text = generate_text_content(full_llm_prompt, instruction)
                    slide_output["content"][element_id] = {"type": "text", "value": generated_text}
                    
                elif request.type == "image":
                    # For images, we must first turn the high-level instruction into a detailed prompt
                    image_prompt_instruction = f"Generate a detailed, cinematic image description (80 words max) based on the instruction: '{instruction}'"
                    image_prompt = generate_text_content(full_llm_prompt, image_prompt_instruction)
                    
                    # Then, generate the Base64 image, passing the specific aspect ratio
                    base64_image = generate_image(image_prompt, aspect_ratio=request.aspect_ratio)
                    
                    slide_output["content"][element_id] = {
                        "type": "image", 
                        "value": base64_image,
                        "image_description_used": image_prompt 
                    }

            final_response.append(slide_output)
            
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
