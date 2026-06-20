import express from 'express';
import { query } from '../db/connection.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all dishes (paginated)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const dishes = await query(
      'SELECT id, name, description, image_url, difficulty_level, prep_time, cook_time, servings FROM dishes LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM dishes');
    const total = countResult[0].total;

    res.json({
      data: dishes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get dishes error:', error);
    res.status(500).json({ error: 'Error fetching dishes' });
  }
});

// Get featured/recommended dishes (for dashboard - first 6)
router.get('/featured', isAuthenticated, async (req, res) => {
  try {
    const dishes = await query(
      'SELECT id, name, description, image_url, difficulty_level, prep_time, cook_time, servings FROM dishes LIMIT 6'
    );
    res.json(dishes);
  } catch (error) {
    console.error('Get featured dishes error:', error);
    res.status(500).json({ error: 'Error fetching featured dishes' });
  }
});

// Get single dish with recipe
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const dishes = await query(
      'SELECT id, name, description, image_url, difficulty_level, prep_time, cook_time, servings FROM dishes WHERE id = ?',
      [id]
    );

    if (dishes.length === 0) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    const dish = dishes[0];

    // Get recipe details
    const recipes = await query(
      'SELECT id, ingredients_json, instructions, techniques_used, allergens, dietary_info, nutrition_info FROM recipes WHERE dish_id = ?',
      [id]
    );

    const recipe = recipes.length > 0 ? recipes[0] : null;

    res.json({
      ...dish,
      recipe
    });
  } catch (error) {
    console.error('Get dish error:', error);
    res.status(500).json({ error: 'Error fetching dish details' });
  }
});

// Create new dish (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, description, image_url, difficulty_level, prep_time, cook_time, servings } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const result = await query(
      'INSERT INTO dishes (name, description, image_url, difficulty_level, prep_time, cook_time, servings) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, image_url, difficulty_level || 'beginner', prep_time || 0, cook_time || 0, servings || 2]
    );

    res.status(201).json({
      message: 'Dish created successfully',
      dishId: result.insertId
    });
  } catch (error) {
    console.error('Create dish error:', error);
    res.status(500).json({ error: 'Error creating dish' });
  }
});

// Update dish (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, difficulty_level, prep_time, cook_time, servings } = req.body;

    await query(
      'UPDATE dishes SET name = ?, description = ?, image_url = ?, difficulty_level = ?, prep_time = ?, cook_time = ?, servings = ? WHERE id = ?',
      [name, description, image_url, difficulty_level, prep_time, cook_time, servings, id]
    );

    res.json({ message: 'Dish updated successfully' });
  } catch (error) {
    console.error('Update dish error:', error);
    res.status(500).json({ error: 'Error updating dish' });
  }
});

// Delete dish (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM dishes WHERE id = ?', [id]);

    res.json({ message: 'Dish deleted successfully' });
  } catch (error) {
    console.error('Delete dish error:', error);
    res.status(500).json({ error: 'Error deleting dish' });
  }
});

export default router;

