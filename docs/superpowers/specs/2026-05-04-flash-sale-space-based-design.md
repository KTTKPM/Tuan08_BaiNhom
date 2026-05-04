# Flash Sale Space-Based Architecture Design Spec

Date: 2026-05-04  
Project: Space-Based Architecture Assignment (Buoi 7)  
Scope: Flash sale system with high throughput, low latency, and Redis-backed in-memory grid

## 1. Goals And Constraints

### Goals
- Handle 1000+ requests/second for read + checkout workloads.
- Keep response latency low for product read, cart update, and checkout.
- Avoid database bottleneck in runtime path.
- Demonstrate real-time stock decrement on checkout.

### Constraints
- Runtime path must read/write from Data Grid (Redis), not direct DB.
- Architecture must follow Space-Based style:
  - Processing Units (PU) own processing logic.
  - Shared in-memory Data Grid for state.
- Five team roles map to five components (Frontend + PU1..PU4).

## 2. System Scope And Decomposition

System is decomposed into one frontend and four Processing Units:

1. Frontend (ReactJS)
2. PU1 Product Service
3. PU2 Cart Service
4. PU3 Order Service
5. PU4 Inventory Service

Shared infrastructure:
- Redis as Data Grid
- Optional Redis Stream (bonus, async events)

Build strategy:
1. Vertical MVP first (end-to-end demo path).
2. Infra hardening + load test after MVP.

## 3. Architecture Overview

## 3.1 Component Responsibilities

### Frontend (ReactJS)
- Show product list.
- Show product detail.
- Add item to cart.
- View cart.
- Trigger checkout.

### PU1 Product
- `GET /products`
- `GET /products/{id}`
- Read-only access to product catalog from Redis.

### PU2 Cart
- `POST /cart/add`
- `GET /cart?userId=...`
- Manage per-user cart state in Redis.

### PU3 Order
- `POST /checkout`
- Checkout orchestration:
  - Read cart from Redis.
  - Call PU4 to reserve/decrement stock atomically.
  - Create order data.
  - Clear cart.
  - Return result immediately.

### PU4 Inventory
- `GET /stock/{productId}`
- `POST /inventory/reserve` (internal API used by PU3)
- Own all stock mutation logic.
- Execute atomic Redis Lua script to prevent oversell.

### Redis Data Grid
- Single source of runtime state (catalog, cart, stock, order).
- No synchronous DB dependency in checkout path.

## 3.2 High-Level Request Flow

1. User views products via PU1.
2. User adds products via PU2 (cart stored in Redis).
3. User checks out via PU3.
4. PU3 calls PU4 reserve endpoint.
5. PU4 runs atomic stock validation + decrement script in Redis.
6. PU3 writes order + clears cart.
7. User receives immediate result.

## 4. Redis Data Model

Chosen model: Hash-heavy, with stock counters in String values.

## 4.1 Keys

- `product:{id}` (Hash)
  - fields: `id`, `name`, `price`, `image`, `desc`, `category`
- `products:index` (Set or List of product IDs)
- `cart:{userId}` (Hash)
  - field = `productId`, value = `qty`
- `stock:{productId}` (String integer)
- `order_seq` (String integer, auto-increment sequence)
- `order:{orderId}` (Hash)
  - fields: `orderId`, `userId`, `total`, `status`, `createdAt`
- `order:{orderId}:items` (Hash or JSON-encoded item lines)
- `idempotency:{userId}:{token}` (String with TTL)
  - used to prevent duplicate checkout submission

## 4.2 Data Ownership

- PU1 owns read patterns on product keys.
- PU2 owns cart key writes.
- PU4 owns stock key writes.
- PU3 owns order key writes and idempotency key set/check.

## 5. API Contracts

## 5.1 PU1 Product API

- `GET /products`
  - Response: list of product summaries.
- `GET /products/{id}`
  - Response: single product detail.

## 5.2 PU2 Cart API

- `POST /cart/add`
  - Request: `{ userId, productId, qty }`
  - Behavior: increment or set cart quantity in `cart:{userId}`.
- `GET /cart?userId=...`
  - Response: cart items + computed subtotal.

## 5.3 PU3 Order API

- `POST /checkout`
  - Request: `{ userId, idempotencyKey }`
  - Behavior:
    - Reject empty cart.
    - Call PU4 reserve endpoint.
    - On success, persist order in Redis and clear cart.
  - Response:
    - success: `{ orderId, status, total, items }`
    - failure: `{ code, message, failedItems }`

## 5.4 PU4 Inventory API

- `GET /stock/{productId}`
  - Response: `{ productId, stock }`
- `POST /inventory/reserve` (internal)
  - Request: `{ items: [{ productId, qty }] }`
  - Response:
    - success: `{ reserved: true }`
    - fail: `{ reserved: false, failedItems: [...] }`

## 6. Critical Checkout Design

## 6.1 Sequence

1. PU3 receives checkout request.
2. PU3 checks idempotency key:
  - if already processed, return prior result or duplicate-safe response.
3. PU3 reads cart from `cart:{userId}`.
4. PU3 calls PU4 `/inventory/reserve`.
5. PU4 executes Lua script atomically:
  - Validate all requested stocks first.
  - If any item insufficient, fail all (no partial decrement).
  - If all sufficient, decrement all stocks in one atomic execution.
6. PU3 on reserve success:
  - `INCR order_seq` -> orderId
  - Write `order:{orderId}` + `order:{orderId}:items`
  - Delete/clear `cart:{userId}`
  - Store idempotency result snapshot (short TTL)
7. PU3 returns success immediately.

## 6.2 Oversell Prevention

- Stock mutation only in PU4.
- Redis Lua script ensures check-and-decrement is atomic.
- No multi-step non-atomic `GET` + `DECR` race.

## 6.3 Failure Behavior

- Insufficient stock: checkout fails with failed item list.
- PU4 timeout/network failure: PU3 returns retryable error.
- Order write failure after stock reserve:
  - Mark order status as `PENDING_RECONCILE` in fallback path.
  - Add compensating task/event for reconciliation (or immediate manual rollback rule in demo).

## 7. Non-Functional Design

## 7.1 Performance

- Keep product/catalog and cart reads in memory (Redis).
- Avoid DB call in synchronous flow.
- Keep payloads compact; avoid over-fetching.

## 7.2 Scalability

- PU services can scale horizontally independently.
- Redis can scale via replication/sharding strategy (bonus expansion).

## 7.3 Availability

- If one PU scales down, others remain isolated.
- Add timeout + retry policy between PU3 and PU4.
- Health endpoints per service for local LAN demo.

## 8. Deployment Topology (LAN)

- Redis: `192.168.x.x:6379`
- PU1 Product: `192.168.x.x:8081`
- PU2 Cart: `192.168.x.x:8082`
- PU3 Order: `192.168.x.x:8083`
- PU4 Inventory: `192.168.x.x:8084`
- Frontend: `192.168.x.x:3000`

Note: Actual IP values set by team during deployment.

## 9. MVP Delivery Plan

## Phase 1: Vertical MVP (priority)
- Seed products + stock in Redis.
- Implement PU1 read APIs.
- Implement PU2 cart APIs.
- Implement PU4 reserve + stock API with Lua script.
- Implement PU3 checkout orchestration.
- Implement frontend flow:
  - list -> add cart -> checkout -> show result.

## Phase 2: Hardening + Testing
- Add idempotency behavior.
- Add timeout/retry and error contract consistency.
- Add baseline observability logs/metrics.
- Run concurrency tests and record results.

## 10. Demo Script (Mandatory)

1. Query `GET /products` -> response from Redis.
2. Add one or more products using `POST /cart/add`.
3. View cart using `GET /cart`.
4. Checkout via `POST /checkout`.
5. Immediately query `GET /stock/{productId}` and confirm decrement.
6. Repeat checkout concurrently to show no oversell and stable latency.

## 11. Load Test Plan

Tool options:
- Postman Runner (minimum requirement)
- k6/JMeter (optional stronger proof)

Scenarios:
- Product read burst.
- Cart add burst.
- Concurrent checkout on same hot product.

Metrics to capture:
- Throughput (req/s)
- p95/p99 latency per endpoint
- Checkout success/failure rate
- Oversell count (must be zero)

Success criteria:
- System remains responsive under target load.
- No DB bottleneck in critical path.
- Stock consistency preserved.

## 12. Risks And Mitigations

- Risk: Oversell under concurrency  
  Mitigation: single-owner stock writes in PU4 + Redis Lua atomic script.

- Risk: Duplicate checkout from repeated clicks/retries  
  Mitigation: idempotency key with TTL and stored result.

- Risk: Partial failure between reserve and order persistence  
  Mitigation: fallback status + reconciliation workflow/event.

- Risk: Integration drift across 5 team members  
  Mitigation: freeze API contracts early and use shared request/response schemas.

## 13. Bonus Extensions

- Replace Redis with Hazelcast to compare Data Grid behavior.
- Add distributed locking (SETNX) where appropriate.
- Add async queue/stream for order event processing.
- Extend load test to include failover and retry behavior.

## 14. Acceptance Checklist

- [ ] All 5 required functions available.
- [ ] Runtime path uses Redis Data Grid (no direct DB calls in critical APIs).
- [ ] Checkout decrements stock in real time.
- [ ] Demo flow runs end-to-end on LAN.
- [ ] Concurrency test evidence captured.
