/**
 * User profile API.
 */

import api from './api';

export async function fetchUserProfile() {
  const { data } = await api.get('/api/user/profile');
  return data.profile;
}

export async function updateUserProfile(updates) {
  const { data } = await api.put('/api/user/profile', updates);
  return data.profile;
}
