from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from web_socket import ep
from db import connect_database, close_db
from connection_manager import WebSocketConnectionManager
from asyncio import create_task

manager = WebSocketConnectionManager()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ep, prefix="/ws")

async def startup_event():
    await connect_database(app)
    create_task(manager.check_inactivity())

async def shutdown_event():
    await close_db()

app.add_event_handler("startup", startup_event)
app.add_event_handler("shutdown", shutdown_event)

if __name__ == "__main__":
    workers = 2
    gunicorn_command = [
        "gunicorn",
        f"-w {workers}",
        "-k uvicorn.workers.UvicornWorker",
        "pekanu_ws:app",
        "--bind", "0.0.0.0:2508",
        "--reload"
    ]
    import subprocess
    subprocess.run(gunicorn_command)
