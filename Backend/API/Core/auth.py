from os.path import abspath, join, dirname
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "../"))
path.append(base_dir)

from jwt import decode, encode
from datetime import datetime
from variables import AUTH_SECRET_KEY
from Core.telegram import senderror
from variables import PROJECT_NAME
from Core.error import JWTError

#For validating JWT
async def validate_jwt(col, jwt_token):
    try:
        payload = decode(jwt_token, AUTH_SECRET_KEY, algorithms=["HS512"])
        if not ('Username' in payload.keys()):
            raise JWTError("Invalid Authentication")
        cur_dt = datetime.now()
        jwt_dt = datetime.strptime(payload.get("DateTime"),"%d-%m-%Y %H:%M:%S")
        jwt_expiry_secs = 60*60*24
        if((cur_dt - jwt_dt).seconds > jwt_expiry_secs):
            raise JWTError("Session Expired")
        ff = await col['1'].find_one({
            'Username': payload['Username']
        }, 
        {
            '_id': 0
        })
        if not ff:
            raise JWTError("Invalid Authentication")
        return payload
    except JWTError:
        raise
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f"ERROR!\nProject: {PROJECT_NAME}\nFolder: Core\nFile: auth.py\nFunction: validate_jwt\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}")
        raise Exception('Invalid Authentication')
    
#For generating JWT
async def generate_jwt(username):
    try:
        payload = {
            "Username": username, 
            "DateTime": (datetime.now()).strftime("%d-%m-%Y %H:%M:%S")
        }
        jwt_token = encode(payload, AUTH_SECRET_KEY, algorithm="HS512")
        return jwt_token
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: Core\nFile: auth.py\nFunction: generate_jwt\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        raise Exception('Error')

