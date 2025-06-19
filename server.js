const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const ordersFile = path.join(__dirname, 'orders.json');
const menuFile = path.join(__dirname, 'menu.json');

// Neue Bestellung speichern
app.post('/order', (req, res) => {
  const { table, items } = req.body;
  if (!table || !items || !Array.isArray(items)) {
    return res.status(400).send('Ungültige Bestellung');
  }

  const orders = fs.existsSync(ordersFile)
    ? JSON.parse(fs.readFileSync(ordersFile))
    : [];

  const newOrder = {
    id: Date.now().toString(),
    table,
    items,
    status: 'bestellt',
    time: new Date().toISOString()
  };

  orders.push(newOrder);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Alle Bestellungen abrufen
app.get('/orders', (req, res) => {
  if (!fs.existsSync(ordersFile)) return res.json([]);
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  res.json(orders);
});

// Status aktualisieren
app.post('/status/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!fs.existsSync(ordersFile)) return res.sendStatus(404);
  let orders = JSON.parse(fs.readFileSync(ordersFile));
  const order = orders.find(o => o.id === id);
  if (!order) return res.sendStatus(404);

  order.status = status;
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Menü anzeigen
app.get('/menu.json', (req, res) => {
  if (!fs.existsSync(menuFile)) {
    return res.status(404).send('Menü nicht gefunden');
  }
  const menu = JSON.parse(fs.readFileSync(menuFile));
  res.json(menu);
});

// Menü aktualisieren
app.post('/menu.json', (req, res) => {
  const newMenu = req.body;
  if (!newMenu || !newMenu.speisen || !newMenu.getraenke) {
    return res.status(400).send('Ungültiges Menüformat');
  }
  fs.writeFileSync(menuFile, JSON.stringify(newMenu, null, 2));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`🍽️ Server läuft auf Port ${port}`);
});
