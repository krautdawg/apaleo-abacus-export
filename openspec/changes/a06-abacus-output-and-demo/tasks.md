## 1. Protocol, dry run and manifest

- [ ] 1.1 Summary output in `src/export/summary.ts` per Abacus account and per MWST-Code and rate, with apaleo's precise VAT, the difference, the rounding sentence and the Ziffer for 8.1/2.6/3.8 % (one table in `src/abacus/format.ts`)
- [ ] 1.2 Levies per account with or without MWST, written-off receivables per rate, deposits received/released/refunded in the summary text
- [ ] 1.3 Manifest fields in `src/export/output.ts`: journal total, tax per MWST-Code and rate, Mandant and Geschäftsbereich; keep file hash, booking count, mapping hash, tool version, creation time
- [ ] 1.4 `E-FILE-EXISTS` and `E-PERIOD-OVERLAP` texts from `abacusTarget.advice` (Nebenjournal, reversing); `.replaced-<timestamp>.xml` names
- [ ] 1.5 Tests for every export-run scenario of this change in `test/export/` and `test/cli/export.test.ts`; regenerate `test/golden/export/` and review the diff

## 2. Plausibility

- [ ] 2.1 `E-MWST-CODE-RATES` in `src/export/checks.ts` (code, rates, mapping rows), documented in `docs/troubleshooting.md`
- [ ] 2.2 Tests "Code used at two rates" and "One rate per code" (Swiss fixture month)

## 3. Demo and examples

- [ ] 3.1 Fabricate the Swiss demo responses in `examples/demo/apaleo/` (property `BSP` "Hotel Beispiel", CHF, `Europe/Zurich`, September 2026, the cases of the CH month) and validate them against the Swagger excerpt
- [ ] 3.2 `examples/demo/apaleo-abacus.config.yaml` with `abacus.mandant: 7777` and `leitwaehrung: CHF`; `examples/demo/mapping-BSP.csv` from `init-mapping --template kmu-hotel` with the Kurtaxe row filled; `examples/demo/README.md` in Swiss Standard German
- [ ] 3.3 Regenerate `docs/examples/` (XML, protocol, mapping, README) and keep `test/examples.test.ts` comparing them with the golden output; `test/cli/demo.test.ts` asserts CHF and the three codes

## 4. Release check

- [ ] 4.1 `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` green
- [ ] 4.2 `node dist/cli/main.js export --month 2026-09 --demo --dry-run` prints a CHF summary with `313` 3.8 % (Ziffer 343) and exits 0; the CI `readme-quickstart` and `docker` jobs pass with the new demo file
