const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const ordersFile = path.join(__dirname, 'orders.json');
const menuFile = path.join(__dirname, 'menu.json');

// Bestellungen abrufen
app.get('/orders.json', (req, res) => {
  if (!fs.existsSync(ordersFile)) return res.json([]);
  res.json(JSON.parse(fs.readFileSync(ordersFile)));
});

// Bestellungen speichern (nach Abschluss oder Statusänderung)
app.post('/orders.json', (req, res) => {
  fs.writeFileSync(ordersFile, JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// Menü abrufen
app.get('/menu.json', (req, res) => {
  if (!fs.existsSync(menuFile)) return res.json({ speisen: [], getraenke: [] });
  res.json(JSON.parse(fs.readFileSync(menuFile)));
});

// Menü speichern (von Küche)
app.post('/menu.json', (req, res) => {
  fs.writeFileSync(menuFile, JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`🍽️ Server läuft auf http://localhost:${port}`);
});
