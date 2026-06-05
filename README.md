# 📦 Caching Proxy CLI

A high-performance **Node.js CLI reverse proxy tool** featuring in-memory caching (TTL) and request deduplication (`inFlight` mechanism). Designed to optimize API performance, reduce redundant upstream requests, and gracefully handle spikes in concurrent traffic.

---

## 🚀 Features

- ⚡ **Reverse Proxy Server:** Built native on Node.js.
- 🧠 **Smart Caching:** In-memory caching specifically for `GET` and `HEAD` requests.
- ⏳ **TTL Expiration:** Automatic Time-To-Live cache invalidation.
- 🔁 **Request Collapsing:** `inFlight` mechanism prevents duplicate concurrent origin calls (thundering herd problem).
- 🧹 **Header Filtering:** Automatically strips unsafe and hop-by-hop HTTP headers.
- 📉 **Load Reduction:** Drastically lowers resource consumption on origin servers under load.
- 📡 **Lightweight CLI:** Zero-config execution directly from your terminal.

---

## 🧠 Architecture & Request Flow

```text
Client Request ──> Proxy Server ──> Cache Check ──> InFlight Deduplication ──> Origin Server
```

1. **Client Request:** Traffic hits the local proxy server.
2. **Cache Check:** The system looks for a valid, unexpired entry in the in-memory `Map`.
3. **InFlight Deduplication:** If it's a cache miss but an identical request is already active, subsequent requests wait for that single upstream response.
4. **Origin Server:** The upstream server is queried only when absolutely necessary.

---

## 📥 Installation

### Global Installation
Install the package globally via npm:
```bash
npm install -g caching-proxy
```

### Run via npx
Execute immediately without global installation:
```bash
npx caching-proxy --port 3000 --origin http://example.com
```

---

## ⚙️ CLI Options


| Flag | Description | Default / Example |
| :--- | :--- | :--- |
| `--port` | Port for the proxy server to listen on | `3000` |
| `--origin` | Target upstream origin server URL | `http://localhost:4000` |
| `--help` | Show the help menu and usage guide | — |
| `--version` | Display the current installed version | — |

---

## ⚡ Caching & Deduplication Strategy

### Caching Rules
- Only **GET** and **HEAD** requests are cached to maintain safety.
- Responses are temporarily stored in memory using a fast, native JavaScript `Map`.
- `Cache HIT` returns the payload instantly.
- `Cache MISS` fetches data from the origin and populates the cache.

### Request Deduplication (`inFlight`)
When multiple identical requests arrive simultaneously before the first one finishes:
1. Only **ONE** request is dispatched to the origin server.
2. All other concurrent matching requests stall safely in memory.
3. Once the origin resolves, the single response is distributed to all waiting clients.

---

## 📡 Custom Response Headers

Inspect your network tab or curl output to see the proxy status:


| Header | Meaning |
| :--- | :--- |
| `x-cache: HIT` | The response was served directly from the proxy's memory. |
| `x-cache: MISS` | The response was fetched fresh from the origin server. |

---

## 🧪 Quick Start Example

1. Start your proxy server pointing to your backend application:
   ```bash
   caching-proxy --port 3000 --origin http://localhost:4000
   ```

2. Query your endpoint using `curl` or any API client:
   ```bash
   curl -I http://localhost:3000/users
   ```

3. **Observed Behavior:**
   - **First Request:** Returns `x-cache: MISS` (fetched from origin).
   - **Subsequent Requests:** Returns `x-cache: HIT` (served instantly from cache).

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express
- **State Management:** In-memory native JavaScript `Map`
- **Concurrency Control:** Custom `inFlight` promise-collapsing middleware

---

## 📌 Project Focus

This project serves as a practical implementation of fundamental backend system design patterns:
- Reverse proxy configurations.
- Time-to-Live (TTL) cache invalidation.
- Race condition mitigation and concurrency handling in Node.js.
- Upstream server resource preservation under heavy traffic loads.

---

