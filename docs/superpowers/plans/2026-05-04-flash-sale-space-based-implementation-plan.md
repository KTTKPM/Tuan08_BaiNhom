# Flash Sale SBA (Spring Boot + React) Implementation Plan

## Summary

Goal: build demo-ready Space-Based Architecture flash-sale system from spec at [2026-05-04-flash-sale-space-based-design.md](F:\Cntt\KienTruc\Tuan08_BaiNhom\docs\superpowers\specs\2026-05-04-flash-sale-space-based-design.md).  
Stack locked: Spring Boot + React.  
Layout locked: mono-repo PU folders.  
Execution order: vertical MVP first, then hardening + load test.

## Implementation Changes

1. Repo bootstrap (mono-repo)

- Create folders: `frontend`, `pu1-product`, `pu2-cart`, `pu3-order`, `pu4-inventory`, `shared-contracts`, `scripts`, `docs/testing`.
- Add root `README` runbook: start order, ports, env vars, Redis seed/load-test commands.
- Define shared API/DTO contracts in `shared-contracts` (request/response JSON shapes only; no business logic).

2. PU services (Spring Boot)

- `pu1-product`: `GET /products`, `GET /products/{id}` from Redis only.
- `pu2-cart`: `POST /cart/add`, `GET /cart?userId=...`; cart hash ops in Redis.
- `pu4-inventory`: `GET /stock/{productId}`, `POST /inventory/reserve`; Redis Lua atomic check+decrement.
- `pu3-order`: `POST /checkout`; idempotency key, cart fetch, call PU4, write order keys, clear cart.
- Cross-service config: Redis host/port, PU endpoints, request timeout/retry policy.
- Add health endpoints and structured logs (requestId/userId/orderId).

3. Frontend (React)

- Pages/components: product list, cart view, checkout action, stock/result feedback.
- API client per PU endpoint; simple error state for insufficient stock/timeouts.
- Demo UX path fixed: list -> add -> cart -> checkout -> stock refresh.

4. Data grid + scripts

- Redis key schema implement exactly from spec (`product:*`, `products:index`, `cart:*`, `stock:*`, `order:*`, `idempotency:*`, `order_seq`).
- Add seed script for products + initial stock.
- Add helper script for clearing demo keys and reseeding.

5. Hardening phase

- Idempotency persistence (TTL + replay-safe response).
- Error contract normalization (`code/message/failedItems`).
- Reconcile hook for reserve-success/order-write-fail (`PENDING_RECONCILE` marker).
- Optional bonus toggles: Redis Stream `order_events`, SETNX lock experiment, Hazelcast spike doc.

## Public APIs / Interfaces

- PU1:
  - `GET /products`
  - `GET /products/{id}`
- PU2:
  - `POST /cart/add` body `{ userId, productId, qty }`
  - `GET /cart?userId=...`
- PU3:
  - `POST /checkout` body `{ userId, idempotencyKey }`
  - success `{ orderId, status, total, items }`
  - fail `{ code, message, failedItems }`
- PU4:
  - `GET /stock/{productId}`
  - `POST /inventory/reserve` body `{ items:[{ productId, qty }] }`
- Redis contract:
  - Hash-heavy model + stock string counters + Lua atomic reserve semantics.

## Test Plan

1. Unit tests (each PU)

- Redis mapping/serialization for keys.
- Cart add/merge qty behavior.
- Inventory Lua script: pass/fail/no-partial-decrement.
- Checkout idempotency behavior + empty cart rejection.

2. Integration tests (service level)

- PU3 -> PU4 reserve success path.
- PU3 reserve fail path (insufficient stock).
- PU3 timeout/retry path.
- Order write + cart clear + stock decrement consistency.

3. End-to-end demo tests

- Scenario: list products -> add cart -> checkout -> stock immediate decrement.
- Negative: concurrent checkout on same low-stock product, oversell must stay zero.
- Mandatory acceptance checks from spec checklist.

4. Load tests

- Tool: Postman Runner (required), optional k6.
- Scenarios: product read burst, cart burst, hot-item checkout burst.
- Capture: req/s, p95/p99 latency, success/fail rate, oversell count.

## Task Breakdown (execution-ready)

1. Bootstrap mono-repo folders + root runbook.
2. Create Redis key constants + DTO contracts.
3. Implement PU4 inventory reserve Lua + tests.
4. Implement PU2 cart APIs + tests.
5. Implement PU1 product APIs + tests.
6. Implement PU3 checkout orchestration + tests.
7. Implement frontend MVP flow.
8. Add seed/reset scripts + env configs.
9. Run integration + e2e demo script.
10. Run load test + collect evidence docs.

## Assumptions / Defaults

- Runtime path zero direct DB calls (Redis only).
- Internal PU auth skipped for assignment demo LAN.
- Single Redis instance enough for class demo.
- Java version and build tooling follow team default Spring Boot baseline.
- One repo shared by 5 members; each member owns one PU/FE folder.
