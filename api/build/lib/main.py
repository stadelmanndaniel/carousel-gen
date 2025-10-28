from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
from google.genai import types
import re

client = genai.Client()

def generate_carousel_content(ad_prompt: str):
    """
    Generates an image description, title, and subtitle using a text-based 
    GenAI model based on a user's ad prompt.
    """
    try:
        # text_model = client.models.get("gemini-1.5-flash") # Use a capable text model

        # Craft a prompt for the text model to generate structured output
        text_generation_prompt = f"""
        Given the following request: "{ad_prompt}"

        Please generate:
        1. An evocative, detailed image description suitable for a text-to-image model. Focus on composition, lighting, and mood.
        2. A catchy, concise title for an Instagram carousel post.
        3. A descriptive, engaging subtitle for Instagram carousel post.

        Format your response strictly as follows:

        IMAGE_DESCRIPTION: [Your detailed image description here]
        TITLE: [Your ad title here]
        SUBTITLE: [Your ad subtitle here]
        """

        print("Generating ad text and image description...")
        # response = text_model.generate_content(text_generation_prompt)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[text_generation_prompt]
        )


        # Extract content using regex
        text_output = response.candidates[0].content.parts[0].text
        
        img_desc_match = re.search(r"IMAGE_DESCRIPTION:\s*(.*)", text_output)#, re.DOTALL)
        title_match = re.search(r"TITLE:\s*(.*)", text_output)
        subtitle_match = re.search(r"SUBTITLE:\s*(.*)", text_output)

        image_description = img_desc_match.group(1).strip() if img_desc_match else f"A vibrant ad for {ad_prompt.lower()}"
        title = title_match.group(1).strip() if title_match else f"Delicious {ad_prompt.split(' for ')[-1].title()}"
        subtitle = subtitle_match.group(1).strip() if subtitle_match else "Experience a taste sensation!"

        return image_description, title, subtitle

    except Exception as e:
        print(f"Error generating text content: {e}")
        # Fallback values if text generation fails
        return (
            f"A vibrant image for {ad_prompt.lower()}",
            f"Your content for {ad_prompt.split(' for ')[-1].title()}",
            "Simply irresistible!"
        )

# Initialize the FastAPI application
app = FastAPI()

# 1. Define the input structure using Pydantic
class TextInput(BaseModel):
    text: str

# 2. Define the API endpoint to handle POST requests
@app.post("/api/hello")
def create_hello_message(input_data: TextInput):
    """
    Accepts a JSON payload with a 'text' field and returns a greeting.
    """
    input_text = input_data.text
    return {"message": f"Hello world, {input_text}"}

# Optional: A root endpoint to confirm the server is running
@app.get("/")
def read_root():
    return {"status": "API is ready"}
