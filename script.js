let menu = {};
let order = [];
let tableNumber = '';
let orderId = null;
let statusInterval = null;

async function fetchMenu() {
  const res = await fetch('menu.json');
  menu = await res.json();
  renderMenu();
}

function renderMenu() {
  const container = document.getElementById('menu-container');
  container.innerHTML = '';

  const makeSection = (title, items, type) => {
    const section = document.createElement('div');
    section.innerHTML = `<h2>${title}</h2>`;
    items.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'menu-item';

      div.innerHTML = `
        <span>${item.name} (${item.price.toFixed(2)} CHF)</span>
        <input type="number" min="0" value="0" onchange="updateOrder('${type}', ${idx}, this.value)">
      `;

      section.appendChild(div);
    });
    container.appendChild(section);
  };

  makeSection("Speisen", menu.speisen, "speisen");
  makeSection("Getränke", menu.getraenke, "getraenke");
}

function updateOrder(type, index, value) {
  const itemList = menu[type];
  const existing = order.find(o => o.name === itemList[index].name);
  if (existing) {
    existing.qty = parseInt(value);
    if (existing.qty === 0) {
      order = order.filter(o => o.name !== existing.name);
    }
  } else {
    order.push({ name: itemList[index].name, price: itemList[index].price, qty: parseInt(value) });
  }
  updateTotal();
}

function updateTotal() {
  let total = 0;
  order.forEach(o => {
    total += o.price * o.qty;
  });
  document.getElementById('total').innerText = total.toFixed(2);
}

async function submitOrder() {
  tableNumber = document.getElementById('table-number').value;
  if (!tableNumber || order.length === 0) {
    alert("Bitte Tischnummer eingeben und mindestens ein Produkt wählen.");
    return;
  }

  const items = [];
  order.forEach(o => {
    for (let i = 0; i < o.qty; i++) {
      items.push(o.name);
    }
  });

  const res = await fetch('/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table: tableNumber, items })
  });

  if (res.ok) {
    alert("Bestellung gesendet!");
    fetchLastOrder();
  } else {
    alert("Fehler beim Senden.");
  }
}

async function fetchLastOrder() {
  const res = await fetch('/orders');
  const all = await res.json();
  const latest = all.filter(o => o.table == tableNumber).sort((a, b) => b.time.localeCompare(a.time))[0];
  orderId = latest.id;
  showStatus(latest.status);
  if (statusInterval) clearInterval(statusInterval);
  statusInterval = setInterval(() => pollStatus(orderId), 5000);
}

async function pollStatus(id) {
  const res = await fetch('/orders');
  const all = await res.json();
  const match = all.find(o => o.id === id);
  if (match) showStatus(match.status);
}

function showStatus(status) {
  const map = {
    bestellt: '🟦 Bestellung eingegangen',
    bezahlt: '🟩 Bezahlt',
    'in bearbeitung': '🟧 In Bearbeitung',
    abholbereit: '🟨 Abholbereit',
    abgeschlossen: '✅ Abgeschlossen'
  };
  document.getElementById('status-area').innerText = `Status: ${map[status] || status}`;
}

// Start
fetchMenu();
