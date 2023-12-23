**Definition einer EPOCH**

Im STROMDAO Energy Application Framework (EAF) wird das Konzept einer "EPOCH" oder Zeitscheibe verwendet, um dedizierte Zeitabschnitte zu definieren, innerhalb derer ein bestimmter Preis für Strom gilt. Eine EPOCH ist definiert als der Zeitraum, der mit einer spezifizierten Uhrzeit an einem Tag beginnt und zu einer anderen Uhrzeit an einem Tag endet.

**Exklusivität von EPOCHs**

Ein zentrales Merkmal im Konzept der EPOCH ist, dass keine zwei EPOCHs dieselbe Uhrzeit eines Tages abdecken können. Dies sorgt für eine klare und eindeutige Zuordnung von Strompreisen zu bestimmten Zeitfenstern.

**Festlegung der EPOCH-Dauer**

Die Dauer einer EPOCH wird in der Laufzeitkonfiguration durch die Umgebungsvariable `EPOCH_DURATION` bestimmt. Der Wert dieser Variable steht für die Länge der Zeitscheibe in Millisekunden. Somit gibt beispielsweise ein Wert von `EPOCH_DURATION: 3600000` an, dass die Dauer einer EPOCH eine Stunde beträgt.

**Konfigurationsänderungen**

Eine Anpassung der `EPOCH_DURATION` darf ausschließlich beim leeren Datenbestand vorgenommen werden, also während des Setups des Systems. Bestehende Datenbestände dürfen nicht verändert werden, weil das STROMDAO EAF solche Änderungen nicht unterstützt. Erforderlich wäre in diesem Fall eine spezialisierte Migration des Datenbestandes.

**Verbrauchsabgrenzung basierend auf EPOCHs**

Im Rahmen des Settlements, des Clearings und der Abrechnung wird die Verbrauchsabgrenzung immer auf Basis der EPOCH durchgeführt. Dabei wird der Verbrauch den jeweiligen EPOCHs zugeordnet, um eine genaue Abrechnung sicherzustellen. Eine weitere Unterteilung in kleinere Zeiträume als die festgelegte EPOCH ist im STROMDAO EAF nicht vorgesehen. Auf diese Weise wird eine strukturierte und transparente Abrechnungsgrundlage geschaffen, welche die Einheitlichkeit und die Zuverlässigkeit des Abrechnungssystems gewährleistet.
