from fastapi import FastAPI
from pydantic import BaseModel

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
