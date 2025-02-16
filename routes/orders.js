const db = require('../db')
const router = require('express').Router();

router.put('/:id/complete', (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const stmt = db.prepare('UPDATE OrderTable SET status = ?, order_completed_date = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run('COMPLETED', id);

    if (result.changes === 0) return res.status(404).json({ error: 'Order not found.' });
    res.status(200).json({ message: 'Order marked as completed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete order.' });
  }
});

router.route('/:id')
  .get((req, res) => {
    try {
      const id = req.params.id;
      const stmt = db.prepare('SELECT * FROM OrderTable WHERE id = ?');
      const order = stmt.get(id);

      if (!order) return res.status(404).json({ error: 'Order not found.' });
      res.status(200).json(order);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch order with that id.' });
    }
  })
  .delete((req, res) => {
    try {
      const id = req.params.id;
      const stmt = db.prepare('DELETE FROM OrderTable WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) return res.status(404).json({ error: 'Order not found.' });
      res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete order.' });
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
    try {
      const { customer_name, items, total_cost } = req.body;

      const orderStmt = db.prepare('INSERT INTO OrderTable (customer_name, total_price) VALUES (?, ?)');
      const result = orderStmt.run(customer_name, total_cost);
      const orderId = result.lastInsertRowid;

      const orderItemStmt = db.prepare('INSERT INTO OrderItem (quantity, price, subtotal, order_id, menu_item_id) VALUES (?, ?, ?, ?, ?)');

      items.forEach(item => {
        const subtotal = item.price * item.quantity;
        orderItemStmt.run(item.quantity, item.price, subtotal, orderId, item.id);
      });

      res.status(201).json({ message: 'Order created successfully!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create order.' });
    }
  });

function validateData(req, res, next) {
  const { customer_name, items } = req.body;
  
  if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid request data.' });
  }

  const invalidItem = items.find(item => !item.id || !item.price || !item.quantity);
  if (invalidItem) {
      return res.status(400).json({ error: 'Invalid item data.' });
  }

  next();
}

module.exports = router