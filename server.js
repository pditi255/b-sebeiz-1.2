const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const ordersFile = path.join(__dirname, 'orders.json');
const menuFile = path.join(__dirname, 'menu.json');

// Neue Bestellung empfangen
app.post('/order', (req, res) => {
  const { table, items } = req.body;
  if (!table || !items || items.length === 0) return res.status(400).send('Fehlende Daten');

  const orders = fs.existsSync(ordersFile) ? JSON.parse(fs.readFileSync(ordersFile)) : [];
  const newOrder = {
    table,
    items,
    status: 'Bestellt',
    timestamp: Date.now()
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

// Bestellung aktualisieren (Status ändern)
app.post('/update', (req, res) => {
  const { index, status } = req.body;
  if (index === undefined || !status) return res.status(400).send('Fehlende Daten');

  const orders = JSON.parse(fs.readFileSync(ordersFile));
  if (!orders[index]) return res.status(404).send('Nicht gefunden');

  orders[index].status = status;
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Bestellung löschen (z.B. abgeschlossen)
app.post('/delete', (req, res) => {
  const { index } = req.body;
  if (index === undefined) return res.status(400).send('Index fehlt');

  const orders = JSON.parse(fs.readFileSync(ordersFile));
  orders.splice(index, 1);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Menü abrufen
app.get('/menu.json', (req, res) => {
  const menu = fs.existsSync(menuFile) ? JSON.parse(fs.readFileSync(menuFile)) : [];
  res.json(menu);
});

// Menü speichern (Küche -> Änderungen)
app.post('/menu', (req, res) => {
  const menu = req.body;
  fs.writeFileSync(menuFile, JSON.stringify(menu, null, 2));
  res.sendStatus(200);
});

// Mengenstatistik liefern (für Küche)
app.get('/overview', (req, res) => {
  const orders = fs.existsSync(ordersFile) ? JSON.parse(fs.readFileSync(ordersFile)) : [];
  const summary = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      summary[item] = (summary[item] || 0) + 1;
    });
  });
  res.json(summary);
});

app.listen(port, () => {
  console.log(`🍽 Server läuft auf Port ${port}`);
});
