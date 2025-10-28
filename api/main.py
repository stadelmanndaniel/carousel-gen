import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
import re
import base64 # <-- NEW IMPORT

# --- Initialization ---
# IMPORTANT: You must provide your Google AI API Key.
# For Vercel, set this as a secret environment variable (e.g., GEMINI_API_KEY).
# For local development, set it in your shell or .env file.
try:
    # Initialize client, which requires the API key to be set
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    # Check if the API key is actually set, as image models often fail silently otherwise
    if not os.environ.get("GEMINI_API_KEY"):
         raise ConnectionError("GEMINI_API_KEY environment variable is not set.")
except Exception as e:
    print(f"WARNING: AI Client initialization failed: {e}")
    client = None

app = FastAPI()

# 1. Define the input structure using Pydantic
class PromptInput(BaseModel):
    # The input text, which will be the description of the carousel
    ad_prompt: str
    aspect_ratio: str = "16:9"  # Default aspect ratio

# 2. Function to generate image based on description
def generate_image(image_description: str, aspect_ratio: str = "16:9") -> str | None:
    """
    Generates an image based on the provided description using gemini-2.5-flash-image
    and returns the Base64 encoded image string.
    """
    if not client:
        raise ConnectionError("AI Client not initialized or API Key missing.")

    try:
        print(f"Generating ad image with description: '{image_description[:50]}...'")
        
        response = client.models.generate_content(
            model="gemini-2.5-flash-image-preview", # Using the image generation flash model
            contents=[image_description],
            config=types.GenerateContentConfig(
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio,
                ),
            )
        )

        for part in response.candidates[0].content.parts:
            # The Base64 data is inside the inline_data field
            if part.inline_data is not None and part.inline_data.data:
                
                raw_image_data = part.inline_data.data
                
                # --- CORRECTED FIX: Explicitly encode binary data to Base64 string ---
                # If the SDK returns raw binary bytes (a common behavior), we must:
                # 1. Base64 encode the bytes (base64.b64encode)
                # 2. Decode the resulting Base64 bytes to a standard UTF-8 string (decode('utf-8'))
                if isinstance(raw_image_data, bytes):
                    encoded_bytes = base64.b64encode(raw_image_data)
                    return encoded_bytes.decode('utf-8') 
                
                # If it's already a string (str), return it directly.
                return raw_image_data
        
        print("No image data found in the response.")
        return None

    except Exception as e:
        print(f"Error generating ad image: {e}")
        # Re-raise as a distinct exception type for clearer handling in the main route
        raise RuntimeError(f"Image generation failed: {e}")


# 3. Function to interact with the Gemini API (Your core text logic)
def generate_carousel_content(ad_prompt: str):
    """
    Generates an image description, title, and subtitle using a text-based 
    GenAI model based on a user's ad prompt.
    """
    if not client:
        raise ConnectionError("AI Client not initialized or API Key missing.")

    try:
        text_generation_prompt = f"""
        Given the following ad concept: "{ad_prompt}"

        Please generate:
        1. An evocative, detailed image description suitable for a text-to-image model. Focus on composition, lighting, and mood.
        2. A catchy, concise title for an Instagram carousel post (10 words max).
        3. A descriptive, engaging subtitle for Instagram carousel post (20 words max).

        Format your response strictly as follows, ensuring the title and subtitle are contained on single lines:

        IMAGE_DESCRIPTION: [Your detailed image description here]
        TITLE: [Your ad title here]
        SUBTITLE: [Your ad subtitle here]
        """

        print(f"Generating ad text and image description for prompt: {ad_prompt[:30]}...")
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[text_generation_prompt]
        )

        # Extract content using regex
        text_output = response.candidates[0].content.parts[0].text
        
        img_desc_match = re.search(r"IMAGE_DESCRIPTION:\s*(.*)", text_output)
        title_match = re.search(r"TITLE:\s*(.*)", text_output)
        subtitle_match = re.search(r"SUBTITLE:\s*(.*)", text_output)

        image_description = img_desc_match.group(1).strip() if img_desc_match else f"A vibrant ad for {ad_prompt.lower()}"
        title = title_match.group(1).strip() if title_match else f"Content for: {ad_prompt.split(' for ')[-1].title()}"
        subtitle = subtitle_match.group(1).strip() if subtitle_match else "Experience the best of our product!"

        return {
            "image_description": image_description, 
            "title": title, 
            "subtitle": subtitle
        }

    except Exception as e:
        print(f"Error generating text content: {e}")
        # Raise an exception for the FastAPI handler to catch
        raise Exception(f"AI content generation failed: {e}")


# 4. Define the main API endpoint
@app.post("/api/generate_content")
async def handle_content_generation(input_data: PromptInput):
    """
    Accepts an ad prompt, generates structured content and an image, and returns both.
    The image is returned as a Base64 string.
    """
    try:
        # Step 1: Generate text content and get the image description
        content = generate_carousel_content(input_data.ad_prompt)
        
        # Step 2: Generate the image using the description from Step 1
        base64_image = generate_image(content["image_description"], aspect_ratio=input_data.aspect_ratio)
        
        # Step 3: Combine all results
        response_data = {
            "title": content["title"],
            "subtitle": content["subtitle"],
            "image_description": content["image_description"],
            # Return the Base64 image data
            "base64_image": base64_image
        }
        
        return response_data
        
    except ConnectionError as e:
        raise HTTPException(
            status_code=503, 
            detail="AI Service Unavailable: API Key missing or client initialization failed."
        )
    except RuntimeError as e:
         # Catch errors specifically from the image generation step
         raise HTTPException(
            status_code=500,
            detail=f"Image Generation Error: {e}"
        )
    except Exception as e:
        # Catch errors from the text generation step
        raise HTTPException(
            status_code=500,
            detail=f"Content Generation Error: {e}"
        )

# Optional: A root endpoint to confirm the server is running
@app.get("/")
def read_root():
    return {"status": "API is ready. Use POST /api/generate_content to test AI functionality."}
