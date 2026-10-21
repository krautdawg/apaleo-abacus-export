## 1. Fixture month

- [ ] 1.1 Create `test/fixtures/apaleo/ch-month/` (`properties/page-1.json` with `ENG`, CHF, `Europe/Zurich`; `accounts-schema.json` with a Swiss subset of apaleo's chart; `export-gross-daily/<day>.json` for the days of design decision 5) and its README with every line and the VAT-type assumption
- [ ] 1.2 Validate the new files against `test/fixtures/apaleo/swagger-excerpt.json` in `test/apaleo/fixtures.test.ts` and serve them from `test/helpers/apaleo.ts` (`chMonth: true`)
- [ ] 1.3 Write `test/fixtures/mapping/kmu-ch-month.csv`: what `init-mapping --template kmu-hotel` writes on the chart, with only the Kurtaxe row filled in (`2210`, no MWST-Code)

## 2. Posting and checks

- [ ] 2.1 Make sure levy lines, deposits (received, released, refunded, parked at 0 %), accounts receivable, write-offs and Annullationen follow the new requirements in `src/posting/build.ts`; add the levy totals per account (with/without MWST) and written-off receivables per rate to `src/posting/summary.ts`
- [ ] 2.2 Add `W-KURTAXE-TAXED` and `W-ANNULLATION-TAXED` to `src/mapping/check.ts` with tests for the account-mapping scenarios
- [ ] 2.3 Unit tests for every posting-rules scenario of this change in `test/posting/`
- [ ] 2.4 `test/posting/fixture-month-ch.test.ts` with hand-computed constants for every summary value and every booking; golden file `test/golden/abacus/ch-month.xml`
- [ ] 2.5 A test that renders the month with `abacus.abrechnungsart: vereinnahmt` and asserts identical bookings and only `UseCode` and the Collective `TaxAccount` changed

## 3. Template and docs

- [ ] 3.1 Sharpen the comments in `templates/kmu-hotel.rules.csv` for Kurtaxe, deposits (Art. 40), write-offs (Entgeltsminderung, optional correction code) and Annullationen (Ziff. 8.7)
- [ ] 3.2 `docs/mapping-guide.md` (Swiss Standard German, "du", no "ß"): sections on Kurtaxe, Gästetaxe and Beherbergungsabgabe (guest-owed vs hotel-owed, Ziffer 910, examples of Gemeinden with their own names), Anzahlungen and Abrechnungsart, Halb- and Vollpension (decided in apaleo), Annullationen and no-shows, Debitorenverlust
- [ ] 3.3 `docs/posting-rules.md`: the Swiss rules with one worked example each from the fixture month; `docs/abacus-import.md` checklist items for Anzahlungen, Debitorenverlust and Kurtaxe; new codes in `docs/troubleshooting.md`

## 4. Release check

- [ ] 4.1 `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` green; no existing golden file changed except by a reviewed diff
