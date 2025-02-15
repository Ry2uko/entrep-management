const db = require('../db');
const router = require('express').Router();

router.get('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const menuStmt = db.prepare('SELECT * FROM MenuTable WHERE id = ?');
    const menu = menuStmt.get(id);

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found.' });
    }

    // Add menu items
    const itemsStmt = db.prepare('SELECT * FROM MenuItem WHERE menu_id = ?');
    const items = itemsStmt.all(id);

    menu.items = items;
    res.status(200).json(menu);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu with that id.' });
  }
});

router.get('/', (req, res) => {
  try {
    const menus = db.prepare('SELECT * FROM MenuTable').all();

    // Fetch all items and group by menu_id
    const itemsStmt = db.prepare('SELECT * FROM MenuItem');
    const items = itemsStmt.all();

    const menuItemsMap = {};
    items.forEach(item => {
      if (!menuItemsMap[item.menu_id]) {
        menuItemsMap[item.menu_id] = [];
      }

      menuItemsMap[item.menu_id].push(item);
    });

    // Add menu items 
    menus.forEach(menu => {
      menu.items = menuItemsMap[menu.id];
    });
    console.log(menus);
    res.status(200).json(menus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menus.' });
  }
});

module.exports = router;

