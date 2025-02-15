'use strict';

const orderRouter = require('./routes/orders');
const menuRouter = require('./routes/menu');

require('dotenv').config()
const express = require('express');
const cors = require('cors'); 
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/order', (req, res) => {

});

app.get('/manage', (req, res) => {

});

app.get('/menu', (req, res) => {

});

app.get('/stats', (req, res) => {

});

app.use(['/api/orders', '/api/order'], orderRouter);
app.use('/api/menus', menuRouter);

app.use((req, res) => {
  return res.status(404).json({ error: 'Not Found.' });
})

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});

/* TODO CHECKLIST */
// ALL WILL RETURN AN ARRAY except for _id parameters
// TODO: GET and POST - /orders
  // TODO: /orders?menu_id=<ID>
  // TODO: /orders?id=<ID>
// TODO: GET - /menu