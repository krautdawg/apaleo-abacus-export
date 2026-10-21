## Why

This repository is a copy of apaleo-bmd-export v0.1.0: package, binary, config, environment variables, container and CI all say BMD, and the export refuses every property that does not book in EUR. Before any Abacus code lands, the tool needs its own identity, its declared scope cut to apaleo -> Abacus FIBU, and a currency gate owned by the target writer, so the Abacus writer (a02) can accept CHF without touching the pipeline again.

## What Changes

- **BREAKING** Package `apaleo-abacus-export` (version `0.0.0`), binary `apaleo-abacus`, help and version output, package description "apaleo -> Abacus Finanzbuchhaltung (Switzerland)".
- **BREAKING** Config file `./apaleo-abacus.config.yaml`, `APALEO_ABACUS_CONFIG`, override prefix `APALEO_ABACUS_`; `APALEO_CLIENT_ID`/`APALEO_CLIENT_SECRET` stay; example config renamed; `.gitignore` covers new and old config names.
- `TargetWriter` names the currency it books in, and `E-CURRENCY` compares property and ledger lines with it. The BMD target answers `EUR`, so output and golden files stay unchanged.
- Dockerfile, compose and `.env` examples, CI smoke steps, quick-start filter and image tag follow the new names.
- README and docs command lines, clone URL, `cd` line and badges point to apaleo-abacus-export; the docs test reads the new binary and no longer forbids the Swiss terms `Kurtaxe` and `Mandantennummer`. Prose is rewritten in a08.
- Scope cut: BMD-only backlog items leave `docs/maintainers.md`; `openspec/config.yaml` and `openspec/research/a-target.md` describe the Abacus product.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cli`: binary, config file and environment names.
- `export-run`: command name; the currency rule moves into the target-writer boundary.
- `apaleo-source`: command names of `properties` and `live-smoke`.
- `container-deployment`: config path, entry point, image and environment names.
- `documentation`: docs test for `apaleo-abacus` command lines, `abacus` config prefix, Swiss terms allowed.

## Non-goals

- No Abacus output (a02), no mapping or posting change (a03), no BMD removal (a04), no prose rewrite (a08).
- No change of repository visibility, no publishing, no npm or registry release.
- The scheduler spec keeps the old command name until a07; the code is renamed here.

## Impact

- `package.json`, `src/cli/*`, `src/core/config.ts`, `src/export/target.ts`, `src/export/pipeline.ts`, `src/bmd/target.ts`.
- Tests naming binary, config or env variables; `test/docs.test.ts`; a fake-target currency test.
- `Dockerfile`, `docker-compose.example.yml`, `.env.example`, `.gitignore`, `.github/workflows/ci.yml`, README and docs command lines, `docs/maintainers.md`.
