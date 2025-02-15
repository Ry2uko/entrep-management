const Database = require('better-sqlite3');
const db = new Database('orders.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS MenuTable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS MenuItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
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
const insertMenu = db.prepare('INSERT INTO MenuTable (name, description) VALUES (?, ?)');
const insertMenuItem = db.prepare('INSERT INTO MenuItem (name, description, price, menu_id) VALUES (?, ?, ?, ?)');
const getMenuId = db.prepare('SELECT id FROM MenuTable where name = ?');

const menus = [
  { name: 'Menu A', description: 'Main Menu' },
  { name: 'Menu B', description: 'Drinks and Dessert' },
  { name: 'Menu C', description: 'Combo Meals' },
];

const menuIds = {};
menus.forEach(menu => {
  insertMenu.run(menu.name, menu.description);
  const row = getMenuId.get(menu.name);
  menuIds[menu.name] = row.id;
}); 

const menuItems = [
  {
    name: 'Chicken Katsu',
    description: '',
    price: 83,
    menu_name: 'Menu A',
  },
  {
    name: 'Fish Fillet',
    description: '',
    price: 73,
    menu_name: 'Menu A',
  },
  {
    name: 'Corndog',
    description: '',
    price: 35,
    menu_name: 'Menu A',
  },
  {
    name: 'Sago\'t Gulaman',
    description: '',
    price: 10,
    menu_name: 'Menu B',
  },
  {
    name: 'Snow Cone',
    description: '',
    price: 25,
    menu_name: 'Menu B',
  },
  {
    name: 'Chicken Katsu w/ Drink',
    description: '',
    price: 93,
    menu_name: 'Menu C',
  },
  {
    name: 'Fish Fillet w/ Drink',
    description: '',
    price: 83,
    menu_name: 'Menu C',
  },
  {
    name: 'Corndog w/ Drink',
    description: '',
    price: 45,
    menu_name: 'Menu C',
  },
];

menuItems.forEach(item => {
  const menu_id = menuIds[item.menu_name];
  if (menu_id) {
    insertMenuItem.run(item.name, item.description, item.price, menu_id);
  } else {
    console.error(`Error: "${item.menu_name}" not found.`);
  }
});
console.log('Database created successfully!');
db.close();