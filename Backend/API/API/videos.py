from os.path import abspath, join, dirname, exists, isdir
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "../"))
path.append(base_dir)

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from Core.telegram import senderror
from Core.db import PROJECT_NAME
from mimetypes import guess_type
from pathlib import Path

vid = APIRouter()

CHUNK_SIZE = 1024 * 1024  # 1 MB

def get_video_stream(video_path: Path):
    """Generator to yield video file content in chunks."""
    with open(video_path, "rb") as video:
        while chunk := video.read(CHUNK_SIZE):
            yield chunk

@vid.get("/{video_path:path}")
async def stream_video(video_path: str):
    try:
        base_dir = abspath(join(dirname(__file__), "../Content"))
        full_file_path = abspath(join(base_dir, video_path))
        if not full_file_path.startswith(base_dir):
            raise HTTPException(status_code=403, detail="Access to the file is forbidden")
        if not exists(full_file_path):
            raise HTTPException(status_code=404, detail="Video file not found!")
        mime_type, _ = guess_type(full_file_path)
        if not mime_type:
            mime_type = "video/mp4"
        # def iterfile():
        #     with open(full_file_path, mode="rb") as file:
        #         yield from file
        # return StreamingResponse(iterfile(), media_type=mime_type)
        return StreamingResponse(
            get_video_stream(video_path),
                media_type="video/mp4",
                headers={
                    "Accept-Ranges": "bytes",
                    "Content-Type": "video/mp4",
                },
        )
    except HTTPException as http_exc:
        return HTTPException(status_code=http_exc.status_code, detail=http_exc.detail)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: videos.py\nFunction: stream_video\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': 'Error!'}, status_code=400)