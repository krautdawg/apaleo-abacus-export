## 1. Tests first

- [ ] 1.1 `test/docs.test.ts` and `test/helpers/docs.ts`: replace `SWISS_FILES` by every German file for the "ß", Austrian BMD term, foreign-rate (rate tokens not preceded by a digit, `.` or `,`) and Swiss-notation checks; fail on the tokens `BMD` and `DATEV` outside the allowed places (a README line that links an origin project, so the FAQ answer on BMD and DATEV passes; update the `'**DATEV?** Nein.'` case at `test/docs.test.ts:305` to stay a failing example next to a passing linked FAQ answer); tests for "Old Swiss rates pass", "Decimal point in a German rate" and "FAQ answer on BMD and DATEV"; drop `bmd` from the config-key prefix pattern
- [ ] 1.2 `test/readme.test.ts`: H1, link to README.en.md, tagline, search terms, disclaimer notice, `## Was es macht` (five items), quick start with `--template kmu-hotel`, `## Was es nicht macht` items, comparison rows and price sentence, origin sentence, pending-import sentence, FAQ topics of the "README FAQ" requirement (Kosten, Daten, Lizenz, Direktimport, Testimport, rückgängig, mehrere Hotels, wechseln, Saldosteuersatz, BMD und DATEV with a link to both origin projects)
- [ ] 1.3 `test/community.test.ts` and `test/repo-files.test.ts`: changelog entries, Swiss forms, `CODE_OF_CONDUCT.md` without "ß", DISCLAIMER terms (Treuhänder, Abacus)

## 2. README and English README

- [ ] 2.1 Rewrite `README.md` in Swiss Standard German to the documentation requirements (first screen, Schnellstart, Docker, Befehle, Konfiguration, Was es nicht macht, Vergleich, Häufige Fragen, Haftungsausschluss, Mitmachen, Lizenz); CI badges for apaleo-abacus-export
- [ ] 2.2 Rewrite `README.en.md` (at most 80 lines, same install commands, no quickstart marker)

## 3. Guides and community files

- [ ] 3.1 Review and rewrite every file in `docs/` and `examples/demo/README.md` in Swiss Standard German ("du", "ss", Swiss terms), including `docs/setup-apaleo.md`, `docs/export.md`, `docs/apaleo-source.md`, `docs/architecture.md`, `docs/troubleshooting.md`, `docs/configuration.md`, `docs/examples/README.md`
- [ ] 3.2 `docs/mapping-guide.md`: Saldosteuersatz note, every `Vorschlag (ungeprüft)` row of the KMU template, the sign-off checklist (F21 default MWST-Code per mapped VAT account, no default code on untaxed accounts, Kurtaxe never on code `490`); every German doc writes rates as `8,1 %`
- [ ] 3.3 `docs/maintainers.md`: `## Vor der Veröffentlichung` (test import with a Treuhänder, Swiss sandbox recording, visibility, social preview, Discussions, first tag), `## Testimporte` (empty table with date, Abacus release, interface version, program, result), `## Später geplant` (Saldosteuersatz, Debitoren-Schnittstelle, weekly cadence, Sammelbuchung per day if Treuhänder ask)
- [ ] 3.4 `DISCLAIMER.md` (binding Swiss Standard German, English translation; Treuhänder, MWST-Codes, Abacus, no connection to apaleo GmbH or Abacus Research AG), `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` ("ss"), `CHANGELOG.md` (origin apaleo-bmd-export v0.1.0)
- [ ] 3.5 `.github/ISSUE_TEMPLATE/*.yml` and `.github/pull_request_template.md` in Swiss Standard German about Abacus; field ids unchanged; comments in the example config, `.env.example` and compose file

## 4. GitHub metadata

- [ ] 4.1 `gh repo edit krautdawg/apaleo-abacus-export --description "..."` and `--add-topic` for the listed topics, `--remove-topic` for any BMD or DATEV topic; do not change visibility; record the command in `docs/maintainers.md`

## 5. Release check

- [ ] 5.1 `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` green; `src/` unchanged by this slice
- [ ] 5.2 `grep -rn "ß" --include=*.md --include=*.yml --exclude-dir=node_modules --exclude-dir=openspec .` finds nothing; `gh repo view --json description,repositoryTopics,visibility` shows the new metadata and unchanged visibility
