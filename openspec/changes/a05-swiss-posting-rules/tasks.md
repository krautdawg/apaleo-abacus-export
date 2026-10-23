## 1. Fixture month

- [ ] 1.1 Create `test/fixtures/apaleo/ch-month/` (`properties/page-1.json` with `ENG`, CHF, `Europe/Zurich`; `accounts-schema.json` with a Swiss subset of apaleo's chart; `export-gross-daily/<day>.json` for the days of design decision 5) and its README with every line and the VAT-type assumption
- [ ] 1.2 Validate the new files against `test/fixtures/apaleo/swagger-excerpt.json` in `test/apaleo/fixtures.test.ts` and serve them from `test/helpers/apaleo.ts` (`chMonth: true`)
- [ ] 1.3 Write `test/fixtures/mapping/kmu-ch-month.csv`: what `init-mapping --template kmu-hotel` writes on the chart, with only the Kurtaxe row filled in (`2210`, no MWST-Code)

## 2. Posting and checks

- [ ] 2.1 Make sure levy lines, deposits (received, released, refunded, parked at 0 %), accounts receivable, write-offs and Annullationen follow the new requirements in `src/posting/build.ts`; add the levy totals per account (with/without MWST) and written-off receivables per rate to `src/posting/summary.ts`
- [ ] 2.2 Add `W-KURTAXE-TAXED` and `W-ANNULLATION-TAXED` to `src/mapping/check.ts` with tests for the account-mapping scenarios
- [ ] 2.2a `W-ABRECHNUNGSART-VEREINNAHMT` in `doctor` and once per export run (summary and protocol), with tests for "Doctor with vereinnahmte Entgelte", "Export with vereinnahmte Entgelte" and "Default Abrechnungsart"
- [ ] 2.3 Unit tests for every posting-rules scenario of this change in `test/posting/`
- [ ] 2.4 `test/posting/fixture-month-ch.test.ts` with hand-computed constants for every summary value and every booking; golden file `test/golden/abacus/ch-month.xml`
- [ ] 2.5 A test that renders the month with `abacus.abrechnungsart: vereinnahmt` and asserts identical bookings, only `UseCode` and the Collective `TaxAccount` changed, and the warning `W-ABRECHNUNGSART-VEREINNAHMT`

## 3. Template and docs

- [ ] 3.1 Sharpen the comments in `templates/kmu-hotel.rules.csv` for Kurtaxe (durchlaufender Posten: no MWST-Code or a Ziffer-910 code such as `491`, never the Ziffer-900 code `490` "Subvention Kurtaxen"), deposits (Art. 40), write-offs (Entgeltsminderung, optional correction code) and Annullationen (Ziff. 8.7)
- [ ] 3.2 Rewrite `docs/mapping-guide.md` in Swiss Standard German ("du", "ss", rates as `8,1 %`), taking over the prose moved from a03: columns, resolution order, MWST-Codes and the KMU template rows; sections on Kurtaxe, Gästetaxe and Beherbergungsabgabe (guest-owed vs hotel-owed, Ziffer 910, never code `490` of Ziffer 900, examples of Gemeinden with their own names), Anzahlungen and Abrechnungsart (including the period-end correction under `vereinnahmt`: Umbuchung of the paid part from `2202` to `2200`, Debitorenkorrektur for open accounts receivable), Halb- and Vollpension (decided in apaleo), Annullationen and no-shows, Debitorenverlust; in the sign-off checklist one item per mapped VAT account that its default MWST-Code in F21 equals the row's code (`3400 -> 313`, `2030 -> 313`, `2031 -> 311`, `3805 -> 313`, ...) and that it is MWST-pflichtig; with "kostenpflichtiger Connector" the section on carrying an existing account mapping over with `--accounts-from`; add the file to `SWISS_FILES`; turn the skipped test "a05: explains the Swiss MWST rates and lists every account of the KMU template in the mapping guide" in `test/readme.test.ts` on again (`it.skip` -> `it`), so every account of every `Vorschlag (ungeprüft)` row of `templates/kmu-hotel.rules.csv` must appear in the guide
- [ ] 3.3 Rewrite `docs/posting-rules.md` in Swiss Standard German, taking over the prose moved from a03, with the Swiss rules and one worked example each from the fixture month; add the file to `SWISS_FILES`; `docs/abacus-import.md` checklist items for Anzahlungen, Debitorenverlust, Kurtaxe and the `2202` balance under `vereinnahmt`; new codes in `docs/troubleshooting.md`

## 4. Release check

- [ ] 4.1 `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` green; no existing golden file changed except by a reviewed diff
