from os.path import abspath, join, dirname, exists, isdir
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "../"))
path.append(base_dir)

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from Core.telegram import senderror
from Core.db import PROJECT_NAME
from mimetypes import guess_type

content = APIRouter()

@content.get("/{url:path}")
async def get_content(url: str):
    try:
        base_dir = abspath(join(dirname(__file__), "../Content"))
        full_file_path = abspath(join(base_dir, url))
        if not isdir(base_dir):
            raise HTTPException(status_code=500, detail="Server configuration error: base directory does not exist")
        if not full_file_path.startswith(base_dir):
            raise HTTPException(status_code=404, detail="File not found!")
        if not exists(full_file_path):
            raise HTTPException(status_code=404, detail="File not found!")
        mime_type, _ = guess_type(full_file_path)
        if not mime_type:
            mime_type = "application/octet-stream"
        return FileResponse(full_file_path, media_type=mime_type)
    except HTTPException as http_exc:
        return JSONResponse(content={'Error': http_exc.detail}, status_code=http_exc.status_code)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: content.py\nFunction: get_content\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': 'Error!'}, status_code=400)
