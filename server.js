const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const ordersFile = path.join(__dirname, 'orders.json');
const menuFile = path.join(__dirname, 'menu.json');

// Bestellung speichern
app.post('/order', (req, res) => {
  const { item, table } = req.body;
  if (!item || !table) return res.status(400).send('Fehlende Daten');

  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }

  orders.push({
    item,
    table,
    time: new Date().toISOString()
  });

  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Bestellungen abrufen
app.get('/orders', (req, res) => {
  if (!fs.existsSync(ordersFile)) return res.json([]);
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  res.json(orders);
});

// Menü abrufen
app.get('/menu.json', (req, res) => {
  if (!fs.existsSync(menuFile)) return res.json([]);
  const menu = JSON.parse(fs.readFileSync(menuFile));
  res.json(menu);
});

// Menü speichern
app.post('/menu', (req, res) => {
  fs.writeFileSync(menuFile, JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
