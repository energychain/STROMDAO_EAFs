#### Zweck der Tariff Labels

Im Rahmen des STROMDAO Energy Application Framework (EAF) werden "Tariff Labels" als sprechende Bezeichnungen verwendet, um bestimmte Preissegmente innerhalb der Energieabrechnung zu kennzeichnen. Sie dienen als Zuordnungseinheiten zwischen einer leicht verständlichen Bezeichnung und einem dazugehörigen Strompreis.

#### Nutzung von Labels

Typische Beispiele für solche Labels sind "Hochtarif" und "Niedertarif", die zu unterschiedlichen Tageszeiten oder Lastsituationen zugeordnet werden können. In der Praxis kann das EAF eine Vielzahl von Labels verwenden, um eine breite Palette von Tarifstrukturen abzubilden.

#### Eindeutigkeit in Zeitscheiben

Wichtig beim Konzept der Tariff Labels ist, dass jede Zeitscheibe ( [EPOCH](./epoch.md) ) immer nur ein einziges Label besitzt. Dies gewährleistet eine klare und eindeutige Zuordnung der Strompreise zu den entsprechenden Tarifsegmenten.

#### Interne vs. Externe Labels

STROMDAO EAF arbeitet intern mit einer festen Menge an Labels, die mit den Bezeichnungen "virtual\_1" bis "virtual\_n" benannt sind, wobei "n" die Anzahl der unterschiedlichen Tarifsegmente darstellt.

Diese internen Bezeichner stellen die Konsistenz und Integrität des Systems sicher und sind Bestandteil der Kernlogik des EAF. Externe Tarifbezeichnungen hingegen sind konfigurierbar und können an unterschiedliche Märkte und Sprachen angepasst werden.

#### Mehrsprachigkeit und Produktanpassung

Durch die Trennung von internen Bezeichnern und extern konfigurierbaren Bezeichnungen erlaubt das EAF die Bereitstellung mehrsprachiger Stromprodukte. Die Tariff Labels können je nach Zielmarkt und Kundengruppe auf die jeweilige Landessprache angepasst werden, ohne dass Änderungen an der internen Logik oder dem Produktdesign notwendig sind. Dies ermöglicht eine hohe Flexibilität und Skalierbarkeit bei der Gestaltung von Stromtarifen und erleichtert die internationale Anwendung des Frameworks.

#### Schlussfolgerung

Das Konzept der Tariff Labels im STROMDAO EAF ist fundamental für die Schaffung von klar verständlichen, kundenfreundlichen Stromtarifen. Es ermöglicht eine flexible und dynamische Preisgestaltung, die auf die individuellen Bedürfnisse und Sprachen der Kunden zugeschnitten werden kann, während die interne Abrechnungslogik des EAF präzise und unverändert bleibt. Durch die Anwendung von Tariff Labels wird der Abrechnungsprozess für den Endverbraucher transparenter und leichter nachvollziehbar.