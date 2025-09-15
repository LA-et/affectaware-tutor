from os.path import abspath, join, dirname
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "./"))
path.append(base_dir)

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import UpdateOne
from telegram import senderror
from sys import exc_info
from fastapi import FastAPI
from typing import Union
from variables import MONGODB_URL, DATABASE_NAME, PROJECT_NAME

c: Union[AsyncIOMotorClient, None] = None
col = {}

async def connect_database(app: FastAPI):
    try:
        global c, col
        if not c:
            c = AsyncIOMotorClient(MONGODB_URL)
            db = c[DATABASE_NAME]
            col = {
                '1': db['users'],
                '5': db['emotion_logs']
            }
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\Project: {PROJECT_NAME}\nFolder: Core\nFile: db.py\nFunction: connect_database()\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        raise

async def close_db():
    try:
        if c:
            c.close()
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\Project: {PROJECT_NAME}\nFolder: Core\nFile: db.py\nFunction: close_db()\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        raise

async def get_collections():
    global col
    if not col:
        await connect_database(None) 
    return col

async def db_update_one(col, colname, query, update):
    try:
        await col[colname].update_one(query, update)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\Project: {PROJECT_NAME}\nFolder: Core\nFile: db.py\nFunction: db_update_one()\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')

async def db_update_many(col, colname, query, update):
    try:
        await col[colname].update_many(query, update)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\Project: {PROJECT_NAME}\nFolder: Core\nFile: db.py\nFunction: db_update_many()\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')

async def db_insert_one(col, colname, data):
    try:
        await col[colname].insert_one(data)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\Project: {PROJECT_NAME}\nFolder: Core\nFile: db.py\nFunction: db_insert_one()\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')

