
# Django Chat App

A real-time chat application built with **Django** and **Django Channels**, allowing users to send and receive messages instantly. This project demonstrates how to implement WebSocket-based communication in Django.


##  Features
- User register &  login
- One to one and group chat support
- Real-time messaging using Websockets 
- Responsive UI using HTMl and CSS with manage small task javascript
- Responsive UI using Bootstrap
- User online/offline status indicator
- User upload daily status

## Tech stack
- Python 3.x
- Django 4.x
- channels 4.x
- channels-redis 4.x
- SQLite (default, can be changed)

from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

This env file load when we use the celery server.
