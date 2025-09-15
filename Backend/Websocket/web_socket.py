from os.path import abspath, join, dirname
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "./"))
path.append(base_dir)

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from datetime import datetime
from auth import validate_jwt
from db import get_collections
from connection_manager import WebSocketConnectionManager
import numpy as np
import cv2
from meta import *
from base64 import b64decode
from hsemotion_onnx.facial_emotions import HSEmotionRecognizer

ep = APIRouter()

emotion_recognizer = HSEmotionRecognizer(model_name='enet_b0_8_best_vgaf')
manager = WebSocketConnectionManager()

async def get_current_user(websocket: WebSocket, col):
    try:
        jwt = websocket.query_params.get("jwt")
        if not jwt:
            await websocket.close(code=1008, reason="Authentication missing")
            return None
        payload = await validate_jwt(col, jwt)
        user_id = payload.get("Username")
        if not user_id:
            await websocket.close(code=1008, reason="Invalid Authentication format")
            return None
        return user_id
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f"PROJECT: {PROJECT_NAME}\nFile: web_socket.py\nFunction: get_current_user()\nLine: {exc_tb.tb_lineno}\nError Type: {exc_type.__name__}\nError: {err}")
        await websocket.close(code=1008, reason="Invalid authentication")
        return None

@ep.websocket("/predict")
async def emotion_prediction(websocket: WebSocket, col=Depends(get_collections)):
    try:
        user_id = await get_current_user(websocket, col)
        if not user_id:
            return
        await manager.connect(user_id, websocket)
        while True:
            try:
                payload = await websocket.receive_json()
                state = payload.get("state")
                frame_data_list = payload.get("data", [])
                action = payload.get("action")
                if state != "engaged" or not frame_data_list:
                    message, bot_image = await reply("not_engaged", action, user_id)
                    await col['5'].insert_one({
                        'DateTime': datetime.now(),
                        'Username': user_id,
                        'Action': action,
                        'Engaged': False,
                        'Valence': {},
                        'Arousal': {},
                        'HSEmotion': "",
                        'Emotion': "",
                        'Message': message,
                        'Bot Image': bot_image
                    })
                    continue
                predictions = []
                valence = []
                arousal = []
                emotions = []
                for base64_image in frame_data_list:
                    try:
                        header, encoded = base64_image.split(",", 1)
                        img_bytes = b64decode(encoded)
                        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
                        frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                        if frame is None:
                            continue
                        emotion, scores = emotion_recognizer.predict_emotions(frame, logits=True)
                        valence.append(float(scores[0]))
                        arousal.append(float(scores[1]))
                        emotions.append(emotion)
                        learning_emotion = await map_valence_arousal_to_emotion(valence[-1], arousal[-1])
                        predictions.append(learning_emotion)
                    except Exception as frame_err:
                        continue
                if not predictions:
                    continue
                dominant_emotion = max(set(predictions), key=predictions.count)
                emotion = max(set(emotions), key=emotions.count)
                message, bot_image = await reply(dominant_emotion, action, user_id)
                await col['5'].insert_one({
                    'DateTime': datetime.now(),
                    'Username': user_id,
                    'Action': action,
                    'Engaged': True,
                    'Valence': {
                        'Min': min(valence),
                        'Max': max(valence),
                    },
                    'Arousal': {
                        'Min': min(arousal),
                        'Max': max(arousal),
                    },
                    'HSEmotion': emotion,
                    'Emotion': dominant_emotion,
                    'Message': message,
                    'Bot Image': bot_image
                })
                if dominant_emotion not in ["not_engaged", "engaged"] and action != "Quiz":
                    await websocket.send_json({
                        "prediction": dominant_emotion,
                        "message": message,
                        "bot_image": bot_image
                    })
            except WebSocketDisconnect:
                break
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f"PROJECT: {PROJECT_NAME}\nFile: web_socket.py\nFunction: emotion_prediction()\nLine: {exc_tb.tb_lineno}\nError Type: {exc_type.__name__}\nError: {err}")
    finally:
        await manager.disconnect(user_id)


