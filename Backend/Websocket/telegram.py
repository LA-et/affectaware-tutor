from os.path import abspath, join, dirname
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "./"))
path.append(base_dir)

from variables import TELEGRAM_API_URL, TELEGRAM_CHAT_ID, TELEGRAM_API_TOKEN, PROJECT_NAME
from httpx import AsyncClient

async def senderror(message):
    async with AsyncClient() as c:
        for i in TELEGRAM_CHAT_ID:
            await c.post(f"{TELEGRAM_API_URL}{TELEGRAM_API_TOKEN}/sendMessage", json={'chat_id': i, 'text': message})
   
