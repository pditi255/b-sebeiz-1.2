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
  const { items, table } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).send('Keine gültigen Artikel');

  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }

  orders.push({
    items,
    table: table || "-",
    status: "bestellt",
    time: new Date().toISOString()
  });

  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Bestellungen laden
app.get('/orders', (req, res) => {
  if (!fs.existsSync(ordersFile)) return res.json([]);
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  res.json(orders);
});

// Status aktualisieren
app.post('/update-status', (req, res) => {
  const { index, status } = req.body;
  if (typeof index !== 'number' || !status) return res.status(400).send('Fehlerhafte Anfrage');

  let orders = JSON.parse(fs.readFileSync(ordersFile));
  if (!orders[index]) return res.status(404).send('Nicht gefunden');

  orders[index].status = status;
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Menü anzeigen
app.get('/menu.json', (req, res) => {
  if (!fs.existsSync(menuFile)) return res.json([]);
  const menu = JSON.parse(fs.readFileSync(menuFile));
  res.json(menu);
});

// Menü speichern
app.post('/save-menu', (req, res) => {
  const newMenu = req.body;
  if (!Array.isArray(newMenu)) return res.status(400).send('Ungültiges Menü');

  fs.writeFileSync(menuFile, JSON.stringify(newMenu, null, 2));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`✅ Server läuft auf Port ${port}`);
});
