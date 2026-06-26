import axios from "axios";
import { server_url } from "../url/url";

const BASE = `${server_url}/api/videos`;

export const videoService = {
  getAll(params = {}) {
    return axios.get(BASE, { params });
  },

  getByCategory(category, params = {}) {
    return axios.get(`${BASE}/category/${encodeURIComponent(category)}`, { params });
  },

  getById(id) {
    return axios.get(`${BASE}/${id}`);
  },

  create(payload) {
    return axios.post(BASE, payload);
  },

  update(id, payload) {
    return axios.put(`${BASE}/${id}`, payload);
  },

  remove(id) {
    return axios.delete(`${BASE}/${id}`);
  },

  getCategories() {
    return axios.get(`${BASE}/categories/list`);
  },

  updateSequence(orderedIds) {
    return axios.put(`${BASE}/sequence`, { orderedIds });
  },
};
