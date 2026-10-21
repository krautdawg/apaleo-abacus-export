## 1. Code and tests

- [ ] 1.1 Delete `src/bmd/`, `test/bmd/`, `test/golden/bmd/` and `test/helpers/bmd.ts`
- [ ] 1.2 Delete `templates/ekr-hotel.rules.csv` and the EKR, Steuercode, dialect and Sachkonten-/Personenkontenlänge code paths in `src/mapping/` and `src/posting/`, with their tests
- [ ] 1.3 Remove the BMD implementation of `currency()` and `movements()` and every reference to `bmdTarget`; `DEFAULT_TARGET` stays `abacusTarget`
- [ ] 1.4 Remove `W-BUCHSYMBOL-SHARED` and the other BMD-only finding codes (`E-BMD-*`, `N-BMD-*`, `E-STEUERCODE-*`, `W-STEUERCODE-UNCHECKED`, `E-ACCOUNT-LENGTH`, `W-PADDED`, `N-TEMPLATE-SCALED`) from `src/` where a03 did not already replace them
- [ ] 1.5 Remove `src/bmd` from the restricted-import boundary in `eslint.config.js` and from `test/lint/boundaries.test.ts`
- [ ] 1.6 Update the export-run currency tests to the Abacus scenarios ("EUR property in a CHF Mandant", "Swiss property", "Line in another currency")

## 2. Docs

- [ ] 2.1 Delete `docs/bmd-format.md` and `docs/bmd-import.md`; replace links with `docs/abacus-format.md` or `docs/abacus-import.md`; update the required-file list in `test/docs.test.ts` and the "First import" test in `test/readme.test.ts` to `docs/abacus-import.md`
- [ ] 2.2 Remove the deleted codes from `docs/troubleshooting.md`
- [ ] 2.3 Rename the last section of `docs/mapping-guide.md` to `## Checkliste zur Freigabe durch den Treuhänder` and update `test/readme.test.ts`
- [ ] 2.4 Write `docs/abacus-import.md` (Swiss Standard German, "du", no "ß"; already in the docs test's `SWISS_FILES`) with every point of the scenario "First import in Abacus": F11 or F5534 with import type "XML Buchungen", licence, "MWST berechnen" and the F21 default MWST-Code per account, Nebenjournal and undo, Mandant and Geschäftsbereich, the protocol checklist with the "account -> MWST-Code" pairs, and the first-test-import checklist of research §9; link it from README and `docs/configuration.md`
- [ ] 2.5 Remove the BMD topics (`bmd`, `bmd-ntcs`, `bmd-export`, `buchungsimport`, `ekr`, `austria`, `oesterreich`) from the topic command in `docs/maintainers.md` (final list in a08)
- [ ] 2.6 Delete `openspec/research/bmd-target.md` and point `docs/architecture.md` to `renderXmlBuchungen`, `AbacusValidationError` and `test/golden/abacus/`

## 3. Release check

- [ ] 3.1 `pnpm typecheck`, `pnpm lint`, `pnpm test` (without `UPDATE_GOLDEN`), `pnpm build` green; every Abacus golden file and `docs/examples/` unchanged
- [ ] 3.2 `grep -rni "bmd" src test templates` finds only the refusal of an old `bmd` config section and of BMD mapping files with their tests, and README tests that a08 rewrites; `node dist/cli/main.js export --month 2026-09 --demo --dry-run` prints the same summary as after a03
