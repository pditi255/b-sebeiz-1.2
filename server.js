const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

const ordersFile = path.join(__dirname, 'orders.json');
const statusFile = path.join(__dirname, 'status.json');
const menuFile = path.join(__dirname, 'menu.json');

// Bestellung speichern
app.post('/order', (req, res) => {
  const order = req.body;
  const orders = fs.existsSync(ordersFile) ? JSON.parse(fs.readFileSync(ordersFile)) : [];
  orders.push({ ...order, time: new Date().toISOString() });
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

  const status = fs.existsSync(statusFile) ? JSON.parse(fs.readFileSync(statusFile)) : {};
  status[order.table] = "Bestellt";
  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
  res.sendStatus(200);
});

// Status abrufen
app.get('/status/:table', (req, res) => {
  const status = fs.existsSync(statusFile) ? JSON.parse(fs.readFileSync(statusFile)) : {};
  res.json({ status: status[req.params.table] || "Unbekannt" });
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
