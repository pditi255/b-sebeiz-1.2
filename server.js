const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

const ordersFile = "./orders.json";
const statusFile = "./status.json";
const menuFile = "./menu.json";

app.use(express.static("."));
app.use(express.json());

// Bestellung aufgeben
app.post("/order", (req, res) => {
  const { table, items } = req.body;
  if (!table || !Array.isArray(items)) {
    return res.status(400).send("Ungültige Bestellung");
  }

  const newOrder = { table, items, time: new Date().toISOString() };

  // Speichere Bestellung
  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }
  orders.push(newOrder);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

  // Setze Status auf "Bestellt"
  let status = {};
  if (fs.existsSync(statusFile)) {
    status = JSON.parse(fs.readFileSync(statusFile));
  }
  status[table] = "Bestellt";
  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));

  res.sendStatus(200);
});

// Alle Bestellungen abrufen (für die Küche)
app.get("/orders", (req, res) => {
  if (!fs.existsSync(ordersFile)) return res.json([]);
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  res.json(orders);
});

// Menü abrufen
app.get("/menu.json", (req, res) => {
  if (!fs.existsSync(menuFile)) return res.status(404).send("Kein Menü gefunden");
  const menu = JSON.parse(fs.readFileSync(menuFile));
  res.json(menu);
});

// Status für Tisch abrufen
app.get("/status/:table", (req, res) => {
  const table = req.params.table;
  if (!fs.existsSync(statusFile)) return res.json({ status: "-" });
  const status = JSON.parse(fs.readFileSync(statusFile));
  res.json({ status: status[table] || "-" });
});

// Küchenbefehl: Status setzen
app.post("/status/:table", (req, res) => {
  const table = req.params.table;
  const { status: newStatus } = req.body;
  if (!newStatus) return res.status(400).send("Status fehlt");

  let status = {};
  if (fs.existsSync(statusFile)) {
    status = JSON.parse(fs.readFileSync(statusFile));
  }
  status[table] = newStatus;
  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));

  res.sendStatus(200);
});

// Bestellung löschen (Küche: "Erledigt")
app.post("/complete/:index", (req, res) => {
  if (!fs.existsSync(ordersFile)) return res.sendStatus(404);
  let orders = JSON.parse(fs.readFileSync(ordersFile));
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= orders.length) {
    return res.status(400).send("Ungültiger Index");
  }
  orders.splice(index, 1);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
