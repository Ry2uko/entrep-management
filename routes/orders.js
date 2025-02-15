const db = require('../db')
const router = require('express').Router();

router.get('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const stmt = db.prepare('SELECT * FROM OrderTable WHERE id = ?');
    const order = stmt.get(id);

    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order with that id.' });
  }
});

router.route('/')
  .get((req, res) => {
    try {
      const orders = db.prepare('SELECT  * FROM OrderTable').all();
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch orders.'});
    }
  })
  .post(validateData, (req, res) => {
    res.status(201).send('Created!');
  });

function validateData(req, res, next) {

}

module.exports = router