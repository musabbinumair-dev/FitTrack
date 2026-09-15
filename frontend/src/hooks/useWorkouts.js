import { useState, useEffect, useCallback } from 'react';
import { workoutApi } from '../lib/api';

export function useWorkouts() {
  const [routines, setRoutines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoutines = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workoutApi.getRoutines(params);
      setRoutines(data.routines || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async (params = {}) => {
    setLogsLoading(true);
    try {
      const data = await workoutApi.getLogs(params);
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutines();
    fetchLogs();
  }, [fetchRoutines, fetchLogs]);

  const logWorkout = async (logData) => {
    try {
      const data = await workoutApi.createLog(logData);
      if (data.log) {
        setLogs(prev => [data.log, ...prev]);
      }
      return data.log;
    } catch (err) {
      throw err;
    }
  };

  const deleteLog = async (id) => {
    try {
      await workoutApi.deleteLog(id);
      setLogs(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      throw err;
    }
  };

  const createRoutine = async (routineData) => {
    try {
      const data = await workoutApi.createRoutine(routineData);
      setRoutines(prev => [data.routine, ...prev]);
      return data.routine;
    } catch (err) {
      throw err;
    }
  };

  const updateRoutine = async (id, routineData) => {
    try {
      const data = await workoutApi.updateRoutine(id, routineData);
      setRoutines(prev => prev.map(r => r._id === id ? data.routine : r));
      return data.routine;
    } catch (err) {
      throw err;
    }
  };

  const deleteRoutine = async (id) => {
    try {
      await workoutApi.deleteRoutine(id);
      setRoutines(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    routines,
    logs,
    loading,
    logsLoading,
    error,
    fetchRoutines,
    fetchLogs,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    logWorkout,
    deleteLog
  };
}