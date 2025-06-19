const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const ordersFile = path.join(__dirname, 'orders.json');

app.use(express.json());
app.use(express.static(__dirname));

// Bestellung speichern
app.post('/order', (req, res) => {
  const { item, table } = req.body;
  if (!item || !table) return res.status(400).send('Ungültige Bestellung');

  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }

  orders.push({
    item,
    time: new Date().toISOString(),
    table,
    status: 'offen'
  });

  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Bestellung abrufen
app.get('/orders', (req, res) => {
  if (!fs.existsSync(ordersFile)) return res.json([]);
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  res.json(orders);
});

// Status ändern
app.post('/status', (req, res) => {
  const { index, status } = req.body;
  if (typeof index !== 'number' || !status) return res.sendStatus(400);

  let orders = JSON.parse(fs.readFileSync(ordersFile));
  if (!orders[index]) return res.sendStatus(404);

  orders[index].status = status;
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Abrechnen (löschen)
app.post('/clear', (req, res) => {
  const { table } = req.body;
  if (typeof table !== 'number') return res.sendStatus(400);

  let orders = JSON.parse(fs.readFileSync(ordersFile));
  orders = orders.filter(o => o.table !== table);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
