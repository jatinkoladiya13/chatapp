# Django Chat App

A real-time, one-to-one chat application built with Django and Django Channels. Users register with email and password or sign in with Google, add contacts by email, exchange text, photo, and video messages over a WebSocket connection with sent/delivered/seen receipts, see whether a contact is online, and share 24-hour photo and video statuses. A Celery Beat job removes expired statuses and notifies connected clients in real time.

## Highlights

- Email and password registration with an optional profile image
- Google sign-in through `django-allauth`, linking to an existing account with the same email
- Password reset with a four-digit OTP sent by email, plus OTP resend
- Contact list built by email address, with custom contact names, search, and removal
- One-to-one real-time messaging over a single WebSocket connection per browser tab
- Photo and video messages with captions, uploaded over HTTP and announced over the WebSocket
- Message receipts: `sent`, `delivered`, and `seen`, pushed live to the sender
- Unread message counters and last-message preview in the chat list
- Online and offline presence stored on the user and broadcast through the Redis channel layer
- Chat history grouped by day (`Today`, `Yesterday`, or a date)
- In-conversation message search and a calendar picker that jumps to a given day
- Photo and video statuses that expire after 24 hours, with viewer tracking and replies
- Celery Beat task that deletes expired statuses every minute and broadcasts the change
- Django admin for users, messages, statuses, and status views

## Technology

| Area | Technology |
| --- | --- |
| Framework | Django 5.2.4 |
| Real-time | Django Channels 4.2.2, Daphne 4.2.1 |
| Channel layer | `channels_redis` 4.2.1 with Redis |
| Background tasks | Celery 5.5.3 with Redis broker and result backend, Celery Beat |
| Authentication | Django auth with a custom email-based user model, `django-allauth` 65.10.0 (Google) |
| Database | SQLite (`db.sqlite3`) |
| Media | Pillow 11.3.0 for image fields |
| Configuration | `python-dotenv` 1.1.1 |
| Frontend | Django templates, Bootstrap 4.1.3 and Font Awesome 6.5.1 from CDN, vanilla JavaScript |
| Python | Python 3.11 or newer |

## Architecture

The browser renders the Django templates over HTTP, uses JSON endpoints for contacts, uploads, and statuses, and opens one WebSocket to `ws/chat/chat_consumer/`. Every client joins the same Channels group, `chat_chat_consumer`.

```text
Browser (index.html + static/js/index.js)
  |
  |-- HTTP ------------> Django views (app/views.py)
  |                        +-- Auth pages, OTP reset, JSON endpoints
  |                        +-- SQLite: User, Message, Status, StatusView
  |                        +-- media/: profile images, message and status files
  |
  +-- WebSocket -------> ChatConsumer (app/consumers.py) on Daphne / ASGI
                           |
                           +-- In-process user_connections map
                           |     direct delivery of chat messages, receipts,
                           |     and status uploads to the sender and receiver
                           |
                           +-- Redis channel layer, group "chat_chat_consumer"
                                 +-- user_status (online / offline)
                                 +-- status_update (from Celery)

Celery Beat --> Celery worker --> delete_expired_statues
                                    +-- deletes expired Status rows
                                    +-- group_send "status_update" via Redis
```

### Message Flow

1. The client sends `{"action": "send_message", "message": ..., "receiver_id": ...}` over the WebSocket.
2. `ChatConsumer` stores a `Message` row, adds the sender to the receiver's contacts if needed, and restores the sender's contact entry if it was removed.
3. If the receiver has an open connection, the message is marked `delivered`.
4. The consumer sends a `chat_message` payload directly to every open connection of the sender and the receiver.
5. When the receiver reads the message, the client sends `change_message_status_by_receiver`; the message becomes `seen` and the sender receives the update.
6. When a user connects, all of their `sent` messages become `delivered` and the senders receive `receiver_message_delivered` events.

Photo and video messages are first uploaded to `/upload-video/`. The returned message id is then sent over the WebSocket in `Send_Data` with an empty `message`.

Chat messages and receipts are delivered through a module-level dictionary of open connections in the consumer process. Redis is used for presence broadcasts and Celery status updates. Running more than one ASGI process therefore does not deliver chat messages across processes.

## Data Model

| Model | Purpose |
| --- | --- |
| `User` | Custom `AbstractUser` that logs in with `email` (unique). Adds `verfy_otp`, `profile_image`, `google_profile_image`, `contacts` (JSON list of `user_id`, `delete_status`, `contact_name`), `deleted_contacts` (JSON map of contact id to deletion time), and `is_online`. `first_name` and `last_name` are removed. |
| `Message` | `sender`, `receiver`, `content`, `timestamp`, `status_view` (`sent`, `delivered`, `seen`), optional `image`, `video`, `video_duration`, `caption`, and `replied_to` (a `Status`). |
| `Status` | User status with `image`, `video`, `caption`, `created_at`, and `expires_at` (defaults to 24 hours after creation). |
| `StatusView` | Records which user viewed a status and when. |

Uploaded files are stored under `media/` in `product_images/`, `message_images/`, `message_videos/`, `status_images/`, and `status_videos/`.

## Project Structure

```text
chatapp/
├── app/
│   ├── adapters.py            Google social account adapter
│   ├── admin.py               Admin registrations
│   ├── consumers.py           ChatConsumer WebSocket logic
│   ├── custom_time_filters.py Relative time helper for statuses
│   ├── decorator.py           custom_login_required decorator
│   ├── email.py               OTP email sender
│   ├── formate_date.py        Day label helper for chat history
│   ├── migrations/
│   ├── models.py              User, Message, Status, StatusView
│   ├── routing.py             WebSocket URL patterns
│   ├── tasks.py               Celery task for expired statuses
│   ├── untils.py              Fernet encrypt/decrypt for reset links
│   ├── url.py                 HTTP routes
│   └── views.py               Pages and JSON endpoints
├── chatapp/
│   ├── asgi.py                ProtocolTypeRouter (HTTP + WebSocket)
│   ├── celery.py              Celery application
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── static/
│   ├── css/school.css
│   ├── images/
│   └── js/
│       ├── calender.js        Calendar jump-to-date picker
│       ├── index.js           Chat UI, WebSocket client, uploads, statuses
│       └── uploads_files.js
├── tamplates/                 Django templates (folder name is spelled this way)
│   ├── header.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── resetpassword.html
│   ├── sendlink.html
│   └── verifyotp.html
├── info.md                    Notes on WebSockets, Channels, Redis, and Celery
├── manage.py
└── requirements.txt
```

## HTTP Routes

### Pages

| Route | Name | Description |
| --- | --- | --- |
| `/` | `home` | Chat interface with the contact list. Requires login. |
| `/register/` | `register` | Create an account with username, email, password, and optional profile image |
| `/login/` | `login` | Email and password login, with a Google sign-in link |
| `/signout/` | `signout` | Log out and clear the session |
| `/sendlink/` | `sendlink` | Request a password reset OTP by email |
| `/verifyotp/?to=<token>` | `verifyotp` | Enter the four-digit OTP |
| `/changepassword/?to=<token>` | `changepassword` | Set a new password after OTP verification |
| `/admin/` | | Django admin |
| `/accounts/` | | `django-allauth` routes, including `/accounts/google/login/` |

### JSON Endpoints

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/resendotp/` | Resend the OTP. Body: `{"email": ...}` |
| `POST` | `/create_contacts/` | Add or restore a contact. Body: `{"contact_email": ..., "contact_name": ...}` |
| `GET` | `/get_contacts/?q=<term>` | List the current user's contacts, optionally filtered by name |
| `GET` | `/delete_contact/<contact_id>/` | Remove a contact. Messages are deleted when both users have removed each other |
| `POST` | `/upload-video/` | Upload a photo (`image`) or video (`video`) message with `receiver_usr` and `caption` |
| `POST` | `/edit_profile/` | Update `profile_image`, `name-input`, or `email-input` |
| `POST` | `/upload_status/` | Upload a status `image`, or a `video` with a `background_img` thumbnail, plus `caption` |
| `GET` | `/get_My_status/<user_id>/` | Statuses of a user, with view state; includes viewers when the user is the owner |
| `POST` | `/add_viewed_status/` | Record that the current user viewed a status. Body: `{"status_id": ...}` |
| `GET` | `/get_recent_status/` | Status summary for the current user and their contacts |

Media files are served from `/media/` while `DEBUG` is enabled.

## WebSocket Endpoint

| URL pattern | Consumer |
| --- | --- |
| `ws/chat/<str:room_name>/` | `app.consumers.ChatConsumer` |

The frontend always connects to:

```text
ws://<host>/ws/chat/chat_consumer/
```

The connection uses Django session authentication through `AuthMiddlewareStack`, so the user must be logged in.

### Client Actions

| `action` | Payload fields | Effect |
| --- | --- | --- |
| `send_message` | `message`, `receiver_id`, optional `Send_Data`, `status_id`, `status_reply_caption`, `video_duration` | Sends a text message, an uploaded media message, or a reply to a status |
| `send_history` | `receiver_id` | Returns the conversation history grouped by day |
| `change_message_status_by_receiver` | `receiver_id`, `message_id` | Marks a message as `seen` and notifies the sender |
| `uploade_status` | `uploaded_user_id`, `status_id`, `uploaded_users_contacts` | Notifies connected contacts that a new status was uploaded |

### Server Events

| `type` | Description |
| --- | --- |
| `chat_message` | A new message, sent to both the sender and the receiver |
| `chat_history` | Conversation history, unread count, and the contact's online state |
| `user_status` | A user went online or offline |
| `receiver_message_delivered` | A previously sent message was delivered |
| `change_message_status_by_receiver` | A message was seen by the receiver |
| `uploade_status` | A contact uploaded a new status |
| `status_update` | A status expired and was deleted by Celery |

## Background Tasks

| Task | Schedule | Description |
| --- | --- | --- |
| `app.tasks.delete_expired_statues` | Every minute (`crontab(minute='*')`) | Deletes statuses whose `expires_at` has passed and sends a `status_update` event to the `chat_chat_consumer` group for each one |

Celery uses `redis://localhost:6379/0` as both broker and result backend.

## Local Requirements

- Python 3.11 or newer
- Redis on `127.0.0.1:6379` (channel layer and Celery)
- A Gmail account or app password for OTP emails
- Google OAuth client credentials for Google sign-in

## Installation

### Windows PowerShell

```powershell
git clone <your-repository-url>
cd chatapp

py -m venv env
.\env\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

`requirements.txt` is saved as UTF-16. If `pip` cannot read it, convert it to UTF-8 first.

### Environment Variables

Create a `.env` file in the project root. It is listed in `.gitignore`; never commit it.

```env
EMAIL_USER=your-address@gmail.com
EMAIL_PASS=your-app-password

CLIENT_ID=your-google-oauth-client-id
SECRET=your-google-oauth-client-secret

CAPTCHA_SECRET_KEY=your-recaptcha-secret
```

| Variable | Used by |
| --- | --- |
| `EMAIL_USER` | `EMAIL_HOST_USER` for the Gmail SMTP backend |
| `EMAIL_PASS` | `EMAIL_HOST_PASSWORD` for the Gmail SMTP backend |
| `CLIENT_ID` | Google OAuth client id in `SOCIALACCOUNT_PROVIDERS` |
| `SECRET` | Google OAuth client secret in `SOCIALACCOUNT_PROVIDERS` |
| `CAPTCHA_SECRET_KEY` | Read by the login view; reCAPTCHA verification is currently commented out |

The `.env` file is loaded by `manage.py`. Commands that do not go through `manage.py`, such as `daphne` or `celery`, do not load it automatically.

`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, the database, and the Redis addresses are set directly in `chatapp/settings.py`.

### Google Sign-In

Create an OAuth client in Google Cloud Console and add this authorized redirect URI:

```text
http://localhost:8000/accounts/google/login/callback/
```

The provider requests the `profile` and `email` scopes. New Google users get a username from their Google name and their Google avatar as the profile image.

## Database Setup

```powershell
python manage.py migrate
python manage.py createsuperuser
```

## Running the Services

Start Redis first, then run each of the following in its own terminal with the virtual environment activated.

### Redis

```powershell
redis-server
```

Any Redis instance listening on `127.0.0.1:6379` works.

### Django Development Server

`daphne` is the first entry in `INSTALLED_APPS`, so `runserver` starts the ASGI server and serves both HTTP and WebSocket traffic:

```powershell
python manage.py runserver
```

Open `http://127.0.0.1:8000/`.

### Daphne

```powershell
daphne -b 127.0.0.1 -p 8000 chatapp.asgi:application
```

Load the environment variables first, because Daphne does not read `.env`.

### Celery Worker

```powershell
celery -A chatapp worker -l info --pool=solo
```

`--pool=solo` is needed on Windows.

### Celery Beat

```powershell
celery -A chatapp beat -l info
```

Beat schedules `delete_expired_statues` every minute. Both the worker and Beat must be running for expired statuses to be removed.

## Useful Checks

```powershell
python manage.py check
python manage.py makemigrations --check --dry-run
```

The project has no automated tests yet; `app/tests.py` contains only the default stub.
