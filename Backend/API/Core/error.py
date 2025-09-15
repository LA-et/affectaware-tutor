from os.path import abspath, join, dirname
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "../"))
path.append(base_dir)

class JWTError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)