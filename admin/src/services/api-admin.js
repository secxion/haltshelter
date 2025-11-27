import axios from '../axios';

export const stats = {
  get: () => axios.get('/api/admin/stats'),
  update: (stats) => axios.put('/api/admin/stats', stats)
};