# Beispielausgabe: „Hotel Beispiel“

Das schreibt das Tool, noch bevor jemand eine apaleo-App anlegt. Alles hier ist erfunden: das Hotel „Hotel Beispiel“ (`BSP`), die Reservationen und die Beträge. Hinter den Daten steht kein echtes Hotel und kein echter Gast. Dein Treuhänder kann damit die Ausgabe prüfen, bevor jemand etwas einrichtet.

Die Demodaten buchen noch in EUR mit österreichischen Sätzen; sie tragen deshalb die Platzhalter-Codes `V10` und `V20`, und der Mandant `7777` hat die Leitwährung EUR. Die Schweizer Demodaten in CHF folgen.

| Datei | Was sie ist |
|---|---|
| [`ABACUS_Buchungen_20260901-20260930_BSP.xml`](ABACUS_Buchungen_20260901-20260930_BSP.xml) | Die AbaConnect-Datei „XML Buchungen“ für September 2026: 26 Einzelbuchungen aus 31 apaleo-Zeilen. Beherbergung, Speisen und Getränke mit Kostenstelle 20, eine Erlösminderung, Kurtaxe, Karten- und Barzahlungen, eine Rechnung an eine Firma auf die Debitoren, zwei Anzahlungen und ihre Auflösung, eine Überzahlung mit Rückzahlung und ein Debitorenverlust mit MWST-Korrektur. |
| [`ABACUS_Buchungen_20260901-20260930_BSP.protokoll.txt`](ABACUS_Buchungen_20260901-20260930_BSP.protokoll.txt) | Das Protokoll, das daneben geschrieben wird: der Block „Import into Abacus FIBU“ zum Vergleich mit dem Mandanten, Summen pro Abacus-Konto, Erlöse, Anzahlungen und Debitorenverluste mit ihrer MWST pro MWST-Code und Satz, Kurtaxe, Zahlungen, Anzahlungen, Debitoren, übersprungene Zeilen, Befunde und Prüfsummen. |
| [`mapping-BSP.example.csv`](mapping-BSP.example.csv) | Die Kontenzuordnung, aus der die Datei entstanden ist, mit den Spalten `abacus_account`, `mwst_code` und `mwst_percent`. Die Kurtaxe ist ein durchlaufender Posten auf `2210` ohne MWST-Code, und die Getränke tragen die Kostenstelle `20`. |

**Bearbeite die Abacus-Datei nicht.** Sie ist UTF-8 ohne Byte-Order-Mark, mit LF am Zeilenende, genau so, wie Abacus sie liest. Zum Ansehen nimm einen Texteditor oder einen Browser. Was jedes Feld bedeutet und woher die Regeln kommen, steht in [abacus-format.md](../abacus-format.md).

## Selbst erzeugen

Die Abacus-Datei und das Protokoll sind das, was ein normaler Export der Demodaten in `examples/demo/` schreibt; ein Test schlägt fehl, sobald sie von dem abweichen, was der aktuelle Code schreibt. So erzeugst du die Datei selbst, ohne apaleo:

```sh
apaleo-abacus export --month 2026-09 --demo
```

Die Demo schreibt nach `./demo-output/` und markiert ihre Ausgabe mit `DEMO`: im Dateinamen (`…_BSP_DEMO.xml`), am Anfang jedes `Text1` und in der ersten Zeile des Protokolls. Sonst ist ihre Datei gleich wie die hier.
