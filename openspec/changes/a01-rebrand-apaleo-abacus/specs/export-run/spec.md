## MODIFIED Requirements

### Requirement: Export command
The CLI SHALL provide `apaleo-abacus export` taking either `--from <date> --to <date>` (inclusive business dates) or `--month <YYYY-MM>`, an optional `--property <id>` (default: every configured property), and the flags `--dry-run` and `--overwrite`. It SHALL exit with code 0 when every property and month succeeded and 1 when any failed.

#### Scenario: Monthly export
- **WHEN** the user runs `apaleo-abacus export --month 2026-10 --property BSP` with a complete mapping
- **THEN** one file of the configured target for 2026-10-01 to 2026-10-31 is written for BSP and the exit code is 0

#### Scenario: Missing period
- **WHEN** the user runs `apaleo-abacus export` without a period
- **THEN** the CLI exits with code 2 and explains `--month` and `--from/--to`

### Requirement: Target writer boundary
The export pipeline SHALL write files only through a `TargetWriter` that provides the file name for a property and period, the file-name pattern used to find existing and overlapping files of that target, the rendered bytes, the comparison that decides whether an existing file is unchanged, the protocol title, the target's advice in the `E-PERIOD-OVERLAP` and `E-FILE-EXISTS` refusals (the program the file is imported into, its config keys, how an imported file is undone), and the currency the target books in for a given config. `src/export/` SHALL NOT import a target module's internals other than its `TargetWriter`, and the output folder logic SHALL NOT contain a target-specific file pattern, program name, currency or config key. A manifest entry SHALL count as a file of the target only when its name matches the target's file pattern.

#### Scenario: BMD output unchanged behind the boundary
- **WHEN** the golden-file tests run after the currency moves into the `TargetWriter`
- **THEN** every golden BMD file is byte-identical to before, and the golden protocol and `manifest.json` differ only in the tool name and the tool version

#### Scenario: Pattern and comparison come from the writer
- **WHEN** a test runs the export with a fake `TargetWriter` whose files are named `FAKE_<from>-<to>_<propertyId>.txt` and whose comparison ignores nothing
- **THEN** existence, overlap (`E-PERIOD-OVERLAP`), unchanged re-runs and `E-FILE-EXISTS` work for the fake files exactly as for BMD files, and no BMD name appears in the output folder

#### Scenario: Refusal advice comes from the writer
- **WHEN** the fake `TargetWriter` refuses a file with `E-PERIOD-OVERLAP` or `E-FILE-EXISTS`
- **THEN** the message carries the fake target's advice and names neither BMD nor a `bmd.*` config key

#### Scenario: Manifest entry of another target
- **WHEN** `manifest.json` records a current file of the fake target for the period and no file of the default target exists
- **THEN** the lookup for the default target (as used by `schedule --once`) finds no file for that period

## REMOVED Requirements

### Requirement: EUR only
**Reason**: The currency a file can carry is a property of the target format, not of the pipeline: BMD books in EUR, Abacus in the Mandant's Leitwährung (CHF for Swiss hotels).
**Migration**: See "Currency of the target"; with the BMD target the behaviour is unchanged (`E-CURRENCY` for a CHF property).

## ADDED Requirements

### Requirement: Currency of the target
The export SHALL ask the configured `TargetWriter` for the currency it books in and SHALL refuse with `E-CURRENCY`, per property-month and before writing, a property whose currency differs from it (without reading the ledger) and a month with any ledger line in another currency, naming both currencies and saying that the tool does not convert. The BMD target SHALL answer `EUR`.

#### Scenario: Swiss property with the BMD target
- **WHEN** the property's currency is CHF and the target is BMD
- **THEN** `E-CURRENCY` names CHF and EUR, the ledger is not read and no file is written for that property

#### Scenario: Target that books in CHF
- **WHEN** a test runs the export with a fake `TargetWriter` that books in CHF, for a property whose currency is CHF and whose ledger lines are all in CHF
- **THEN** no `E-CURRENCY` is raised and the fake file is written

#### Scenario: Line in another currency
- **WHEN** the fake target books in CHF and one ledger line of the month is in EUR
- **THEN** `E-CURRENCY` names the number of such lines and both currencies, and no file is written for that property-month
