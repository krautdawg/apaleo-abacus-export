## MODIFIED Requirements

### Requirement: Docs folder
The repository SHALL contain, in German, `docs/setup-apaleo.md` (custom app creation with the exact permissions, the optional one marked `optional`), `docs/mapping-guide.md` (columns, resolution order, MWST-Codes, VAT guard, Kurtaxe, Anzahlungen, Debitorenverlust, payments, and a last section `## Checkliste zur Freigabe durch den Treuhänder`), `docs/abacus-import.md` (how the Treuhänder imports the file in Abacus and what to check after the first import), `docs/abacus-format.md` (fields, rules and sources), `docs/configuration.md`, `docs/docker.md`, `docs/troubleshooting.md`, `docs/architecture.md`, `docs/maintainers.md` (`## Vor der Veröffentlichung` checklist, `## Testimporte` record and `## Später geplant` backlog with items inside this product only, no other target formats), `docs/posting-rules.md`, `docs/export.md`, `docs/apaleo-source.md` and `docs/examples/README.md`. The mapping guide SHALL explain that MWST rates depend on the service date (3.8 % for Beherbergung including breakfast, MWSTG Art. 25 Abs. 4; 8.1 % for meals, drinks, minibar and services with a surcharge such as parking or wellness; 2.6 % for take-away food without alcohol; 7.7 %, 3.7 % and 2.5 % until 2023-12-31) and SHALL list every template row marked `Vorschlag (ungeprüft)`. No `docs/bmd-*.md` or `docs/datev-*.md` file SHALL exist.

#### Scenario: Treuhänder review
- **WHEN** a Treuhänder reads the mapping guide and a mapping CSV
- **THEN** they can decide each row without running the tool, and the guide ends with the sign-off checklist

#### Scenario: Contributor adds a source
- **WHEN** a contributor wants to add a Smoobu source
- **THEN** `docs/architecture.md` explains in German the SourceAdapter contract, the canonical ledger line (`LedgerLine`) and where tests and fixtures go

#### Scenario: Former file names
- **WHEN** someone looks for `docs/setup-apaleo.de.md`, `docs/mapping-guide.de.md`, `docs/bmd-import.md` or `docs/bmd-format.md`
- **THEN** none exists, and the README and every doc link `docs/setup-apaleo.md`, `docs/mapping-guide.md`, `docs/abacus-import.md` and `docs/abacus-format.md`

#### Scenario: Contributor adds a target
- **WHEN** a contributor wants to add a writer for another target format
- **THEN** `docs/architecture.md` explains in German the `TargetWriter` boundary (including `currency` and `movements`), the `AbacusBooking` example and where golden files go, without announcing any other target as planned

#### Scenario: First import in Abacus
- **WHEN** a Treuhänder imports the first file
- **THEN** `docs/abacus-import.md` names the programs (F11 Buchen, F5534 "Import/Export Buchungen AbaConnect" with import type "XML Buchungen"), the licence the Mandant needs (FIBU with Buchungsschnittstellen, as far as documented), the option "MWST berechnen" and that with it Abacus may take the default MWST-Code of each account in F21 instead of the file's code, the Mandant and the Geschäftsbereich per property in a shared Mandant, where the imported bookings land (Nebenjournal) and how to undo them, a checklist to compare with the protocol (Saldenliste, MWST-Journal per MWST-Code and Ziffer 303/313/343, every "account -> MWST-Code" pair of the import block against the default MWST-Code of that account in F21, for example `3400 -> 313`, `2030 -> 313`, `2031 -> 311`, `3805 -> 313`, with every such account MWST-pflichtig, Anzahlungen, Debitorenverlust as Entgeltsminderung, Kurtaxe and 0 % revenue accounts without default MWST-Code, Belegnummern), and the open questions of research §9 as a checklist for the first test import (licence and program, interface version, `TaxType`, tax sign, `Amount` `0.00` with the tax in `KeyAmount`, `TaxAccount` in both blocks and on rate-0 codes (`TAX_ACCOUNT_AT_RATE_ZERO`), `TaxIncluded` on rate-0 codes, whether "MWST berechnen" keeps the file's MWST-Code, Belegnummern (including whether Abacus checks duplicates per Geschäftsjahr, since the number has no year), Nebenjournal, and `vereinnahmt` with the Hilfskonto)
