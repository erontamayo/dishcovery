import express from 'express';
import { query } from '../db/connection.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Get recipe for a dish
router.get('/:dishId', isAuthenticated, async (req, res) => {
  try {
    const { dishId } = req.params;

    const recipes = await query(
      'SELECT id, dish_id, ingredients_json, instructions, techniques_used, allergens, dietary_info, nutrition_info FROM recipes WHERE dish_id = ?',
      [dishId]
    );

    if (recipes.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = recipes[0];
    // Parse JSON fields
    recipe.ingredients = recipe.ingredients_json ? JSON.parse(recipe.ingredients_json) : [];
    recipe.techniques = recipe.techniques_used ? JSON.parse(recipe.techniques_used) : [];
    recipe.allergens = recipe.allergens ? JSON.parse(recipe.allergens) : [];
    recipe.dietary = recipe.dietary_info ? JSON.parse(recipe.dietary_info) : {};
    recipe.nutrition = recipe.nutrition_info ? JSON.parse(recipe.nutrition_info) : {};

    res.json(recipe);
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Error fetching recipe' });
  }
});

// Search recipes by ingredients (pantry search)
router.post('/search/pantry', isAuthenticated, async (req, res) => {
  try {
    const { ingredients } = req.body; // Array of ingredient names

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }

    // This is a simplified search - matches recipes that contain at least one of the ingredients
    const placeholders = ingredients.map(() => '?').join(',');
    
    const recipes = await query(
      `SELECT DISTINCT d.id, d.name, d.description, d.image_url, d.difficulty_level 
       FROM dishes d 
       JOIN recipes r ON d.id = r.dish_id 
       WHERE r.ingredients_json LIKE CONCAT('%', ?, '%')`,
      [ingredients[0]]
    );

    res.json(recipes);
  } catch (error) {
    console.error('Pantry search error:', error);
    res.status(500).json({ error: 'Error searching recipes' });
  }
});

// Filter recipes by allergens
router.get('/filter/allergens', isAuthenticated, async (req, res) => {
  try {
    const { avoid } = req.query; // Comma-separated allergens to avoid

    if (!avoid) {
      return res.status(400).json({ error: 'Allergen parameter required' });
    }

    const allergenList = avoid.split(',');
    const dishes = await query('SELECT id, name, description, image_url, difficulty_level FROM dishes');

    // Filter dishes that don't contain the allergens
    const recipes = await query('SELECT * FROM recipes');

    const filteredDishes = dishes.filter(dish => {
      const recipe = recipes.find(r => r.dish_id === dish.id);
      if (!recipe) return true;

      const allergens = recipe.allergens ? JSON.parse(recipe.allergens) : [];
      return !allergenList.some(allergen => allergens.includes(allergen));
    });

    res.json(filteredDishes);
  } catch (error) {
    console.error('Allergen filter error:', error);
    res.status(500).json({ error: 'Error filtering recipes' });
  }
});

// Filter recipes by dietary preferences
router.get('/filter/dietary', isAuthenticated, async (req, res) => {
  try {
    const { preference } = req.query; // e.g., 'vegetarian', 'vegan', 'glutenfree'

    if (!preference) {
      return res.status(400).json({ error: 'Preference parameter required' });
    }

    const recipes = await query('SELECT * FROM recipe');
    const dishes = await query('SELECT id, name, description, image_url, difficulty_level FROM dishes');

    const filteredDishes = dishes.filter(dish => {
      const recipe = recipes.find(r => r.dish_id === dish.id);
      if (!recipe) return true;

      const dietary = recipe.dietary_info ? JSON.parse(recipe.dietary_info) : {};
      return dietary[preference] === true;
    });

    res.json(filteredDishes);
  } catch (error) {
    console.error('Dietary filter error:', error);
    res.status(500).json({ error: 'Error filtering recipes' });
  }
});

// Get all techniques
router.get('/techniques/list', isAuthenticated, async (req, res) => {
  try {
    const techniques = await query(
      'SELECT id, name, description, video_url, image_url, difficulty FROM techniques'
    );
    res.json(techniques);
  } catch (error) {
    console.error('Get techniques error:', error);
    res.status(500).json({ error: 'Error fetching techniques' });
  }
});

export default router;

