## Why

With the Abacus writer in place (a02), the export still maps apaleo accounts to BMD Sachkonten and Steuercodes and writes BMD files. Swiss Treuhänder need a Kontenzuordnung to Abacus accounts with an MWST-Code and rate per row, a hotel template based on the Schweizer Kontenrahmen KMU, and posting rules that put the MWST-bearing account into `SingleInformation`. This slice switches the product to Abacus end to end; a04 deletes the then unused BMD code separately.

## What Changes

- **BREAKING** Mapping CSV columns `apaleo_account;apaleo_type;apaleo_name;apaleo_vat_percent;abacus_account;mwst_code;mwst_percent;kost;comment`; BMD, DATEV and Grman mapping files are refused with a hint to `init-mapping --template kmu-hotel`.
- KMU hotel template and `init-mapping --template kmu-hotel` (replaces `ekr`): revenue by Swiss rate, payments, folios, Debitoren, deposits and write-offs by rate wildcards, MWST-Codes from `abacus.mwstCodes`; Kurtaxe, House, TransitoryItems, pre-2024 and non-Swiss rates stay empty with a comment; every row `Vorschlag (ungeprüft)`.
- `mapping check` for Abacus: account format, MWST-Code format and placement, Swiss rates, `kost`, untaxed revenue, rate consistency.
- Posting rules for Abacus: VAT side in `SingleInformation` with apaleo's per-line tax, gross amount, `DebitCredit`, Kostenstelle only on revenue and write-off lines, texts without guest names (`posting.text2` replaces `posting.extbelegnr`).
- **BREAKING** The `abacus` section is required and the `bmd` section is refused; the pipeline uses `abacusTarget` (currency = `abacus.leitwaehrung`, so CHF properties export); the plausibility checks take the movement model from the target.
- The live regression runs on the recorded VIE day with `abacus.leitwaehrung: EUR` and a committed Abacus live mapping; demo, `docs/examples/` and command lines follow; first `docs/abacus-import.md`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `account-mapping`: file format, unmapped guard, KMU template replaces EKR, validation, init-mapping, deposit rows.
- `posting-rules`: VAT side in SingleInformation, tax guard, fields, summary; Austrian special cases removed (Swiss ones follow in a05).
- `cli`: `abacus` required, `bmd` refused.
- `export-run`: movement model from the target; live regression.
- `documentation`: `docs/examples/` and the demo output are Abacus files.

## Non-goals

- Deleting `src/bmd`, the EKR template and BMD docs: a04.
- Swiss special cases (Kurtaxe treatments, Anzahlungen and Abrechnungsart, Annullationen, Debitorenverlust) and the CHF fixture month: a05.
- Demo data in CHF, protocol wording, Docker, Swiss docs: a06-a08.

## Impact

- `src/mapping`, `src/posting`, `src/core/config.ts`, `src/export/pipeline.ts`, `src/export/checks.ts`, `src/export/target.ts`, `src/cli/commands`, `templates/kmu-hotel.rules.csv`, demo config and mapping.
- Tests under `test/mapping`, `test/posting`, `test/export`, `test/cli`, `test/examples.test.ts`, `test/helpers/live-mapping.ts`.
- README and README.en command lines, `docs/mapping-guide.md`, `docs/posting-rules.md`, `docs/configuration.md`, `docs/troubleshooting.md`, `docs/export.md`, new `docs/abacus-import.md`.
