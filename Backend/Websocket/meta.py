from os.path import abspath, join, dirname
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "./"))
path.append(base_dir)

from telegram import senderror, PROJECT_NAME

async def map_valence_arousal_to_emotion(valence, arousal):
    try:
        if valence < 0:
            return "delight"
        if 3 >= valence >= 0 and 3 >= arousal >= -3:
            return "engaged"
        elif valence > 0:
            if arousal > 0:
                return "confusion"
            else:
                return "frustration"
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFile: meta.py\nFunction: map_valence_arousal_to_emotion\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return "error"

async def reply(prediction, content_type, username):
    try:
        message = ""
        bot_image = ""
        if content_type == "Quiz":
            message = f"Remember to read each question carefully. You've got this {username}!"
            bot_image = "GIFs/not_engaged.gif"
        else:
            if prediction == "delight":
                message = f"Fantastic! Your understanding is impressive. Let's keep this momentum going."
                bot_image = "GIFs/Delight.gif"
            elif prediction == "confusion":
                message = f"This part is a bit tricky. Let's break it down together step by step."
                bot_image = "GIFs/Confusion.gif"
            elif prediction == "boredom":
                message = f"Are you bored? Pause the video/reading and try to predict the next step before it’s explained."
                bot_image = "GIFs/Boredom.gif"
            elif prediction == "frustration":
                message = f"I know this is tough, but I believe in you. Let's tackle it one step at a time."
                bot_image = "GIFs/Frustation.gif"
            elif prediction == "not_engaged":
                message = f"It seems like you're not very engaged. Let's try to focus!"
                bot_image = "GIFs/not_engaged.gif"
            elif prediction == "engaged":
                message = f"You're doing an excellent job staying focused. Keep it up!"
                bot_image = "GIFs/Engagement.gif"
            else:
                message = f"You're doing an excellent job staying focused. Keep it up!"
                bot_image = "GIFs/Engagement.gif"
        return message, bot_image
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFile: meta.py\nFunction: reply\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return "error"
