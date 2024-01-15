---
marp: true
theme: base
backgroundImage: url('./stromdao.png')
backgroundPosition: top right
backgroundSize: auto
backgroundRepeat: no-repeat
---

# Bilanzierung und Fakturierung bei Dynamischen Stromtarifen
## im Energy Application Framework

---

# Übersicht
- Einführung in die Dynamischen Stromtarife
- Wichtigkeit der kontinuierlichen Messwertverarbeitung
- Der Prozess des Settlements
- Unterscheidung zwischen Fakturierung und Bilanzierung
- Herausforderungen der synchronen Abrechnung
- Lösungsansatz im STROMDAO EAF: Trennung von Clearing und Balancing

---

# Dynamische Stromtarife
- Definition und Relevanz
- Ablesen der Stromzählerstände
- Kontinuierliche Erfassung als Grundlage der Tarifierung

---

# Dynamische Stromtarife
## Was sind sie?

- Definition: Stromtarife, die basierend auf Echtzeit-Marktkonditionen oder Netzlast variieren können
- Relevanz: Fördern ein effizienteres Energiemanagement und erlauben Konsumenten, Kosten zu sparen
- Anpassungsfähig an Angebot und Nachfrage sowie erneuerbare Energieresourcen

---

# Die Bedeutung des Ablesens der Stromzählerstände
## Eine kontinuierliche Notwendigkeit

- Zählerstände geben den exakten Energieverbrauch wieder
- Grundlage für die genaue Abrechnung und Tarifierung
- Wichtig für die Abrechnung bei dynamischen Tarifen, die sich kurzfristig ändern können

---

# Kontinuierliche Erfassung der Stromzählerstände
## Die Grundlage der Tarifierung

- Erfassung von Energieverbrauch in Echtzeit oder in kurzen Intervallen
- Wichtig für korrekte Anpassung der Tarife gemäß dem tatsächlichen Verbrauchsmuster
- Ermöglicht verbrauchsabhängige Preismodelle und Transparenz für den Verbraucher

---
# Kontinuierliche Messwertverarbeitung
- Notwendigkeit regelmäßiger Zählerstandsgänge
- Bedeutung für Kunden und Energiewirtschaft
- Prozessüberblick vom Zählerstand zum Settlement

---
# Kontinuierliche Messwertverarbeitung
## Notwendigkeit regelmäßiger Zählerstandsgänge

- Regelmäßige Übermittlung von Zählerständen für genaue Stromtarifierung
- Technische Lösungen: Smart Meter Gateways und Leseköpfe auf modernen Messeinrichtungen
- Zukünftige Entwicklungen im Bereich der Messdatenübertragung


---

# Bedeutung der Messwertverarbeitung
## Für Kunden und Energieversorger

- Gewährleistung von Betriebssicherheit in Ablesung und Kommunikation
- Wichtig für die Verlässlichkeit und Genauigkeit der Stromabrechnung
- Aufbau eines vertrauensvollen Verhältnisses zwischen Kunden und Energiewirtschaft

---

# Vom Zählerstand zum Settlement
## Ein Prozessüberblick

- Ankunft der Zählerstände bei Systemen wie dem STROMDAO EAF
- Authentifizierung und Autorisierung der Daten als erster Schritt
- Plausibilitätsprüfung zur Sicherstellung der Messwertqualität
- Überführung der Daten in nachfolgende Schritte zur Abrechnung

---

# Der Settlement-Prozess
- Von zwei Ablesungen zum Settlement
- Energieaufteilung bei veränderlichen Bedingungen
- Abgrenzung bei schwankenden Strompreisen

---
# Der Settlement-Prozess
## Einführung

- Definition von "Zählerstandsgang" als Differenz zwischen zwei aufeinanderfolgenden Zählerablesungen
- Wichtigkeit des Zählerstandsgangs als Basis für das Settlement

---

# Erfassung des Verbrauchs
## Ermittlung der Energiemengen

- Ermittlung der verbrauchten Energiemenge auf Basis des Zählerstandsgangs
- Settlement als Prozess zur Energiebilanzierung zwischen den Ablesungen

---

# Energieaufteilung unter variablen Bedingungen
## Herausforderungen und Methoden

- Bedingungen wie Preise oder Verbrauch können zwischen den Ablesungen variieren
- Notwendige Abgrenzung zur gerechten Aufteilung der Energiemengen

---

# Abgrenzung bei Strompreisschwankungen
## Anpassung des Settlements

- Berücksichtigung schwankender Strompreise im Abrechnungszeitraum
- Verfahren zur korrekten Abgrenzung der Kosten entsprechend den Veränderungen

---

# Zusammenfassung Settlement
## Wichtigkeit einer präzisen Abgrenzung

- Eine genaue Abgrenzung ist entscheidend für faire und transparente Abrechnungen
- Gewährleistet die korrekte Zuweisung von Energiekosten und -mengen

---
# Fakturierung vs. Bilanzierung
- Fakturierung: Abrechnung mit dem Stromkunden
- Bilanzierung: Abrechnung auf Energiewirtschaftsebene
- Sichtweisen und Zuständigkeiten

---

# Herausforderungen der synchronen Abrechnung
- Asynchronität bei Bilanzierung und Fakturierung
- Endgültige Abrechnung vs. Echtzeit-Fakturierung
- Geschätzte vs. reale Strommengen

---

# Lösung im STROMDAO EAF
- Trennung der Prozesse: Clearing und Balancing
- Clearing: Fakturierung der Stromkunden
- Balancing: Bilanzierung im Energiesektor
- Anpassung an Echtzeitbedingungen und flexible Tarife

---

# Zusammenfassung 
- Wichtigkeit der getrennten Verarbeitung im STROMDAO EAF
- Vorteile der Unabhängigkeit von Clearing und Balancing
- Zukünftige Entwicklungen und Herausforderungen

---

# Q&A
### Haben Sie Fragen?