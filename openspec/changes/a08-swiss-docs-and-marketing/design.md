## Context

a01-a07 changed names, engine, demo and container, and wrote the new guides (`docs/abacus-format.md`, `docs/abacus-import.md`, mapping guide sections) in Swiss Standard German where they were touched. The README, DISCLAIMER, community files, GitHub forms and several guides still carry the BMD product's Austrian text, and the docs test still forbids only German DATEV terms. The README is the page a Swiss hotel or Treuhänder lands on from a search for "apaleo Abacus Export".

## Goals / Non-Goals

**Goals:**
- One language (Schweizer Hochdeutsch, "du", "ss") across every user-facing file, enforced by the docs test.
- A first screen that answers "what, for whom, free, how safe" and ranks for the search terms Swiss users type.
- Honest scope: what the paid connector does that this tool does not (direct import, Debitoren, e-mail/S3, support).

**Non-Goals:**
- Publishing, release tags, visibility changes; marketing outside GitHub.

## Decisions

1. **Swiss Standard German, enforced mechanically.** The test fails on "ß" anywhere in a German file and on Austrian and German practice terms (`Kanzlei`, `Steuercode`, `Buchungssymbol`, `EKR`, `UVA`, `Ortstaxe`, foreign rates), matched as whole words. Alternative: a style guide only. Rejected: the BMD and DATEV projects showed that copied paragraphs slip through review; the test caught them.
2. **`CODE_OF_CONDUCT.md` keeps the official translation, with "ss".** The Contributor Covenant has no Swiss edition; replacing "ß" by "ss" is the Swiss orthography of the same text and keeps the headings the test checks.
3. **Comparison without vendor names, price as a range.** Same rule as the predecessors: the table compares the typical paid offer (24-48 EUR per month depending on variant and number of properties, apaleo Store, October 2026) with self-hosting, and says plainly what self-hosting costs in effort. Direct import into Abacus and the Debitoren interface are rows, because they are the paid connector's strongest points.
4. **Search terms in title, tagline and intro.** "apaleo Abacus Export", "Abacus Finanzbuchhaltung", "AbaConnect", "XML Buchungen", "MWST", "KMU-Kontenrahmen", "Treuhänder", "Schweiz" in the first lines; repository description and topics (`abacus`, `abaconnect`, `abacus-fibu`, `mwst`, `treuhand`, `schweiz`, ...) set with `gh repo edit` without touching visibility.
5. **Compatibility claim guarded.** Until `docs/maintainers.md` `## Testimporte` records an import (date, Abacus release, interface version, program, result), the docs say the file follows the documented AbaConnect interface and that the first test import is pending.

## Risks / Trade-offs

- [Whole-word rate checks block a legitimate sentence] → exceptions are limited to the troubleshooting entries that detect copied setups; a guide rephrases instead of quoting foreign rates.
- [Readers outside Switzerland (Liechtenstein, cross-border groups)] → README.en.md and the FAQ say the tool writes the Mandant's Leitwährung (CHF or EUR) and Swiss MWST rules only.

## Open Questions

None.
