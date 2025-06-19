const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const ordersFile = path.join(__dirname, 'orders.json');

app.use(express.json());
app.use(express.static(__dirname));

// Bestellungen speichern
app.post('/order', (req, res) => {
  const { item, price, status } = req.body;
  if (!item || !price) return res.status(400).send('Fehlende Daten');

  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }

  orders.push({
    item,
    price: parseFloat(price),
    status: status || 'offen',
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

// Status aktualisieren
app.post('/update-status', (req, res) => {
  const { index, status } = req.body;
  if (!fs.existsSync(ordersFile)) return res.sendStatus(404);

  const orders = JSON.parse(fs.readFileSync(ordersFile));
  if (!orders[index]) return res.sendStatus(400);

  orders[index].status = status;
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
