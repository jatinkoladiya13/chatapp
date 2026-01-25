# WebSocket, Django Channels & Redis — Senior-Level Mental Model

## 1. WebSocket

**WebSocket** is a technology that keeps a **persistent, bi‑directional connection** open between the client and the server.

```
Frontend  ⇄  Backend
(connection stays open)
```

### Why WebSocket?

Used when the server needs to push data **in real time**:

* Chat applications
* Notifications
* Live updates (stocks, games, dashboards)

Unlike HTTP (request → response → close), WebSocket stays connected.

---

## 2. TCP (Transmission Control Protocol)

**TCP** is the underlying reliable protocol that:

* Guarantees data delivery
* Preserves message order
* Retransmits lost packets

WebSocket is built **on top of TCP**.

---

## 3. ws:// vs wss://

* **ws://** → WebSocket without encryption (❌ not secure)
* **wss://** → WebSocket over TLS/SSL (✅ encrypted, secure)

👉 In production, always use **wss://**

---

## 4. Django Channels

**Django Channels = WebSocket support + Async Django**

### What Channels Does

* Accept WebSocket connections
* Keep users connected
* Send & receive real‑time messages

### Clear Responsibility Split

* **DRF (HTTP)**

  * Authentication
  * Create chat rooms
  * Fetch old messages

* **Channels (WebSocket)**

  * Real‑time send/receive
  * Presence, typing, live updates

---

## 5. Channels Worker (ASGI)

Channels runs on **ASGI workers**.

Each worker:

1. Handles WebSocket connections
2. Handles async events
3. Communicates with Redis

---

## 6. Why Redis Is Required

### Redis

**Redis** is a super‑fast, in‑memory data store.

* Data stored in RAM
* Extremely fast (microseconds)
* Shared between all servers

Redis lives **between your WebSocket servers**.

```
User A → Server 1 → Redis → Server 2 → User B
```

👉 Redis acts as a **message broker**.

---

## 7. What Redis Is Used For

### 1. WebSocket Message Broadcasting (Most Important)

```
User → WebSocket → Channels → Redis → All Servers → All Users
```

* 5 Django servers
* Users connected randomly
* Redis ensures every user in the room gets the message

---

### 2. Channel Layer

Redis is the **communication bus** between Channels workers.

Workers do **not** talk directly to each other.

---

### 3. Online / Offline User Tracking

Fast, temporary state (❌ not DB):

```
user:123:online → true
room:45:users → [12, 18, 34]
```

Why Redis?

* Very fast
* Auto‑expire
* No database load

---

### 4. Temporary & Real‑Time State

Examples:

* Typing indicator
* Seen status
* Presence
* Rate limiting

```
typing:user:123:room:45 → expires in 3s
```

Rule:

* **Message content** → Database
* **Real‑time state** → Redis

---

### 5. Redis Pub/Sub (Core Concept)

```python
await channel_layer.group_send(
    "chat_12",
    {
        "type": "chat.message",
        "message": "Hello",
    }
)
```

* Every server subscribes to `chat_12`
* Redis instantly publishes the message

---

## 8. Message Flow (Important)

### Key Truth

> **Server A does NOT know where the receiver is connected.**

Redis:

* Does NOT know users
* Does NOT know sockets
* Does NOT know business logic

Redis only:
➡️ publishes events to all workers

---

### Actual Flow

```
Sender Frontend
   ↓
Channels Worker A
   ↓
Redis (Pub/Sub)
   ↓
Channels Worker B
   ↓
Receiver Frontend
```

Each worker asks:

> “Do I have any WebSocket connections subscribed to `chat_room_45`?”

Only the worker that **has the receiver’s socket** delivers the message.

👉 Redis does **not** decide the receiver.

👉 **Channels Group decides**.

---

## 9. What If Both Users Are on the Same Server?

```
Sender → Server A → Server A → Receiver
```

Redis is still used, but the message loops back internally.

---

## 10. What If Receiver Is Offline?

* Message is saved to the database
* Redis has no active subscriber
* Receiver fetches messages via API on reconnect

---

## 11. Senior Interview Trick Question

**Q: Can we skip Redis and send messages directly?**

**A:**

* Single server → maybe
* Multiple servers → ❌ impossible

---

## 12. Final One‑Line Mental Model (Memorize This)

> **Frontend sends message → Channels worker publishes to Redis → Redis fan‑outs to all workers → only workers with matching WebSocket connections deliver to receivers.**

---

# Celery & Redis — Background Processing Mental Model

## 13. Celery

**Celery** is a **background job processing system**.

Celery runs slow, heavy, or non-critical tasks **outside** the HTTP/WebSocket request lifecycle.

### Why Celery?

```
User Action
   ↓
Django responds instantly ⚡
   ↓
Celery handles heavy work in background
```

Examples:

* Sending emails
* Push notifications
* Image / video processing
* Analytics & reports
* Message delivery confirmations
* Scheduled jobs (cron replacement)

---

## 14. Celery Architecture

```
Django App
   ↓ (task)
Message Broker (Redis)
   ↓
Celery Worker
   ↓
Task Execution
```

Redis stores tasks **after Django submits them**.

Redis acts like a **queue**:

```
Queue:
  - send_push_notification(user_id=12)
  - send_email(user_id=34)
```

---

## 15. Role of Redis in Celery (VERY IMPORTANT)

### 1. Message Broker (Main Role)

* Stores pending tasks
* Acts as a queue

```
Task → Redis Queue → Celery Worker
```

---

### 2. Result Backend (Optional)

Redis can store:

* Task result
* Task status

```
PENDING → STARTED → SUCCESS / FAILED
```

---

### 3. Task Retry & Reliability

* Task stays in Redis until acknowledged
* If a worker dies, another worker picks it up

---

## 16. Chat + Celery Flow (Senior-Level)

```
Sender Frontend
   ↓
Channels Worker
   ↓
Save Message (DB)
   ↓
Redis (Channels fan-out)
   ↓
Receiver WebSocket
```

**Parallel background work:**

```
Celery Task (Redis Queue)
   ↓
Push Notification / Email / Analytics
```

Celery never blocks real-time messaging.

---

# Redis — The Shared Memory Backbone

## 17. Redis

**Redis** stores data in **RAM**, allowing reads/writes in **microseconds**.

---

## 18. Why Redis Exists (The Real Problem)

```
Django Server A        Django Server B
User 1 connected      User 2 connected
❌ No shared state
❌ No real-time sync
```

Problems:

* Database is too slow
* Local memory is not shared
* Scaling breaks real-time features

Solution:

```
Server A
   ↓
Redis (Shared Memory)
   ↓
Server B
```

Fast | Shared | Scales

---

## 19. Why Redis Is FAST

* Stores data in RAM
* Single-threaded event loop (no locks)
* No heavy joins
* Simple data structures

---

## 20. Common Redis Use Cases

### 1. Caching (Most Common)

* User profiles
* Permissions
* API responses

```
GET user:123 → Redis → DB fallback
```

---

### 2. Real-Time Messaging (Django Channels)

* Pub/Sub system
* Channel layer

```
Message → Redis → All Servers → Users
```

---

### 3. Task Queues (Celery)

* Task broker
* Retry store

```
Task → Redis → Celery Worker
```

---

### 4. Online Presence & State

* Online users
* Typing indicators
* Read receipts

```
user:12:online → true (expires in 60s)
```

---

### 5. Rate Limiting

```
login:ip:count → 5
```

---

## 21. Redis in Real-Time Flow

```
WebSocket Message
   ↓
Channels Worker
   ↓
Redis (fan-out)
   ↓
Other Workers
   ↓
Receivers
```

---

## 22. Final Unified Mental Model

> **Channels uses Redis for real-time fan-out.**
> **Celery uses Redis as a task queue.**
> **Redis is the shared, fast, in-memory backbone that makes scaling possible.**
