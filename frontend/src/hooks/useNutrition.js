import { useState, useEffect, useCallback } from 'react';
import { nutritionApi } from '../lib/api';

export function useNutrition(dateString) {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLog = useCallback(async (targetDate = dateString) => {
    if (!targetDate) return;
    setLoading(true);
    setError(null);
    try {
      const data = await nutritionApi.getLog(targetDate);
      setLog(data.log);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateString]);

  useEffect(() => {
    if (dateString) {
      fetchLog(dateString);
    }
  }, [dateString, fetchLog]);

  const addMealItems = async (mealType, items) => {
    try {
      const data = await nutritionApi.addMealItem(dateString, {
        type: mealType,
        items,
      });
      if (data.log) {
        setLog(data.log);
      }
      return data.log;
    } catch (err) {
      throw err;
    }
  };

  const updateMealItem = async (itemId, updatedData) => {
    try {
      const data = await nutritionApi.updateMealItem(dateString, itemId, updatedData);
      if (data.log) {
        setLog(data.log);
      }
      return data.log;
    } catch (err) {
      throw err;
    }
  };

  const deleteMealItem = async (itemId) => {
    try {
      const data = await nutritionApi.deleteMealItem(dateString, itemId);
      if (data.log) {
        setLog(data.log);
      }
      return data.log;
    } catch (err) {
      throw err;
    }
  };

  const updateWater = async (waterIntakeMl, waterGoalMl) => {
    try {
      const data = await nutritionApi.updateWater(dateString, {
        waterIntakeMl,
        waterGoalMl,
      });
      if (data.log) {
        setLog(data.log);
      }
      return data.log;
    } catch (err) {
      throw err;
    }
  };

  const updateGoals = async (goals) => {
    try {
      const data = await nutritionApi.updateGoals(dateString, goals);
      if (data.log) {
        setLog(data.log);
      }
      return data.log;
    } catch (err) {
      throw err;
    }
  };

  return {
    log,
    loading,
    error,
    fetchLog,
    addMealItems,
    updateMealItem,
    deleteMealItem,
    updateWater,
    updateGoals,
  };
}
