# Repository Guidelines

## Project Structure & Module Organization
This repository is currently documentation-first. Key files and folders:
- `README.md`: team and repo overview.
- `Space_Based_Architecture_Assignment.md`: assignment context.
- `docs/superpowers/specs/`: architecture/spec documents.
- `docs/superpowers/plans/`: execution plans and task breakdowns.

Planned implementation layout (from current plan): `frontend/`, `pu1-product/`, `pu2-cart/`, `pu3-order/`, `pu4-inventory/`, `shared-contracts/`, `scripts/`, and `docs/testing/`.

## Build, Test, and Development Commands
There is no root build system yet. Use these commands for current workflow:
- `git status` - check local changes before committing.
- `git log --oneline -n 10` - review recent commit style.
- `rg --files` - quickly inspect repository contents.

When implementation folders are added, define per-module run/test scripts in each module (`frontend`, each `pu*`) and document them in `README.md`.

## Coding Style & Naming Conventions
- Use Markdown for architecture and planning docs with clear heading hierarchy (`#`, `##`, `###`).
- Keep filenames descriptive and date-prefixed for plans/specs, e.g. `YYYY-MM-DD-topic.md`.
- Use kebab-case for document filenames and folder names.
- Keep sections concise, actionable, and scoped to one topic.

For future code modules:
- Spring Boot services: standard Java conventions (`PascalCase` classes, `camelCase` methods).
- React: component files in `PascalCase`, hooks/utilities in `camelCase`.

## Testing Guidelines
Current testing is document validation and review:
- Verify specs and plans are internally consistent (APIs, data keys, execution order).
- Record test strategy and evidence under `docs/testing/` once implementation starts.

Planned test layers: unit tests per PU, service integration tests, end-to-end demo flow, and load tests (Postman Runner, optional k6).

## Commit & Pull Request Guidelines
Recent history uses short messages (for example: `init`, `update readme & init`). Prefer a clearer pattern going forward:
- `<scope>: <what changed>` (example: `docs: add flash-sale implementation plan`).

PR requirements:
- Clear summary of changes and impacted paths.
- Link to related spec/plan file in `docs/superpowers/`.
- For behavioral changes, include test evidence or validation notes.
- Keep PRs focused on one concern (docs, one service, or frontend flow).
