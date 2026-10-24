# Hinweise für Maintainer

## Das Repository ist öffentlich

Das Repository ist seit dem 24. Oktober 2026 öffentlich, Version `v0.1.0` ist veröffentlicht. Beschreibung und Themen sind gesetzt, damit Hotels und Treuhänder in der Schweiz es finden, wenn sie auf GitHub nach «apaleo Abacus Export», «AbaConnect Import», «Abacus FIBU MWST» oder «apaleo Buchhaltung Schweiz» suchen.

Die OpenSpec-Änderung a08 hat Beschreibung und Themen mit diesem Befehl gesetzt; `--remove-topic` entfernt Themen aus den Vorgängerprojekten, falls jemand sie gesetzt hat. Mit `gh repo view` prüfst du den Stand:

```sh
gh repo edit krautdawg/apaleo-abacus-export \
  --description "Kostenloser apaleo Abacus Export (Open Source): XML-Buchungsimport für die Abacus Finanzbuchhaltung aus apaleo, für Hotels in der Schweiz und ihre Treuhänder. Selbst gehostet, MIT, kein Abo." \
  --add-topic apaleo,abacus,abacus-export,abaconnect,abacus-fibu,mwst,kmu-kontenrahmen,hotel,hospitality,accounting,buchhaltung,treuhand,switzerland,schweiz \
  --remove-topic bmd,bmd-ntcs,datev,ekr,austria,oesterreich
gh repo view krautdawg/apaleo-abacus-export --json description,repositoryTopics,visibility
```

## Zusammenführen

Der Branch `main` ist geschützt und verlangt die drei CI-Prüfungen, GitHub blockiert also einen roten Pull Request. Führe zusammen, wenn die CI grün ist:

```sh
gh pr checks <number> --watch --fail-fast && gh pr merge <number> --squash
```

## Veröffentlichung

README und Anleitungen beschreiben das Abacus-Produkt in Schweizer Hochdeutsch (OpenSpec-Änderung a08). Erledigt ist, was abgehakt ist; die offenen Schritte sind weiterhin die Entscheidung des Maintainers.

1. [ ] Mach mit einem Treuhänder einen ersten echten Testimport in Abacus FIBU (Testmandant, Checkliste in [abacus-import.md](abacus-import.md#erster-testimport-offene-fragen)) und trag ihn unten unter [Testimporte](#testimporte) ein: Datum, Version, Programm und Ergebnis. Erst wenn der Import ohne Nacharbeit ging, darf das README mehr sagen als «folgt der dokumentierten Schnittstelle XML Buchungen».
2. [ ] Zeichne einen Geschäftstag einer Schweizer apaleo-Sandbox (CHF, `Europe/Zurich`) mit `live-smoke` auf, anonymisiere ihn und leg ihn als Testdaten in `test/fixtures/apaleo/live/` ab, neben den Tagen BER und VIE, damit der Export auch über echte Schweizer Antworten getestet ist.
3. [ ] Lies das README in einem frischen Klon und führe den Schnellstart und `export --month 2026-09 --demo --dry-run` noch einmal aus.
4. [x] `pnpm test` (mit dem Docs-Test) läuft, und die CI auf `main` ist grün.
5. [x] Die Historie ist durchsucht: `git log -p | grep -iE 'secret|password|token'` zeigt nur Code und Dokumentation, nie einen Wert. Keine echten Gästedaten in den Testdaten.
6. [x] Die Sichtbarkeit ist öffentlich (seit dem 24. Oktober 2026).
7. [ ] Lade ein Vorschaubild (Social Preview) hoch (Settings > General > Social preview).
8. [ ] Entscheide, ob es GitHub Discussions für Fragen geben soll. Schaltest du sie ein, leg eine `config.yml` in `.github/ISSUE_TEMPLATE/` an, die auf die Discussions verweist; bis dahin sind die Vorlagen für Issues der einzige Weg.
9. [x] Die private Meldung von Sicherheitslücken ist eingeschaltet (Settings > Code security), auf die `SECURITY.md` verweist.
10. [x] Der Schutz für den Branch `main` ist eingeschaltet und verlangt die drei CI-Prüfungen, damit sich ein roter Pull Request nicht zusammenführen lässt.
11. [x] Die erste Version ist mit dem Tag `v0.1.0` markiert. Ein Tag ist nur eine Version des Quellcodes; nichts wird auf npm oder in einer Container-Registry veröffentlicht.
12. [ ] Prüfe, dass das deutsche README auf github.com richtig angezeigt wird (Tabellen, der Link auf `README.en.md` in der zweiten Zeile, die Anker der Überschriften, die Badges) und dass das CI-Badge den Stand von `main` zeigt.

## Testimporte

Jeder echte Import einer Datei des Tools in die Abacus FIBU, den ein Treuhänder gemacht hat. Solange die Tabelle leer ist, sagen README und Dokumentation nur, dass die Datei der dokumentierten AbaConnect-Schnittstelle «XML Buchungen» folgt und der erste Testimport noch aussteht; der Docs-Test schlägt fehl, wenn sie mehr behaupten. Ein Eintrag zählt erst, wenn alle fünf Spalten gefüllt sind.

| Datum | Abacus-Version | Schnittstellenversion | Programm | Ergebnis |
|---|---|---|---|---|

Trag unter «Ergebnis» ein, was ohne Nacharbeit ging und was nicht (zum Beispiel Zeichensatz, MWST-Codes im MWST-Journal, Belegnummern), ohne Namen des Treuhänders oder des Hotels, wenn sie das nicht möchten. Jede offene Frage aus [abacus-format.md](abacus-format.md#offene-fragen), die der Import beantwortet, kommt als Einstellung oder Korrektur in eine eigene OpenSpec-Änderung.

## Später geplant

Nicht Teil von Version 1, in keiner bestimmten Reihenfolge, und alles innerhalb dieses Tools. Jeder Punkt braucht eine eigene OpenSpec-Änderung.

- **Saldosteuersatz- und Pauschalsteuersatzmethode**: Buchungen ohne MWST-Code pro Zeile für Mandanten, die mit dem Saldosteuersatz abrechnen, mit einer Anleitung für die Abrechnung in Abacus.
- **Debitoren-Schnittstelle**: Firmenrechnungen als offene Posten in die Abacus Debitorenbuchhaltung (DEBI) statt auf ein Sachkonto, mit den Kundenstammdaten.
- **Wöchentlicher Rhythmus**: `schedule.cadence` mit einer Datei pro Woche, zwischen Tag und Monat.
- **Sammelbuchung pro Tag**: neben der Datei mit einer Buchung pro apaleo-Zeile eine verdichtete Datei mit einer Sammelbuchung pro Tag, Konto und MWST-Code, wenn Treuhänder das wünschen, zum Beispiel für sehr grosse Hotels.
- **Gebühren aus Abrechnungsdateien**: die Gebühren und Rückbuchungen (Chargebacks) der Zahlungsdienstleister aus ihren Abrechnungen buchen.
- **E-Mail-Versand**: die Dateien per SMTP an den Treuhänder schicken statt über einen gemeinsamen Ordner.
- **Dauerprozess mit eigenem Zeitplan**: ein Modus, der dauerhaft läuft und eine eigene Uhr hat, statt `schedule --once` aus Cron oder der Compose-Schleife.
- **Überwachung und Alarme**: eine Zustandsprüfung und ein Alarm (Mail oder Webhook), wenn ein geplanter Lauf fehlschlägt.
- **Dependabot**: automatische Updates der Abhängigkeiten für npm-Pakete, GitHub Actions und das Docker-Basis-Image.
- **Veröffentlichung auf npm oder in einer Registry**: das Kommandozeilenprogramm auf npm und ein Container-Image in einer Registry veröffentlichen. Heute ist das Paket mit Absicht `"private": true`, und das Image wird lokal gebaut.
