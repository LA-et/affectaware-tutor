from os.path import abspath, join, dirname
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "../"))
path.append(base_dir)

from datetime import datetime
from Core.telegram import senderror
from variables import PROJECT_NAME

async def User_Logs(col, username, action, comment, **kwargs):
    try:
        data = {
            'Username': username,
            'DateTime': datetime.now(),
            'Action': action,
            'Comment': comment,
            'Details': kwargs
        }
        await col['1'].insert_one(data)
        return True
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: Core\nFile: logs.py\nFunction: User_Logs\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return None


