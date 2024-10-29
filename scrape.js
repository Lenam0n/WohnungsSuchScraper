const { webkit } = require("playwright");
const cheerio = require("cheerio");
const { Client } = require("@notionhq/client");
const fs = require("fs");
const inquirer = require("inquirer");
require("dotenv").config();

// Notion Client initialisieren
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

// Funktion, um existierende URLs aus der Notion-Datenbank zu laden
async function fetchExistingUrls() {
  try {
    const existingUrls = new Set();
    let hasMore = true;
    let cursor = undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
      });

      response.results.forEach((page) => {
        const urlProperty = page.properties.URL;
        if (urlProperty && urlProperty.url) {
          existingUrls.add(urlProperty.url);
        }
      });

      hasMore = response.has_more;
      cursor = response.next_cursor;
    }
    return existingUrls;
  } catch (error) {
    console.error(
      "Fehler beim Abrufen der existierenden URLs aus Notion:",
      error.message
    );
    return new Set(); // Leeres Set, damit das Programm fortgesetzt werden kann
  }
}

// Funktion, um ein neues Listing in Notion hinzuzufügen
async function addListingToNotion(listing) {
  try {
    // Ersetze das Komma in der Zimmeranzahl durch einen Punkt
    const roomsFormatted = listing.rooms.replace(",", ".");

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Title: { title: [{ text: { content: listing.title } }] },
        Prize: { number: parseFloat(listing.price.replace(",", ".")) },
        Size: { number: parseFloat(listing.size.replace(",", ".")) },
        Rooms: { select: { name: `${roomsFormatted} Zimmer` } },
        Address: { rich_text: [{ text: { content: listing.address } }] },
        URL: { url: listing.link },
      },
    });
    console.log(`Neuer Eintrag hinzugefügt: ${listing.title}`);
  } catch (error) {
    console.error(
      `Fehler beim Hinzufügen des Listings "${listing.title}" zu Notion:`,
      error.message
    );
  }
}

// Scraper-Funktion, um die Listings von der Webseite zu holen
async function fetchListings(url) {
  const browser = await webkit.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Öffne die Listings-Seite und warte, bis sie geladen ist
    await page.goto(url, { waitUntil: "load", timeout: 30000 });

    // Cookie-Akzeptanz-Button anklicken, wenn vorhanden
    try {
      await page.waitForSelector("button[aria-label='Alle akzeptieren']", {
        timeout: 10000,
      });
      await page.click("button[aria-label='Alle akzeptieren']");
      console.log("Cookies wurden akzeptiert.");
    } catch (error) {
      console.warn(
        "Cookie-Banner konnte nicht gefunden oder geklickt werden:",
        error.message
      );
    }

    // Nachdem Cookies akzeptiert wurden, warte kurz, um sicherzustellen, dass die Seite vollständig geladen ist
    await page.waitForTimeout(2000);

    // Inhalt der Seite holen und mit Cheerio analysieren
    const content = await page.content();
    const $ = cheerio.load(content);
    const listings = [];

    // Scraping-Logik mit Cheerio
    $(".result-list-entry__brand-title-container").each((index, element) => {
      try {
        let title = $(element)
          .find(".result-list-entry__brand-title")
          .text()
          .trim();
        title = title.replace(/^NEU\s*/, ""); // Entferne "NEU" aus dem Titel

        // Preis extrahieren und nur Zahlen und Komma behalten
        let price = $(element)
          .closest(".result-list-entry__data")
          .find(
            ".result-list-entry__criteria .result-list-entry__primary-criterion"
          )
          .first()
          .find("dd")
          .text()
          .trim();
        price = price.replace(/[^\d,]/g, "");

        // Größe extrahieren und nur Zahlen und Komma behalten
        let size = $(element)
          .closest(".result-list-entry__data")
          .find(
            ".result-list-entry__criteria .result-list-entry__primary-criterion"
          )
          .eq(1)
          .find("dd")
          .text()
          .trim();
        size = size.replace(/[^\d,]/g, "");

        // Zimmeranzahl extrahieren und nur die erste Zahl oder Zahl mit Komma behalten
        let rooms = $(element)
          .closest(".result-list-entry__data")
          .find(
            ".result-list-entry__criteria .result-list-entry__primary-criterion"
          )
          .eq(2)
          .find("dd")
          .text()
          .trim();
        rooms = rooms.match(/^\d+(,\d+)?/)[0];

        // Adresse extrahieren
        const address = $(element)
          .closest(".result-list-entry__data")
          .find(".result-list-entry__address")
          .text()
          .trim();

        // Link extrahieren
        const link =
          "https://www.immobilienscout24.de" + $(element).attr("href");

        listings.push({ title, price, size, rooms, address, link });
      } catch (error) {
        console.warn(
          `Fehler beim Extrahieren eines Eintrags auf der Webseite:`,
          error.message
        );
      }
    });

    await browser.close();
    return listings;
  } catch (error) {
    console.error("Fehler beim Abrufen der Listings:", error.message);
    await browser.close();
    return null;
  }
}

// Hauptfunktion zur Steuerung der Aktionen
async function main() {
  // Prüfen, ob die JSON-Datei mit den URLs vorhanden ist
  if (!fs.existsSync("generated_url.json")) {
    console.log("Keine URL-JSON-Datei gefunden.");

    // Den Benutzer fragen, ob das URL-Erstellungsskript ausgeführt werden soll
    const { shouldRunBuildUrl } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldRunBuildUrl",
        message: "Möchtest du das URL-Erstellungsskript starten?",
        default: true,
      },
    ]);

    if (shouldRunBuildUrl) {
      console.log("Starte URL-Erstellungsskript...");
      require("child_process").execSync("npm run build-url", {
        stdio: "inherit",
      });
    } else {
      console.log("Beende das Programm.");
      return;
    }
  }

  // JSON-Datei laden und URLs extrahieren
  const urlData = JSON.parse(fs.readFileSync("generated_url.json", "utf8"));
  const urls = Array.isArray(urlData.url) ? urlData.url : [urlData.url];

  const existingUrls = await fetchExistingUrls();

  for (const url of urls) {
    console.log(`Scraping URL: ${url}`);
    const listings = await fetchListings(url);

    if (listings && listings.length > 0) {
      for (const listing of listings) {
        if (!existingUrls.has(listing.link)) {
          await addListingToNotion(listing);
        }
        // Entferne die Zeile, die bestehende Einträge ausgibt
      }
      console.log("Alle neuen Listings erfolgreich zu Notion hinzugefügt.");
    } else {
      console.log(
        "Keine neuen Anzeigen gefunden oder Fehler beim Abrufen der Daten."
      );
    }
  }
}

main();
