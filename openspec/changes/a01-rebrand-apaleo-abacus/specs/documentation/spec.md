## MODIFIED Requirements

### Requirement: Quick start that works
The README SHALL contain a `## Schnellstart` with five numbered steps labelled "apaleo Custom App anlegen.", "Installieren", "Kontenzuordnung anlegen", "Probelauf" and "Export" (create the apaleo custom app; install from source with `git clone https://github.com/krautdawg/apaleo-abacus-export.git`, `cd apaleo-abacus-export`, `corepack enable`, `pnpm install --frozen-lockfile`, `pnpm build`; then `init-mapping`, `export --dry-run`, `export`), and a `## Schnellstart mit Docker` that builds the image locally with `docker compose -f docker-compose.example.yml build`. It SHALL contain the sentence "Es gibt noch kein npm-Paket und kein Container-Image zum Herunterladen. Du installierst aus dem Quellcode.", SHALL NOT show `npx` or `docker pull` (nor shall `README.en.md`), and every command shown SHALL exist in the CLI. CI SHALL run the install block marked `<!-- quickstart -->` in `README.md` verbatim up to `--help` and then the demo dry run.

#### Scenario: Install commands run in CI
- **WHEN** the `readme-quickstart` CI job runs
- **THEN** it executes the German README's quick-start install block, `node dist/cli/main.js --help` exits 0 and shows `apaleo-abacus`, and `node dist/cli/main.js export --month 2026-09 --demo --dry-run` prints the posting summary of the default target and exits 0 without network or credentials

#### Scenario: No dead-end install step
- **WHEN** `README.md` and `README.en.md` are scanned
- **THEN** they contain no `npx apaleo-abacus`, no `npx apaleo-bmd` and no `docker pull`, and each contains its sentence that there is no npm or registry release yet

### Requirement: Docs consistency test
The test suite SHALL check `README.md`, `README.en.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `DISCLAIMER.md`, `CHANGELOG.md`, every Markdown file in `docs/` and `examples/demo/README.md`. It SHALL fail when one of them contains, inside an `sh` or `bash` code fence, an `apaleo-abacus` command line whose command is not registered or whose flag is not in that command's options, or an `apaleo-bmd` or `apaleo-datev` command line at all; when it contains a backticked token matching `^(apaleo|abacus|bmd|output|posting|properties|schedule|checks)(\.[A-Za-z\[\]]+)+$` that is not a config schema path; when a finding code (`[EWN]-[A-Z-]+`) used in the source is missing from `docs/troubleshooting.md` or a documented code no longer exists in the source; when a relative link outside code fences points to a missing file or to an anchor that is not a heading slug of its target (GitHub slug rules, umlauts kept); when a `*.de.md` file exists outside `node_modules/`, `dist/` and `openspec/`; when the prose of a German file is not predominantly German; when a German file other than `CODE_OF_CONDUCT.md` addresses the reader with "Sie"; or when a German file uses a term from German DATEV practice (`Buchungsstapel`, `BU-Schlüssel`, `SKR03`, `SKR04`, `Automatikkonto`, `Beherbergungssteuer`, `Übernachtungssteuer`, `Beraternummer`, `EXTF`, `Belegfeld`, `Festschreibung`, `UStVA`, `ELSTER`, `19 %` or `7 %`) or the token `DATEV`, except in the README sentence that names the origin project, the README `## Was es nicht macht` item about other target formats, `CHANGELOG.md`, and the `docs/troubleshooting.md` entries of the findings that detect a copied German setup (the DATEV-mapping error, the rejected `datev` config section and `W-VAT-RATE-UNUSUAL`).

#### Scenario: Renamed command
- **WHEN** a command is renamed in code but not in the README
- **THEN** `pnpm test` fails and names the stale mention and the file

#### Scenario: Old binary in a doc
- **WHEN** `docs/export.md` shows ```` ```sh ```` `apaleo-bmd export --month 2026-10`
- **THEN** `pnpm test` fails naming `apaleo-bmd` and the file, and passes once the line reads `apaleo-abacus export --month 2026-10`

#### Scenario: Stale flag
- **WHEN** `docs/bmd-import.md` shows ```` ```sh ```` `apaleo-abacus export --month 2026-10 --email` and `export` has no `--email` option
- **THEN** `pnpm test` fails naming `--email`, the command and the file

#### Scenario: Stale config key
- **WHEN** `docs/configuration.md` mentions `` `bmd.beraternummer` `` and the schema has no such key
- **THEN** `pnpm test` fails naming `bmd.beraternummer` and the file

#### Scenario: Other backticked text is ignored
- **WHEN** a doc mentions `` `BMD_` ``, `` `2890` `` or `` `Revenues` ``
- **THEN** the test does not treat them as config keys or commands

#### Scenario: Broken anchor after translation
- **WHEN** the README links `docs/docker.md#the-demo-in-the-image` and that heading is now `### Die Demo im Image`
- **THEN** `pnpm test` fails naming the README, the link and the missing anchor, and passes once the link is `docs/docker.md#die-demo-im-image`

#### Scenario: Umlaut anchor
- **WHEN** a doc links `../README.md#häufige-fragen` and the README has `## Häufige Fragen`
- **THEN** the link check passes

#### Scenario: English paragraph in a German doc
- **WHEN** `docs/troubleshooting.md` is left in English
- **THEN** `pnpm test` fails naming the file as not German, and `README.en.md` is the only checked file expected to be English

#### Scenario: Copied DATEV paragraph
- **WHEN** `docs/mapping-guide.md` contains "Trag den BU-Schlüssel ein"
- **THEN** `pnpm test` fails naming the file and the term `BU-Schlüssel`

#### Scenario: German rate
- **WHEN** `docs/posting-rules.md` contains "Getränke mit 19 %"
- **THEN** `pnpm test` fails naming the file and the term `19 %`

#### Scenario: Swiss terms are allowed
- **WHEN** `docs/abacus-format.md` contains "Kurtaxe" and "Mandantennummer"
- **THEN** the term check passes, because both are the terms Swiss Treuhänder and Abacus use

#### Scenario: Bare DATEV mention
- **WHEN** `docs/bmd-import.md` contains "wie beim DATEV-Import"
- **THEN** `pnpm test` fails naming the file and the token `DATEV`

#### Scenario: Allowed DATEV mention
- **WHEN** the README origin sentence links apaleo-datev-export for DATEV users and the `## Was es nicht macht` list says "keine anderen Zielformate wie DATEV oder RZL"
- **THEN** the term check passes for the README
