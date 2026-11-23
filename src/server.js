require('dotenv').config();

const app = require('./app');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3011);

app.listen(PORT, HOST, () => {
  console.log(`ms-eventos escuchando en http://${HOST}:${PORT}`);
});