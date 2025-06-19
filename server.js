const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

const ordersFile = path.join(__dirname, 'orders.json');
const menuFile = path.join(__dirname, 'menu.json');
let status = {};

app.post("/order", (req, res) => {
  const { table, items } = req.body;
  if (!table || !items) return res.sendStatus(400);

  const orders = fs.existsSync(ordersFile)
    ? JSON.parse(fs.readFileSync(ordersFile))
    : [];

  orders.push({ table, items, time: new Date() });
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  status[table] = "Bestellt";
  res.sendStatus(200);
});

app.get("/orders", (req, res) => {
  const orders = fs.existsSync(ordersFile)
    ? JSON.parse(fs.readFileSync(ordersFile))
    : [];
  res.json(orders);
});

app.post("/status/:table", (req, res) => {
  const { table } = req.params;
  const { status: newStatus } = req.body;
  status[table] = newStatus;
  res.sendStatus(200);
});

app.get("/status/:table", (req, res) => {
  res.json({ status: status[req.params.table] || "Bestellt" });
});

app.post("/clear/:table", (req, res) => {
  if (!fs.existsSync(ordersFile)) return res.sendStatus(200);
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  const remaining = orders.filter(o => o.table != req.params.table);
  fs.writeFileSync(ordersFile, JSON.stringify(remaining, null, 2));
  delete status[req.params.table];
  res.sendStatus(200);
});

app.post("/menu", (req, res) => {
  fs.writeFileSync(menuFile, JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
