from os.path import abspath, join, dirname
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "./"))
path.append(base_dir)

from typing import Dict
from threading import Timer
from datetime import datetime, timedelta
from fastapi import WebSocket
from fastapi.websockets import WebSocketState
from asyncio import sleep
from telegram import senderror, PROJECT_NAME

class WebSocketConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.last_activity: Dict[str, datetime] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        try:
            await websocket.accept()
            if user_id in self.active_connections:
                old_ws = self.active_connections[user_id]
                if old_ws.client_state != WebSocketState.DISCONNECTED:
                    try:
                        await old_ws.close(code=1001, reason="New connection established")
                    except RuntimeError:
                        pass
            self.active_connections[user_id] = websocket
            self.last_activity[user_id] = datetime.now()
        except Exception as err:
            exc_type, exc_obj, exc_tb = exc_info()
            await senderror(f"PROJECT: {PROJECT_NAME}\nFile: connection_manager.py\nFunction: connect()\nLine: {exc_tb.tb_lineno}\nError Type: {exc_type.__name__}\nError: {err}")
            await websocket.close(code=1008, reason="Connection error")
            return None

    async def disconnect(self, user_id: str):
        try:
            if user_id in self.active_connections:
                try:
                    await self.active_connections[user_id].close()
                except Exception:
                    pass
                del self.active_connections[user_id]
                del self.last_activity[user_id]
        except Exception as err:
            exc_type, exc_obj, exc_tb = exc_info()
            await senderror(f"PROJECT: {PROJECT_NAME}\nFile: connection_manager.py\nFunction: disconnect()\nLine: {exc_tb.tb_lineno}\nError Type: {exc_type.__name__}\nError: {err}")
            return None

    async def send_message(self, user_id: str, message: dict):
        try:
            if user_id in self.active_connections:
                await self.active_connections[user_id].send_json(message)
        except Exception as err:
            exc_type, exc_obj, exc_tb = exc_info()
            await senderror(f"PROJECT: {PROJECT_NAME}\nFile: connection_manager.py\nFunction: send_message()\nLine: {exc_tb.tb_lineno}\nError Type: {exc_type.__name__}\nError: {err}")
            return None

    async def update_activity(self, user_id: str):
        try:
            if user_id in self.last_activity:
                self.last_activity[user_id] = datetime.now()
        except Exception as err:
            exc_type, exc_obj, exc_tb = exc_info()
            await senderror(f"PROJECT: {PROJECT_NAME}\nFile: connection_manager.py\nFunction: update_activity()\nLine: {exc_tb.tb_lineno}\nError Type: {exc_type.__name__}\nError: {err}")
            return None
    
    async def check_inactivity(self):
        try:
            while True:
                now = datetime.now()
                inactive_users = [
                    user_id for user_id, last_time in self.last_activity.items()
                    if (now - last_time) > timedelta(minutes=15)
                ]
                for user_id in inactive_users:
                    await self.disconnect(user_id)
                await sleep(300)
        except Exception as err:
            exc_type, exc_obj, exc_tb = exc_info()
            await senderror(f"PROJECT: {PROJECT_NAME}\nFile: connection_manager.py\nFunction: check_inactivity()\nLine: {exc_tb.tb_lineno}\nError Type: {exc_type.__name__}\nError: {err}")
            return None
    
