## Why

Swiss Treuhänder import bookings into Abacus Finanzbuchhaltung through AbaConnect "XML Buchungen", Abacus' own documented file interface (research §1-2). It needs no partnership and no API access: the Treuhänder drops the file into F11 Buchen or F5534 "Import/Export Buchungen AbaConnect". This slice adds a writer for that file, pinned by golden files, before any mapping or posting change, so the format can be reviewed on its own.

## What Changes

- New module `src/abacus/` with the booking type `AbacusBooking` (Collective account, Single account with optional MWST, Soll/Haben of the Collective account, gross amount, Kostenstelle, two text lines), the renderer for `AbaConnectContainer` / `Task` / `Parameter` (FIBU, `XML Buchungen`, `AbaDefault`, interface version, Mandant) with one Einzelbuchung per booking, `TaxData` in `SingleInformation`, generated Belegnummern, sanitising, XML escaping and validation that reports every problem at once.
- `abacusTarget: TargetWriter<AbacusBooking>`: file name `ABACUS_Buchungen_<from>-<to>_<propertyId>.xml`, file pattern, byte comparison, protocol import block (program, Mandant, Geschäftsbereich, Leitwährung, Abrechnungsart, MWST-Codes, Belegnummern, "MWST berechnen"), Abacus refusal advice, and the currency `abacus.leitwaehrung`.
- Config section `abacus`: `mandant` (required in the section), `leitwaehrung` (`CHF` default, `EUR`), `abrechnungsart` (`vereinbart` default, `vereinnahmt`), `version` (`2015.00` default), `mwstKonto` (`2200`), `mwstHilfskonto` (`2202`), `mwstCodes.normal|reduziert|beherbergung` (`311`/`312`/`313`), `geschaeftsbereich` (`0`); per-property `mandant` and `geschaeftsbereich`; `W-MANDANT-SHARED`.
- Golden files in `test/golden/abacus/`; `docs/abacus-format.md` (Swiss Standard German) with fields, rules and sources.
- The BMD target stays the default; the pipeline switch follows in a03.

## Capabilities

### New Capabilities

- `abacus-xml-writer`: the AbaConnect XML Buchungen file for Abacus FIBU: container, Einzelbuchung layout, MWST data, Belegnummern, encoding, validation, sanitising, file name, import block and golden tests.

### Modified Capabilities

- `cli`: the `abacus` config section.
- `project-quality`: `src/abacus` joins the modules that must not import source adapters.

## Non-goals

- No Sammelbuchungen, no foreign-currency bookings (`ExchangeRateData`), no `QuantityData`, no Debitoren (`SubLedgerObject`), no archive attachments.
- No AbaConnect web service, no command-line import on the Abacus server.
- No mapping, posting or pipeline change (a03); no Saldosteuersatz (`FlatRate` stays `0`).

## Impact

- New: `src/abacus/` (`types.ts`, `format.ts`, `sanitise.ts`, `validate.ts`, `writer.ts`, `errors.ts`, `import-block.ts`, `target.ts`, `index.ts`, `README.md`), `test/abacus/`, `test/golden/abacus/`, `test/helpers/abacus.ts`, `docs/abacus-format.md`.
- Changed: `src/core/config.ts` (section `abacus`), `apaleo-abacus.config.example.yaml`, `docs/configuration.md`, `docs/troubleshooting.md` (new codes), `eslint.config.js` (boundary for `src/abacus`).
