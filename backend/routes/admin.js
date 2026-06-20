import express from 'express';
import { query } from '../db/connection.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin dashboard)
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, email, name, role, created_at FROM users'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Get reflection statistics
router.get('/reflections/stats', isAdmin, async (req, res) => {
  try {
    const stats = await query(
      `SELECT d.id, d.name, COUNT(r.id) as reflection_count, AVG(r.rating) as avg_rating 
       FROM dishes d 
       LEFT JOIN reflection_logs r ON d.id = r.dish_id 
       GROUP BY d.id, d.name`
    );
    res.json(stats);
  } catch (error) {
    console.error('Get reflection stats error:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

// Create recipe for a dish (admin)
router.post('/recipes', isAdmin, async (req, res) => {
  try {
    const { dish_id, ingredients_json, instructions, techniques_used, allergens, dietary_info, nutrition_info } = req.body;

    if (!dish_id || !instructions) {
      return res.status(400).json({ error: 'Dish ID and instructions are required' });
    }

    const result = await query(
      'INSERT INTO recipes (dish_id, ingredients_json, instructions, techniques_used, allergens, dietary_info, nutrition_info) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [dish_id, JSON.stringify(ingredients_json), instructions, JSON.stringify(techniques_used), 
       JSON.stringify(allergens), JSON.stringify(dietary_info), JSON.stringify(nutrition_info)]
    );

    res.status(201).json({
      message: 'Recipe created successfully',
      recipeId: result.insertId
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ error: 'Error creating recipe' });
  }
});

// Update recipe
router.put('/recipes/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { ingredients_json, instructions, techniques_used, allergens, dietary_info, nutrition_info } = req.body;

    await query(
      'UPDATE recipes SET ingredients_json = ?, instructions = ?, techniques_used = ?, allergens = ?, dietary_info = ?, nutrition_info = ? WHERE id = ?',
      [JSON.stringify(ingredients_json), instructions, JSON.stringify(techniques_used), 
       JSON.stringify(allergens), JSON.stringify(dietary_info), JSON.stringify(nutrition_info), id]
    );

    res.json({ message: 'Recipe updated successfully' });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ error: 'Error updating recipe' });
  }
});

// Manage techniques (CRUD)
router.get('/techniques', isAdmin, async (req, res) => {
  try {
    const techniques = await query('SELECT id, name, description, video_url, image_url, difficulty FROM techniques');
    res.json(techniques);
  } catch (error) {
    console.error('Get techniques error:', error);
    res.status(500).json({ error: 'Error fetching techniques' });
  }
});

router.post('/techniques', isAdmin, async (req, res) => {
  try {
    const { name, description, video_url, image_url, difficulty } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Technique name is required' });
    }

    const result = await query(
      'INSERT INTO techniques (name, description, video_url, image_url, difficulty) VALUES (?, ?, ?, ?, ?)',
      [name, description, video_url, image_url, difficulty]
    );

    res.status(201).json({
      message: 'Technique created successfully',
      techniqueId: result.insertId
    });
  } catch (error) {
    console.error('Create technique error:', error);
    res.status(500).json({ error: 'Error creating technique' });
  }
});

router.put('/techniques/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, video_url, image_url, difficulty } = req.body;

    await query(
      'UPDATE techniques SET name = ?, description = ?, video_url = ?, image_url = ?, difficulty = ? WHERE id = ?',
      [name, description, video_url, image_url, difficulty, id]
    );

    res.json({ message: 'Technique updated successfully' });
  } catch (error) {
    console.error('Update technique error:', error);
    res.status(500).json({ error: 'Error updating technique' });
  }
});

router.delete('/techniques/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM techniques WHERE id = ?', [id]);

    res.json({ message: 'Technique deleted successfully' });
  } catch (error) {
    console.error('Delete technique error:', error);
    res.status(500).json({ error: 'Error deleting technique' });
  }
});

export default router;

