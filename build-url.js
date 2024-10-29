const fs = require("fs");
const inquirer = require("inquirer");
const querystring = require("querystring");

// Basis-URL für die Immobiliensuche
const baseURL =
  "https://www.immobilienscout24.de/Suche/radius/wohnung-mit-einbaukueche-mieten";

async function getInput() {
  // Fragen für die Benutzereingabe
  const questions = [
    {
      type: "input",
      name: "location",
      message: "Gib den Ort ein (z.B. Köln, Rodenkirchen):",
    },
    {
      type: "input",
      name: "numberOfRooms",
      message:
        "Maximale Zimmeranzahl (z.B. 2 für bis zu 2 Zimmer, -1 für keine Begrenzung):",
      validate: (input) => !isNaN(input) || "Bitte eine gültige Zahl eingeben.",
    },
    {
      type: "input",
      name: "price",
      message:
        "Maximale Miete (z.B. 750 für bis zu 750 € Warmmiete, -1 für keine Begrenzung):",
      validate: (input) => !isNaN(input) || "Bitte eine gültige Zahl eingeben.",
    },
    {
      type: "confirm",
      name: "excludeSwap",
      message: "Wohnungstausch ausschließen?",
      default: true,
    },
    {
      type: "input",
      name: "latitude",
      message: "Geografischer Breitengrad (z.B. 50.87706 für Köln):",
      validate: (input) => !isNaN(input) || "Bitte eine gültige Zahl eingeben.",
    },
    {
      type: "input",
      name: "longitude",
      message: "Geografischer Längengrad (z.B. 6.97067 für Köln):",
      validate: (input) => !isNaN(input) || "Bitte eine gültige Zahl eingeben.",
    },
    {
      type: "input",
      name: "radius",
      message: "Suchradius in Kilometern (z.B. 10 für 10 km):",
      validate: (input) => !isNaN(input) || "Bitte eine gültige Zahl eingeben.",
    },
    {
      type: "list",
      name: "sorting",
      message: "Sortierreihenfolge wählen:",
      choices: [
        { name: "Preis aufsteigend", value: "1" },
        { name: "Preis absteigend", value: "2" },
        { name: "Neueste zuerst", value: "3" },
        { name: "Älteste zuerst", value: "4" },
      ],
    },
    {
      type: "input",
      name: "pageNumber",
      message: "Seitenzahl der Ergebnisse (z.B. 1 für die erste Seite):",
      validate: (input) => !isNaN(input) || "Bitte eine gültige Zahl eingeben.",
    },
  ];

  // Eingabe des Benutzers abfragen
  const answers = await inquirer.default.prompt(questions);

  // URL-Parameter basierend auf Benutzereingaben erstellen
  const params = {
    centerofsearchaddress: answers.location, // Ort wird kodiert
    numberofrooms: answers.numberOfRooms,
    price: answers.price,
    exclusioncriteria: answers.excludeSwap ? "swapflat" : "",
    pricetype: "calculatedtotalrent", // Standardmäßig Gesamtkaltmiete
    geocoordinates: `${answers.latitude};${answers.longitude};${answers.radius}`,
    sorting: answers.sorting,
    pagenumber: answers.pageNumber,
  };

  // Kodierung der Ortsangabe und Erstellung der vollständigen URL
  const encodedLocation = querystring.escape(params.centerofsearchaddress);
  const fullURL = `${baseURL}?centerofsearchaddress=${encodedLocation}&numberofrooms=${params.numberofrooms}&price=${params.price}&exclusioncriteria=${params.exclusioncriteria}&pricetype=${params.pricetype}&geocoordinates=${params.geocoordinates}&sorting=${params.sorting}&pagenumber=${params.pagenumber}`;

  // JSON-Datei mit der generierten URL speichern
  fs.writeFileSync(
    "generated_url.json",
    JSON.stringify({ url: fullURL }, null, 2)
  );
  console.log("Die URL wurde erfolgreich in 'generated_url.json' gespeichert.");
}

// Hauptfunktion starten
getInput();
