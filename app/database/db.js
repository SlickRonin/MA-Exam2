import * as SQLite from 'expo-sqlite';

// Create the database connection
const db = SQLite.openDatabaseSync('inventory.db');

// Initialize the database table
export const initDatabase = async () => {
  try {
    // Create items table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        purchase_date TEXT,
        warranty_expiry TEXT,
        location TEXT,
        notes TEXT
      );
    `);
    console.log('Items table created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Item CRUD operations

// Create a new item
export const saveItem = async (item) => {
  try {
    const result = await db.runAsync(
      `INSERT INTO items (name, category, purchase_date, warranty_expiry, location, notes)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        item.name,
        item.category || '',
        item.purchase_date || '',
        item.warranty_expiry || '',
        item.location || '',
        item.notes || ''
      ]
    );

    const itemId = result.lastInsertRowId;
    console.log('Item saved with ID:', itemId);
    return itemId;
  } catch (error) {
    console.error('Error saving item:', error);
    throw error;
  }
};

// Retrieve items, with optional search filtering on name and category
export const getItems = async (searchTerm = '') => {
  try {
    let query = 'SELECT * FROM items';
    let params = [];

    if (searchTerm) {
      query += ' WHERE name LIKE ? OR category LIKE ?';
      params = [`%${searchTerm}%`, `%${searchTerm}%`];
    }

    const result = await db.getAllAsync(query, params);
    return result;
  } catch (error) {
    console.error('Error retrieving items:', error);
    throw error;
  }
};

// Retrieve a single item by its id
export const getItemById = async (id) => {
  try {
    const items = await db.getAllAsync(
      'SELECT * FROM items WHERE id = ?;',
      [id]
    );

    if (items.length === 0) {
      return null;
    }

    return items[0];
  } catch (error) {
    console.error('Error retrieving item:', error);
    throw error;
  }
};

// Update an existing item
export const updateItem = async (item) => {
  try {
    await db.runAsync(
      `UPDATE items 
       SET name = ?, category = ?, purchase_date = ?, warranty_expiry = ?, location = ?, notes = ?
       WHERE id = ?;`,
      [
        item.name,
        item.category || '',
        item.purchase_date || '',
        item.warranty_expiry || '',
        item.location || '',
        item.notes || '',
        item.id
      ]
    );
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

// Delete an item by id
export const deleteItem = async (id) => {
  try {
    await db.runAsync('DELETE FROM items WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

export { db };
