require('dotenv').config();

const app = require('./app');

const PUERTO = 3011;
const HOST = '127.0.0.1';

app.listen(PUERTO, HOST, () => {
  console.log(`Microservicio ms-eventos escuchando en http://${HOST}:${PUERTO}`);
});