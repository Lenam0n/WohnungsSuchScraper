Webscraper für ImmobilienScout24

    Hinweis: Der Webscraper ist nicht vollautomatisch und benötigt Benutzereingaben und eine manuelle Konfiguration, bevor er ausgeführt werden kann.

Voraussetzungen

Um den Webscraper zu nutzen, benötigst du Folgendes:

    1.	Node.js und npm: Installiere Node.js und npm (Node Package Manager), falls diese noch nicht auf deinem System installiert sind.
    2.	Abhängigkeiten: Stelle sicher, dass alle erforderlichen npm-Pakete installiert sind. Dies kannst du mit dem folgenden Befehl ausführen:

npm install

    3.	Notion API Key: Ein Notion API-Schlüssel, um Daten in deine Notion-Datenbank zu schreiben. Weitere Informationen zum Erstellen eines API-Schlüssels findest du in der Notion API-Dokumentation.
    4.	Umgebungsdatei (.env): Erstelle eine .env-Datei in deinem Projektordner und füge die folgenden Zeilen hinzu:

NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_database_id_here

Ersetze your_notion_api_key_here und your_database_id_here durch deinen tatsächlichen API-Schlüssel und die ID deiner Notion-Datenbank.

Nutzung des Webscraper-Skripts

Um den Webscraper zu verwenden, führe folgende Schritte aus:

    1.	Generiere die URL(s):
    •	Verwende das build-url-Skript, um die URLs für deine Suchkriterien zu erstellen:

npm run build-url

    •	Die erstellte URL wird in einer JSON-Datei namens generated_url.json gespeichert. Überprüfe diese Datei, um sicherzustellen, dass die URL korrekt ist.

    2.	Starte das Webscraper-Skript:
    •	Nachdem die URLs generiert wurden, kannst du das Scraping-Skript starten:

npm run scrape

    •	Das Skript wird die gespeicherten URLs aus generated_url.json verwenden und die Listings scrapen. Neue Einträge werden automatisch zu deiner Notion-Datenbank hinzugefügt.

Notion-Datenbank Konfiguration

Richte deine Notion-Datenbank ein, um die gescrapten Daten korrekt zu speichern und anzuzeigen. Stelle sicher, dass folgende Spalten vorhanden sind:

Spalte Typ Beschreibung
Title Text Der Titel des Listings.
Prize Zahl Der Preis des Listings.
Size Zahl Die Größe des Listings in Quadratmetern.
Rooms Auswahlfeld Die Anzahl der Zimmer im Format „x Zimmer“.
Address Text Die Adresse des Listings.
URL URL Der Link zum Listing auf ImmobilienScout24.
Status Auswahlfeld Zeigt den aktuellen Status des Listings in verschiedenen Kategorien an.

Status-Einstellungen

Die Spalte Status sollte so konfiguriert sein, dass sie den Fortschritt des Listings anzeigt und in verschiedene Kategorien unterteilt ist:

    •	DONE:
    •	Nice
    •	Sehr Nice
    •	In Progress:
    •	NEW
    •	Okay
    •	To-do:
    •	Meh

Diese Statuswerte helfen, die Listings basierend auf ihrem Status oder Zustand zu organisieren und zu priorisieren.

Sortierempfehlung

Für eine bessere Übersicht wird empfohlen, die Tabelle wie folgt zu sortieren:

    •	Status: Absteigend (DONE > In Progress > To-do)
    •	Prize: Aufsteigend

Diese Sortierung ermöglicht es dir, die wertvollsten Listings an oberster Stelle zu sehen, basierend auf ihrem Preis und Fortschritt im Bearbeitungsprozess.

Weitere Hinweise

    •	Der Scraper akzeptiert und speichert Cookies, weshalb es gelegentlich notwendig sein kann, eine manuelle Bestätigung auf der Website durchzuführen.
    •	Achte darauf, dass keine Duplicate in der Datenbank entstehen; das Skript überprüft zwar auf Duplikate, dennoch ist eine regelmäßige manuelle Kontrolle empfehlenswert.

Mit diesen Schritten und Einstellungen sollte dein Webscraper für ImmobilienScout24 einsatzbereit sein und die Daten entsprechend in deine Notion-Datenbank übertragen.
