## 1. Config

- [ ] 1.1 Make the `abacus` section required in `src/core/config.ts`, refuse `bmd` and `datev` sections with an error naming `abacus`, and rename `posting.extbelegnr` to `posting.text2` (`receipt` default, `reference`)
- [ ] 1.2 Update `apaleo-abacus.config.example.yaml`, `examples/demo/apaleo-abacus.config.yaml` and the test config fixtures; tests for the cli scenarios "Abacus section missing" and "Old BMD section"

## 2. Mapping

- [ ] 2.1 Change the mapping row model and CSV reader/writer in `src/mapping/` to `abacus_account;mwst_code;mwst_percent` (code kept as text); refuse BMD, DATEV and Grman headers with a hint to `init-mapping --template kmu-hotel`; remove the padding and Sachkontenlänge logic from the reader
- [ ] 2.2 Write `templates/kmu-hotel.rules.csv` (comments in Swiss Standard German, no "ß", every row `Vorschlag (ungeprüft)`) with the rows of "KMU hotel template" and "Template rows for Swiss special cases"; MWST-Code placeholders resolved from `abacus.mwstCodes` by `src/mapping/template.ts`
- [ ] 2.3 `init-mapping --template kmu-hotel` in `src/cli/commands/`; unknown template names are usage errors listing `kmu-hotel`; container rows (`3000`, `9999`, `6900`) skipped as before
- [ ] 2.4 Rewrite `src/mapping/check.ts` for Abacus: `E-ACCOUNT-FORMAT`, `E-MWST-CODE-FORMAT`, `E-MWST-CODE-MISSING`, `E-VAT-RATE-MISSING`, `E-MWST-CODE-NOT-ALLOWED`, `W-MWST-CODE-UNCHECKED`, `W-MWST-CODE-RATE`, `W-UNTAXED-REVENUE`, `W-VAT-RATE-UNUSUAL` (Swiss rates, pre-2024 note), `E-KOST-FORMAT` (1-11 digits), `W-KOST-IGNORED`, `E-VAT-MISMATCH`
- [ ] 2.5 Update the `E-UNMAPPED` fix hints to the KMU template accounts (`2030` at 3.8 %, `*;AccountsReceivable;;;1102`)
- [ ] 2.6 Fixture `test/fixtures/mapping/excel-ch-saved.csv` and tests for every account-mapping scenario of this change

## 3. Posting

- [ ] 3.1 New posting step producing `AbacusBooking` in `src/posting/build.ts`: VAT side in Single, `DebitCredit` of the Collective account, absolute gross, signed tax, MWST-Code and rate, Kostenstelle only from a Revenues or LossOfAccountsReceivable Single row, `E-MWST-CODE-NOT-ALLOWED`, `E-TWO-VAT-SIDES`
- [ ] 3.2 Adapt the tax guard in `src/posting/guard.ts` to the inclusive check value `round(|gross| × rate / (100 + rate))`; keep normalisation, precise sums, `W-VAT-ROUNDING`, `E-VAT-AMOUNT`, `E-VAT-RATE`, `E-VAT-MISSING`, `E-VAT-UNEXPECTED`, `E-VAT-MIXED`
- [ ] 3.3 `Text1` labels in Swiss Standard German (`src/posting/describe.ts`, `Gästeforderung`, `Debitorenverlust`), `Text2` from `posting.text2`, no guest names
- [ ] 3.4 Summary per MWST-Code and rate in `src/posting/summary.ts`, Soll/Haben per account from the target's movement model
- [ ] 3.5 Port the posting tests to Swiss numbers (3.8/8.1/2.6 %); delete `test/posting/fixture-month-at.test.ts` and its fixture usage (the Swiss month follows in a05)

## 4. Pipeline and checks

- [ ] 4.1 Add `movements(booking)` to `TargetWriter`; implement it for `abacusTarget` (and `bmdTarget` until a04); make `src/export/checks.ts` use it instead of BMD fields
- [ ] 4.2 Set `DEFAULT_TARGET` to `abacusTarget` in `src/export/pipeline.ts`; CHF properties pass the currency gate with the default `abacus.leitwaehrung`
- [ ] 4.3 Write `test/fixtures/apaleo/live/VIE/mapping-VIE.abacus.csv` by hand (Austrian rates mapped with the placeholder codes `V10`, `V13`, `V20`, which give the documented warnings), point `test/helpers/live-mapping.ts` and `test/cli/live-data.test.ts` to it with `abacus.leitwaehrung: EUR`, assert the VIE totals and the BER-with-template `E-UNMAPPED` scenario
- [ ] 4.4 Regenerate the export golden files (`test/golden/export/`) with `UPDATE_GOLDEN=1` and review the diff: Abacus XML, protocol and manifest only

## 5. Demo, docs and examples

- [ ] 5.1 Convert `examples/demo/mapping-BSP.csv` to the Abacus columns and set `abacus.leitwaehrung: EUR` in the demo config (the demo data become Swiss CHF in a06), so `export --demo --dry-run` and the CI quick-start stay green
- [ ] 5.2 Replace `--template ekr` by `--template kmu-hotel` in README, README.en.md and `docs/`; update `docs/mapping-guide.md` (columns, MWST-Codes, KMU template rows), `docs/posting-rules.md`, `docs/configuration.md` and `docs/troubleshooting.md` (new and removed codes) in Swiss Standard German; keep the headings that `test/readme.test.ts` checks (the sign-off heading moves in a04, the README in a08)
- [ ] 5.3 Write the first `docs/abacus-import.md` (F11 or F5534, import type "XML Buchungen", "MWST berechnen", Nebenjournal, first-import checklist) and link it from README and the config error
- [ ] 5.4 Regenerate `docs/examples/` with the Abacus file, protocol and mapping; `test/examples.test.ts` compares them with the golden output
- [ ] 5.5 Point the CI `docker` job's demo-file check in `.github/workflows/ci.yml` to `demo-output/BSP/2026-09/ABACUS_Buchungen_20260901-20260930_BSP_DEMO.xml`; demo `Text1` starts with `DEMO `

## 6. Release check

- [ ] 6.1 `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` green
- [ ] 6.2 `node dist/cli/main.js export --month 2026-09 --demo --dry-run` prints an Abacus posting summary and exits 0; `node dist/cli/main.js init-mapping --help` lists `kmu-hotel`
