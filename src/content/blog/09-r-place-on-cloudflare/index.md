---
title: "Building /r/place on Cloudflare"
description: "A first draft of how I'd build /r/place on the Cloudflare platform"
date: "08/20/2025"
draft: false
---

This is my loose design of an /r/place clone (April 2017) on the Cloudflare platform. I’m considering similar real-time multiplayer ideas, so I wanted to get a better sense of the cost and people are not shy about how expensive it can get. Of course biggest trade off for that potential cost is free bandwidth and no server management if there's any traction. 

### Functional Requirements:
- Users can change the color of any pixel in the 1000 x 1000 canvas (1 million pixels)
- They can choose from 16 color options
- Each user is limited to 1 update per 5 minutes
- We want to support 100K simultaneous users
- All users should be able to see canvas update in real-time

### Storage Requirements:
- Entire canvas is 1 million pixels and the user can choose one of 16 colors
    - 16 colors can be represented with 4 bits (2^4 = 16 bits)
    - So we need 4 million bits to store the entire canvas or 0.5 megabytes
- Rate limit counters
    - If our peak load is 100K simultaneous users, we can use the 80/20 rule to say peak users are 20% of daily users.
        - 100K / 0.20 = 500K total daily users
    - For each user, we store their most recent update’s timestamp (8 bytes) and their user IDs (64 bit integer IDs)
        - 500K daily users * 16 bytes = 8 M bytes —> 8 MB

### Bandwidth Requirements:
- Incoming data:
    - 100K simultaneous users submitting a 4 bit color —> 400000 bits —> 50 kb/s
- Outgoing data:
    - Every update must be broadcast to all other users, so 50kb is broadcast 100K times —> 5,000,000Kb —> 5 GB per 5 minutes. Let’s say we have 100k users for an hour, that’s 50 GB, and if we apply our 80/20 rule, a day of traffic would be 250 GB per day.
    - That should be a piece of cake for Cloudflare to handle and “free”, but in case we were to build this with our own servers like on digital ocean, which charges $0.02 / GB that be just $5.

### Throughput Requirements:
- 100K users could, through unlikely, submit a color all at the same time so that would be 100K requests per second at peak traffic.
- If we want to broadcast updates in real-time, then we probably want 

### Replacing Redis with a DurableObject
	
The board’s coordinates start from the top left (x, y) coordinate of (0, 0) all the way to the last pixel at the bottom right at (999, 999). To get the color of, say, the 500th row at the 350th column, that coordinate would be (349, 499), they would need to insert those X and Y coordinates into the formula 1000 y + x. 1000 * 499 + 349 ‎ = 499,349. They would need to get the 499,349th offset on the 4 million bitfield. 

Getting the color is not as easy as it would be if we were using Redis where bitfield is a basic primitive with high performance operations. We’ll need to extract the pixel information in JS or WASM. JS doesn’t have a Uint4Array, so we’ll need to do some bit hoop-jumping to use a Uint8Array (next most efficient typed array) to get/set the pixel color. Though it isn’t Redis, these operations should be fairly performant inside a cloudflare worker.

Any time the full board is requested, we can retrieve the 4M bitfield and store it cloudflare’s cache for 5 seconds, alongside a “Last-Modified” header timestamp for the most recent pixel update. This way, I do not overwork the cloudflare workers and they can stay focused on pixel updates.

[insert sample code]

### Real-time updates with websockets

Okay! Real-time updates. I think this is where the scale and cost really skyrockets. Instead of all having all users connect to a single DurableObject websocket server, we’ll shard connections using 2 Durable Object classes:
- WebsocketCoordinator: manages websocket servers and determines with websocket server the user will connect to and the centralized broadcaster.
- WebsocketServer: handles client-server websocket connections. Communicates with WebsocketCoordinator.

When an HTTP Upgrade request arrives, the CF worker registers the session with the WebsocketCoordinator and receives a WebsocketServer namespace. The namespace is where to forward the Upgrade request in order to establish a websocket connection. This allows us to shard the websocket connections into groups so that we tune how many connection each durable object manages. If we wanted to have max 1000 websocket connections then that would mean 100,000 / 1000 ‎ = 100 durable objects. When a pixel update arrives at a WebsocketServer DurableObject, check the rate limit counters and broadcast the change to its websocket connections and then forwards the update to the WebsocketCoordinator which rebroadcasts to all the other WebsocketServers, which broadcasts to all the other users.

[insert durable object websocket servers diagram]

### Cost Estimation

Request costs: 1 million free + $0.15 / million messages.
100,000 users at 1 tile per 5 minutes is 333 requests per second.
333 requests * 100,000 = 33,300,000 messages broadcast per 5 minutes
33,300,000 broadcast messages * 288 5-minute windows in a day =~ 10 billion messages * 0.15 per million =~ $1500

Duration costs: 400k GB-s + $12.50/million GB-s
Let’s assume a single websocket connection requires =~ 8 kb
Let’s say I want to have a max of 1,000 websocket connections per websocket server, then for 100K simultaneous users,
I would need 1,000 DurableObject instances or namespaces + 1 DurableObject for the WebsocketCoordinator
1000 connections would require =~ 8 megabytes of memory per server. So 100 durable objects would be 800 MB of memory.
800 MB of memory running for 86,400 seconds in a day = 69,120 GB-s
69,120 GB-s - free 400,000 GB-s ‎ =  FREE!

Cloudflare bandwidth is “Free”!

### Revenue Estimation

/r/place had 1M total unique users with probably 2.5 average sessions per user but probably 40% use an ad blockers.

So 1000000 * 2.5 * 0.6 ‎ = 1,500,000 impressions

For a RPM range of $3-$6, our estimated revenue could be $4.5k - $9k.


References:
- https://redditinc.com/blog/how-we-built-rplace

