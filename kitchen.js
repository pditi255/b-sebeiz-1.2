async function loadOrders() {
  const res = await fetch("/orders");
  const data = await res.json();

  const grouped = {};
  const summary = {};
  data.forEach(order => {
    if (!grouped[order.table]) grouped[order.table] = [];
    grouped[order.table].push(order);
    order.items.forEach(item => {
      summary[item] = (summary[item] || 0) + 1;
    });
  });

  const summaryDiv = document.getElementById("summary");
  summaryDiv.innerHTML = "<h3>Offene Artikel</h3>";
  Object.keys(summary).forEach(name => {
    summaryDiv.innerHTML += `<div>${name}: ${summary[name]}</div>`;
  });

  const ordersDiv = document.getElementById("orders");
  ordersDiv.innerHTML = "<h3>Offene Bestellungen</h3>";
  Object.entries(grouped).forEach(([table, orders]) => {
    const el = document.createElement("div");
    const allItems = orders.flatMap(o => o.items).join(", ");
    el.innerHTML = `
      <strong>Tisch ${table}</strong><br>
      ${allItems}<br>
      <button onclick="updateStatus(${table}, 'Bezahlt')">Bezahlt</button>
      <button onclick="updateStatus(${table}, 'In Bearbeitung')">In Bearbeitung</button>
      <button onclick="updateStatus(${table}, 'Abholbereit')">Abholbereit</button>
      <button onclick="clearTable(${table})">Abgeschlossen</button><hr>`;
    ordersDiv.appendChild(el);
  });
}

async function updateStatus(table, status) {
  await fetch(`/status/${table}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
}

async function clearTable(table) {
  await fetch(`/clear/${table}`, { method: "POST" });
}

async function toggleSettings() {
  const box = document.getElementById("settings");
  box.style.display = box.style.display === "none" ? "block" : "none";

  const res = await fetch("/menu.json");
  const data = await res.text();
  document.getElementById("menuEditor").value = data;
}

async function saveMenu() {
  const content = document.getElementById("menuEditor").value;
  await fetch("/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: content
  });
}

setInterval(loadOrders, 5000);
