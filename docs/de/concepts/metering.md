## Überblick über das Metering / Messwesen

Das STROMDAO Energy Application Framework (EAF) führt selbst keine Messungen durch, sondern ist auf Sensoren oder Stromzähler angewiesen, die Daten entweder an das Framework senden (Push) oder von dem das Framework diese Daten abrufen kann. Aufgrund der Vielzahl an verfügbaren Stromzählern und deren Backendsystemen ist das STROMDAO EAF so ausgelegt, dass es minimale Anforderungen an den SmartMeter stellt.

## Kompatibilität mit verschiedenen Zählern

Dynamische Stromtarife, die auf dem STROMDAO EAF basieren, können parallel mit Lese- oder Erfassungsköpfen, intelligenten Messsystemen (iMSyS) oder Hutschienenzählern mit Fernauslesefähigkeit umgesetzt werden, ohne dass das Produktdesign des Stromtarifs explizit Unterscheidungen treffen muss. Diese Kompatibilität stellt sicher, dass das STROMDAO EAF unabhängig von der bestehenden Infrastruktur breit adoptiert werden kann.

## Der Metering Service

Der "Metering Service" agiert innerhalb des EAF als zentrale Schnittstelle zur Verarbeitung der Zählerstände. Dieser Dienst ermöglicht das Konzept des inkrementellen Messens, bei dem jede abgelesene Messung einen Zeitstempel und den Zählerstand in Wattstunden (Wh) benötigt. Keine weiteren Daten sind für die Verarbeitung einer Messung notwendig, und das Framework verarbeitet auch keine anderen Daten.

### Zeitreihenmessung der Zählerstände

Implementiert im Metering Service ist das Prinzip der Zeitreihenmessung von Zählerständen. Dies bedeutet, dass für die Verarbeitung einer Ablesung lediglich der Zeitstempel der Ablesung und der Zählerstand in Wattstunden erforderlich sind. Dieser gestraffte Ansatz ermöglicht eine effiziente und effektive Handhabung von Messdaten und unterstützt die Genauigkeit von Abrechnungen innerhalb des EAF.

## Schlussfolgerung

Das Metering-Konzept innerhalb des STROMDAO EAF ist so konzipiert, dass es effizient und unauffällig ist und minimale Daten benötigt, um eine genaue und rechtzeitige Energieabrechnung für dynamische Tarife durchzuführen. Indem sich der Fokus ausschließlich auf den Zeitstempel und die Ablesung in Wattstunden richtet, erhält das STROMDAO EAF eine leichtgewichtige und anpassbare Metering-Schnittstelle, die für eine breite Palette von Messgeräten geeignet ist und die für verschiedene Energienutzungsszenarien erforderliche Flexibilität bietet.