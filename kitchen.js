async function loadKitchen() {
  const res = await fetch("/orders.json");
  const orders = await res.json();

  const menuCounts = {};
  const ordersContainer = document.getElementById("orders");
  const summaryContainer = document.getElementById("summary");

  ordersContainer.innerHTML = "";
  summaryContainer.innerHTML = "";

  // Berechne Anzahl pro Menü
  orders.forEach(order => {
    if (order.status !== "Erledigt") {
      order.items.forEach(item => {
        menuCounts[item] = (menuCounts[item] || 0) + 1;
      });
    }
  });

  // Zeige Menüübersicht
  if (Object.keys(menuCounts).length > 0) {
    const ul = document.createElement("ul");
    for (const item in menuCounts) {
      const li = document.createElement("li");
      li.textContent = `${item}: ${menuCounts[item]}x`;
      ul.appendChild(li);
    }
    summaryContainer.appendChild(ul);
  } else {
    summaryContainer.textContent = "Keine offenen Bestellungen.";
  }

  // Zeige einzelne Bestellungen
  orders
    .filter(order => order.status !== "Erledigt")
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .forEach(order => {
      const div = document.createElement("div");
      div.className = "order-box";

      const table = document.createElement("h4");
      table.innerHTML = `🪑 Tisch ${order.table}`;
      div.appendChild(table);

      const ul = document.createElement("ul");
      order.items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      div.appendChild(ul);

      const time = document.createElement("p");
      const date = new Date(order.timestamp);
      time.innerHTML = `⏰ ${date.toLocaleTimeString()}`;
      div.appendChild(time);

      // Dropdown zur Statusauswahl
      const select = document.createElement("select");
      ["Bestellt", "In Bearbeitung", "Abholbereit", "Bezahlt", "Erledigt"].forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        if (order.status === status) option.selected = true;
        select.appendChild(option);
      });

      select.addEventListener("change", async () => {
        await fetch(`/status/${order.table}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: select.value })
        });
        loadKitchen();
      });

      div.appendChild(select);
      ordersContainer.appendChild(div);
    });
}

setInterval(loadKitchen, 4000);
loadKitchen();
