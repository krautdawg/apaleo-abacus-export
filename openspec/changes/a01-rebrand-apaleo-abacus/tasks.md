## 1. Rename

- [ ] 1.1 Set `package.json` `name` to `apaleo-abacus-export`, `version` to `0.0.0`, `bin` to `{ "apaleo-abacus": "dist/cli/main.js" }` and the description to "Free open-source export from the apaleo hotel PMS to Abacus Finanzbuchhaltung (AbaConnect XML Buchungen) for Swiss hotels."; refresh `pnpm-lock.yaml` with `pnpm install`
- [ ] 1.2 In `src/core/config.ts` rename the config env variable to `APALEO_ABACUS_CONFIG`, the default file names to `apaleo-abacus.config.{yaml,yml,json}`, the env prefix to `APALEO_ABACUS_` and every allow-list entry; keep `APALEO_CLIENT_ID` and `APALEO_CLIENT_SECRET`; the `datev` rejection message says "not a section of apaleo-abacus"
- [ ] 1.3 Rename the binary in `src/cli/help.ts`, usage lines, error hints, `src/cli/version.ts` and every message that names the command (`"apaleo-bmd mapping check"` and similar in `src/`); set the `--help` summary line to apaleo -> Abacus
- [ ] 1.4 Rename `apaleo-bmd.config.example.yaml` to `apaleo-abacus.config.example.yaml` and `examples/demo/apaleo-bmd.config.yaml` to `examples/demo/apaleo-abacus.config.yaml`; update every reference
- [ ] 1.5 Update `.gitignore` (add `/apaleo-abacus.config.*`, keep the BMD and DATEV names), `Dockerfile` (entry point `apaleo-abacus`, `/config/apaleo-abacus.config.yaml`, OCI title `apaleo-abacus-export`), `docker-compose.example.yml` (service `apaleo-abacus`, image `apaleo-abacus-export:local`, `APALEO_ABACUS_*`), `.env.example`, and `.github/workflows/ci.yml` (CLI steps, the `readme-quickstart` filter for `cd apaleo-abacus-export`, image tag `apaleo-abacus-export:ci`)
- [ ] 1.6 Replace `apaleo-bmd` command lines and `APALEO_BMD_*` names in README, README.en.md, `docs/` and `examples/demo/README.md`; point the clone URL, `cd` line and CI badges to `krautdawg/apaleo-abacus-export` (prose otherwise unchanged)
- [ ] 1.7 Update the tests that name the binary, config file or env variables; add the cli scenarios "Old binary name is gone" (no `apaleo-bmd`) and "Old variable names are not read" (`APALEO_BMD_CONFIG`)

## 2. Currency in the target

- [ ] 2.1 Add `currency(config: Config): string` to `TargetWriter` in `src/export/target.ts`; implement it in `src/bmd/target.ts` returning `'EUR'`
- [ ] 2.2 Replace `EXPORT_CURRENCY` and `currencyFindings` in `src/export/pipeline.ts` by a check against `target.currency(config)`; move the BMD Grundwährung sentence into the BMD target; keep the two-step order (property first, then lines)
- [ ] 2.3 Add tests in `test/export/target.test.ts`: CHF property with the BMD target (`E-CURRENCY`, no ledger request), a fake target booking in CHF (file written), one EUR line under the CHF fake target (`E-CURRENCY` with the line count)

## 3. Docs test and scope cut

- [ ] 3.1 `test/docs.test.ts`: read command lines of `apaleo-abacus`, fail on any `apaleo-bmd` or `apaleo-datev` command line inside `sh`/`bash` fences, add `abacus` to the config-key prefix pattern, and drop `Kurtaxe` and `Mandantennummer` from the list of German DATEV terms (both are Swiss and Abacus terms; the final term list follows in a08)
- [ ] 3.2 Remove the BMD-only backlog items from `docs/maintainers.md` `## Später geplant` (for example the BMD Personenkonten file and BMD Com); keep generic items
- [ ] 3.3 `grep -rn "apaleo-bmd\|APALEO_BMD" --exclude-dir=node_modules --exclude-dir=openspec .` returns only README/README.en prose that a08 rewrites, `CHANGELOG.md` history and the `.gitignore` legacy names; no clone URL, `cd` line, badge, CI step, image tag or command line

## 4. Release check

- [ ] 4.1 `pnpm typecheck`, `pnpm lint`, `pnpm test` (without `UPDATE_GOLDEN`), `pnpm build` green; every BMD golden file byte-identical
- [ ] 4.2 `node dist/cli/main.js --help` starts with `apaleo-abacus <command> [options]`; `node dist/cli/main.js export --month 2026-09 --demo --dry-run` exits 0
- [ ] 4.3 `docker build -t apaleo-abacus-export:ci .` and `docker run --rm apaleo-abacus-export:ci --help` work with the new entry point
