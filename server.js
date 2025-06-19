const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const ordersFile = path.join(__dirname, 'orders.json');
const menuFile = path.join(__dirname, 'menu.json');

// Bestellung aufgeben
app.post('/order', (req, res) => {
  const { table, items } = req.body;
  if (!table || !items) return res.status(400).send('Ungültige Bestellung');

  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }

  orders.push({
    table,
    items,
    time: new Date().toISOString(),
    status: "Bestellt"
  });

  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Alle Bestellungen anzeigen
app.get('/orders', (req, res) => {
  if (!fs.existsSync(ordersFile)) return res.json([]);
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  res.json(orders);
});

// Status fortschalten
app.post('/update-status/:index', (req, res) => {
  const index = parseInt(req.params.index);
  let orders = JSON.parse(fs.readFileSync(ordersFile));
  const statusSteps = ["Bestellt", "Bezahlt", "In Bearbeitung", "Abholbereit", "Erledigt"];
  const currentStatus = orders[index].status;
  const next = statusSteps.indexOf(currentStatus) + 1;
  if (next < statusSteps.length) {
    orders[index].status = statusSteps[next];
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  }
  res.sendStatus(200);
});

// Bestellung als erledigt markieren
app.post('/mark-done/:index', (req, res) => {
  let orders = JSON.parse(fs.readFileSync(ordersFile));
  orders[index].status = "Erledigt";
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Menü lesen
app.get('/menu.json', (req, res) => {
  if (!fs.existsSync(menuFile)) return res.json([]);
  const menu = JSON.parse(fs.readFileSync(menuFile));
  res.json(menu);
});

// Menü speichern
app.post('/update-menu', (req, res) => {
  fs.writeFileSync(menuFile, JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
