## Why

The engine is Swiss after a07, but README, guides, disclaimer, community files and GitHub metadata still speak of BMD, Austria and the Kanzlei, partly in German with "ß". Swiss hotels and Treuhänder search for "apaleo Abacus Export" and read Schweizer Hochdeutsch; they need to see on the first screen that this is a free, file-based alternative to the paid connector, what it does not do, and that the first test import is pending. This is the last slice before the repository can be published.

## What Changes

- README in Swiss Standard German: H1 "apaleo Abacus Export – kostenlos und Open Source", tagline, intro for Swiss hotels and their Treuhänder, disclaimer notice, quick start with `init-mapping --template kmu-hotel`, `## Was es nicht macht`, comparison without vendor names ("24-48 EUR pro Monat (je nach Variante und Anzahl der Betriebe), laut apaleo Store, Oktober 2026"), FAQ, origin sentence linking apaleo-bmd-export and apaleo-datev-export.
- Every guide, DISCLAIMER, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT (official translation in Swiss orthography), CHANGELOG, issue forms, PR template and example-config comments in Swiss Standard German with "du".
- Docs test: no "ß" in any German file; Swiss terms required where practitioners use them; forbidden German DATEV and Austrian BMD terms (`Kanzlei`, `Steuercode`, `Buchungssymbol`, `EKR`, `UVA`, `Ortstaxe`, ...) and the tokens `DATEV` and `BMD` outside the allowed places; no "getestet mit Abacus" claim until a test import is recorded.
- Short `README.en.md` for international contributors.
- `docs/maintainers.md`: `## Vor der Veröffentlichung` (first Abacus test import with a Treuhänder, Swiss sandbox recording, visibility, social preview, first tag), `## Testimporte`, `## Später geplant` (Saldosteuersatz, DEBI interface, weekly cadence, ...); GitHub description and topics for "apaleo Abacus Export" without changing visibility.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `documentation`: README first screen, quick start, scope and comparison, docs folder, docs test, Swiss Standard German, English README, compatibility claim.
- `community-health`: contribution files, changelog, templates, repository description and topics.
- `project-quality`: disclaimer text for Abacus and the Treuhänder.

## Non-goals

- Making the repository public, a release tag or any publishing: the maintainer decides after the first test import.
- New features or behaviour changes.

## Impact

- `README.md`, `README.en.md`, `DISCLAIMER.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`, `.github/ISSUE_TEMPLATE/*`, `.github/pull_request_template.md`, every file in `docs/`, `examples/demo/README.md`, comments in `apaleo-abacus.config.example.yaml`, `.env.example`, `docker-compose.example.yml`.
- `test/docs.test.ts`, `test/readme.test.ts`, `test/community.test.ts`, `test/repo-files.test.ts`, `test/helpers/docs.ts`; GitHub repository metadata via `gh repo edit` (description and topics only).
