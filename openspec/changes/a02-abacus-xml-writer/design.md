## Context

`openspec/research/a-target.md` §1-2 records the import options of Abacus FIBU and the AbaConnect "XML Buchungen" field rules from the Abacus documentation (versions 2015.00 and 2024.00, the 2020 "Fibu Buchungsschnittstelle" PDF) and the erpnextswiss cross-check. The engine already has a `TargetWriter<B>` boundary (`src/export/target.ts`) and, after a01, lets the target name its currency. This slice adds the writer only; the posting rules that produce `AbacusBooking` values follow in a03.

## Goals / Non-Goals

**Goals:**
- A byte-deterministic AbaConnect XML Buchungen file that a Treuhänder can import with F11 or F5534 without extra configuration beyond the Mandant.
- Every field rule traceable to a source line in `docs/abacus-format.md`.
- Every uncertain choice (TaxType value, tax sign, interface version, TaxAccount) in one constant, so the first test import changes one line and the golden files.

**Non-Goals:**
- Sammelbuchungen, foreign currency, Debitoren, archive links, budget entries, Saldosteuersatz.
- A generic XML library: the output is a fixed tree of about 40 elements.

## Decisions

1. **AbaConnect XML, not ASCII and not web services.** XML is Abacus' current documented import (versions up to 2024.00), carries MWST per booking and is what both the paid connector and Kontera deliver. ASCII Buchungen ends at version 2014.00; web services need network access to the Mandant and a licence (research §1). Alternative: CSV for the F11 Excel import of a third party. Rejected: not Abacus standard.
2. **One Einzelbuchung per apaleo line, `TaxData` in `SingleInformation`.** The AbaDefault mapping has `TaxData` only in `SingleInformation`, so the VAT-bearing account (revenue, deposit, write-off) is always the Single account and the other account the Collective account; `DebitCredit` states the side of the Collective account. A Sammelbuchung per day would shrink the file, but would hide the apaleo line behind a total and break the traceability rule of the engine (one booking per ledger line). Alternative: Collective = debited account always. Rejected: an allowance debits the revenue account, which must still carry `TaxData`.
3. **Gross amounts, `TaxIncluded` `I`, apaleo's tax amount.** apaleo's ledger line has a gross amount in whole Rappen; Abacus books an inclusive amount and posts the tax on the tax account of the MWST-Code. The file carries apaleo's tax (rounded per line) so the import does not depend on Abacus' rounding; with "MWST berechnen" Abacus may recompute it (research §2, open question 5).
4. **`TaxType` `0` and negative output tax, each a named constant.** The Abacus field description says `0` = Umsatzsteuer and explains the shift against the DBX numbering; erpnextswiss writes `1`. We follow the documentation and keep `TAX_TYPE_OUTPUT` and `taxSign()` in `src/abacus/format.ts` so a confirmed import can flip them (open questions 3, 4). The golden files make any change visible.
5. **`TaxAccount` per the documented table.** Single: the account itself (it is the MWST-pflichtige account); Collective: `abacus.mwstKonto` (vereinbart) or `abacus.mwstHilfskonto` (vereinnahmt); `0` on bookings without MWST. Defaults `2200` and `2202` are the accounts of the Abacus KMU sample codes 311/312/313.
6. **Belegnummer `MMDD` + 6-digit counter, 10 characters.** `DocumentNumber` is text of length 10. Using the period's first day keeps files of one property apart for daily, partial and monthly files, as in the BMD writer, and leaves room for 999,999 bookings. The apaleo receipt or reference goes to `Text2`, where the Treuhänder sees it (Grman puts it into `Text1`).
7. **Interface version as config, default `2015.00`.** All used fields exist since 2012; the 2015.00 marks more of them mandatory, so we always write those. A newer Abacus imports older interface versions; the reverse is not guaranteed. Alternative: always `2024.00`. Rejected until a test import shows that 2015.00 is refused (open question 2).
8. **Mandant written into `Parameter` and `Client`; required in the section.** It makes Abacus refuse the file in a wrong Mandant when the Treuhänder has "nur Buchungen mit gleicher Mandantennummer" active, and it lets the protocol name the target Mandant. Two properties in one Mandant need different Geschäftsbereiche (`W-MANDANT-SHARED`), like the separate Buchungssymbole in BMD.
9. **UTF-8, LF, single-quoted attributes, own escaping.** The Abacus examples use `version='1.0'`, `mode='SAVE'` and UTF-8; LF is valid XML and keeps the golden files readable in git. A hand-written serializer for a fixed tree avoids a runtime dependency (project rule: minimal dependencies).

## Risks / Trade-offs

- [Abacus rejects a field value we chose from the documentation] → every such value is in `format.ts`, listed in `docs/abacus-format.md` under "Offene Fragen" and in the first-import checklist; the protocol import block shows the values a Treuhänder needs to compare.
- [No real Abacus to validate against] → golden files are built from the documented field rules and reviewed line by line against the 2024.00 documentation; the erpnextswiss layout is a second, independent reading.
- [UTF-8 umlauts misread by an old Abacus release] → XML declares the encoding; if a test import shows a problem, the writer can escape non-ASCII as character references without changing the structure.

## Open Questions

- Research §9 questions 2-5, 7 and 8 are answered by the first test import; until then the defaults above apply.
