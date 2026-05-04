# Copilot instructions for this repository

## Build, test, lint commands

Current repo is documentation-first; no app modules scaffolded yet, so no runnable build/lint/test pipelines exist.

Use these real workflow commands now:

- `git status`
- `git log --oneline -n 10`
- `rg --files`

Single-test command: not available yet (no test runner configured in repo at this stage).

## High-level architecture (project direction)

Project target is a **Space-Based Architecture** flash-sale system (see `Space_Based_Architecture_Assignment.md` and `docs/superpowers/specs/2026-05-04-flash-sale-space-based-design.md`).

Planned components:

1. `frontend` (React UI)
2. `pu1-product` (read product catalog from Redis)
3. `pu2-cart` (cart state in Redis)
4. `pu3-order` (checkout orchestration)
5. `pu4-inventory` (atomic stock reserve/decrement)

Shared runtime backbone:

- **Redis Data Grid** is runtime source of truth
- Optional messaging/stream for async extensions
- Critical path avoids direct DB access

Key request flow:

1. Frontend reads products via PU1
2. Add/view cart via PU2
3. Checkout via PU3
4. PU3 calls PU4 reserve
5. PU4 uses atomic Redis Lua script to prevent oversell
6. PU3 writes order + clears cart + returns immediately

## Key conventions specific to this repo

- Repo is intentionally **docs-first** right now; architecture/spec/plan docs are primary artifacts before implementation.
- Specs live in `docs/superpowers/specs/`; plans live in `docs/superpowers/plans/`.
- Spec/plan filenames use date-prefixed kebab-case: `YYYY-MM-DD-<topic>.md`.
- Planned module boundaries are strict by processing unit ownership (PU1 product reads, PU2 cart writes, PU3 order orchestration, PU4 stock mutation).
- Redis key model is contract-driven (for example: `product:*`, `products:index`, `cart:*`, `stock:*`, `order:*`, `idempotency:*`, `order_seq`) and should stay consistent across PUs.
- For this assignment direction, runtime APIs should align with published contracts in the design spec:
  - `GET /products`, `GET /products/{id}`
  - `POST /cart/add`, `GET /cart`
  - `POST /checkout`
  - `GET /stock/{productId}`, `POST /inventory/reserve`

