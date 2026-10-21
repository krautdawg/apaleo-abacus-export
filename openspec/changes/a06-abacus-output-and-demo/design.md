## Context

The export pipeline (`src/export/`) already writes a protocol, a manifest, handles re-runs and overlaps and runs the plausibility checks, all target-neutral since a01/a03. What a Treuhänder reads is still shaped by the BMD past: per-rate lines without MWST-Code, "Soll and Haben totals as the Kanzlei sees them in BMD", BMD undo advice in some tests, and Austrian-era demo data converted to EUR with an Abacus mapping in a03.

## Goals / Non-Goals

**Goals:**
- The protocol answers the Treuhänder's three checks: does the file match apaleo (per MWST-Code and rate), what will Abacus show (journal total, MWST per code and Ziffer), how do I undo it.
- A Swiss demo that shows a CHF file to anyone in 30 seconds, without apaleo.

**Non-Goals:**
- Changing the XML (a02) or posting rules (a03, a05).

## Decisions

1. **Summary keyed by MWST-Code and rate.** Abacus' MWST-Journal and the MWST-Abrechnung are organised by code and Ziffer; a per-rate summary would hide two codes at one rate (for example a Ziffer-910 code at 0 % next to a code-less 0 % account). The Ziffer is shown only for the three Swiss rates in force since 2024 (303, 313, 343), so a non-Swiss rate in the VIE regression gets none instead of a wrong one.
2. **Journal total instead of Soll/Haben by sign.** Every Einzelbuchung moves its gross amount once to Soll and once to Haben; the manifest records that total plus the tax per code, which is what the Treuhänder compares with the Abacus journal of the import.
3. **`E-MWST-CODE-RATES` as a pipeline check, not a mapping check.** Two rows may legitimately use one code at different rates over time (a rate change on 1 January); within one file the code must have one rate. The check therefore runs on the bookings of a property-month.
4. **Demo data fabricated in the CH-month shape, September 2026.** Same generator approach as the BMD demo: recorded-shape apaleo responses in `examples/demo/apaleo/`, Mandant `7777` (the Abacus sample Mandant number from the AbaConnect examples), KMU template mapping with the Kurtaxe row filled, so `docs/examples/` shows every common case. The demo stays independent from the test fixture month, so tests and docs can change separately.
5. **Undo advice names the Nebenjournal.** contofox and the bexio help article describe that F5534 imports go to a Nebenjournal or a Zeitachse for review before they are transferred; that is the cheapest undo and is what `E-FILE-EXISTS` names first, with reversing as the fallback (research open question 9).

## Risks / Trade-offs

- [The Ziffer mapping changes with the next rate change] → it sits in one table next to the Swiss rates; the mapping guide points to the ESTV form for the period.
- [Demo numbers look like advice] → every demo text starts with `DEMO`, the file name carries `_DEMO`, and `docs/examples/README.md` says the accounts are template suggestions.

## Open Questions

- Research open question 9 (Nebenjournal behaviour) is confirmed with the first test import; the advice text is in the target, so a correction is one string.
