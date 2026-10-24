import { useCallback, useEffect, useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach JSON Server. Run "npm run server" first.');
  }
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  list: (resource) => request(`/${resource}`),
  create: (resource, data) => request(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (resource, id, data) => request(`/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' }),
};

// Loads students and interventions; call reload() after any change
export function useData() {
  const [students, setStudents] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      const [s, i] = await Promise.all([api.list('students'), api.list('interventions')]);
      setStudents(s);
      setInterventions(i);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { students, interventions, loading, error, reload };
}
