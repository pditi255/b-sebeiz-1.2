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
  const { table, items } = req.body;
  if (!table || !Array.isArray(items)) {
    return res.status(400).send('Ungültige Bestellung');
  }

  let orders = [];

  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }

  const timestamp = new Date().toLocaleTimeString('de-CH', { hour12: false });

  items.forEach(item => {
    orders.push({
      table,
      item,
      status: 'Bestellt',
      time: timestamp
    });
  });

  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Status für bestimmte Tischnummer abrufen
app.get('/status/:table', (req, res) => {
  const table = parseInt(req.params.table);
  if (isNaN(table)) return res.status(400).send({ status: "-" });

  if (!fs.existsSync(ordersFile)) return res.json({ status: "-" });

  const orders = JSON.parse(fs.readFileSync(ordersFile));
  const tableOrders = orders.filter(o => o.table === table);

  const last = tableOrders.reverse().find(o => o.status);
  res.json({ status: last ? last.status : "-" });
});

// Menü abrufen
app.get('/menu.json', (req, res) => {
  const menuPath = path.join(__dirname, 'menu.json');
  if (fs.existsSync(menuPath)) {
    res.sendFile(menuPath);
  } else {
    res.status(404).send("Menu nicht gefunden");
  }
});

// Bestellung als abgeschlossen markieren
app.post('/status/:table/:status', (req, res) => {
  const table = parseInt(req.params.table);
  const status = req.params.status;

  if (!fs.existsSync(ordersFile)) return res.sendStatus(404);

  let orders = JSON.parse(fs.readFileSync(ordersFile));
  orders = orders.map(o => {
    if (o.table === table) {
      o.status = status;
    }
    return o;
  });

  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
