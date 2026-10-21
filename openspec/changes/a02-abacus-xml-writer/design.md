## Context

`openspec/research/a-target.md` §1-2 records the import options of Abacus FIBU and the AbaConnect "XML Buchungen" field rules from the Abacus documentation (versions 2015.00 and 2024.00, the 2020 "Fibu Buchungsschnittstelle" PDF) and the erpnextswiss cross-check. The engine already has a `TargetWriter<B>` boundary (`src/export/target.ts`) and, after a01, lets the target name its currency. This slice adds the writer only; the posting rules that produce `AbacusBooking` values follow in a03.

## Goals / Non-Goals

**Goals:**
- A byte-deterministic AbaConnect XML Buchungen file that a Treuhänder can import with F11 or F5534 without extra configuration beyond the Mandant.
- Every field rule traceable to a source line in `docs/abacus-format.md`.
- Every uncertain choice (TaxType value, tax sign, tax amount in the Leitwährung, `TaxIncluded` on rate-0 codes, Single and Collective TaxAccount, interface version) in one constant, so the first test import changes one line and the golden files.

**Non-Goals:**
- Sammelbuchungen, foreign currency, Debitoren, archive links, budget entries, Saldosteuersatz.
- A generic XML library: the output is a fixed tree of about 40 elements.

## Decisions

1. **AbaConnect XML, not ASCII and not web services.** XML is Abacus' current documented import (versions up to 2024.00), carries MWST per booking and is what both the paid connector and Kontera deliver. ASCII Buchungen ends at version 2014.00; web services need network access to the Mandant and a licence (research §1). Alternative: CSV for the F11 Excel import of a third party. Rejected: not Abacus standard.
2. **One Einzelbuchung per apaleo line, `TaxData` in `SingleInformation`.** The AbaDefault mapping has `TaxData` only in `SingleInformation`, so the VAT-bearing account (revenue, deposit, write-off) is always the Single account and the other account the Collective account; `DebitCredit` states the side of the Collective account. A Sammelbuchung per day would shrink the file, but would hide the apaleo line behind a total and break the traceability rule of the engine (one booking per ledger line). Alternative: Collective = debited account always. Rejected: an allowance debits the revenue account, which must still carry `TaxData`.
3. **Gross amounts, `TaxIncluded` `I`, apaleo's tax amount in `KeyAmount`.** apaleo's ledger line has a gross amount in whole Rappen; Abacus books an inclusive amount and posts the tax on the tax account of the MWST-Code. The file carries apaleo's tax (rounded per line) in `TaxData/KeyAmount` so the import does not depend on Abacus' rounding; with "MWST berechnen" Abacus may recompute it (research §2, open question 5). `TaxData/AmountData/Amount` is `0.00`, because every booking is in the Leitwährung and erpnextswiss, the only production Abacus XML writer we cross-check, had to hard-code `0` there in 2023 after Abacus raised an error when the document currency equals the key currency. The constant `TAX_AMOUNT_IN_KEY_CURRENCY` (`zero` default, `tax`) keeps the documented reading one switch away (open question 11). `TaxIncluded` on rate-0 codes is the constant `TAX_INCLUDED_AT_RATE_ZERO` (default `I`): the KMU sample codes 400 and 491 carry different `Inclusive` flags whose meaning is undocumented, so one `E` for every rate-0 code could break 400 while fixing 491; the amounts are the same either way (open question 14).
4. **`TaxType` `0` and negative output tax, each a named constant.** The Abacus field description says `0` = Umsatzsteuer and explains the shift against the DBX numbering. erpnextswiss writes the constants `TaxType` `1`, `UseCode` `1` and a negated tax on sales and purchase invoices alike, so it is no evidence for either value; it rather suggests that Abacus with "MWST berechnen" recomputes them from the MWST-Code. We follow the documentation and keep `TAX_TYPE_OUTPUT` and `taxSign()` in `src/abacus/format.ts` so a confirmed import can flip them (open questions 3, 4). `E-ABACUS-TAX-SIGN` calls `taxSign()` instead of repeating the rule, so flipping the sign after the first import leaves no hard-coded validator behind. The golden files make any change visible.
5. **`TaxAccount` per the documented table.** Single: the account itself (it is the MWST-pflichtige account, 2020 PDF table "Ertragskonto"); Collective: `abacus.mwstKonto` (vereinbart) or `abacus.mwstHilfskonto` (vereinnahmt); `0` on bookings without MWST. Defaults `2200` and `2202` are the accounts of the Abacus KMU sample codes 311/312/313. erpnextswiss writes the tax account in the Single block and no Collective `TaxAccount`; the Single value is therefore the constant `SINGLE_TAX_ACCOUNT` (`account` default, `taxAccount`), and the Collective value stays one function (open questions 8, 12).
6. **Belegnummer `MMDD` + 6-digit counter, 10 characters.** `DocumentNumber` is text of length 10. Using the period's first day keeps files of one property apart for daily, partial and monthly files, as in the BMD writer, and leaves room for 999,999 bookings. The apaleo receipt or reference goes to `Text2`, where the Treuhänder sees it (the paid connector puts it into `Text1`).
7. **Interface version as config, default `2015.00`.** All used fields exist since 2012; the 2015.00 marks more of them mandatory, so we always write those. A newer Abacus imports older interface versions; the reverse is not guaranteed. Alternative: always `2024.00`. Rejected until a test import shows that 2015.00 is refused (open question 2).
8. **Mandant written into `Parameter` and `Client`; required in the section.** It makes Abacus refuse the file in a wrong Mandant when the Treuhänder has "nur Buchungen mit gleicher Mandantennummer" active, and it lets the protocol name the target Mandant. Two properties in one Mandant need different Geschäftsbereiche (`W-MANDANT-SHARED`), like the separate Buchungssymbole in BMD.
9. **UTF-8, LF, single-quoted attributes, own escaping.** The Abacus examples use `version='1.0'`, `mode='SAVE'` and UTF-8; LF is valid XML and keeps the golden files readable in git. A hand-written serializer for a fixed tree avoids a runtime dependency (project rule: minimal dependencies).

## Risks / Trade-offs

- [Abacus rejects a field value we chose from the documentation] → every such value is in `format.ts`, listed in `docs/abacus-format.md` under "Offene Fragen" and in the first-import checklist; the protocol import block shows the values a Treuhänder needs to compare, including the constants.
- ["MWST berechnen" replaces the file's MWST-Code by the default code of the account in F21] → the import block lists every pair "account -> MWST-Code" and warns that each account must carry that code in F21; the mapping guide's sign-off checklist asks for it (research §2, open question 13).
- [No real Abacus to validate against] → golden files are built from the documented field rules and reviewed line by line against the 2024.00 documentation; the erpnextswiss layout is a second, independent reading.
- [UTF-8 umlauts misread by an old Abacus release] → XML declares the encoding; if a test import shows a problem, the writer can escape non-ASCII as character references without changing the structure.

## Open Questions

- Research §9 questions 2-5, 7, 8 and 11-14 are answered by the first test import; until then the defaults above apply.
