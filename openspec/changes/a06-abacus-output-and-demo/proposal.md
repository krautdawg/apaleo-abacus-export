## Why

The Treuhänder decides on the protocol, not on the XML: before importing, they compare the posting summary with apaleo and, after importing, with Abacus' Saldenliste and MWST-Journal. After a03-a05 the protocol, dry run, manifest and refusal texts still use the BMD wording and layout, the plausibility checks know rates but not MWST-Codes, and the demo still runs on the old EUR demo data. This slice makes output, checks and demo Swiss.

## What Changes

- Dry run and protocol: summary per Abacus account and per MWST-Code and rate (net, tax, gross, apaleo's precise VAT, difference) with the MWST-Abrechnung Ziffer of each Swiss rate (8.1 % 303, 2.6 % 313, 3.8 % 343), deposit tax, Kurtaxe and other levies, payments, deposits, Debitoren, write-offs, skipped lines, findings, and the Abacus import block.
- Manifest: file name, SHA-256, number of bookings, journal total in the Leitwährung, tax per MWST-Code and rate, Mandant, mapping SHA-256, tool version, creation time.
- Re-runs and overlaps: `E-FILE-EXISTS` and `E-PERIOD-OVERLAP` explain how to delete or reverse imported bookings in Abacus; a changed `abacus.*` value that changes the file is refused until `--overwrite`.
- New plausibility check `E-MWST-CODE-RATES`: one MWST-Code with two rates in one file is refused, because Abacus knows one rate per code and date.
- Demo: bundled Swiss demo data "Hotel Beispiel" in CHF (`Europe/Zurich`, September 2026, Mandant `7777`, the number of Abacus' sample Mandant), KMU template mapping; `docs/examples/` regenerated with the Swiss file, protocol and mapping.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `export-run`: dry run, output layout and manifest, idempotent re-runs, the MWST-Code check.
- `documentation`: Swiss demo and examples.

## Non-goals

- No e-mail or S3 delivery, no PDF, no Debitoren file.
- No change to the posting rules or the writer format.
- Docker and scheduler defaults (a07), README and guide rewrite (a08).

## Impact

- `src/export/summary.ts`, `src/export/output.ts`, `src/export/checks.ts`, `src/export/pipeline.ts`, `src/abacus/import-block.ts`, `src/demo/`, `examples/demo/` (apaleo responses, config, mapping, README).
- Tests under `test/export/`, `test/cli/demo.test.ts`, `test/examples.test.ts`, `test/golden/export/`.
- `docs/examples/`, `docs/export.md`, `docs/troubleshooting.md`.
