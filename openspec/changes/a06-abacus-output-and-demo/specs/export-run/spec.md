## MODIFIED Requirements

### Requirement: Dry run
With `--dry-run` the export SHALL run every step except writing, SHALL print the posting summary (totals per Abacus account; net, tax and gross per MWST-Code and rate with apaleo's precise VAT, the difference to the tax per booking and, for the Swiss rates, the Ziffer of the MWST-Abrechnung: 8.1 % 303, 2.6 % 313, 3.8 % 343; deposit tax per MWST-Code and rate the same way; Kurtaxe and other levies per account, with or without MWST; payments per clearing account; deposits received, released and refunded; accounts receivable; write-offs; skipped lines with unsigned totals; findings) and the import block of the protocol, and SHALL exit with code 1 if any error finding exists. The protocol file SHALL contain the same summary.

#### Scenario: Review before the first file
- **WHEN** the user runs `apaleo-abacus export --month 2026-10 --property BSP --dry-run`
- **THEN** the summary and the import block are printed and no file or folder is created

#### Scenario: Swiss rates with their Ziffer
- **WHEN** the Swiss fixture month is exported with `--dry-run`
- **THEN** the summary shows the revenue lines for `313` 3.8 % with Ziffer 343, `311` 8.1 % with Ziffer 303 and `312` 2.6 % with Ziffer 313, each with net, tax, gross, apaleo VAT and difference

#### Scenario: VAT comparison on the recorded VIE day
- **WHEN** the recorded VIE day 2026-10-21 is exported with `--dry-run` and the Abacus live mapping
- **THEN** the summary shows for revenue at 10 % the tax 7.74 of the bookings, apaleo's VAT 7.75 and the difference 0.01, with one sentence explaining that the tax is rounded per booking and apaleo's total per day

#### Scenario: VAT comparison in the protocol
- **WHEN** the recorded VIE day 2026-10-21 is exported with the Abacus live mapping (codes `V10`, `V13`, `V20`)
- **THEN** the protocol shows for revenue `V10 10 %: net 77.46, tax 7.74, gross 85.20, apaleo VAT 7.75, difference 0.01` and `V20 20 %: net 39.49, tax 7.89, gross 47.38, apaleo VAT 7.90, difference 0.01`, without a Ziffer for these non-Swiss rates, and with the same sentence on the rounding

### Requirement: Output layout and manifest
The export SHALL write each file to `<output.dir>/<propertyId>/<YYYY-MM>/` with the deterministic name `ABACUS_Buchungen_<from>-<to>_<propertyId>.xml`, SHALL write a protocol text file `<name>.protokoll.txt` beside it, and SHALL record in `manifest.json` the file name, SHA-256 of the file, number of bookings, the journal total in the Leitwährung (the sum of the gross amounts, which Abacus shows as both Soll and Haben of the imported Einzelbuchungen), the tax per MWST-Code and rate, the Mandant and Geschäftsbereich, the mapping file SHA-256, the tool version and the creation time. The protocol SHALL contain the target's import block (see the `abacus-xml-writer` capability).

#### Scenario: Files after a run
- **WHEN** a monthly export for BSP 2026-10 succeeds
- **THEN** the folder `exports/BSP/2026-10/` contains `ABACUS_Buchungen_20261001-20261031_BSP.xml`, its protocol and a manifest entry with the file hash, the journal total and the tax per MWST-Code and rate

#### Scenario: Protocol names the Mandant
- **WHEN** the October file is written for Mandant `1234` and Geschäftsbereich `2`
- **THEN** the protocol's import block names Mandant `1234` and Geschäftsbereich `2`, and the manifest entry records both

### Requirement: Idempotent re-runs
Re-running an export for a period whose file exists SHALL do nothing when the new file is byte-identical to the existing one, SHALL refuse with `E-FILE-EXISTS` when any byte differs, and with `--overwrite` SHALL keep the old file under a `.replaced-<timestamp>.xml` name, write the new one and record both in the manifest. The comparison SHALL read the existing file, so it works without the manifest. When the file is unchanged but its protocol or current manifest entry is missing or describes another file (a run interrupted between writing the file and its companions), the run SHALL rewrite them and report `N-COMPANIONS-REPAIRED`. Writing SHALL hold an exclusive lock file in the property-month folder and SHALL re-check the file on disk under that lock, so two concurrent runs never both write or replace the same file; the run that finds the lock or a changed file SHALL fail that property-month with `E-EXPORT` and write nothing. An export whose period overlaps another Abacus file in the same folder SHALL be refused with `E-PERIOD-OVERLAP`, because importing both would book the shared days twice.

#### Scenario: Unchanged re-run
- **WHEN** the same month is exported twice with unchanged apaleo data and mapping
- **THEN** the second run reports `unchanged`, rewrites nothing and exits 0

#### Scenario: Late posting changed the month
- **WHEN** a late posting changed the month after it was exported
- **THEN** the second run refuses with `E-FILE-EXISTS`, explains that the Treuhänder must first delete the imported bookings of that file in Abacus (in the Nebenjournal before they are transferred, or by reversing them), and suggests `--overwrite`

#### Scenario: Manifest deleted
- **WHEN** `manifest.json` was deleted and the same month is exported again with unchanged data
- **THEN** the run reports `unchanged` by comparing the existing file, leaves the Abacus file untouched and writes the missing manifest entry again (`N-COMPANIONS-REPAIRED`)

#### Scenario: Config changed the content
- **WHEN** the month was exported and `abacus.geschaeftsbereich` was changed before the same month is exported again with unchanged data
- **THEN** the run refuses with `E-FILE-EXISTS` and keeps the old file, and with `--overwrite` it replaces the file and the new bookings carry the new `Division`

#### Scenario: Config changed the interface version
- **WHEN** the month was exported and `abacus.version` was changed to `2024.00` before the same month is exported again with unchanged data
- **THEN** the run refuses with `E-FILE-EXISTS` and keeps the old file, because the `Parameter` block differs, and with `--overwrite` it replaces the file and the new file names version `2024.00`

#### Scenario: Overlapping period
- **WHEN** the folder holds the file for 2026-09-01 to 2026-09-30 and the user exports 2026-09-20 to 2026-09-30
- **THEN** the export refuses with `E-PERIOD-OVERLAP`, names the existing file and writes nothing

## ADDED Requirements

### Requirement: One rate per MWST-Code
Before writing, the export SHALL refuse with `E-MWST-CODE-RATES` a property-month whose bookings use one MWST-Code with more than one rate, naming the code, the rates and the mapping rows, because an Abacus MWST-Code has one rate per date and Abacus would recompute or refuse the other bookings.

#### Scenario: Code used at two rates
- **WHEN** one mapping row maps 3.8 % revenue and another maps 8.1 % revenue, both with MWST-Code `311`, and the month books both
- **THEN** `E-MWST-CODE-RATES` names `311`, 3.8 % and 8.1 % and both rows, and no file is written

#### Scenario: One rate per code
- **WHEN** the Swiss fixture month is exported with the template mapping
- **THEN** no `E-MWST-CODE-RATES` is raised
