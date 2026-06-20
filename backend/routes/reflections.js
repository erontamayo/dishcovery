import express from 'express';
import { query } from '../db/connection.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

/* ======================================================
   GET ALL REFLECTIONS (FOR CURRENT USER)
====================================================== */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    const reflections = await query(
      `SELECT 
        id,
        user_id,
        recipe_title,
        notes,
        rating,
        created_at
       FROM reflection_logs
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(reflections);
  } catch (error) {
    console.error('Get reflections error:', error);
    res.status(500).json({ error: 'Error fetching reflections' });
  }
});

/* ======================================================
   CREATE NEW REFLECTION
====================================================== */
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { recipe_title, notes, rating } = req.body;
    const userId = req.session.userId;

    if (!recipe_title || !notes) {
      return res.status(400).json({
        error: 'Recipe title and notes are required',
      });
    }

    const result = await query(
      `INSERT INTO reflection_logs 
        (user_id, recipe_title, notes, rating)
       VALUES (?, ?, ?, ?)`,
      [userId, recipe_title, notes, rating || 5]
    );

    res.status(201).json({
      message: 'Reflection created successfully',
      reflectionId: result.insertId,
    });
  } catch (error) {
    console.error('Create reflection error:', error);
    res.status(500).json({ error: 'Error creating reflection' });
  }
});

/* ======================================================
   UPDATE REFLECTION
====================================================== */
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, rating } = req.body;
    const userId = req.session.userId;

    // Check ownership
    const existing = await query(
      'SELECT user_id FROM reflection_logs WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Reflection not found' });
    }

    if (existing[0].user_id !== userId) {
      return res.status(403).json({
        error: "Cannot modify other users' reflections",
      });
    }

    await query(
      `UPDATE reflection_logs 
       SET notes = ?, rating = ? 
       WHERE id = ?`,
      [notes, rating, id]
    );

    res.json({ message: 'Reflection updated successfully' });
  } catch (error) {
    console.error('Update reflection error:', error);
    res.status(500).json({ error: 'Error updating reflection' });
  }
});

/* ======================================================
   DELETE REFLECTION
====================================================== */
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    // Check ownership
    const existing = await query(
      'SELECT user_id FROM reflection_logs WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Reflection not found' });
    }

    if (existing[0].user_id !== userId) {
      return res.status(403).json({
        error: "Cannot delete other users' reflections",
      });
    }

    await query(
      'DELETE FROM reflection_logs WHERE id = ?',
      [id]
    );

    res.json({ message: 'Reflection deleted successfully' });
  } catch (error) {
    console.error('Delete reflection error:', error);
    res.status(500).json({ error: 'Error deleting reflection' });
  }
});

export default router;