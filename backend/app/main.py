# app/main.py
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from app.routers.crypto import router as crypto_router
from app.utils.simulator import start_simulation
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(default_response_class=ORJSONResponse)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your Lovable domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crypto_router)

start_simulation()
