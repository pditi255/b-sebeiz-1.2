let correctCode = "885700";

async function checkCode() {
  const input = document.getElementById("code").value;
  if (input === correctCode) {
    document.getElementById("login").style.display = "none";
    document.getElementById("kitchen-panel").style.display = "block";
    loadOrders();
    setInterval(loadOrders, 5000);
  } else {
    alert("Falscher Code");
  }
}

async function loadOrders() {
  const res = await fetch('/orders');
  const data = await res.json();
  const container = document.getElementById("orders");
  container.innerHTML = '';

  const summary = {};

  data
    .filter(order => order.status !== "Erledigt")
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .forEach((order, index) => {
      const div = document.createElement("div");
      div.className = "order-block";
      div.innerHTML = `
        <strong>Tisch: ${order.table}</strong><br>
        ${Object.entries(order.items).map(([name, qty]) => {
          if (!summary[name]) summary[name] = 0;
          summary[name] += qty;
          return `${qty} × ${name}`;
        }).join('<br>')}
        <br>Status: <strong>${order.status}</strong><br>
        <button onclick="changeStatus(${index})">↪️ Status weiter</button>
        <button onclick="markDone(${index})">✅ Erledigt</button>
      `;
      container.appendChild(div);
    });

  // Zeige Zusammenfassung
  const summaryDiv = document.getElementById("summary");
  summaryDiv.innerHTML = Object.entries(summary)
    .map(([name, qty]) => `${qty} × ${name}`)
    .join('<br>');
}

async function changeStatus(index) {
  await fetch(`/update-status/${index}`, { method: 'POST' });
  loadOrders();
}

async function markDone(index) {
  await fetch(`/mark-done/${index}`, { method: 'POST' });
  loadOrders();
}

function openMenuEditor() {
  fetch('/menu.json')
    .then(res => res.json())
    .then(menu => {
      document.getElementById("menu-editor-area").value = JSON.stringify(menu, null, 2);
      document.getElementById("menu-editor").style.display = "block";
    });
}

function closeMenuEditor() {
  document.getElementById("menu-editor").style.display = "none";
}

function saveMenu() {
  const newMenu = document.getElementById("menu-editor-area").value;
  fetch('/update-menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: newMenu
  }).then(() => {
    alert("Menü gespeichert");
    closeMenuEditor();
  });
}
