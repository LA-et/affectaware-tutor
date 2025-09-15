from os.path import abspath, join, dirname
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "../"))
path.append(base_dir)

from uuid import uuid4
from Core.telegram import senderror
from variables import PROJECT_NAME

async def transid():
    try:
        return 'PEKA' + uuid4().hex[:32].upper()
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f"ERROR!\nProject: {PROJECT_NAME}\nFolder: Core\nFile: idgen.py\nFunction: transid\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}")
        raise Exception('Error')

async def course_enrol_id():
    try:
        return 'PEKA' + uuid4().hex[:12].upper()
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f"ERROR!\nProject: {PROJECT_NAME}\nFolder: Core\nFile: idgen.py\nFunction: course_enrol_id\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}")
        raise Exception('Error')
