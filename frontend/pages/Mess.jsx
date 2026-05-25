import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import messService from '../features/mess/messService';

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'];

const dayLabels = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday' };

export default function Mess() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [filterDay, setFilterDay] = useState('');
  const [filterMealType, setFilterMealType] = useState('');
  const [formData, setFormData] = useState({
    day: 'MON', mealType: 'LUNCH', items: '', specialNote: ''
  });

  const fetchMeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await messService.list({ day: filterDay || undefined, mealType: filterMealType || undefined });
      setMeals(result.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [filterDay, filterMealType]);

  const handleAddMeal = () => {
    setEditingMeal(null);
    setFormData({ day: 'MON', mealType: 'LUNCH', items: '', specialNote: '' });
    setShowForm(true);
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setFormData({
      day: meal.day || 'MON',
      mealType: meal.mealType || 'LUNCH',
      items: meal.items || '',
      specialNote: meal.specialNote || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMeal) {
        await messService.update(editingMeal.id, formData);
      } else {
        await messService.create(formData);
      }
      setShowForm(false);
      fetchMeals();
    } catch (err) {
      setError(err.message || 'Failed to save meal');
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await messService.remove(id);
      fetchMeals();
    } catch (err) {
      setError(err.message || 'Failed to delete meal');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Mess Management</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Plan and manage the weekly meal schedule for students.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <LoadingSkeleton count={6} type="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Mess Management</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Plan and manage the weekly meal schedule for students.</p>
        </div>
        <button
          onClick={handleAddMeal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Meal
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          className="px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Days</option>
          {days.map(d => (
            <option key={d} value={d}>{dayLabels[d]}</option>
          ))}
        </select>
        <select
          value={filterMealType}
          onChange={(e) => setFilterMealType(e.target.value)}
          className="px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Meal Types</option>
          {mealTypes.map(t => (
            <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Meals Grid */}
      {meals.length === 0 ? (
        <div className="text-center py-12 rounded-xl border-2" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)'}}>
          <p style={{color: 'var(--muted)'}}>No meals found. Add a meal to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {meals.map((meal) => (
            <div key={meal.id} className="rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow" style={{backgroundColor: 'var(--surface)'}}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold" style={{color: 'var(--text)'}}>{dayLabels[meal.day] || meal.day}</h2>
                  <span className="text-sm font-medium" style={{color: 'var(--accent)'}}>{meal.mealType ? meal.mealType.charAt(0) + meal.mealType.slice(1).toLowerCase() : ''}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditMeal(meal)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{color: 'var(--muted)'}}>{meal.items}</p>
              {meal.specialNote && (
                <p className="text-xs mt-2 italic" style={{color: 'var(--accent)'}}>{meal.specialNote}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl shadow-xl max-w-md w-full" style={{backgroundColor: 'var(--surface)'}}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{color: 'var(--text)'}}>
                  {editingMeal ? 'Edit Meal' : 'Add Meal'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text)'}}>Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{dayLabels[day]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text)'}}>Meal Type</label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData({...formData, mealType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {mealTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text)'}}>Menu Items</label>
                  <textarea
                    value={formData.items}
                    onChange={(e) => setFormData({...formData, items: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter menu items separated by commas"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text)'}}>Special Note</label>
                  <input
                    type="text"
                    value={formData.specialNote}
                    onChange={(e) => setFormData({...formData, specialNote: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional special note"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {editingMeal ? 'Update' : 'Add'} Meal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
