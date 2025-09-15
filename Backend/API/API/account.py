from os.path import abspath, join, dirname
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "../"))
path.append(base_dir)

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from Core.telegram import senderror
from Core.db import get_collections
from Model.user_account import *
from hashlib import sha512
from datetime import datetime
from Core.idgen import transid, PROJECT_NAME
from Core.auth import generate_jwt, validate_jwt

user = APIRouter()

@user.post("/username_avail")
async def username_avail(l1: Username, col: dict = Depends(get_collections)):
    try:
        if l1.username == '':
            return JSONResponse(content={'Error': 'Username is required!'}, status_code=400) 
        h = await col['1'].find_one({
            'Username': l1.username
        },
        {
            '_id': 0,
            'Username': 1
        })
        if not h: 
            return JSONResponse(content={'Success': f'Username {l1.username} is available!', 'Status': True}, status_code=200)
        return JSONResponse(content={'Success': f'Username {l1.username} is already taken!', 'Status': False}, status_code=200)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: account.py\nFunction: username_avail\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)

@user.post("/register")
async def register(l1: Register, col: dict = Depends(get_collections)):
    try:
        if l1.name == '':
            return JSONResponse(content={'Error': 'Name is required!'}, status_code=400)
        if l1.username == '':
            return JSONResponse(content={'Error': 'Username is required!'}, status_code=400)
        if l1.email == '':
            return JSONResponse(content={'Error': 'Email is required!'}, status_code=400)
        if l1.password == '':
            return JSONResponse(content={'Error': 'Password is required!'}, status_code=400)
        if l1.con_password == '':
            return JSONResponse(content={'Error': 'Confirm Password is required!'}, status_code=400)
        if l1.password != l1.con_password:
            return JSONResponse(content={'Error': 'Password and Confirm Password do not match!'}, status_code=400)
        if l1.grade == '':
            return JSONResponse(content={'Error': 'Grade is required'}, status_code=400)
        if l1.institute == '':
            return JSONResponse(content={'Error': 'Institute Name is required!'}, status_code=400)
        user = await col['1'].find_one({'Username': l1.username}, {'_id': 0, 'Username': 1})    
        if user:
            return JSONResponse(content={'Error': 'Username already exists!'}, status_code=400)
        dt = datetime.now()
        await col['1'].insert_one({
            'Username': l1.username,
            'Name': l1.name,
            'Email': l1.email,
            'Grade': l1.grade,
            'Institute': l1.institute,
            'Password': sha512(bytes(l1.password,'utf-8')).hexdigest(),
            'Created_On': dt,
            'Updated_On': dt
        })
        await col['5'].insert_one({
            'TransID': await transid(),
            'DateTime': dt,
            'Username': l1.username,
            'Action': 'Registered',
            'Details': {},
            'Status': True
        })
        return JSONResponse(content={'Success': f'{l1.username} registered successfully!', 'Username': l1.username}, status_code=200)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: account.py\nFunction: register\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)

@user.post("/login")
async def login(l1: Login, col: dict = Depends(get_collections)):
    try:
        if l1.username == '':
            return JSONResponse(content={'Error': f'Username is required!'}, status_code=400)
        if l1.password == '':
            return JSONResponse(content={'Error': f'Password is required!'}, status_code=400)
        h = await col['1'].find_one({
            'Username': l1.username,
            'Password': sha512(bytes(l1.password,'utf-8')).hexdigest()
        },
        {
            '_id': 0,
            'Username': 1
        })
        if not h:
            return JSONResponse(content={'Error': f'Incorrect credentials!'}, status_code=400)
        await col['5'].insert_one({
            'TransID': await transid(),
            'DateTime': datetime.now(),
            'Username': l1.username,
            'Action': 'Logged In',
            'Details': {},
            'Status': True
        })
        jwt = await generate_jwt(l1.username)
        return JSONResponse(content={'Success': f'Login successfull!', 'JWT': jwt}, status_code=200)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: account.py\nFunction: login\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)

@user.post("/view_profile")
async def view_profile(l1: JWT, col: dict = Depends(get_collections)):
    try:
        try:
            response = await validate_jwt(col, l1.jwt)
        except Exception as err:
            return JSONResponse(content={'Error': str(err)}, status_code=400)
        username = response['Username']
        user_details = await col['1'].find_one({
            'Username': username
        },
        {
            '_id': 0,
            'Created_On': 0,
            'Updated_On': 0,
            'Password': 0
        })
        return JSONResponse(content={'Success': user_details}, status_code=200)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: account.py\nFunction: view_profile\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)

@user.post("/user_logs")
async def user_logs(l1: Log, col: dict = Depends(get_collections)):
    try:
        try:
            response = await validate_jwt(col, l1.jwt)
        except Exception as err:
            return JSONResponse(content={'Error': str(err)}, status_code=400)
        username = response['Username']
        if l1.action == '':
            return JSONResponse(content={'Error': 'Action is required!'}, status_code=400)
        data = {
            'TransID': await transid(),
            'Username': username,
            'DateTime': datetime.now(),
            'Action': l1.action,
            'Details': {},
            'Status': True
        }
        if l1.details is not None:
            data['Details'] = l1.details
        await col['5'].insert_one(data)
        return JSONResponse(content={'Success': 'Submit successfully!'}, status_code=200)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: account.py\nFunction: user_logs\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)
