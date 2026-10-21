## Context

The repository starts as an exact copy of apaleo-bmd-export v0.1.0 (commit `dce2814`), which includes the v0.1.1 live-data fixes (precise net and tax amounts, per-reservation accounts, `/Offset` lines). Its engine is target-independent apart from three places: the names (package, binary, config, environment, image), the `EXPORT_CURRENCY = 'EUR'` gate in `src/export/pipeline.ts`, and the BMD writer behind `TargetWriter` (`src/bmd/target.ts`, chosen by `DEFAULT_TARGET`). Abacus Mandanten of Swiss hotels keep their books in CHF (research §7), so the currency gate must belong to the target before a02 adds a CHF-capable writer.

## Goals / Non-Goals

**Goals:**
- One consistent identity: `apaleo-abacus-export`, `apaleo-abacus`, `apaleo-abacus.config.yaml`, `APALEO_ABACUS_*`, `apaleo-abacus-export:local`.
- The currency the file carries is decided by the target writer, not by the pipeline.
- Every slice after this one can rely on the new names in tests, docs and CI.

**Non-Goals:**
- Any change of output: BMD golden files, protocols and the demo stay byte-identical apart from the tool name and version in protocol and manifest.
- Rewriting docs prose (a08) or removing BMD (a04).

## Decisions

1. **Rename everything in one slice, keep old config names git-ignored.** Same approach as b01 in the BMD project: one mechanical rename that the docs test and the CLI tests pin. `.gitignore` keeps `/apaleo-bmd.config.*` and `/apaleo-datev.config.*` so an old local config with account numbers never gets committed. Alternative considered: keep `apaleo-bmd` as an alias binary. Rejected: the product is new, there are no users of an old name.
2. **Old environment variables are ignored, not migrated.** `APALEO_BMD_*` is neither read nor rejected (the prefix check only rejects unknown `APALEO_ABACUS_*` variables), so a shell with old variables cannot change an Abacus export by accident. Alternative: reject them loudly. Rejected: a developer with both projects checked out would get errors in the wrong project.
3. **`TargetWriter.currency(config)` instead of a pipeline constant.** The pipeline asks `target.currency(loaded.config)` and keeps the existing two-step check (property currency before reading the ledger, line currencies after). `bmdTarget.currency` returns `'EUR'`. The `E-CURRENCY` text names the target's currency and keeps "this tool does not convert", but no longer explains BMD's Grundwährung inside `src/export/`; that sentence moves into the BMD target's advice. Alternative: a list of accepted currencies. Rejected: a file has exactly one Leitwährung; Abacus (a02) answers with `abacus.leitwaehrung`.
4. **Scope cut is declarative here, code removal in a04.** `--help` summary, package description, `openspec/config.yaml` and `docs/maintainers.md` drop the BMD promises now; BMD code stays reachable until the Abacus target replaces it in a03, so every slice stays green.

## Risks / Trade-offs

- [The README still describes a BMD product under an Abacus name until a08] → the repository stays private and unpublished until a08 (documented in `docs/maintainers.md` `## Vor der Veröffentlichung`).
- [A missed `apaleo-bmd` string in CI breaks the quick-start job] → task 3.3 greps for every old name; the docs test now fails on any `apaleo-bmd` command line.

## Migration Plan

Not applicable: no installation of this product exists yet. Developers rename a local `apaleo-bmd.config.yaml` to `apaleo-abacus.config.yaml` by hand.

## Open Questions

None for this slice.
