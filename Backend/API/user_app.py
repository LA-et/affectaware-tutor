from fastapi import FastAPI, Response, Request
from Core.db import connect_database, close_db
from API.account import user
from API.course import course
from API.content import content
from API.videos import vid
from logging import getLogger, INFO, ERROR, FileHandler, Formatter
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Message, Receive, Scope, Send
from fastapi.middleware.cors import CORSMiddleware
# from prometheus_fastapi_instrumentator import Instrumentator

# formatter = Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# logger = getLogger(__name__)
# logger.setLevel(INFO)
# log_file = "Logs/user_app.log"
# file_handler = FileHandler(log_file)
# file_handler.setFormatter(formatter)
# logger.addHandler(file_handler)

# error_logger = getLogger("error_logger")
# error_logger.setLevel(ERROR)
# error_log_file = "Logs/user_error.log"
# error_file_handler = FileHandler(error_log_file)
# error_file_handler.setFormatter(formatter)
# error_logger.addHandler(error_file_handler)

# class LoggingMiddleware(BaseHTTPMiddleware):
#    def __init__(self, app: ASGIApp) -> None:
#       super().__init__(app)

#    async def dispatch(self, request: Request, call_next: ASGIApp) -> Response:
#       client_ip = request.headers.get("CF-Connecting-IP", request.client.host)
#       response = await call_next(request)
#       logger.info(f"IP: {client_ip}, Method: {request.method}, URL: {request.url}, Response: {response.status_code}")
#       return response

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

# app.add_middleware(LoggingMiddleware)

# Instrumentator().instrument(app).expose(app)

app.include_router(user, prefix="/user")
app.include_router(course, prefix="/course")
app.include_router(content, prefix="/content")
app.include_router(vid, prefix="/video")

async def startup_event():
    # logger.info("Server starting up...")
    await connect_database(app)
    # logger.info("Established connection with MongoDB")

async def shutdown_event():
    # logger.info("Terminating connection with MongoDB")
    await close_db()
    # logger.info("Server shutting down...")

app.add_event_handler("startup", startup_event)
app.add_event_handler("shutdown", shutdown_event)

if __name__ == "__main__":
    workers = 2
    gunicorn_command = [
        "gunicorn",
        f"-w {workers}",
        "-k uvicorn.workers.UvicornWorker",
        "user_app:app", 
        "--bind", "0.0.0.0:2506",
        "--reload"
    ]
    import subprocess
    subprocess.run(gunicorn_command)
