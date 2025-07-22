from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from service.generate import generate
import uvicorn

app = FastAPI()

class MessageRequest(BaseModel):
    message: str

@app.post("/send-message")
async def send_message(req: MessageRequest):
    message = generate(req.message)
    response_data = {"response": message}
    return JSONResponse(content=response_data)

if __name__ == "__main__":
    uvicorn.run(app, host='127.0.0.1', port=8000, reload=True)