import base64
import os
from google import genai
from google.genai import types


def generate(message:str):
    client = genai.Client(
        api_key=os.getenv("GOOGLE_API_KEY")
    )
    model = "gemini-2.5-flash"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=message),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config = types.ThinkingConfig(
            thinking_budget=-1,
        ),
        response_mime_type="text/plain",
        system_instruction=[
            types.Part.from_text(text="""Behave like a financial advisor"""),
        ],
    )
    return client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    ).text
if __name__ == "__main__":
    response=generate("I have 1 lac ruppes how to invest it?")
    print(response)
