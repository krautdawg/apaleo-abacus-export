## 1. Config

- [ ] 1.1 Add the `abacus` section to the schema in `src/core/config.ts` (`mandant` required in the section, `leitwaehrung`, `abrechnungsart`, `version`, `mwstKonto`, `mwstHilfskonto`, `mwstCodes.normal|reduziert|beherbergung`, `geschaeftsbereich`) with the defaults of the cli spec, and per-property `mandant` and `geschaeftsbereich`; register the section in `configSections`
- [ ] 1.2 Add `W-MANDANT-SHARED` to `doctor` and the protocol warnings (same place as `W-BUCHSYMBOL-SHARED`)
- [ ] 1.3 Tests in `test/core/config.test.ts` for the scenarios "Mandant missing", "Invalid Leitwährung", "Abacus defaults"; a `doctor` test for "Two properties share a Mandant"
- [ ] 1.4 Add a commented `abacus:` block to `apaleo-abacus.config.example.yaml` (comments in Swiss Standard German, no "ß")

## 2. Writer

- [ ] 2.1 `src/abacus/types.ts`: `AbacusBooking` (`collectiveAccount`, `singleAccount`, `debitCredit`, `businessDate`, `grossCents`, optional `tax` with `mwstCode`, `percent`, `taxCents`, optional `kost`, `text1`, `text2`) and `AbacusRenderOptions` (period, property id, Mandant, Geschäftsbereich, Leitwährung, Abrechnungsart, version, MWST accounts)
- [ ] 2.2 `src/abacus/format.ts`: amount and rate formatting, `YYYY-MM-DD` dates, `DocumentNumber`, `TAX_TYPE_OUTPUT = 0`, `taxSign()`, `TAX_AMOUNT_IN_KEY_CURRENCY = 'zero'` (`'zero' | 'tax'`), `TAX_INCLUDED_AT_RATE_ZERO = 'I'` (`'I' | 'E'`), `SINGLE_TAX_ACCOUNT = 'account'` (`'account' | 'taxAccount'`), `taxAccounts()`, XML escaping and indentation helpers; each constant with a comment naming its research §9 open question
- [ ] 2.3 `src/abacus/sanitise.ts`: control characters, XML-invalid characters, spaces, 80-character cut with `N-ABACUS-TRUNCATED`
- [ ] 2.4 `src/abacus/validate.ts` and `src/abacus/errors.ts`: every `E-ABACUS-*` rule of the spec, all findings at once in one `AbacusValidationError` (a `FindingsError`); `E-ABACUS-TAX-SIGN` calls `taxSign()` from `format.ts`
- [ ] 2.5 `src/abacus/writer.ts`: `renderXmlBuchungen(bookings, options)` building container, `Parameter`, one `Transaction`/`Entry` per booking in the documented element order
- [ ] 2.6 `src/abacus/import-block.ts` and `src/abacus/target.ts`: `abacusTarget` with file name, file pattern, byte comparison, protocol title, import block (including the "account -> MWST-Code" pairs, the `format.ts` constants and the F21 warning for "MWST berechnen"), refusal advice and `currency()` = `abacus.leitwaehrung`; `src/abacus/index.ts` and `src/abacus/README.md`
- [ ] 2.7 Add `src/abacus` to the restricted-import boundary in `eslint.config.js` and `test/lint/boundaries.test.ts`

## 3. Tests

- [ ] 3.1 Unit tests in `test/abacus/` for format, sanitising, validation (every code, several at once, the sign check following a replaced `taxSign()`), Belegnummern, `TaxAccount` per Abrechnungsart, each `format.ts` constant switched once (scenarios "Tax amount constant switched", "Single TaxAccount constant switched", "Kurtaxe with a Ziffer-910 code"), and the target (pattern, currency, advice, account-code pairs)
- [ ] 3.2 Golden files in `test/golden/abacus/` for every case listed in the spec, rendered from `test/helpers/abacus.ts` booking builders; `test/abacus/golden.test.ts` compares bytes and updates only with `UPDATE_GOLDEN=1`
- [ ] 3.3 Review each golden file element by element against the 2024.00 field list in `openspec/research/a-target.md` §2 and note the review in the test file header

## 4. Docs

- [ ] 4.1 Write `docs/abacus-format.md` in Swiss Standard German ("du", no "ß"): container, Einzelbuchung, `TaxData` (including `Amount` `0.00` with the tax in `KeyAmount`), number and date formats, Belegnummer, encoding, "MWST berechnen" and the default MWST-Code of an account in F21, every open question of research §9, and the source list from the research note with the check date; the docs test's Swiss-file list (a01) already contains this file
- [ ] 4.2 Document the `abacus` keys in `docs/configuration.md` and every new finding code in `docs/troubleshooting.md` (the docs test requires both)

## 5. Release check

- [ ] 5.1 `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` green; BMD golden files and the BMD demo unchanged (BMD stays the default target)
