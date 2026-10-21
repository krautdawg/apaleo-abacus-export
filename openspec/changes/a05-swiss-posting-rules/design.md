## Context

After a03/a04 the engine books every line through its mapping row, puts the VAT side into `SingleInformation` and guards apaleo's tax. The Swiss rules in research §4 decide how a few account types must be mapped and what the Treuhänder checks; most of them need no new code path, but they need explicit requirements, two warnings and a fixture month that proves the bookings end to end in CHF. The removed Austrian requirements (a03) left exactly these gaps: levies, deposits, bad debt, cancellations and the fixture month.

## Goals / Non-Goals

**Goals:**
- Each Swiss special case has a requirement, a scenario with Swiss numbers and a place in the CHF fixture month.
- The two silent-error cases a mapping can create (taxed Kurtaxe, taxed Annullation) produce a warning that cites the ESTV rule.
- `abacus.abrechnungsart` is proven not to change the bookings.

**Non-Goals:**
- Tax decisions: apaleo charges the tax, the tool checks and books it.
- Package splitting, Saldosteuersatz, Vorsteuer.

## Decisions

1. **Kurtaxe stays a mapping decision.** ESTV MBI 08 Ziff. 7.11 makes the treatment depend on facts the tool cannot see (separate invoicing, forwarding, a lump sum to the Gemeinde, hotel-owed vs guest-owed levy). The template leaves the row empty (a03); the guard checks consistency with apaleo; `W-KURTAXE-TAXED` flags the unusual case without blocking it, because a hotel-owed Beherbergungsabgabe is legitimately taxed at 3.8 %.
2. **Deposits are taxed at receipt under both methods.** MWSTG Art. 40 Abs. 1 Bst. c (vereinbart, Vorauszahlungen) and Abs. 2 (vereinnahmt) both make the tax arise when the money comes in, which is what apaleo's deposit VAT already models. So in the file the Abrechnungsart only changes `UseCode` and the Collective `TaxAccount` (a02); a scenario pins that the bookings are identical. Alternative: book deposits without MWST under `vereinbart`. Rejected: wrong under Art. 40 Abs. 1 Bst. c.
6. **`vereinnahmt` stays possible, but warned and documented.** Under the vereinnahmte Methode Abacus books the output tax to the Hilfskonto (`2202`) and moves it to the Steuerkonto when the payment is recorded, normally in the Debitorenbuchhaltung, which is out of scope; FIBU revenue on `1101`/`1102` with `UseCode` `1` may stay on `2202` and never reach the MWST-Abrechnung, and charges on accounts receivable that are unpaid at period end are taxed too early (Art. 40 Abs. 2). Until a test import answers research open question 15, `doctor` and every export warn `W-ABRECHNUNGSART-VEREINNAHMT`, and the mapping guide and the import guide describe the period-end correction (Umbuchung of the paid part from `2202` to `2200`, Debitorenkorrektur for what is still open). Alternative: refuse `vereinnahmt` in v1. Rejected: hotels that already account by vereinnahmte Entgelte would have no way to use the tool, and the warning plus a documented correction leave the decision with the Treuhänder.
3. **Debitorenverlust as Entgeltsminderung on the write-off account.** The write-off account is the VAT side (Single, debited), so the tax is positive and reduces the Umsatzsteuer in Abacus' MWST-Journal; the Treuhänder may prefer a correction code (318/319 in the KMU sample), which the row's MWST-Code allows without code change.
4. **Annullationen: no special logic, one warning.** apaleo's `RevenueCancellationFees` and `RevenueNoShow` accounts are ordinary revenue accounts with a rate; MBI 08 Ziff. 8.7 says payments for Annullationen are Schadenersatz. The template maps 0 % to `3680` and leaves taxed rows empty (a03); `W-ANNULLATION-TAXED` catches a row filled in with MWST later.
5. **The CHF fixture month replaces the Austrian one.** Same structure as the AT month of the BMD project (one property, 26 lines), Swiss rates and accounts, CHF, `Europe/Zurich`, reservations `ENG-ALPHA-1` to `ENG-FOXTROT-1`:
   - 08-03 Twint prepayment 311.40 at 3.8 % (net 300.00, tax 11.40) for `ENG-ALPHA-1`.
   - 08-10 one night `ENG-BRAVO-1`: Logis mit Frühstück 155.70 at 3.8 % (tax 5.70), dinner 54.05 at 8.1 % (tax 4.05), Kurtaxe 4.20 with a `Without`/0 %/0.00 entry, minibar 10.81 at 8.1 % (tax 0.81).
   - 08-11 `ENG-BRAVO-1` pays 224.76 cash, with `/Offset`.
   - 08-12 check-out `ENG-ALPHA-1`: two nights of 103.80 at 3.8 %, Kurtaxe 8.40, release of 207.60 as a negative charge (tax −7.60), refund of 103.80 to Twint as a negative prepayment (tax −3.80), Kurtaxe paid by Mastercard 8.40 with `/Offset`.
   - 08-14 `ENG-CHARLIE-1` Annullation 80.00 on `RevenueCancellationFees_Without:0.00`, paid by Mastercard with `/Offset`.
   - 08-17 take-away 15.39 at 2.6 % (net 15.00, tax 0.39), paid in cash.
   - 08-18 one night `ENG-FOXTROT-1` 103.80 at 3.8 %, never paid.
   - 08-20 company stay `ENG-DELTA-1`: Halbpension 186.84 at 3.8 % (tax 6.84, invoiced as a whole under the 70 % rule), drinks 21.62 at 8.1 % (tax 1.62), checked out to accounts receivable with invoice `ENG-2026-0815` and `/Offset`.
   - 08-28 write-off of `ENG-FOXTROT-1` 103.80 with tax 3.80 at 3.8 %.
   The amounts are chosen so that every inclusive check value equals apaleo's tax rounded to Rappen (no `W-VAT-ROUNDING`). The apaleo VAT type names for Swiss rates (`Special:3.80`, `Normal:8.10`, `Reduced:2.60`) are assumptions until a Swiss sandbox day is recorded (research open question 6); the README says so.

## Risks / Trade-offs

- [apaleo's Swiss account names differ from the fabricated ones] → the mapping resolves by type, rate and wildcard, not by the VAT type name; a recorded Swiss day replaces the assumption (maintainers checklist).
- [The Treuhänder overlooks the Hilfskonto under `vereinnahmt`] → the warning appears in every protocol, and the import guide's checklist asks for the `2202` balance at period end.
- [A Treuhänder books Anzahlungen without MWST by habit] → the mapping guide explains Art. 40 and the template comment says the deposit rows carry the code of their rate; the protocol lists deposit tax per code for comparison with the MWST-Journal.

## Open Questions

- Research open question 10 (dedicated Vorauszahlungs-code) stays with the Treuhänder; the row's code is free text, so no code change is needed either way.
- Research open question 15 (`vereinnahmt` and the Hilfskonto for FIBU-only bookings) is answered by the first test import with a Mandant that accounts by vereinnahmte Entgelte; until then decision 6 applies.
