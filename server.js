const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Dateipfade
const ordersFile = path.join(__dirname, 'orders.json');
const menuFile = path.join(__dirname, 'menu.json');

// Menü abrufen
app.get('/menu', (req, res) => {
  if (fs.existsSync(menuFile)) {
    const menu = JSON.parse(fs.readFileSync(menuFile));
    res.json(menu);
  } else {
    res.status(404).send('Kein Menü gefunden');
  }
});

// Menü speichern (Küchen-Login-Code: 885700)
app.post('/menu', (req, res) => {
  const code = req.body.code;
  if (code !== '885700') return res.status(401).send('Zugriff verweigert');
  fs.writeFileSync(menuFile, JSON.stringify(req.body.menu, null, 2));
  res.sendStatus(200);
});

// Neue Bestellung
app.post('/order', (req, res) => {
  const data = req.body;
  if (!data || !data.bestellung || !data.tisch) {
    return res.status(400).send('Ungültige Bestellung');
  }

  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }

  orders.push({
    id: Date.now(),
    bestellung: data.bestellung,
    tisch: data.tisch,
    status: 'bestellt',
    bezahlt: false,
    zeit: new Date().toISOString()
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

// Status ändern
app.post('/status', (req, res) => {
  const { id, status, bezahlt } = req.body;
  if (!fs.existsSync(ordersFile)) return res.status(404).send('Keine Bestellungen');

  let orders = JSON.parse(fs.readFileSync(ordersFile));
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return res.status(404).send('Bestellung nicht gefunden');

  if (status) orders[index].status = status;
  if (bezahlt !== undefined) orders[index].bezahlt = bezahlt;

  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

// Bestellung abschließen
app.post('/delete', (req, res) => {
  const id = req.body.id;
  if (!fs.existsSync(ordersFile)) return res.status(404).send('Keine Bestellungen');

  let orders = JSON.parse(fs.readFileSync(ordersFile));
  orders = orders.filter(order => order.id !== id);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
