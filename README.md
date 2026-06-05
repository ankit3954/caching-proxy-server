Caching Proxy CLI

A high-performance Node.js CLI reverse proxy tool with in-memory caching, TTL-based expiry, and request deduplication (inFlight mechanism) to optimize API performance and reduce redundant upstream calls.

Features
1. Reverse proxy server using Node.js
2. In-memory caching for GET/HEAD requests
3. TTL-based cache expiration
4. Request collapsing using inFlight promises
5. Header sanitization for safe proxy forwarding
6. Reduces duplicate origin calls under concurrent load