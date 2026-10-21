## Why

a03 books the common hotel lines, but the Swiss special cases are where a wrong row silently produces a wrong MWST-Abrechnung: Kurtaxen are durchlaufende Posten only when invoiced separately and forwarded (ESTV MBI 08 Ziff. 7.11), a hotel-owed Beherbergungsabgabe is part of the 3.8 % Beherbergung, Anzahlungen are taxed when received under both Abrechnungsarten (MWSTG Art. 40), Annullationen and no-shows are Schadenersatz without MWST (Ziff. 8.7), and written-off guest receivables reduce the Umsatzsteuer. These rules need explicit posting requirements, mapping warnings and a CHF fixture month that proves them.

## What Changes

- Kurtaxe, Gästetaxe and Beherbergungsabgabe: booked through their rows; untaxed on a liability (durchlaufender Posten, Ziffer 910) or with apaleo's 3.8 % on a revenue row; the summary shows them per account; `mapping check` warns `W-KURTAXE-TAXED` when a levy row carries an MWST-Code above 0 %.
- Anzahlungen: deposits booked with the MWST of their rate when received, released and refunded with the reverse MWST; in the file `abacus.abrechnungsart` changes only `UseCode` and the Collective `TaxAccount`, never the amounts.
- Vereinnahmte Entgelte: `doctor` and every export warn `W-ABRECHNUNGSART-VEREINNAHMT` (Abacus parks the tax on the Hilfskonto until a payment is recorded in the Debitorenbuchhaltung, which this tool does not feed); the guides describe the period-end correction.
- Debitorenverlust: LossOfAccountsReceivable lines with tax booked on the write-off account as Single with the code of the rate and positive tax (Entgeltsminderung); untaxed write-offs without MWST.
- Annullationen and no-shows: booked as apaleo taxed them, under the guard; `mapping check` warns `W-ANNULLATION-TAXED` for a cancellation or no-show row above 0 %.
- A Swiss fixture month in CHF in apaleo's recorded shapes covering every case above, with hand-computed totals.
- Mapping guide rewritten in Swiss Standard German (prose moved from a03) with sections on Kurtaxe by Gemeinde/Kanton (never the Ziffer-900 code `490`), Anzahlungen and Abrechnungsart, Halb- and Vollpension (70 % / 65 %-35 % rules decided in apaleo), Annullationen, Debitorenverlust, the F21 default-code check and carrying a connector mapping over; posting-rules doc rewritten likewise.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `posting-rules`: Kurtaxe and levies, deposits and accounts receivable, vereinnahmte Entgelte, bad debt with MWST correction, Annullationen, the Swiss fixture month.
- `account-mapping`: Swiss special-case warnings in `mapping check`.

## Non-goals

- Deciding tax questions for the hotel: the tool books what apaleo charged and checks consistency.
- Splitting packages (Halbpension, Vollpension, Seminarpauschalen) in the tool: apaleo posts the components.
- Saldosteuersatz- and Pauschalsteuersatzmethode, Vorsteuer, payment-provider fees.

## Impact

- `src/mapping/check.ts`, `src/posting/build.ts`, `src/posting/describe.ts`, `src/posting/summary.ts`, `templates/kmu-hotel.rules.csv` (comments).
- New fixture `test/fixtures/apaleo/ch-month/` with README and `test/posting/fixture-month-ch.test.ts`.
- `docs/mapping-guide.md`, `docs/posting-rules.md`, `docs/abacus-import.md` (checklist), `docs/troubleshooting.md`.
