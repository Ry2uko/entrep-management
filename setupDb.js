const Database = require('better-sqlite3');
const db = new Database('orders.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS MenuTable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS MenuItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_available INTEGER DEFAULT 1,
    menu_id INTEGER NOT NULL,
    FOREIGN KEY (menu_id) REFERENCES MenuTable (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS OrderTable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    order_completed_date DATETIME,
    status TEXT DEFAULT 'PENDING',
    total_price DECIMAL(10,2) DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS OrderItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) DEFAULT 0,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES OrderTable (id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES MenuItem (id) ON DELETE SET NULL
  );
`);

// Pre-populate data
const insertMenu = db.prepare('INSERT INTO MenuTable (name) VALUES (?)');
const insertMenuItem = db.prepare('INSERT INTO MenuItem (name, price, menu_id) VALUES (?, ?, ?)');
const getMenuId = db.prepare('SELECT id FROM MenuTable where name = ?');

const menus = ['Meals', 'Dessert', 'Drinks (16oz)', 'Combo Meals', 'Add-ons'];

const menuIds = {};
menus.forEach(menu => {
  insertMenu.run(menu);
  const row = getMenuId.get(menu);
  menuIds[menu] = row.id;
}); 

const menuItems = [
  { name: 'Inasal Bites w/ Java Rice', price: 73, menu_name: 'Meals' },
  { name: 'Pork Sisig w/ Java Rice', price: 89, menu_name: 'Meals' },
  { name: 'Graham de Letching', price: 25, menu_name: 'Dessert' },
  { name: 'Pineapple Juice', price: 15, menu_name: 'Drinks (16oz)' },
  { name: 'Iced Tea', price: 15, menu_name: 'Drinks (16oz)' },
  { name: 'Inasal Bites w/ Java Rice, Sinigang Soup, Chicken Oil & Drinks', price: 83, menu_name: 'Combo Meals' },
  { name: 'Pork Sisig w/ Java Rice & Drinks', price: 99, menu_name: 'Combo Meals' },
  { name: 'Java Rice', price: 20, menu_name: 'Add-ons' },
  { name: 'Chicken Oil', price: 10, menu_name: 'Add-ons' },
  { name: 'Sinigang Soup', price: 10, menu_name: 'Add-ons' },
];

menuItems.forEach(item => {
  const menu_id = menuIds[item.menu_name];
  if (menu_id) {
    insertMenuItem.run(item.name, item.price, menu_id);
  } else {
    console.error(`Error: "${item.menu_name}" not found.`);
  }
});
console.log('Database created successfully!');
db.close();