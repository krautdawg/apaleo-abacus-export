## Context

After a02 the repository has two writers behind `TargetWriter`: BMD (default, fed by the BMD posting rules and EKR mapping rows) and Abacus (tested only with hand-built bookings). The mapping rows carry `bmd_account`, a numeric `steuercode` and `bmd_vat_percent`; the posting step `src/posting/build.ts` produces `BmdBooking` with the revenue account as `konto` and net plus tax; the checks in `src/export/checks.ts` know BMD's `konto`/`gkonto` movement model. Research §4-6 gives the Swiss rates, the MWST-Code convention and the KMU accounts.

## Goals / Non-Goals

**Goals:**
- One switch: mapping file, template, mapping check, posting step, default target and checks move to Abacus together, so no slice has a half-BMD, half-Abacus export.
- Reuse every target-independent rule (resolution order, wildcards, deposit-rate inference, skip rules, VAT guard structure, aggregate check) unchanged.
- CHF properties export; the recorded EUR days still run as regression with `abacus.leitwaehrung: EUR`.

**Non-Goals:**
- Swiss special cases beyond what the template comments say (a05), Swiss demo data (a06), deleting BMD (a04).

## Decisions

1. **Mapping columns `abacus_account;mwst_code;mwst_percent`, MWST-Code as text.** Abacus codes are Mandant-specific text of up to three characters (`311`, `V81`), so the column is never parsed as a number, and Excel's number conversion cannot strip anything that matters (a lost leading zero shows up as `W-MWST-CODE-UNCHECKED`). No Sachkontenlänge and no padding logic: Abacus accounts are numbers of up to 11 digits, and a wrong number is refused by the Abacus import anyway. Alternative: keep generic `target_account;tax_code;tax_percent`. Rejected: the CSV is read by Treuhänder, who expect Abacus words.
2. **MWST-Codes in the template come from config.** `abacus.mwstCodes.normal|reduziert|beherbergung` default to the codes of the Abacus KMU sample Mandant (311/312/313) and are written into the rows by `init-mapping`. A Mandant with other codes (for example Banana-style `V81`) sets three values once instead of editing dozens of rows. The same values drive `W-MWST-CODE-UNCHECKED` and `W-MWST-CODE-RATE`, the only way to catch a Vorsteuer code or swapped codes without knowing the Mandant's MWST-Tabelle.
3. **Template accounts from the KMU chart, hotel numbers from the hotel chart.** 3400 Beherbergung, 3200 Küche, 3100 Getränke, 3500 übrige Hotelleistungen follow Banana's model of the Kontenrahmen Hotellerie und Gastronomie; 1000/1090/1101/1102/2030/3805 are KMU accounts or sub-accounts of KMU groups. `1102` instead of `1100` for apaleo's Debitoren, because in Abacus `1100` is usually the Sammelkonto of the Debitorenbuchhaltung, which refuses direct FIBU postings. Every row is a suggestion; the comment says so.
4. **Non-Swiss and pre-2024 rates stay empty.** apaleo creates VAT sub-accounts for every rate of its country profile; a copied German or Austrian chart would otherwise be mapped silently. Empty rows plus `E-UNMAPPED` force a decision, as the 5 % rows did in the BMD template.
5. **Posting: the VAT side is always Single, the Collective side carries `DebitCredit`.** This follows from `TaxData` existing only in `SingleInformation` (a02 decision 2). The direction rule of the BMD step (sign from the point of view of `konto`) becomes a side rule: `D` when the Collective account is debited. Lines without a VAT side keep the BMD behaviour of putting a Revenues or LossOfAccountsReceivable side where the Kostenstelle can go (Single), so allowances and charges of one account look alike.
6. **Tax guard on gross.** Abacus books inclusive amounts, so the check value is `round(gross × rate / (100 + rate))`, not the net-based BMD value. apaleo's precise tax rounded per line stays the tax of the booking; the existing precise-sum logic (`sumDecimals`) is reused for the apaleo VAT comparison in the summary.
7. **Movement model is a `TargetWriter` method.** `movements(booking)` returns signed amounts per account; `src/export/checks.ts` compares them with apaleo without knowing field names. This removes the last BMD knowledge from the checks and keeps a future target to one function.
8. **`posting.text2` replaces `posting.extbelegnr`.** The apaleo receipt or reference goes into `Text2` (80 characters), the generated Belegnummer into `DocumentNumber`. The option name says where the value lands in Abacus.
9. **VIE stays the regression day, with an Abacus mapping written by hand.** No Swiss recording exists (research open question 6). VIE has every line shape (deposits, release, refund, AR, offsets) and hand-checked totals that are target-independent; its Austrian rates produce warnings, not errors, with a hand-written mapping. BER with the template is the negative test that a non-Swiss chart is not mapped silently.

## Risks / Trade-offs

- [The template's account numbers differ from a Treuhänder's Kontenplan] → every row is `Vorschlag (ungeprüft)`; the mapping guide's sign-off checklist (a08) asks for each row; `mapping check` validates format, not meaning.
- [A Mandant's 0 % revenue account carries a default MWST-Code that "MWST berechnen" applies] → `W-UNTAXED-REVENUE` and a template comment; the import guide's checklist compares the MWST-Journal with the protocol.
- [Spec wording lags behind the code until a06] → the export-run requirements "Dry run", "Output layout and manifest" and "Idempotent re-runs" keep their BMD file names and wording until a06 rewrites them; their behaviour is already target-neutral (names, patterns and advice come from the `TargetWriter`), and the tests of this slice assert the Abacus names.
- [Large slice] → task groups are ordered so that mapping, posting, pipeline and docs can be reviewed one by one; BMD code is untouched until a04 deletes it.

## Migration Plan

No users yet. A developer with a BMD mapping runs `init-mapping --template kmu-hotel` again; the loader refuses BMD files with that hint.

## Open Questions

- Research open question 10 (deposit code) is settled in a05; until then deposit rows use the normal code of their rate.
