# 🧾 b-sobeiz Bestellsystem

Ein simples Bestell- und Küchensystem für Feste. Gäste bestellen Essen & Getränke direkt über das Smartphone. Die Küche sieht alles live und verwaltet Bestellungen.

---

## ✅ Funktionen

- Gäste wählen Speisen & Getränke + Menge
- Gesamtsumme wird automatisch berechnet
- Tischnummer wird eingegeben
- Live-Status sichtbar (Bestellt, In Bearbeitung, Abholbereit, Bezahlt)
- Küche sieht alle Bestellungen inkl. Tischnummer & Zeit
- Offene Bestellungen nach Menü gezählt (z. B. 3× „Pommes“)
- Küche kann Status ändern oder Bestellungen abschließen
- Menü kann einfach in `menu.json` geändert werden

---

## 🗂️ Dateien
📁 Projektordner/
├── index.html        → Gästeansicht
├── kitchen.html      → Küche (Bestellungen & Verwaltung)
├── script.js         → Logik Gäste
├── kitchen.js        → Logik Küche
├── styles.css        → Design
├── menu.json         → Speisen & Getränke
├── server.js         → Node.js Backend
└── orders.json       → wird automatisch erstellt
---

## ▶️ Starten

1. Node.js installieren
2. Projekt entpacken
3. Terminal öffnen:

```bash
node server.js
http://localhost:3000
