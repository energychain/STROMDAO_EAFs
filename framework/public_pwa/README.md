# MeinStadtwerk

![Screenshot][screenshot1]

**Prototyp einer Endkunden Progressive Web Application (PWA) für EVUs mit dynamischen Stromtarif, die auf dem [STROMDAO EAF](https://github.com/energychain/STROMDAO_EAFs) basieren**

## Hintergrund
Diese App ist bewusst sehr einfach und schlicht gehalten, um mit möglichst geringem Aufwand entweder als selbständige App oder integriert in einer bestehende EndkundenApp eingesetzt zu werden. Die APP greift im Hintergrund auf die API des STROMDAO EAF zu, um die Vorhersage des Strompreises der kommenden Tage sowie die aktuellen Abrechnungsinformationen (Verbrauch, Preis,...) abzurufen.

## Über
Die "Mein Stadtwerk - Dynamischer Stromtarif UI" ist eine Whitelabel-Referenzimplementierung der [STROMDAO GmbH](https://stromdao.de/) für die Einführung eines netzdienlichen, dynamischen Stromtarifs im Sinne des EAF-10 für Elektrizität. Sie bietet Verbrauchern und Erzeugern kurzfristig variable Tarife für bestimmte Zeitfenster, welche durch Energielieferanten oder Aggregatoren über das intelligente Messsystem (iMSys) zur Verfügung gestellt werden. 

Diese Tarife sind eventspezifisch und treten im Gegensatz zu zeitvariablen Tarifen einmalig für ein spezifisches Zeitfenster auf. Nutzer haben die Möglichkeit, auf diese variablen Tarife zu reagieren, um ihre Energiekosten bei Vorhandensein von flexiblen Verbrauchs-, Erzeugungs- oder Speicheranlagen zu optimieren.

Features der App beinhalten:
-   Verarbeitung von Zählerstandsgängen über eine REST-API
-   Anwendung eines dynamischen Preissignals für die Strompreisabrechnung (Settlement)
-   Anlegen von Unterzählern (Submetering) für verschiedene Tarifstufen
-   Erstellung von Abrechnungen (Clearing)

Neben diesen funktionalen Aspekten sorgt die App für eine zeitaufgelöste und transparente Abrechnung durch das Zusammenspiel von iMSys oder Lesekopf und Backend. Dies stellt sicher, dass Nutzer eine Übersicht über die vergangenen Verbräuche und die dafür abgerechneten Preise erhalten können.

Die App nutzt digitale Identitäten und erfüllt damit die Anforderungen der eIDAS-Verordnung. Sie ist Teil des "STROMDAO EAF" Frameworks, einer hochskalierenden Lösung für Stromversorger, um ihren Kunden einen variablen Stromtarif anzubieten.

Wenn Sie weitere Informationen benötigen oder einen Blick in die App werfen möchten, können Sie die App über folgenden Link in einer Demo-Umgebung ausprobieren: [Open in Gitpod](https://gitpod.io/#https://github.com/energychain/STROMDAO_EAFs).

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

[screenshot1]: ./assets/img/screenshots/screenshot_1.jpg "MeinStadtwerk PWA für variable Stromtarife"