[![STROMDAO logo](https://static.corrently.cloud/stromdao_988.png)](https://stromdao.de/)

[![codecov](https://codecov.io/gh/energychain/STROMDAO_EAFs/graph/badge.svg?token=O04DB3uPAJ)](https://codecov.io/gh/energychain/STROMDAO_EAFs)
![GitHub issues](https://img.shields.io/github/issues/energychain/STROMDAO_EAFs)

# EAFs - Zählerstandsgangmessung für dynamische Stromtarife
**Referenzimplementierung der STROMDAO GmbH**

Das STROMDAO Energy Application Framework (EAF) adressiert die Aspekte der Implementierung dynamischer Tarife wie folgt:

1.  **Datenerfassung**: Das EAF von STROMDAO nutzt Verbrauchsdaten und Erzeugungsprognosen, um die dynamische Preisgestaltung umzusetzen. Zusätzlich wird in Deutschland der GrünstromIndex genutzt, um Tarifsegmente auf der Basis der tatsächlichen regionalen Erzeugungsbedingungen abzuleiten. Das Framework integriert Daten aus verschiedenen Quellen, um eine validierte und präzise Grundlage für dynamische Tarife zu schaffen.
    
2.  **Analyse und Prognose**: Das Framework verfügt über einen eingebauten Prognosemechanismus, der einen Konsens zwischen Erzeugungs- und Verbrauchsprognosen erreicht. Dies reduziert Risiken sowohl für die Versorger als auch für die Verbraucher durch einen transparenten Prognose- und Analyseprozess, der direkt in das Framework integriert ist.
    
3.  **Preisanpassungsalgorithmus**: Mit einem Open-Source-Algorithmus arbeitet das EAF mit festgelegten Preissegmenten. Hier liegt der Schwerpunkt darauf, Stunden (konfigurierbar) genau  diesen Segmenten zuzuweisen, um konsistente dynamische Tarife zu gewährleisten, ohne häufige Neuberechnungen der Preise vornehmen zu müssen.
    
4.  **Tarifsegmentierung**: Die dynamische Preisgestaltung im Rahmen des EAF basiert auf festen Preisen für definierte Segmente, wie zum Beispiel für „Nebenzeiten“ und „Hauptzeiten“, anstatt auf schwankenden Preisen im Tagesverlauf. Dies ermöglicht das Angebot eines dynamischen Stromtarifs auch bei vorhandener Strompreisbremse oder ähnlichen Preissteuerrungen, die mit einem vollflexiblen Preis nicht vereinbar sind. 
    
5.  **Veröffentlichung und Benachrichtigung**: Das Framework nutzt eine OpenAPI-Schnittstelle, wodurch eine breite Palette an Client-Anwendungen, Websites oder Energiemanagementsystemen Zugang zu den Preisinformationen erhält. Dies macht die dynamischen Tarife weitreichend zugänglich und leicht zu integrieren.
    
6.  **Abrechnung und Abwicklung**: Das EAF von STROMDAO ist so konzipiert, dass es Abrechnungs- und Abwicklungsdaten direkt als Unterzählerablesungen an Enterprise-Resource-Planning-(ERP)-Systeme über offene Standards liefert. Diese nahtlose Integration vereinfacht die finanziellen Prozesse im Zusammenhang mit dynamischen Tarifen.
    
7.  **Berichterstattung und Optimierung**: Die eingebaute Berichtsfunktion unterstützt Versorger dabei, Preisstrategien kontinuierlich zu überwachen und das Nachfrageverhalten ihrer Stromkunden zu bewerten. Dies erleichtert einen laufenden Optimierungsprozess und ermöglicht es den Versorgern, ihre dynamischen Tarifmodelle anzupassen und zu verbessern.
    
Das STROMDAO EAF umfasst somit ein vollständiges Paket an Dienstleistungen und Funktionalitäten, die für die Implementierung und Verwaltung dynamischer Tarife erforderlich sind, und gewährleistet Effizienz, Transparenz und Benutzerfreundlichkeit sowohl für Versorger als auch für Verbraucher. Zudem wird auf offene Standards gesetzt, um Interoperabilität und breite Anwendung zu fördern.

## Essay: EAF-10

Umsetzung für die Einführung eines netzdienlichen dynamischen Stromtarifs folgend des [EAF-10 Dynamische Tarife für Elektrizität](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/SmartMeter/Stufenmodell/Energiewirtschaftliche_Anwendungsfaelle.pdf?__blob=publicationFile&v=5):

> Der Verbraucher oder Erzeuger erhält kurzfristig für bestimmte Zeitfenster variable Tarife durch den Energielieferanten oder Aggregator, der diese über den Messstellenbetreiber durch das iMSys zur Verfügung stellt. Dies sind ereignisvariable Tarife, da sie, anders als bei den zeitvariablen Tarifen, nicht wiederkehrend in bestimmten Zeitfenstern auftreten, sondern einmalig und damit ereignishaft für ein bestimmtes Zeitfenster gesetzt werden. Der Verbraucher oder Erzeuger kann auf diese ereignisvariablen Tarife reagieren, wenn er über flexible Verbrauchs-, Erzeugungs- oder Speicheranlagen verfügt, und somit seine Energiekosten optimieren. Neben dem Anzeigen der Tarifereignisse wird durch Zusammenspiel von iMSys und Backend auch die zeitaufgelöste und transparente Abrechnung sichergestellt.

### Umsetzung in STROMDAO EAF
Das STROMDAO Energy Application Framework (EAF) stellt eine innovative Plattform für Stromanbieter dar, um dynamische, ereignisvariable Stromtarife zu implementieren und anzubieten. Mit Blick auf die Verpflichtung der Energieversorger, bis zum Jahr 2025 einen dynamischen Tarif zur Verfügung zu stellen, bietet das STROMDAO EAF folgende Funktionen:

-   **Tarifaktualisierung**: Automatisiertes Update der Tarife, konfigurierbar bis zu 15-minütigen Intervallen, und Stabilisierung der Preise für festgelegte Zeiteinheiten über eine API zuverlässig abrufbar.
    
-   **Integration mit Messstellenbetreibern**: Durch die Nutzung von etablierten Kommunikationsstandards wie AS4 und die Integration über CLS-Kanäle, bietet das EAF eine flexible Anbindung an existierende iMSys oder Leseköpfe.
    
-   **Tarifgestaltung**: EAF erlaubt Stromanbietern, Tarife präzise zu segmentieren und situativ anzupassen, wodurch auf spezifische Markt- und Netzgegebenheiten schnell und effizient reagiert werden kann.
    
-   **Abrechnungsintegration**: Durch eine direkte Anbindung zu ERP-Systemen mittels OBIS-Codes für jeden Tarifsegment-Unterzähler wird eine einfache, kompatible und transparente Abrechnung sichergestellt.
    
-   **Skalierbare Echtzeit-Datenverarbeitung**: EAFs Microservice-Architektur ermöglicht eine flexible Anpassung an wachsende Teilnehmerzahlen sowie die Aufrechterhaltung hoher Durchsatzraten für die Prozesse von Datenerfassung, Tarifverwaltung und Abrechnung.
    
-   **Benutzerfreundliche und sichere Infrastruktur**: Die EAF bietet eine intuitive Benutzeroberfläche für die Anbindung an Kundensysteme und bewahrt die Sicherheit der Daten durch fortschrittliche Verfahren zur Datenverarbeitung.
    
So unterstützt das STROMDAO EAF Energieversorger dabei, ihren Kunden maßgeschneiderte Tarifmodelle anzubieten, die eine Reaktion auf spezifische Ereignisse und Marktsituationen erlauben. Dies fördert eine aktivere Teilnahme am Energiemarkt und trägt zu effizienterem Energieverbrauch und -erzeugung bei. Mit diesem fortschrittlichen Ansatz hilft das EAF Energieversorgern, Innovationstreiber zu sein und den gesetzlichen Anforderungen eines dynamischen Energiesektors gerecht zu werden.

## 🌟 Features

-   **Datenerfassung**:
    -   Nutzt Verbrauchsdaten und Erzeugungsprognosen für die Preisbildung
    -   Integriert den [GrünstromIndex](https://gruenstromindex.de/) zur regionalen Tarifanpassung in Deutschland
-   **Analyse und Prognose**:  
    -   In-built Forecasting-Mechanismus für transparente und konsensbasierte Prognosen
    -   Risikominimierung für Versorger und Verbraucher
-   **Preisanpassungsalgorithmus**:
    -   Open-Source-Algorithmen für die Zuweisung von Preissegmenten
-   **Tarifsegmentierung**:
    -   Arbeitet mit festen Preissegmenten statt volatilem Tarif-Fluktuieren
    -   Segmentierung nach Nutzungszeiten wie Neben- und Hauptzeiten
-   **Veröffentlichung und Benachrichtigung**:
    -   Bereitstellung einer OpenAPI-Schnittstelle für breiten Zugriff
    -   Einfache Integration in diverse Client-Anwendungen und Energiemanagementsysteme
-   **Abrechnung und Abwicklung**:
    -   Direkte Integration in ERP-Systeme über offene Standards
    -   Genauigkeit durch Lieferung als Unterzählerablesungen zur Abrechnungsbildung
-   **Berichterstattung und Optimierung**:
    -   Kontinuierliches Monitoring der Tarifpolitik möglich
    -   Berücksichtigung des Nachfrageverhaltens zur Verbesserung der Preisstrategien
-   **Benutzerfreundlichkeit und Interoperabilität**:
    -   Konzipiert für einfache Handhabung und Nutzung
    -   Förderung von Standards, die die Zusammenarbeit und gemeinsame Nutzung erleichtern

## Repository Struktur
- `/framework/` - Laufzeitumgebung von STROMDAO EAF basierend auf der Moleculer Service Microservice Umgebung.
- `/framework/public` - Statische Entwickler UI (Zugriff via [[https://localhost:3000/]]).
- `/framework/public_metering` - Statische MeterPointOperations UI (Zugriff via [[https://localhost:3001/]]).
- `/framework/services` - Implementierung der einzelnen Micro Services.
- `/framework/test` - Unit und Coverage Tests der Micro Services. Ausführen via `npm run test`.
- `/framework/dynamicsignal` - Beispiele für die Implementierung von Preissignale zur Verwendung in Stromtarifen.

## Demo

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/energychain/STROMDAO_EAFs)

<!-- LICENSE -->
## License

Distributed under the Apache-2.0 License. See [License](./LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Maintainer / Imprint

<addr>
STROMDAO GmbH  <br/>
Gerhard Weiser Ring 29  <br/>
69256 Mauer  <br/>
Germany  <br/>
  <br/>
+49 6226 968 009 0  <br/>
  <br/>
dev@stromdao.com  <br/>
  <br/>
Handelsregister: HRB 728691 (Amtsgericht Mannheim)<br/>
  <br/>
https://stromdao.de/<br/>
</addr>
