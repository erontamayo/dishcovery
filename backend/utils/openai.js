import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Get detailed explanation for a cooking step
async function getStepExplanation(step, recipe, difficulty) {
  try {
    const prompt = `You are a professional culinary instructor. Provide a detailed but concise explanation for this cooking step.

Recipe: ${recipe.name}
Difficulty Level: ${difficulty}
Step: ${step}

Provide:
1. What this step does
2. Why it's important
3. Tips to do it correctly
4. Common mistakes to avoid
5. Timing guidance

Keep the explanation clear and educational, suitable for hospitality students.`;

    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert culinary instructor helping hospitality management students learn cooking techniques.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Step Explanation Error:', error.response?.data || error.message);
    throw new Error('Failed to get step explanation');
  }
}

// Get smart suggestions for recipe modifications
async function getSmartSuggestions(recipe, ingredients, userPreferences) {
  try {
    const prompt = `You are a professional chef and nutritionist. Provide practical suggestions for this recipe.

Recipe: ${recipe.name}
Current Ingredients: ${ingredients.join(', ')}
User Difficulty Level: ${userPreferences.difficulty || 'intermediate'}
Dietary Restrictions: ${userPreferences.dietary || 'none'}

Suggest:
1. Ingredient substitutions (if needed)
2. Timing adjustments based on difficulty
3. Equipment alternatives
4. Dietary or allergen-friendly versions
5. Portion modifications

Keep suggestions practical and beginner-friendly.`;

    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful culinary expert providing practical cooking suggestions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Suggestions Error:', error.response?.data || error.message);
    throw new Error('Failed to get suggestions');
  }
}

// Chat with AI assistant about cooking
async function chatWithAI(question, recipe, conversationHistory) {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are a friendly culinary assistant helping hospitality management students learn cooking. 
You are helping with the recipe: ${recipe.name}
Ingredients: ${recipe.ingredients?.join(', ') || 'various'}
Instructions: ${recipe.instructions?.slice(0, 2)?.join('; ') || 'cooking steps'}

Be concise, practical, and educational. If the question is not related to cooking or this recipe, politely redirect.`
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: question
      }
    ];

    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 300
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Chat Error:', error.response?.data || error.message);
    throw new Error('Failed to get AI response');
  }
}

export {
  getStepExplanation,
  getSmartSuggestions,
  chatWithAI
};

