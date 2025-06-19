const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const ordersFile = path.join(__dirname, 'orders.json');

// Bestellungen speichern
app.post('/order', (req, res) => {
  const item = req.body.item;
  if (!item) return res.status(400).send('Kein Artikel');

  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }
  orders.push({ item, time: new Date().toISOString() });
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Bestellungen abrufen
app.get('/orders', (req, res) => {
  if (!fs.existsSync(ordersFile)) return res.json([]);
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  res.json(orders);
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
