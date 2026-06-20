import express from 'express';
import db from '../db/connection.js';
import { isAuthenticated } from '../middleware/auth.js';
import {
  getStepExplanation,
  getSmartSuggestions,
  chatWithAI
} from '../utils/openai.js';

const router = express.Router();

// Middleware to check auth
router.use(isAuthenticated);

/* =========================
   STEP EXPLANATION
========================= */
router.post('/step-explanation', async (req, res) => {
  try {
    const { recipeId, step, stepNumber } = req.body;
    const userId = req.session.userId;

    if (!recipeId || !step) {
      return res.status(400).json({ error: 'Recipe ID and step are required' });
    }

    const [recipes] = await db.promise().query(
      'SELECT r.*, d.name FROM recipes r JOIN dishes d ON r.dish_id = d.id WHERE r.id = ?',
      [recipeId]
    );

    if (recipes.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = recipes[0];

    const explanation = await getStepExplanation(
      step,
      recipe,
      recipe.difficulty_level
    );

    await db.promise().query(
      `INSERT INTO ai_conversation_history
       (user_id, recipe_id, question, ai_response, conversation_type)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        recipeId,
        `Step ${stepNumber}: ${step}`,
        explanation,
        'explanation'
      ]
    );

    res.json({ explanation });
  } catch (error) {
    console.error('Step explanation error:', error);
    res.status(500).json({ error: error.message || 'Failed to get explanation' });
  }
});

/* =========================
   SUGGESTIONS
========================= */
router.post('/suggestions', async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.session.userId;

    if (!recipeId) {
      return res.status(400).json({ error: 'Recipe ID is required' });
    }

    const [recipes] = await db.promise().query(
      `SELECT r.*, d.name, d.difficulty_level
       FROM recipes r
       JOIN dishes d ON r.dish_id = d.id
       WHERE r.id = ?`,
      [recipeId]
    );

    if (recipes.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = recipes[0];

    const [prefs] = await db.promise().query(
      'SELECT * FROM ai_preferences WHERE user_id = ?',
      [userId]
    );

    const userPreferences = prefs[0] || {
      difficulty: 'intermediate',
      dietary: null
    };

    const ingredients = recipe.ingredients
      ? JSON.parse(recipe.ingredients)
      : [];

    const ingredientList = Array.isArray(ingredients)
      ? ingredients
          .map(ing =>
            typeof ing === 'string' ? ing : ing.name || ing.item
          )
          .filter(Boolean)
      : [];

    const suggestions = await getSmartSuggestions(
      recipe,
      ingredientList,
      userPreferences
    );

    await db.promise().query(
      `INSERT INTO ai_conversation_history
       (user_id, recipe_id, question, ai_response, conversation_type)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        recipeId,
        `Suggestions for ${recipe.name}`,
        suggestions,
        'suggestion'
      ]
    );

    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: error.message || 'Failed to get suggestions' });
  }
});

/* =========================
   CHAT
========================= */
router.post('/chat', async (req, res) => {
  try {
    const { recipeId, question } = req.body;
    const userId = req.session.userId;

    if (!recipeId || !question) {
      return res.status(400).json({ error: 'Recipe ID and question are required' });
    }

    const [recipes] = await db.promise().query(
      `SELECT r.*, d.name, d.difficulty_level
       FROM recipes r
       JOIN dishes d ON r.dish_id = d.id
       WHERE r.id = ?`,
      [recipeId]
    );

    if (recipes.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = recipes[0];

    const [history] = await db.promise().query(
      `SELECT question, ai_response
       FROM ai_conversation_history
       WHERE user_id = ? AND recipe_id = ? AND conversation_type = 'chat'
       ORDER BY created_at DESC LIMIT 10`,
      [userId, recipeId]
    );

    const conversationHistory = [];
    history.reverse().forEach(msg => {
      conversationHistory.push({ role: 'user', content: msg.question });
      conversationHistory.push({ role: 'assistant', content: msg.ai_response });
    });

    const aiResponse = await chatWithAI(
      question,
      recipe,
      conversationHistory
    );

    await db.promise().query(
      `INSERT INTO ai_conversation_history
       (user_id, recipe_id, question, ai_response, conversation_type)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, recipeId, question, aiResponse, 'chat']
    );

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to get AI response' });
  }
});

/* =========================
   CHAT HISTORY
========================= */
router.get('/chat-history/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.session.userId;

    const [history] = await db.promise().query(
      `SELECT question, ai_response, conversation_type, created_at
       FROM ai_conversation_history
       WHERE user_id = ? AND recipe_id = ? AND conversation_type = 'chat'
       ORDER BY created_at DESC LIMIT 50`,
      [userId, recipeId]
    );

    res.json({ history: history.reverse() });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

/* =========================
   PREFERENCES
========================= */
router.post('/preferences', async (req, res) => {
  try {
    const {
      enableExplanations,
      enableSuggestions,
      enableChat,
      difficultyPreference
    } = req.body;

    const userId = req.session.userId;

    await db.promise().query(
      `INSERT INTO ai_preferences
       (user_id, enable_explanations, enable_suggestions, enable_chat, difficulty_preference)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       enable_explanations = VALUES(enable_explanations),
       enable_suggestions = VALUES(enable_suggestions),
       enable_chat = VALUES(enable_chat),
       difficulty_preference = VALUES(difficulty_preference)`,
      [
        userId,
        enableExplanations !== false,
        enableSuggestions !== false,
        enableChat !== false,
        difficultyPreference || 'intermediate'
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;