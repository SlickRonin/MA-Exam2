import * as SQLite from 'expo-sqlite';

// Create the database connection
const db = SQLite.openDatabaseSync('recipes.db');

// Initialize the database tables
export const initDatabase = async () => {
  try {
    // Create recipes table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        cuisine_type TEXT,
        cooking_time INTEGER
      );
    `);
    console.log('Recipes table created successfully');

    // Create ingredients table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER,
        item TEXT NOT NULL,
        quantity TEXT,
        unit TEXT,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
      );
    `);
    console.log('Ingredients table created successfully');

    // Create steps table for cooking instructions
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER,
        step_number INTEGER,
        instruction TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
      );
    `);
    console.log('Steps table created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Recipe CRUD operations
export const saveRecipe = async (recipe, ingredients, steps) => {
  try {
    // Insert recipe
    const result = await db.runAsync(
      `INSERT INTO recipes (name, description, cuisine_type, cooking_time) 
       VALUES (?, ?, ?, ?);`,
      [
        recipe.name,
        recipe.description || '',
        recipe.cuisine_type || '',
        recipe.cooking_time || 0,
        ''
      ]
    );
    
    const recipeId = result.lastInsertRowId;
    console.log('Recipe saved with ID:', recipeId);
    
    // Insert ingredients
    for (const ingredient of ingredients) {
      await db.runAsync(
        `INSERT INTO ingredients (recipe_id, item, quantity, unit) 
         VALUES (?, ?, ?, ?);`,
        [
          recipeId,
          ingredient.item,
          ingredient.quantity || '',
          ingredient.unit || ''
        ]
      );
    }
    
    // Insert steps
    for (const step of steps) {
      await db.runAsync(
        `INSERT INTO steps (recipe_id, step_number, instruction) 
         VALUES (?, ?, ?);`,
        [
          recipeId,
          step.step_number,
          step.instruction
        ]
      );
    }
    
    return recipeId;
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
};

export const getRecipes = async (searchTerm = '') => {
  try {
    let query = 'SELECT * FROM recipes';
    let params = [];
    
    if (searchTerm) {
      query += ' WHERE name LIKE ? OR cuisine_type LIKE ?';
      params = [`%${searchTerm}%`, `%${searchTerm}%`];
    }
    
    const result = await db.getAllAsync(query, params);
    return result;
  } catch (error) {
    console.error('Error retrieving recipes:', error);
    throw error;
  }
};

export const getRecipeById = async (id) => {
  try {
    // Get the recipe
    const recipes = await db.getAllAsync(
      'SELECT * FROM recipes WHERE id = ?;',
      [id]
    );
    
    if (recipes.length === 0) {
      return null;
    }
    
    const recipe = recipes[0];
    
    // Get ingredients for this recipe
    const ingredients = await db.getAllAsync(
      'SELECT * FROM ingredients WHERE recipe_id = ?;',
      [id]
    );
    
    // Get steps for this recipe
    const steps = await db.getAllAsync(
      'SELECT * FROM steps WHERE recipe_id = ? ORDER BY step_number;',
      [id]
    );
    
    // Combine all data
    return {
      ...recipe,
      ingredients,
      steps
    };
  } catch (error) {
    console.error('Error retrieving recipe:', error);
    throw error;
  }
};

export const updateRecipe = async (recipe, ingredients, steps) => {
  try {
    // Update recipe table
    await db.runAsync(
      `UPDATE recipes 
       SET name = ?, description = ?, cuisine_type = ?, cooking_time = ?, image_uri = ? 
       WHERE id = ?;`,
      [
        recipe.name,
        recipe.description || '',
        recipe.cuisine_type || '',
        recipe.cooking_time || 0,
        recipe.image_uri || '',
        recipe.id
      ]
    );
    
    // Delete existing ingredients and steps to replace with new ones
    await db.runAsync('DELETE FROM ingredients WHERE recipe_id = ?;', [recipe.id]);
    await db.runAsync('DELETE FROM steps WHERE recipe_id = ?;', [recipe.id]);
    
    // Insert new ingredients
    for (const ingredient of ingredients) {
      await db.runAsync(
        `INSERT INTO ingredients (recipe_id, item, quantity, unit) 
         VALUES (?, ?, ?, ?);`,
        [
          recipe.id,
          ingredient.item,
          ingredient.quantity || '',
          ingredient.unit || ''
        ]
      );
    }
    
    // Insert new steps
    for (const step of steps) {
      await db.runAsync(
        `INSERT INTO steps (recipe_id, step_number, instruction) 
         VALUES (?, ?, ?);`,
        [
          recipe.id,
          step.step_number,
          step.instruction
        ]
      );
    }
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

export const deleteRecipe = async (id) => {
  try {
    await db.runAsync('DELETE FROM recipes WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

export { db };