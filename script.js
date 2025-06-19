let menuData = [];
let selectedItems = {};

async function loadMenu() {
  const res = await fetch('/menu.json');
  menuData = await res.json();
  renderMenu();
}

function renderMenu() {
  const foodDiv = document.getElementById('food-menu');
  const drinkDiv = document.getElementById('drink-menu');
  foodDiv.innerHTML = '';
  drinkDiv.innerHTML = '';
  selectedItems = {};

  menuData.forEach((item, index) => {
    const container = item.category === 'drink' ? drinkDiv : foodDiv;
    const row = document.createElement('div');
    row.className = 'menu-item';
    row.innerHTML = `
      <label>${item.name} – CHF ${item.price.toFixed(2)}</label>
      <input type="number" min="0" max="10" value="0" onchange="updateCount(${index}, this.value)">
    `;
    container.appendChild(row);
    selectedItems[index] = 0;
  });
  updateTotal();
}

function updateCount(index, value) {
  selectedItems[index] = parseInt(value) || 0;
  updateTotal();
}

function updateTotal() {
  let total = 0;
  Object.entries(selectedItems).forEach(([index, count]) => {
    const item = menuData[index];
    total += item.price * count;
  });
  document.getElementById('total-price').innerText = `Gesamt: CHF ${total.toFixed(2)}`;
}

async function submitOrder() {
  const table = document.getElementById('table').value.trim();
  if (!table) return alert("Bitte Tischnummer eingeben!");

  const items = [];
  Object.entries(selectedItems).forEach(([index, count]) => {
    if (count > 0) {
      items.push({ ...menuData[index], quantity: count });
    }
  });
  if (items.length === 0) return alert("Bitte mindestens ein Produkt auswählen!");

  const res = await fetch('/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, items })
  });

  if (res.ok) {
    document.body.innerHTML = `
      <h2>Vielen Dank für Ihre Bestellung!</h2>
      <p>Status: <span id="order-status">Bestellt</span></p>
      <script>
        const table = "${table}";
        function checkStatus() {
          fetch('/status/' + table)
            .then(res => res.json())
            .then(data => {
              document.getElementById('order-status').innerText = data.status || 'Unbekannt';
            });
        }
        checkStatus();
        setInterval(checkStatus, 5000);
      </script>
    `;
  }
}

loadMenu();
