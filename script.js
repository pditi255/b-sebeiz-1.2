let menu = [];
let order = {};
let currentStatus = "Bestellt";

async function loadMenu() {
  const res = await fetch('menu.json');
  menu = await res.json();

  const container = document.getElementById('menu-container');
  container.innerHTML = '';

  for (let item of menu) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'menu-item';
    
    itemDiv.innerHTML = `
      <span>${item.name} (${item.price} CHF)</span>
      <input type="number" min="0" max="10" value="0" onchange="updateOrder('${item.name}', ${item.price}, this.value)">
    `;

    container.appendChild(itemDiv);
  }
}

function updateOrder(name, price, quantity) {
  if (quantity > 0) {
    order[name] = { quantity: parseInt(quantity), price: price };
  } else {
    delete order[name];
  }

  displaySummary();
}

function displaySummary() {
  const summary = document.getElementById('summary');
  summary.innerHTML = '';

  let total = 0;
  for (let [name, info] of Object.entries(order)) {
    const line = document.createElement('p');
    line.textContent = `${info.quantity}x ${name} – ${info.price * info.quantity} CHF`;
    summary.appendChild(line);
    total += info.price * info.quantity;
  }

  if (total > 0) {
    const totalLine = document.createElement('p');
    totalLine.innerHTML = `<strong>Gesamt: ${total.toFixed(2)} CHF</strong>`;
    summary.appendChild(totalLine);
  }
}

async function submitOrder() {
  const table = document.getElementById('table').value;
  if (!table || Object.keys(order).length === 0) {
    alert("Bitte Tischnummer eingeben und mindestens 1 Produkt wählen.");
    return;
  }

  const items = [];
  for (let [name, info] of Object.entries(order)) {
    items.push(`${info.quantity}x ${name}`);
  }

  await fetch('/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, items })
  });

  currentStatus = "Bestellt";
  updateStatusDisplay();
}

function updateStatusDisplay() {
  const statusLine = document.getElementById('statusDisplay');
  const steps = ["Bestellt", "Bezahlt", "In Bearbeitung", "Abholbereit"];

  statusLine.innerHTML = steps.map(s => {
    if (s === currentStatus) return `<span class="active">${s}</span>`;
    if (steps.indexOf(s) < steps.indexOf(currentStatus)) return `<span class="done">${s}</span>`;
    return `<span>${s}</span>`;
  }).join(" ➔ ");
}

async function checkStatusLive() {
  const res = await fetch('/orders');
  const data = await res.json();
  const table = document.getElementById('table').value;

  if (!table) return;

  const latest = data.reverse().find(o => o.table == table);
  if (latest && latest.status) {
    currentStatus = latest.status;
    updateStatusDisplay();
  }
}

setInterval(checkStatusLive, 5000);
loadMenu();
