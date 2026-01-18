1. WebSocket
   Websocket is a technology that keeps a connection open so the client and server can talk to each other anytime in real time.
   
   A permanent connection between frontend and backend.
    Frontend ⇄ Backend
    (connection stays open)

   👉 This is why WebSocket is used for:
       Chat, Notifications, Live updates
   
TCP (Transmission Control Protocol):- TCP is a reliable connection that makes sure data is sent correctly and in order between two computers.

WS:// (Not safe) :- ws:// is a websocket connection without security (no encryption).

WSS:// (Safe) :- wss:// is a secure websocket connection with encryption.

Django Channels

  Django Channels = Websocket  + aync support
  
  1. Accept Websocket connections
  2. Keep users connected
  3. Send/receive real-time messages

  DRF → login, create room, fetch messages
  Channels → real-time send/receive

  Channels Worker (ASGI)
     1. Handles Webocket
     2. Handles async events
     3. Talks to redis

  User A Frontend
     ↓ (WebSocket)
  Channels Worker
     ↓
  Redis
     ↓
  Channels Worker (where User B is connected)
     ↓
  User B Frontend

Redis

   Redis = super-fast in memory data store

   A shared memory that many server can read/write
   Extremely fast(microseconds)
   Lives between your webscoket servers

   Redis stores data in RAM, not disk (but can persist if needed)

   User A → Server 1 → Redis → Server 2 → User B ✅

   Redis acts as a message broker between servers.

   1. Websocket Message Broadcating (Most Important)

      User → WebSocket → Django Channels → Redis → All Servers → All Users

      5 django servers
      users connected randomly
      Redis esures everyone in the room gets the message
   
   2. Channel Layer

      Redis is the communication bus between WebSocket workers.
      
   3. Online / Offline User Tracking

      Online users | Active rooms | Socket connections

      user:123:online → true
      room:45:users → [12, 18, 34]

      Should Not go to DB | should be fast | should auto expire
      
   4. Temporary & Real-Time Data

      Typing indicators | Seen status | Presence | Rate limits

      typing:user:123:room:45 → expires in 3 sec

      Message content → DB
      Real-time state → Redis

   5. Redis Pub/Sub (Core Concept)
      await channel_layer.group_send(
            "chat_12",
            {
                "type": "chat.message",
                "message": "Hello",
            }
       )
        Every server subscribed to chat_12
        Redis delivers message instantly

        Frontend (WebSocket)
              ↓
        Django Channels Worker
              ↓
        Redis (Pub/Sub + State)
              ↓
        Other Django Workers
              ↓
        WebSocket Clients

Message:

  Server A does NOT know where receiver is connected
      
  Redis PUb/SUB Layer
       Redis receives event for "chat_room_45"
       Does NOT know users
       Does NOT know sockets
       Does NOT know business logic
       
  Publishes message to all workers subscribed to that group  

Redis → All Django Workers
  Redis
   ↓
  Server A
  Server B
  Server C

  “Do I have any WebSocket connections subscribed to chat_room_45?”

Receiver Worker Sends to Frontend 

  Server B
   ↓
  Receiver WebSocket
   ↓
  Receiver Browser

  Only the worker that has:
       Receiver’s WebSocket
       Subscribed to the room group
  will deliver the message.

Redis does NOT decide the receiver

Channels Group decides

Who receives message?
→ WebSockets currently joined to the group

[ Sender Frontend ]
        ↓
[ Channels Worker A ]
        ↓
        Redis (Pub/Sub)
        ↓
[ Channels Worker B ]
        ↓
[ Receiver Frontend ]

Frontend sends message → Channels worker publishes to Redis → Redis fan-outs to all workers → only workers with matching WebSocket connections deliver to receivers.
            
