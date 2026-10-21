## Why

After a03 the export writes Abacus files end to end, and the BMD code is no longer reached: `src/bmd/`, the EKR template, the Austrian Steuercode helpers, the BMD tests and golden files, and the BMD docs. Deleting them in a slice of their own keeps a03 reviewable as an engine switch and this slice reviewable as "only deletions, no behaviour change".

## What Changes

- **BREAKING** Remove `src/bmd/` (writer, dialects, Belegnummern, `bmdTarget`), `test/bmd/`, `test/golden/bmd/` and `test/helpers/bmd.ts`.
- **BREAKING** Remove `templates/ekr-hotel.rules.csv`, the Steuercode and Sachkontenlänge helpers in `src/mapping/` and `src/posting/`, `W-BUCHSYMBOL-SHARED` and the other BMD-only finding codes, with their tests.
- Remove `src/bmd` from the lint boundary; `TargetWriter` loses the BMD implementation of `currency()` and `movements()`.
- Remove `docs/bmd-format.md` and `docs/bmd-import.md` (replaced by `docs/abacus-format.md` and `docs/abacus-import.md`), fix links, remove deleted codes from `docs/troubleshooting.md`, rename the mapping guide's sign-off section to `## Checkliste zur Freigabe durch den Treuhänder`, and update the docs test's required-file list and the README/docs tests that named BMD files.
- Remove the Austrian research note `openspec/research/bmd-target.md` and the BMD topics from `docs/maintainers.md` (final list in a08).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `bmd-import-writer`: removed.
- `project-quality`: `src/bmd` leaves the lint boundary.
- `export-run`: the currency rule no longer names BMD.
- `documentation`: the required docs list names the Abacus guides; first-import scenario for Abacus.

## Non-goals

- No behaviour change: every Abacus golden file, protocol and test from a03 stays byte-identical.
- No README or guide rewrite beyond removing dead links, files and codes (a08).

## Impact

- Deleted: `src/bmd/`, `test/bmd/`, `test/golden/bmd/`, `test/helpers/bmd.ts`, `templates/ekr-hotel.rules.csv`, BMD code paths in `src/mapping/`, `src/posting/`, `src/cli/commands/doctor.ts`, `docs/bmd-*.md`, `openspec/research/bmd-target.md`.
- Changed: `eslint.config.js`, `test/lint/boundaries.test.ts`, `test/docs.test.ts`, `test/readme.test.ts`, `docs/troubleshooting.md`, `docs/mapping-guide.md`, `docs/maintainers.md`, links in README and `docs/`.
