const express = require('express');
const path = require('path');

const app = express();

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})