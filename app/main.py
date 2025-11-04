# app/main.py
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from app.routers.crypto import router as crypto_router
from app.utils.simulator import start_simulation

app = FastAPI(default_response_class=ORJSONResponse)

app.include_router(crypto_router)

start_simulation()
