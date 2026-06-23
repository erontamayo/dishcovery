const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiOptions extends RequestInit {
  headers?: HeadersInit;
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API error');
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 3001.');
    }
    throw error;
  }
}

// Auth APIs
export async function login(email: string, password: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string, name: string) {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function logout() {
  return apiCall('/auth/logout', { method: 'POST' });
}

export async function getCurrentUser() {
  return apiCall('/auth/user');
}

// Dishes APIs
export async function getFeaturedDishes() {
  return apiCall('/dishes/featured');
}

export async function getAllDishes(page = 1, limit = 10) {
  return apiCall(`/dishes?page=${page}&limit=${limit}`);
}

export async function getDishById(id: string | number) {
  return apiCall(`/dishes/${id}`);
}

export async function createDish(dishData: any) {
  return apiCall('/dishes', {
    method: 'POST',
    body: JSON.stringify(dishData),
  });
}

export async function updateDish(id: string | number, dishData: any) {
  return apiCall(`/dishes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dishData),
  });
}

export async function deleteDish(id: string | number) {
  return apiCall(`/dishes/${id}`, { method: 'DELETE' });
}

// Recipes APIs
export async function getRecipe(dishId: string | number) {
  return apiCall(`/recipes/${dishId}`);
}

export async function searchByPantry(ingredients: string[]) {
  return apiCall('/recipes/search/pantry', {
    method: 'POST',
    body: JSON.stringify({ ingredients }),
  });
}

export async function filterByAllergens(avoid: string) {
  return apiCall(`/recipes/filter/allergens?avoid=${avoid}`);
}

export async function filterByDietary(preference: string) {
  return apiCall(`/recipes/filter/dietary?preference=${preference}`);
}

export async function getTechniques() {
  return apiCall('/recipes/techniques/list');
}

// Reflections APIs
export async function getReflections() {
  return apiCall('/reflections');
}

export async function getReflectionsForDish(dishId: string | number) {
  return apiCall(`/reflections/dish/${dishId}`);
}

export async function createReflection(
  recipeTitle: string,
  notes: string,
  rating: number
) {
  return apiCall('/reflections', {
    method: 'POST',
    body: JSON.stringify({ recipe_title: recipeTitle, notes, rating }),
  });
}

export async function updateReflection(id: string | number, notes: string, rating?: number) {
  return apiCall(`/reflections/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ notes, rating }),
  });
}

export async function deleteReflection(id: string | number) {
  return apiCall(`/reflections/${id}`, { method: 'DELETE' });
}

// Admin APIs
export async function getUsers() {
  return apiCall('/admin/users');
}

export async function getReflectionStats() {
  return apiCall('/admin/reflections/stats');
}

export async function createRecipe(recipeData: any) {
  return apiCall('/admin/recipes', {
    method: 'POST',
    body: JSON.stringify(recipeData),
  });
}

export async function forgotPassword(email: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/forgot-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    }
  )

  if (!res.ok) {
    throw new Error('Failed to send reset email')
  }

  return res.json()
}

export async function updateRecipe(id: string | number, recipeData: any) {
  return apiCall

}
