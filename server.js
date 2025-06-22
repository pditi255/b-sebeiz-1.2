const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const ordersFile = path.join(__dirname, 'orders.json');
const menuFile = path.join(__dirname, 'menu.json');

// Neue Bestellung
app.post('/order', (req, res) => {
  const { table, items } = req.body;
  if (!table || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send('Ungültige Bestellung');
  }

  const menu = JSON.parse(fs.readFileSync(menuFile));
  let price = 0;
  items.forEach(item => {
    const found = menu.find(m => m.name === item);
    if (found) price += found.price;
  });

  let orders = fs.existsSync(ordersFile)
    ? JSON.parse(fs.readFileSync(ordersFile))
    : [];

  orders.push({
    id: Date.now(),
    table,
    items,
    status: "Bestellt",
    price: price.toFixed(2),
    time: new Date().toISOString()
  });

  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Alle Bestellungen abrufen
app.get('/orders', (req, res) => {
  if (!fs.existsSync(ordersFile)) return res.json([]);
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  res.json(orders);
});

// Status abrufen pro Tisch
app.get('/status/:table', (req, res) => {
  const table = parseInt(req.params.table);
  const orders = fs.existsSync(ordersFile)
    ? JSON.parse(fs.readFileSync(ordersFile))
    : [];

  const latest = [...orders]
    .reverse()
    .find(o => o.table == table);

  res.json({ status: latest ? latest.status : null });
});

// Status aktualisieren
app.post('/update-status', (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) return res.status(400).send('Fehlende Daten');

  let orders = fs.existsSync(ordersFile)
    ? JSON.parse(fs.readFileSync(ordersFile))
    : [];

  const index = orders.findIndex(o => o.id == id);
  if (index === -1) return res.status(404).send('Bestellung nicht gefunden');

  orders[index].status = status;
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Bestellung löschen
app.post('/delete-order', (req, res) => {
  const { id } = req.body;
  let orders = fs.existsSync(ordersFile)
    ? JSON.parse(fs.readFileSync(ordersFile))
    : [];

  orders = orders.filter(o => o.id !== id);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Server starten
app.listen(port, () => {
  console.log(`🚀 Server läuft auf http://localhost:${port}`);
});
