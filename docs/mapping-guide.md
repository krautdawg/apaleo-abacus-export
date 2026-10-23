# Kontenzuordnung (Mapping): Leitfaden für Hotel und Steuerberatung

Die Abacus-Datei ist nur so gut wie die Kontenzuordnung. Sie ist eine CSV-Datei pro Hotel (Property), die du in Excel öffnest und mit deinem Treuhänder durchgehst. Sie ordnet jedem apaleo-Konto ein Abacus-Konto zu, dazu den MWST-Code und den MWST-Satz. **Keine Gewähr, keine Steuerberatung: Jede Zeile der Vorlage ist ein Vorschlag (ungeprüft), den dein Treuhänder bestätigt.**

`init-mapping --template kmu-hotel` schreibt die Datei nach der Vorlage `templates/kmu-hotel.rules.csv` (Schweizer Kontenrahmen KMU und Kontenrahmen für die Hotellerie und Gastronomie); der Kommentar jeder Zeile sagt, warum sie so vorgeschlagen ist. Die Abschnitte ab „Steuersätze in Österreich“ beschreiben noch die frühere österreichische Vorlage `ekr-hotel@1`; die Schweizer Fassung dieser Abschnitte folgt.

Ein vollständiges Beispiel liegt in [examples/mapping-BSP.example.csv](examples/mapping-BSP.example.csv): die Zuordnung des erfundenen „Hotel Beispiel“, aus der die Beispieldatei in [examples/](examples/) entstanden ist. Dein Treuhänder kann damit die Ausgabe beurteilen, bevor jemand eine apaleo-App anlegt.

## Ablauf

```sh
apaleo-abacus init-mapping --property BSP --template kmu-hotel      # schreibt mapping-BSP.csv aus dem apaleo-Kontenplan
# Datei mit dem Treuhänder prüfen, leere Abacus-Konten ausfüllen
apaleo-abacus mapping check --property BSP                    # prüft die Datei
apaleo-abacus mapping check --property BSP --from 2026-09-01 --to 2026-09-30   # ist jedes gebuchte Konto zugeordnet?
apaleo-abacus init-mapping --property BSP --template kmu-hotel --update   # später: neue apaleo-Konten anhängen, bearbeitete Zeilen bleiben
apaleo-abacus init-mapping --property BSP --template kmu-hotel --accounts-from konten.csv   # Konten aus dem Kontenexport eines kostenpflichtigen Connectors übernehmen
```

Der Pfad der Datei kann in der Konfiguration stehen (`properties[].mapping`), sonst heißt sie `mapping-<id>.csv` im Arbeitsverzeichnis. `mapping check --from --to` liest das Buchungsjournal des Zeitraums aus apaleo und meldet jedes gebuchte Konto ohne Zuordnung; die Kanzlei kann die Datei also an einem echten Monat prüfen, bevor ein Export läuft. Die Vorlage schreibt die MWST-Codes aus `abacus.mwstCodes` der Konfiguration (Standard `311`, `312` und `313` wie im KMU-Mustermandanten von Abacus).

## Spalten

| Spalte | Bedeutung |
|---|---|
| `apaleo_account` | apaleo-Kontonummer, oder `*` für alle Konten eines Typs |
| `apaleo_type` | apaleo-Kontotyp (Revenues, Payments, Liabilities, Receivables, AccountsReceivable, CityTaxes, …) |
| `apaleo_name`, `apaleo_vat_percent` | zur Information, aus apaleo; bei `*`-Zeilen ist `apaleo_vat_percent` der MWST-Satz, für den die Zeile gilt |
| `abacus_account` | Konto in Abacus, 1 bis 11 Ziffern. Leer heisst: nicht zugeordnet, der Export bricht mit `E-UNMAPPED` ab |
| `mwst_code` | MWST-Code aus der MWST-Tabelle des Mandanten, 1 bis 3 Zeichen, zum Beispiel `313`. Leer heisst: keine MWST auf dieser Zeile |
| `mwst_percent` | MWST-Satz, den Abacus mit dem MWST-Code bucht, zum Beispiel `3.8`, `8.1` oder `2.6`. Mit MWST-Code Pflicht (auch `0`), ohne MWST-Code leer oder `0` |
| `kost` | Kostenstelle, 1 bis 11 Ziffern (optional). Steht nur auf Erlös- und Debitorenverlust-Buchungen in der Datei, siehe unten |
| `comment` | Freitext, zum Beispiel die Begründung des Treuhänders |

Sätze darfst du mit Komma oder Punkt schreiben (`8,1` oder `8.1`). Eine Zuordnung von apaleo-bmd-export (Spalten `bmd_account`, `steuercode`) oder aus einer deutschen Einrichtung (Spalten `datev_account`, `bu_key`) liest das Tool nicht; es nennt dann `init-mapping --template kmu-hotel` ([troubleshooting.md](troubleshooting.md#einrichtung-aus-deutschland-übernommen)). Den Kontenexport eines kostenpflichtigen Connectors (Spalten `Apaleo Kontonummer`, `Kontoname`, `Kontotyp`, `Abacus Kontonummer`, `Kostenstelle`) liest es nur mit `init-mapping --accounts-from`, siehe unten.

### Kontonummern und MWST-Codes

Ein Abacus-Konto hat 1 bis 11 Ziffern (`E-ACCOUNT-FORMAT`); das Tool füllt nie Nullen auf und prüft nur die Form, nicht, ob das Konto im Mandanten existiert. Der MWST-Code bleibt Text: `011` und `11` sind verschiedene Codes. Formatiere die Spalten `abacus_account` und `mwst_code` in Excel als Text, damit Excel keine führende Null entfernt.

## Welche Zeile gilt?

Für jedes gebuchte apaleo-Konto sucht das Tool in dieser Reihenfolge:

1. genau diese Nummer und dieser Typ;
2. diese Nummer mit beliebigem Typ (Zeilen mit dem Typ `*any*`);
3. das Elternkonto (und dessen Eltern) mit gleichem Typ; eine Elternzeile ohne BMD-Konto überspringt es;
4. für Typen mit USt eine `*`-Zeile mit dem USt-Satz der Buchung;
5. für andere Typen eine `*`-Zeile des Typs.

Erlöskonten (Revenues) werden nie per `*` zugeordnet: Ein neues Erlöskonto (Spa, Parken) ordnet ein Mensch zu. Konten je Reservierung (Anzahlungen unter `3000`, Debitoren unter `9999`, ihre `/Offset`-Konten) erreichen die `*`-Zeilen.

## Steuercode und USt-Satz

In Abacus heisst das MWST-Code und MWST-Satz. Abacus bekommt den Bruttobetrag und die MWST aus apaleo: Das Konto mit MWST-Code steht in `SingleInformation`, weil nur dort `TaxData` steht, und die MWST kommt genau so, wie apaleo sie für die Buchung berechnet hat. Die MWST-Codes legt der Mandant in seiner MWST-Tabelle fest; das Tool kennt die drei Codes aus `abacus.mwstCodes` (Standard `311` Normalsatz 8,1 %, `312` reduzierter Satz 2,6 %, `313` Beherbergung 3,8 %).

`mapping check` prüft jede Zeile:

- Ein MWST-Code hat 1 bis 3 Zeichen `A-Z`, `a-z` und `0-9` (`E-MWST-CODE-FORMAT`).
- Zahlungen (Payments), Gästeforderungen (Receivables) und Debitoren (AccountsReceivable) haben nie einen MWST-Code (`E-MWST-CODE-NOT-ALLOWED`): Sonst bucht Abacus die MWST auf das Geld- oder Forderungskonto.
- Ein MWST-Code braucht einen Satz (`E-VAT-RATE-MISSING`), ein Satz über 0 % einen MWST-Code (`E-MWST-CODE-MISSING`). Ein MWST-Code mit 0 % ist erlaubt.
- Ein MWST-Code, der nicht in `abacus.mwstCodes` steht, ergibt `W-MWST-CODE-UNCHECKED`: Lass deinen Treuhänder bestätigen, dass er ein Umsatzsteuer-Code des Mandanten ist. Ist er einer der Codes des KMU-Mustermandanten, nennt die Warnung seine Ziffer der MWST-Abrechnung (`400` Ziffer 230, `490` Ziffer 900, `491` Ziffer 910). Der Code `490` „Subvention Kurtaxen“ ist nicht für die Kurtaxe, die das Hotel einzieht: Die ist ein durchlaufender Posten ohne MWST-Code oder mit einem Code für Ziffer 910.
- Ein Code aus `abacus.mwstCodes` mit einem anderen Satz als seinem eigenen ergibt `W-MWST-CODE-RATE` (zum Beispiel vertauschte Codes).
- `export` und `schedule --once` melden `W-MWST-CODE-UNCHECKED` und `W-MWST-CODE-RATE` ebenfalls, aber nur für die Zeilen, die die Buchungen des Monats tatsächlich brauchen: im Probelauf, in der Ausgabe und im Protokoll. Die Datei wird trotzdem geschrieben. So fällt ein vertauschter Code auch dann auf, wenn niemand `mapping check` startet.
- Ein Satz ausser 0, 2,6, 3,8 und 8,1 % ergibt `W-VAT-RATE-UNUSUAL`; bei 7,7, 3,7 und 2,5 % sagt die Warnung, dass sie bis 2023 galten.
- Der Satz der Zeile muss dem Satz in apaleo entsprechen (`E-VAT-MISMATCH`), auch über eine Elternzeile: Landet ein Konto mit 3,8 % über `5000;Revenues;…;3500;311;8.1` auf 3500 mit 8,1 %, meldet `mapping check --from --to` `E-VAT-MISMATCH` und verlangt eine eigene Zeile.
- Eine Erlöszeile ohne MWST-Code ergibt `W-UNTAXED-REVENUE`: Mit „MWST berechnen“ setzt Abacus den Standard-MWST-Code des Kontos ein. Prüfe, dass das Abacus-Konto keinen hat, oder trag den MWST-Code des Mandanten für Umsätze ohne MWST ein.

Beim Export prüft das Tool zusätzlich jede Buchung: Der Satz muss der Satz der apaleo-Buchung sein (`E-VAT-RATE`), und die MWST, die im Bruttobetrag steckt, darf höchstens einen Rappen von der Steuer abweichen (`W-VAT-ROUNDING`, die Buchung behält die Steuer aus apaleo). Mehr dazu in [posting-rules.md](posting-rules.md).

## Steuersätze in Österreich

Nach UStG 1994 § 10 (RIS, Fassung ab 2026-07-01). Das Tool bucht den Satz, den apaleo auf der Buchung hat; die Liste hilft dir und der Kanzlei, die Erlöskonten in apaleo richtig einzurichten.

- **Beherbergung**: 10 % (§ 10 Abs. 2 Z 3 lit. c), mit einem ortsüblichen Frühstück, das im Zimmerpreis enthalten ist.
- **Speisen**: 10 %, auch im Restaurant und beim Frühstück, das extra verrechnet wird.
- **13 %**: Eintritt in Schwimmbad und Therme und die Thermalbehandlung (§ 10 Abs. 3 Z 5), Eintritt zu Theater, Konzert und Museum (Z 6) und zu Sportveranstaltungen (Z 12). Die 13-%-Zeile der Vorlage (`4040`) deckt Schwimmbad und Therme ab.
- **Getränke**: 20 %, ebenso Massagen, Spa-Behandlungen, Parken und die meisten anderen Leistungen.
- **4,9 %**: seit 2026-07-01 nur für die Lieferung ausgewählter Grundnahrungsmittel (Anlage 3), nicht für Restaurations- oder Cateringumsätze.
- **5 %** galt von 1. Juli 2020 bis 31. Dezember 2021. apaleo legt diese Konten in jedem Kontenplan an; die Vorlage lässt sie leer, damit eine Buchung darauf den Export stoppt (`E-UNMAPPED`). Exporte für diesen Zeitraum klärst du mit der Kanzlei.

## Ortstaxe, Nächtigungsabgabe, Gästeabgaben

Die Zeilen für CityTaxes, SecondCityTax und GuestLevies bleiben in der Vorlage leer. Das ist Absicht: Name und Buchung hängen vom Bundesland und von der Gemeinde ab, und die Entscheidung trifft die Kanzlei.

In jedem Bundesland schuldet der Gast die Abgabe für seine Nächtigung, und das Hotel hebt sie ein und führt sie ab. Sie ist kein Erlös des Hotels. Die üblichen Namen (Stand 2026-10, ohne Gewähr; maßgeblich sind das Landesgesetz und die Verordnung deiner Gemeinde):

| Bundesland | üblicher Name | schuldet | hebt ein |
|---|---|---|---|
| Burgenland | Ortstaxe | Gast | Hotel |
| Kärnten | Ortstaxe, Nächtigungstaxe | Gast | Hotel |
| Niederösterreich | Nächtigungstaxe | Gast | Hotel |
| Oberösterreich | Ortstaxe | Gast | Hotel, abgeführt an die Gemeinde |
| Salzburg | Ortstaxe | Gast | Hotel |
| Steiermark | Nächtigungsabgabe | Gast | Hotel |
| Tirol | Aufenthaltsabgabe | Gast | Hotel, abgeführt an den Tourismusverband |
| Vorarlberg | Gästetaxe | Gast | Hotel |
| Wien | Ortstaxe | Gast | Hotel |

Nicht gemeint ist der Tourismusbeitrag (Interessentenbeitrag, in Oberösterreich die Tourismusabgabe nach dem Oö. Tourismusgesetz 2018), den das Hotel selbst schuldet: Den bucht apaleo nicht, und er ist kein durchlaufender Posten.

Zwei Möglichkeiten für die Zeile, beide ohne Steuercode:

- **(a) Verbindlichkeit** gegenüber der Gemeinde, dem Land oder dem Tourismusverband: EKR 350-359 (Abgaben) oder 370-389 (übrige sonstige Verbindlichkeiten). Die Beispielzuordnung nimmt `3580`.
- **(b) Durchlaufender Posten** nach dem Kontenplan der Kanzlei.

Das BMD-Konto darf keinen fixen Steuercode haben: Sonst trägt BMD ihn in das leere Feld ein, und die Abgabe landet in der UVA. Unterwirft apaleo eine Abgabe der USt, gehört sie auf ein Erlöskonto mit Steuercode und Satz; dann prüft die USt-Prüfung sie wie jeden Erlös.

Bis eine Zeile ausgefüllt ist, blockieren `mapping check --from --to` und der Export mit `E-UNMAPPED`. Die Beispielzuordnung bucht die Ortstaxe auf die Verbindlichkeit gegenüber der Gemeinde 3580 und sagt das im Kommentar.

## Anzahlungen

Anzahlungen der Gäste (Liabilities) gehen auf erhaltene Anzahlungen (EKR 320), je USt-Satz eine `*`-Zeile: 3200 (10 %), 3202 (13 %) und 3201 (20 %) mit dem Umsatzsteuer-Code, 3209 (0 %) ohne. Auch Sollversteuerer schulden die USt auf eine Anzahlung schon bei Erhalt (Mindest-Istbesteuerung, § 19 Abs. 2 Z 1 lit. a UStG). In BMD NTCS ist das die normale Umsatzsteuer mit Steuercode `1`: Die UVA zählt sie in KZ 000/022/029/006 unter „+ Anzahlungen“ (BMD NTCS Buchen, Anhang A). Ob Soll- oder Istversteuerung, steht im Firmen- und FIBU-Stamm, nicht auf der Buchung. Wird die Anzahlung mit der Rechnung verrechnet, bucht apaleo eine negative Belastung auf dieselbe Anzahlung, und das Tool bucht die USt dort wieder zurück; eine Rückzahlung an den Gast (eine negative Anzahlung) ebenso.

BMD NTCS kennt zwei Einrichtungen (BMD NTCS Buchen, Anhang C):

1. **USt direkt am Anzahlungskonto** (Vorschlag der Vorlage): Das Konto 3200, 3202 oder 3201 bekommt den Steuercode `1` und den Satz, BMD bucht die USt bei Erhalt.
2. **Anzahlungskonto der Kanzlei je Steuersatz** (im Anhang C zum Beispiel 3290 und 3292) mit einem Konto für noch nicht fällige USt (dort 3510): Dann trägst du die Anzahlungskonten der Kanzlei und ihren Steuercode in die `*`-Zeilen ein.

Jeder Umsatzsteuer-Code des Dialekts geht durch. Ein Vorsteuer-Code (`2` oder `3` in NTCS) auf einer Anzahlungszeile ist ein Fehler (`E-STEUERCODE-INPUT-TAX`): In NTCS ist `3` die Vorsteuer-Berichtigung (KZ 062), nicht die Soll-USt von BMD 5.5. Welche Einrichtung gilt, bestätigt der erste Testimport mit der Kanzlei. apaleos eigene USt-Konten (Vat, VatOnLiabilities) brauchen keine Zuordnung: Diese Buchungen überspringt das Tool, denn BMD bucht die Steuer aus dem Feld `steuer` der Erlös- oder Anzahlungsbuchung.

Wird eine Anzahlung verrechnet, ohne dass apaleo dabei einen USt-Betrag mitschickt, nimmt das Tool Satz und Steuer aus der `PostPrepaymentVat`-Buchung desselben Tages und derselben Reservierung, sonst den Satz aus dem Kontenplan (Warnung `W-VAT-INFERRED`), nie 0 %. Lässt sich kein Satz finden, stoppt es mit `E-VAT-RATE-UNKNOWN`.

## Forderungsverlust

Schreibt das Hotel eine Gastforderung ab, bucht apaleo den Forderungsverlust (LossOfAccountsReceivable) gegen die Gastforderung, mit der USt, wenn es die USt berichtigt (§ 16 Abs. 3 UStG). Die Vorlage ordnet Forderungsverluste nach USt-Satz zu, mit `*`-Zeilen:

- `7800` (10 %), `7802` (13 %) und `7801` (20 %) mit dem Umsatzsteuer-Code (NTCS `1`) und dem Satz,
- `7809` (0 %) ohne Steuercode.

Mit dem Umsatzsteuer-Code steht das Forderungsverlust-Konto vorn (`konto`), Betrag und Steuer sind positiv: eine Soll-Buchung auf das USt-Konto, die die Umsatzsteuer mindert, wie eine Gutschrift an einen Kunden. In der UVA sollte die Berichtigung als Minderung in KZ 022/029/006 (oder KZ 090) erscheinen; das prüft der erste Import (Checkliste in [abacus-import.md](abacus-import.md#erster-import-bitte-prüfen)). Ein Vorsteuer-Code auf dieser Zeile ist ein Fehler (`E-STEUERCODE-INPUT-TAX`).

Warum `*`-Zeilen: apaleo bucht Forderungsverluste wohl auf Konten je Reservierung unter den Containern `6900` und `CollectiveDebitor_LossOfAccountsReceivable`, wie bei den Debitoren. Belegt ist das noch nicht, denn keine aufgezeichnete Buchung enthält einen Forderungsverlust. Die `*`-Zeilen greifen nach Typ und Satz, egal unter welchem Container das Konto hängt; für die Container selbst schreibt die Vorlage keine Zeile. Bucht apaleo direkt auf einen Container, stoppt der Export mit `E-UNMAPPED`.

## Stornogebühr und No-Show

Eine Stornogebühr ist meist echter Schadenersatz und nicht steuerbar; ein No-Show kann steuerbar sein (die Leistung stand bereit). Das entscheidet nicht dieses Tool: Es bucht die USt, die apaleo auf der Buchung hat, und prüft nur, ob die Zeile dazu passt.

- **Ohne USt** (apaleos Konten `RevenueCancellationFees…` und `RevenueNoShow…` mit 0 %, oder ein Erlöskonto, dessen Name Storno, Stornogebühr, Cancellation, No-Show oder Noshow enthält): Die Vorlage schlägt `4091` Stornoerlöse (nicht steuerbar) ohne Steuercode vor. Wie bei `4090` gilt `W-UNTAXED-REVENUE`, bis die Kanzlei bestätigt, dass das Konto in BMD keinen fixen Steuercode hat, oder ihren Steuercode für nicht steuerbare Umsätze einträgt.
- **Mit USt** (zum Beispiel apaleos `RevenueNoShow_Reduced:13.00`): Die Vorlage lässt die Zeile leer, mit dem Kommentar „No-Show kann steuerbar sein, Stornogebühr meist nicht“, auch dort, wo sonst die 13-%- oder 20-%-Regel greifen würde. Ist die USt richtig, trägst du ein Erlöskonto mit Umsatzsteuer-Code und dem Satz von apaleo ein; sonst korrigierst du die USt in apaleo. Bis dahin stoppen `mapping check --from --to` und der Export mit `E-UNMAPPED`.

Hat apaleo eine Gebühr besteuert, die Zeile aber keinen Steuercode, stoppt der Export mit `E-VAT-MISSING`: Das Tool ändert die USt von apaleo nie.

## Zahlungen, Forderungen, Debitoren

- **Bar**: Kassa 2700.
- **Karte, Überweisung und andere unbare Zahlungen**: Schwebende Geldbewegungen 2890, nie direkt das Bankkonto. Die Kanzlei bucht den Kontoauszug oder die Abrechnung des Zahlungsdienstleisters gegen dieses Konto. Gebühren der Zahlungsdienstleister bucht dieses Tool nicht.
- **Gast-, externe und Buchungsfolios (Receivables)**: Verrechnung Gastforderungen 2390. Folios mit Gästenamen erscheinen nie mit Namen im Buchungstext.
- **Rechnungen an Firmen (AccountsReceivable)**: ein Sammeldebitor, das Personenkonto 200000. Lege ihn im Mandanten an. Die Rechnungsnummer steht als OP-Nummer in `extbelegnr`. Einzelne Debitoren pro Firma (mit Stammdaten) erzeugt das Tool nicht.

## Kostenstellen

BMD liest das Feld `kost` auf Erlös- und Aufwandsbuchungen als Kostenstelle, auf einer Zahlung aber als Belegnummer der Rechnung, die die Zahlung ausgleicht. Das Tool schreibt `kost` deshalb nur, wenn das führende Konto eine Erlös- oder Forderungsverlustzeile ist. Steht `kost` auf einer anderen Zeile, warnt `mapping check` mit `W-KOST-IGNORED`; eine Kostenstelle, die nicht aus 1 bis 9 Ziffern besteht, ist ein Fehler (`E-KOST-FORMAT`).

## Die EKR-Vorlage

Die frühere österreichische Vorlage `ekr-hotel@1` liegt nicht mehr in diesem Repository, sie bleibt in apaleo-bmd-export; die Schweizer Fassung dieses Abschnitts mit `templates/kmu-hotel.rules.csv` folgt. Sie folgte den Gruppen des Einheitskontenrahmens (KFS/BW 6, 2017) mit vierstelligen Konten, wie BMD-Kanzleien sie oft einrichten. Die Nummern sind Vorschläge: Viele Kanzleien führen einen eigenen, vom EKR abgeleiteten Kontenplan. Jede Zeile trägt im Kommentar die Markierung „Vorschlag (ungeprüft)“.

| Fall | BMD-Konto | Steuercode (NTCS) | USt |
|---|---|---|---|
| Beherbergung 10 % | `4000` | 1 | 10 % |
| Speisen 10 % | `4010` | 1 | 10 % |
| Getränke 20 % | `4020` | 1 | 20 % |
| sonstige Erlöse 20 % | `4030` | 1 | 20 % |
| Erlöse 13 % | `4040` | 1 | 13 % |
| Erlöse 4,9 % | `4050` | 1 | 4,9 % |
| Erlöse ohne USt | `4090` | leer | 0 % |
| Stornogebühr und No-Show ohne USt | `4091` | leer | 0 % |
| Stornogebühr und No-Show mit USt | leer, Kanzlei entscheidet | | |
| Barzahlung | `2700` Kassa | | |
| Karte, Überweisung, andere unbare Zahlungen | `2890` Schwebende Geldbewegungen | | |
| Gast-, externe und Buchungsfolios | `2390` Verrechnung Gastforderungen | | |
| Rechnungen an Firmen (Sammeldebitor) | `200000` | | |
| Anzahlungen 10 % / 13 % / 20 % | `3200` / `3202` / `3201` | 1 | 10 / 13 / 20 % |
| Anzahlungen ohne USt | `3209` | leer | 0 % |
| Forderungsverlust 10 % / 13 % / 20 % | `7800` / `7802` / `7801` | 1 | 10 / 13 / 20 % |
| Forderungsverlust ohne USt | `7809` | leer | 0 % |

Für einen Container wie `3000` (Anzahlungen) oder `6900` (Forderungsverluste) schreibt sie keine Zeile, weil die `*`-Zeilen dessen Konten je Reservierung abdecken.

### Was die Kanzlei entscheiden muss

Diese Vorlagenzeilen lassen das BMD-Konto leer oder verlangen eine Entscheidung:

- **Ortstaxe, Nächtigungsabgabe, Gästeabgaben** (CityTaxes, SecondCityTax, GuestLevies): bleiben leer, siehe oben.
- **Erlöse zu 10 % ohne erkennbaren Namen** bleiben leer („weder Beherbergung noch Speisen“).
- **Erlöse ohne USt** auf 4090 und **Stornoerlöse** auf 4091: Hat das Konto in BMD einen fixen Steuercode, oder braucht es den Steuercode der Kanzlei für nicht steuerbare Umsätze?
- **Stornogebühr und No-Show mit USt** bleiben leer: Ist die USt von apaleo richtig?
- **Anzahlungen**: USt direkt am Anzahlungskonto oder das Anzahlungskonto der Kanzlei mit noch nicht fälliger USt?
- **Forderungsverluste** zu 4,9 % oder 5 % haben keine `*`-Zeile.
- **Erlöse und Anzahlungen zu 5 %**: bleiben leer, historischer Satz.
- **Hauskonten (House)** und **durchlaufende Posten aus apaleo (TransitoryItems)** haben noch keine Vorlage.
- **Vat, VatOnLiabilities**: brauchen kein Konto; diese Buchungen werden übersprungen.

## Umstieg von einem anderen Connector

Nutzt dein Hotel heute einen kostenpflichtigen apaleo-Abacus-Connector, hat dein Treuhänder dessen Kontenzuordnung schon geprüft. Exportiere sie dort als CSV (Spalten `Apaleo Kontonummer`, `Kontoname`, `Kontotyp`, `Abacus Kontonummer`, `Kostenstelle`) und übernimm sie:

```sh
apaleo-abacus init-mapping --property BSP --template kmu-hotel --accounts-from konten.csv
apaleo-abacus mapping check --property BSP --from 2026-09-01 --to 2026-09-30
```

Das Tool nimmt für jedes apaleo-Konto mit Typ das Abacus-Konto und die Kostenstelle aus dem Export und den MWST-Code und Satz aus der Vorlage, denn der Export hat keine MWST-Spalte. Jede übernommene Zeile ist als „Vorschlag (ungeprüft)“ markiert und sagt im Kommentar, dass sie übernommen ist. Konten des Exports, die der apaleo-Kontenplan nicht hat, listet der Befehl auf. Gibt die Vorlage für ein Konto keinen MWST-Code, bleibt er leer, und `mapping check` meldet `E-MWST-CODE-MISSING`, bis du ihn mit deinem Treuhänder einträgst. Als Kontenzuordnung lehnt das Tool den Export ab und nennt `--accounts-from`.

## Checkliste zur Freigabe durch den Treuhänder

Bevor die erste Datei in Abacus importiert wird:

- [ ] Mandant, Leitwährung und MWST-Codes in der Konfiguration stimmen (`abacus.mandant`, `abacus.leitwaehrung`, `abacus.mwstCodes.normal`, `abacus.mwstCodes.reduziert`, `abacus.mwstCodes.beherbergung`).
- [ ] Jede Zeile mit BMD-Konto ist geprüft; jede leere Zeile ist ausgefüllt oder bewusst leer (ein solches Konto darf dann nicht gebucht werden).
- [ ] Die Erlöskonten haben den Steuercode und den Satz, den apaleo bucht (Beherbergung und Speisen 10 %, Getränke 20 %), und auf keiner Erlös- oder Anzahlungszeile steht ein Vorsteuer-Code.
- [ ] Die Ortstaxe ist für die Gemeinde des Hotels entschieden, und ihr BMD-Konto hat keinen fixen Steuercode.
- [ ] Die Einrichtung der Anzahlungen (USt direkt am Anzahlungskonto oder Anzahlungskonto der Kanzlei) ist entschieden.
- [ ] Stornogebühren und No-Shows sind geklärt: ohne USt auf 4091 (oder dem Konto der Kanzlei), mit USt nur, wenn apaleos Satz stimmt.
- [ ] Anzahlungen gehen auf die erhaltenen Anzahlungen mit Steuercode, Zahlungen außer bar auf Schwebende Geldbewegungen, Firmenrechnungen auf den Sammeldebitor, der im Mandanten angelegt ist.
- [ ] Die Erlöskonten ohne Steuercode haben in BMD keinen fixen Steuercode.
- [ ] `apaleo-abacus mapping check --property <id> --from <Monatsanfang> --to <Monatsende>` endet ohne Fehler für einen echten Monat.
- [ ] Ein Probelauf `apaleo-abacus export --month <YYYY-MM> --dry-run` ist ohne `E-` Befund; die Summen pro Konto und USt-Satz stimmen mit den Berichten in apaleo überein.
- [ ] Der erste Import läuft in einen Testmandanten, und das Importprotokoll wurde geprüft ([abacus-import.md](abacus-import.md)).

Datum, Name der Kanzlei und die geprüfte Version der Datei (SHA-256 aus dem Protokoll) kannst du in die Spalte `comment` oder in eure Unterlagen schreiben.
