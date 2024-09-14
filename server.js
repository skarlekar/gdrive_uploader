const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/config', (req, res) => {
  res.json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});