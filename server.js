const express = require('express');
const path = require('path');

const app = express();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.post('/save/:name', (req, res) => {
  fs = require('fs');
  fs.writeFile(`public/levels/${req.params.name}.json`, JSON.stringify(req.body), function (err) {
    if (err) return res.status(500).json(err);
    res.status(200).json(`Success: '${req.params.name}' saved`);
  });
})

const PORT = process.env.PORT || 4201;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})