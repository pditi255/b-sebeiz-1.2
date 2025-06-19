const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// ❗️Hier wird das aktuelle Verzeichnis als statischer Ordner verwendet
app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
