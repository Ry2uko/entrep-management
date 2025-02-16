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
  res.sendFile(path.join(__dirname, 'views/order.html'));
});

app.get('/manage', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/manage.html'));
});

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/menu.html'));
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

/*
TODO: 
- menu static render
- fix styling on new order
- much more efficient image loading in new order
- quantity set feature - new order
- detailed view - manage orders
- manage orders styling upgrade
- search - manage orders
- fix styling menu page
- stats page
- proper deployment
*/