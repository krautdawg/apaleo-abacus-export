# Der Befehl export

`apaleo-abacus export` liest das apaleo-Buchungsjournal eines Zeitraums, bucht es mit deiner Kontenzuordnung und schreibt pro Hotel und Kalendermonat eine Abacus-Datei (AbaConnect „XML Buchungen“) in den Ausgabeordner. Dein Treuhänder holt die Dateien dort ab (ein gemeinsamer Ordner, ein Cloud-Ordner, oder du schickst sie). Nichts wird irgendwohin hochgeladen.

Keine Gewähr, keine Steuerberatung: Lass deinen Treuhänder die Kontenzuordnung und die ersten Importe prüfen.

```sh
apaleo-abacus export --month 2026-10 --dry-run          # alles prüfen, Übersicht zeigen, nichts schreiben
apaleo-abacus export --month 2026-10                    # jedes Hotel aus der Konfiguration
apaleo-abacus export --month 2026-10 --property BSP     # ein Hotel
apaleo-abacus export --from 2026-09-25 --to 2026-10-05  # beide Tage eingeschlossen; zwei Dateien, eine pro Monat
apaleo-abacus export --month 2026-10 --overwrite        # nach einer Nachbuchung, siehe „Noch einmal exportieren“
```

Der Exit-Code ist 0, wenn jedes Hotel und jeder Monat geschrieben wurde oder schon aktuell war, 1, wenn einer davon fehlgeschlagen ist, und 2 bei falschem Aufruf (zum Beispiel ohne Zeitraum).

## Demo ohne apaleo

```sh
apaleo-abacus export --month 2026-09 --demo --dry-run   # die Übersicht für das erfundene Hotel Beispiel
apaleo-abacus export --month 2026-09 --demo             # die Datei, nur nach ./demo-output/
```

`--demo` lässt genau diese Verarbeitung auf den aufgezeichneten apaleo-Antworten in `examples/demo/` laufen: keine Konfigurationsdatei, kein Secret, kein Netz. Die Demodaten sind ein erfundenes „Hotel Beispiel“ mit Beherbergung, Speisen und Getränken, Kurtaxe, Anzahlungen, einer Rechnung an eine Firma und einem Debitorenverlust, sodass jeder Abschnitt des Protokolls etwas zeigt; sie buchen noch in EUR mit den Platzhalter-Codes `V10` und `V20` (Mandant `7777`, `abacus.leitwaehrung: EUR`). Die Uhr der Demo steht auf 2026-10-05, der September 2026 ist also abgeschlossen. Die Demo markiert ihre Ausgabe dreifach: Der Dateiname endet auf `_DEMO` (`ABACUS_Buchungen_20260901-20260930_BSP_DEMO.xml`), jeder `Text1` beginnt mit `DEMO ` (samt `DEMO ` höchstens 80 Zeichen), und die erste Zeile des Protokolls ist `DEMO`. Eine versehentlich importierte Demobuchung erkennst du in Abacus also am Text. Importiere sie nie in einen echten Mandanten. Die Demo schreibt unterhalb des Arbeitsverzeichnisses; im Docker-Image ist das das nur lesbare `/config`, siehe deshalb [docker.md](docker.md#die-demo-im-image). `--config` lässt sich nicht mit `--demo` kombinieren, und die Umgebung ändert nicht, wohin die Demo schreibt.

## Einstellungen

```yaml
abacus:
  mandant: 1234         # die Mandantennummer in Abacus
  leitwaehrung: CHF
properties:
  - id: BSP
    mapping: ./mapping-BSP.csv
    geschaeftsbereich: 2  # optional, ersetzt abacus.geschaeftsbereich für dieses Hotel
output:
  dir: ./exports
checks:
  aggregates: false     # zusätzliche Vollständigkeitsprüfung, siehe unten
```

## Welche Tage sich exportieren lassen

apaleo veröffentlicht nicht, ob der Tagesabschluss (Night Audit) einen Tag geschlossen hat. Das Tool nutzt deshalb Datumsregeln in der Zeitzone des Hotels:

- Einen Zeitraum, der bis heute (oder später) reicht, lehnt es mit `E-DAY-NOT-CLOSED` ab.
- Einen Zeitraum, der gestern endet, exportiert es mit der Warnung `W-RECENT-DAY`: Der Tagesabschluss ist vielleicht noch nicht gelaufen, spätere Buchungen für diesen Tag sind also möglich. Exportiere nach Möglichkeit nur bis vorgestern.

Ein Zeitraum wird an Monatsgrenzen geteilt, damit jede Datei in einem Kalendermonat bleibt; Abacus ordnet jede Buchung über ihr Datum (`EntryDate`) der Periode zu.

## Was vor dem Schreiben geprüft wird

Für jedes Hotel und jeden Monat, in dieser Reihenfolge:

1. Das Hotel und jede apaleo-Zeile des Monats sind in der Leitwährung des Mandanten (`abacus.leitwaehrung`, `E-CURRENCY`). Eine Abacus-Buchung steht in der Leitwährung, ohne Fremdwährung, und das Tool rechnet nicht um. Ein Hotel in einer anderen Währung wird deshalb abgelehnt, bevor das Buchungsjournal gelesen wird.
2. Die Kontenzuordnung lässt sich lesen; eine Zuordnung von apaleo-bmd-export, eine aus einer deutschen Einrichtung und den Kontenexport eines kostenpflichtigen Connectors lehnt das Tool ab (`E-EXPORT`, siehe [troubleshooting.md](troubleshooting.md#einrichtung-aus-deutschland-übernommen)).
3. Jedes im Zeitraum gebuchte Konto ist zugeordnet (`E-UNMAPPED`, `E-VAT-MISMATCH`, `E-VAT-RATE-UNKNOWN`, wie bei `mapping check --from --to`).
4. Die Buchungsregeln und ihre USt-Prüfung pro Zeile ([posting-rules.md](posting-rules.md)).
5. Plausibilitätsprüfungen auf dem Ergebnis, die nachrechnen, was die Buchungen ergeben müssen:
   - `E-CONSERVATION`: Jede apaleo-Zeile ist gebucht oder übersprungen, nach Anzahl und Betrag ohne Vorzeichen.
   - `E-ACCOUNT-BALANCE`: Pro Geschäftstag und Abacus-Konto bewegen die Buchungen das Konto genau so wie die apaleo-Zeilen, die ihm zugeordnet sind: das Konto der `CollectiveInformation` mit dem Bruttobetrag, das Konto der `SingleInformation` mit dem Bruttobetrag ohne die MWST, jedes mit seiner Seite aus `DebitCredit`. Die MWST-Buchung auf dem Steuerkonto zählt hier nicht mit. Das findet Fehler bei Soll/Haben und Vorzeichen.
   - `E-VAT-TOTAL`: Pro MWST-Satz entspricht die MWST der Buchungen der Summe der Steuerbeträge von apaleo, jeder pro Zeile auf den Rappen gerundet, mit höchstens einem Rappen pro gemeldeter Rundungsdifferenz einer berechneten Anzahlungssteuer bei diesem Satz. Da jede Buchung die Steuer ihrer apaleo-Zeile trägt, passt das normalerweise auf den Rappen. Die Meldung nennt auch die genaue Summe von apaleo und die Rundungsdifferenz der Zeilen. Dass die MWST der Buchungen um ein paar Rappen von der genauen Summe von apaleo abweicht, ist allein nie ein Fehler (siehe unten).
6. Optional (`checks.aggregates: true`): die Tagessummen von apaleo, eine Anfrage pro Geschäftstag, gegen die Zeilen des Buchungsjournals an diesem Tag. Verglichen wird pro Konto, das apaleo listet, der **Saldo** (Soll minus Haben): globale Konten wie Zahlungsarten, Erlös- und USt-Unterkonten für sich, Gast-, externe und Buchungskonten über ihr oberstes Elternkonto (`1200`, `3000`, `9999`); Erlöse und Anzahlungen mit dem genauen Nettobetrag, die USt-Konten von apaleo mit den genauen Steuern der Erlös- und Anzahlungszeilen, alle anderen Konten brutto. So passten im ersten Live-Test alle Konten. Ein Konto, dessen Saldo abweicht, ergibt die Warnung `W-AGGREGATE-DIFF` mit beiden Salden und der Grundlage (brutto, netto oder Steuer); die Datei wird trotzdem geschrieben. Dafür braucht es die optionale Berechtigung `core.subledger_aggregate.create`; ohne sie scheitert der Monat mit `E-AGGREGATE-CHECK` und einem Hinweis, sie zu vergeben. Ist apaleo nicht erreichbar oder antwortet mit einem anderen Fehler, scheitert der Monat ebenfalls mit `E-AGGREGATE-CHECK`; starte ihn später noch einmal. Standardmäßig aus: Die Regel stammt aus einer Sandbox und zwei Tagen und ist für Produktivkonten noch nicht bestätigt.

Jeder Befund mit `E-` stoppt dieses Hotel und diesen Monat: Dafür wird keine Datei geschrieben, und die anderen Hotels und Monate laufen weiter. Warnungen (`W-`) werden ausgegeben und im Protokoll festgehalten.

Ein Monat ohne Buchungen schreibt keine Datei (`N-NO-BOOKINGS`).

### MWST im Protokoll: pro Buchung gerundet, apaleo genau

Das Protokoll und der Probelauf zeigen pro MWST-Code und Satz, für die Erlöse, die Anzahlungen und die Debitorenverluste, Netto, MWST und Brutto der Buchungen, daneben die MWST von apaleo und die Differenz (MWST von apaleo minus MWST der Buchungen), zum Beispiel am aufgezeichneten Tag VIE (österreichische Sätze mit den Platzhalter-Codes der Testzuordnung):

```
Revenue and MWST per MWST-Code and rate:
  V10 10 %: net 77.46, tax 7.74, gross 85.20, apaleo VAT 7.75, difference 0.01 (apaleo precise 7.74545454)
  V13 13 %: net 362.85, tax 47.17, gross 410.02, apaleo VAT 47.17, difference 0.00 (apaleo precise 47.17044248)
```

Jede Buchung trägt die Steuer ihrer apaleo-Zeile, auf den Rappen gerundet; apaleo hält die Steuer jeder Zeile genau (bis zu acht Nachkommastellen) und rundet erst die Summe des Tages. Die Differenz von ein paar Rappen ist diese Rundung, kein Fehler, und kein Grund, Buchungen zu ändern. In der MWST-Abrechnung zählt, was Abacus gebucht hat. Auf 5 Rappen rundet das Tool nie.

Abacus bucht Bruttobeträge mit enthaltener MWST (`TaxIncluded` `I`); die Kontrolle ist die MWST, die im Bruttobetrag steckt (Betrag mal Satz durch 100 plus Satz, auf den Rappen gerundet). Weicht sie um einen Rappen von der Steuer aus apaleo ab, meldet der Export `W-VAT-ROUNDING`, und die Buchung behält die Steuer von apaleo.

## Ausgabeordner

```
exports/
  BSP/
    2026-10/
      ABACUS_Buchungen_20261001-20261031_BSP.xml
      ABACUS_Buchungen_20261001-20261031_BSP.protokoll.txt
      manifest.json
```

Pro Hotel ein Ordner mit seiner apaleo-ID, darin pro Kalendermonat ein Ordner `JJJJ-MM`. Der Dateiname nennt den ersten und den letzten Tag und das Hotel; das Tool erkennt seine Dateien an diesem Namen. Ein Beispiel für alle drei Dateien liegt in [examples/](examples/).

- Die Abacus-Datei ist das, was dein Treuhänder importiert ([abacus-format.md](abacus-format.md)). Benenne sie nicht um, und bearbeite sie nicht.
- Das Protokoll beginnt mit dem Hinweis „keine Gewähr“, dem Hotel, dem Zeitraum und der Zahl der apaleo-Zeilen und Buchungen. Dann folgt der Block **Import into Abacus FIBU**, den der Treuhänder vor dem Import mit dem Mandanten vergleicht: Dateiname, Zahl der Buchungen, Programm, Schnittstelle und Version, Mandant, Geschäftsbereich, Leitwährung, Abrechnungsart, jeder MWST-Code mit seinen Sätzen und seiner Summe, jedes Konto mit seinem MWST-Code, die `TaxAccount`-Regel und der Bereich der Belegnummern. Danach kommen die Summen: pro Abacus-Konto, Erlöse, Anzahlungen und Debitorenverluste mit ihrer MWST pro MWST-Code und Satz, Kurtaxe, Zahlungen pro Konto, erhaltene, aufgelöste und zurückbezahlte Anzahlungen, Debitoren, übersprungene Zeilen (mit Beträgen ohne Vorzeichen) und die Befunde. Am Ende stehen die SHA-256-Prüfsumme der Datei, die der Kontenzuordnung, die Version des Tools und die Erstellungszeit. Der Probelauf zeigt denselben Text ohne die Prüfsummen.
- `manifest.json` listet jede Datei des Ordners, auch ersetzte, mit:
  - `sha256`: die Prüfsumme der ganzen Datei. Die Abacus-Datei hat keine Erstellungszeit, dieselben Buchungen ergeben also immer dieselbe Prüfsumme;
  - `bookings`: die Zahl der Buchungen;
  - `taxByRate`: die MWST der Buchungen pro Satz in Rappen, als geschuldete MWST (eine Erlösminderung oder ein Debitorenverlust mindert sie), zum Abgleich mit der MWST-Abrechnung;
  - `mappingSha256`, `toolVersion` und `createdAt`: die Prüfsumme der Kontenzuordnung, die Version des Tools und die Erstellungszeit; bei einer ersetzten Datei zusätzlich `replacedAt` und `replacedBy`.

  Felder, die das Tool nicht kennt (zum Beispiel `bodySha256` aus einer früheren Version), stören nicht: Es liest sie nicht und lässt sie stehen.

## Noch einmal exportieren

Abacus erkennt eine schon importierte Datei nicht wieder: Dieselben Buchungen zweimal zu importieren, bucht sie zweimal. Der Export nutzt deshalb den Ausgabeordner als Gedächtnis:

- Dieselbe Datei wie die im Ordner (Byte für Byte): `unchanged`, nichts wird geschrieben, Exit-Code 0. Denselben Monat noch einmal zu exportieren, ist also immer sicher.
- Ein anderer Inhalt, und sei es nur ein Byte: abgelehnt mit `E-FILE-EXISTS`. Das passiert nach einer Nachbuchung in apaleo, einer geänderten Kontenzuordnung oder einer geänderten Einstellung im Abschnitt `abacus` (zum Beispiel `abacus.geschaeftsbereich`). Hat der Treuhänder die alte Datei schon importiert, löscht er zuerst ihre Buchungen in Abacus: im Nebenjournal, bevor sie übertragen sind, sonst durch Stornobuchungen; Mandant und Bereich der Belegnummern stehen im Protokoll der alten Datei. Dann starte den Export noch einmal mit `--overwrite`. Mit `--overwrite` bleibt die alte Datei als `<name>.replaced-<Zeitstempel>.xml` erhalten (ihr Protokoll ebenso), die neue Datei wird geschrieben, und das Manifest verzeichnet beide.
- Ein anderer Zeitraum, der einige derselben Tage abdeckt wie eine Datei im Ordner (zum Beispiel ein Monatsexport nach einem Teilexport vom 20. bis 30.): abgelehnt mit `E-PERIOD-OVERLAP`, und die Meldung nennt die vorhandene Datei, weil der Import beider Dateien diese Tage doppelt buchen würde. Exportiere denselben Zeitraum wie die vorhandene Datei, oder verschiebe sie zuerst, und lass deinen Treuhänder ihre Buchungen in Abacus löschen, falls sie importiert wurde.

Der Vergleich liest die Datei selbst, er funktioniert also auch, wenn `manifest.json` gelöscht wurde. Ist die Datei unverändert, aber ihr Protokoll oder ihr Eintrag im Manifest fehlt oder beschreibt eine andere Datei (zum Beispiel weil `manifest.json` gelöscht oder ein Lauf nach dem Schreiben der Datei unterbrochen wurde), schreibt der Lauf beides neu und meldet den Hinweis `N-COMPANIONS-REPAIRED`; die Abacus-Datei selbst bleibt unberührt.

Während ein Lauf in einen Ordner für Hotel und Monat schreibt, hält er dort die Sperrdatei `.apaleo-abacus.lock` und prüft noch einmal, dass die Datei auf der Festplatte noch die ist, die er verglichen hat. Ein zweiter Lauf, der gleichzeitig startet, scheitert für diesen Monat mit `E-EXPORT` und schreibt nichts; starte ihn noch einmal, wenn der erste fertig ist. Wurde ein Lauf beim Schreiben abgebrochen, kann die Sperrdatei übrig bleiben: Wenn kein anderer Lauf aktiv ist, lösch sie und starte noch einmal.
