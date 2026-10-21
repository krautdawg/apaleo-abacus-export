## MODIFIED Requirements

### Requirement: Target writer boundary
The export pipeline SHALL write files only through a `TargetWriter` that provides the file name for a property and period, the file-name pattern used to find existing and overlapping files of that target, the rendered bytes, the comparison that decides whether an existing file is unchanged, the protocol title, the target's advice in the `E-PERIOD-OVERLAP` and `E-FILE-EXISTS` refusals (the program the file is imported into, its config keys, how an imported file is undone), the currency the target books in for a given config, and the signed account movements of a booking that the plausibility checks compare with apaleo. `src/export/` SHALL NOT import a target module's internals other than its `TargetWriter`, and the output folder logic and the checks SHALL NOT contain a target-specific file pattern, program name, currency, field name or config key. A manifest entry SHALL count as a file of the target only when its name matches the target's file pattern. The default target SHALL be `abacusTarget`.

#### Scenario: Abacus is the default target
- **WHEN** `export --month 2026-10 --property BSP` runs with a complete Abacus mapping
- **THEN** the file `ABACUS_Buchungen_20261001-20261031_BSP.xml` is written and no BMD file appears

#### Scenario: Pattern and comparison come from the writer
- **WHEN** a test runs the export with a fake `TargetWriter` whose files are named `FAKE_<from>-<to>_<propertyId>.txt` and whose comparison ignores nothing
- **THEN** existence, overlap (`E-PERIOD-OVERLAP`), unchanged re-runs and `E-FILE-EXISTS` work for the fake files exactly as for Abacus files, and no Abacus name appears in the output folder

#### Scenario: Refusal advice comes from the writer
- **WHEN** the fake `TargetWriter` refuses a file with `E-PERIOD-OVERLAP` or `E-FILE-EXISTS`
- **THEN** the message carries the fake target's advice and names neither Abacus nor an `abacus.*` config key

#### Scenario: Manifest entry of another target
- **WHEN** `manifest.json` records a current file of the fake target for the period and no file of the default target exists
- **THEN** the lookup for the default target (as used by `schedule --once`) finds no file for that period

### Requirement: Plausibility checks
The export SHALL verify that the absolute gross of all ledger lines equals the sum over booked and skipped lines; that per business day the signed movement of each mapped target account in the bookings, as the target's movement model gives it (Abacus: the Collective account by the gross amount and the Single account by the gross amount minus the tax, each signed by its side from `DebitCredit`; the tax leg on the MWST account is not part of this check), equals the signed apaleo movement of the booked lines mapped to it (the gross amount on the side without MWST, the gross amount minus apaleo's rounded tax on the VAT side); and that per rate the tax amounts in the bookings equal the sum of apaleo's per-line tax rounded to Rappen of the booked lines of that rate, apart from tax amounts of deposit releases computed from a chart rate (`W-VAT-INFERRED`); violations SHALL be errors. The `E-VAT-TOTAL` message SHALL also name apaleo's precise VAT total of the rate and the line-rounding difference; the difference between the tax per booking and apaleo's precise total SHALL never be an error by itself. When `checks.aggregates` is true (default false), it SHALL call apaleo's daily aggregates once per business day and compare each listed account's balance (debit minus credit) with the signed sum of that day's ledger lines: a side on a global chart account counts for that account, any other side for its main account; Revenues and Liabilities sides count with their precise net amount, all other types with their gross amount; each tax of a line with a Revenues side counts for the chart's `Vat` account of that VAT type and rate, and of a line with a Liabilities side for the `VatOnLiabilities` account, signed like that side; both balances are rounded to cents only for the comparison. A difference SHALL be reported as a warning. The aggregate comparison SHALL depend only on the ledger lines and the chart, never on the bookings of a target.

#### Scenario: Tax total per rate
- **WHEN** a defect makes the bookings at 8.1 % carry 4.00 tax in total while apaleo's per-line taxes at 8.1 %, rounded to Rappen, total 4.02
- **THEN** error `E-VAT-TOTAL` is reported for 8.1 % with both amounts and apaleo's precise total, and no file is written

#### Scenario: Line rounding is not an error
- **WHEN** the recorded VIE day 2026-10-21 is exported, where the bookings carry 7.74 tax at 10 % and apaleo's precise total is 7.74545454
- **THEN** no `E-VAT-TOTAL` is raised, and the protocol shows both amounts and the difference 0.01

#### Scenario: Roundings at another rate
- **WHEN** the posting run reported two `W-VAT-ROUNDING` differences of computed deposit tax at 3.8 % and the bookings at 8.1 % carry two Rappen more tax than apaleo charged
- **THEN** error `E-VAT-TOTAL` is reported for 8.1 % and no file is written

#### Scenario: Side bug is caught
- **WHEN** a defect writes a booking with `DebitCredit` `D` where the apaleo line credits the Collective account
- **THEN** error `E-ACCOUNT-BALANCE` names the day, the Abacus account and both signed amounts, and no file is written

#### Scenario: Aggregate check off by default
- **WHEN** `checks.aggregates` is not set
- **THEN** no aggregate request is sent and the custom app does not need `core.subledger_aggregate.create`

#### Scenario: Aggregate difference
- **WHEN** `checks.aggregates` is true and apaleo's daily balance for an account differs from the ledger lines of that day
- **THEN** warning `W-AGGREGATE-DIFF` names the day, the account, both balances and the basis (gross, net or tax), and the file is still written

#### Scenario: Normal real day has no aggregate warning
- **WHEN** `checks.aggregates` is true and the recorded VIE responses of 2026-10-21 are exported with the Abacus live mapping
- **THEN** all 19 listed accounts match and no `W-AGGREGATE-DIFF` is raised

#### Scenario: Conservation violated
- **WHEN** a defect causes a ledger line to be neither booked nor listed as skipped
- **THEN** error `E-CONSERVATION` is raised and no file is written

### Requirement: Regression on recorded live data
The repository SHALL contain recorded real apaleo responses in `test/fixtures/apaleo/live/` (chart of accounts, `export-gross-daily` and `aggregate-daily` of BER and VIE for 2026-10-21 and 2026-10-22, synthetic sandbox data, no folios), scanned for tokens, secrets, e-mail addresses, guest names and addresses on every test run, with a README naming origin, files and scan; a committed Abacus live mapping `test/fixtures/apaleo/live/VIE/mapping-VIE.abacus.csv` for the VIE chart; and tests that run the full pipeline (apaleo adapter on a fake fetch, mapping, posting, plausibility and aggregate checks, the configured `TargetWriter`) on them and assert the hand-checked totals. Because both recorded properties book in EUR, these tests SHALL set `abacus.leitwaehrung: EUR`.

#### Scenario: VIE exports cleanly
- **WHEN** `export --from 2026-10-21 --to 2026-10-21 --property VIE` runs on the recorded responses with the committed Abacus live mapping, `abacus.leitwaehrung: EUR`, `checks.aggregates: true` and the default target
- **THEN** it writes one `ABACUS_Buchungen_20261021-20261021_VIE.xml` without `E-` findings or `W-AGGREGATE-DIFF`, with 35 apaleo lines, 29 bookings and 6 skipped lines, the writer's validation passes, and the summary has the values of the posting-rules scenario "Summary of the recorded VIE day"

#### Scenario: BER with the KMU template
- **WHEN** the same export runs for BER with a mapping that `init-mapping --template kmu-hotel` writes on the BER chart
- **THEN** it raises no parse, sub-cent or Swagger-shape error and stops with `E-UNMAPPED` for the 7 % and 19 % revenue and deposit accounts, whose rows the template leaves empty as no Swiss MWST rate, and no file is written

#### Scenario: Fixture scan
- **WHEN** the scan runs over `test/fixtures/apaleo/live/`
- **THEN** it finds no key or value matching token, secret, bearer, password or e-mail patterns, and every account name is an apaleo default name or of the form `… for Reservation|Folio <id>`
