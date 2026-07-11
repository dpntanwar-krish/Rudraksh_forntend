import axios from "axios";
// import { server_url } from "../url/url";
const  server_url= require("dotenv");
server_url.config();

const API_URL = `${server_url}/api/portfolio`;

export const PORTFOLIO_CATEGORIES = [
  "PRINTING",
  "OUTDOOR",
  "ONLINE",
  "PHOTOSHOOT & VIDEO",
  "EVENTS",
  "PROMOTIONAL",
  "ELECTRONIC ADS",
];

export const getPortfolioCounts = async () => {
  const response = await axios.get(API_URL, { params: { counts: true } });
  return response.data;
};

export const getPortfolioItems = async (params = {}) => {
  const response = await axios.get(API_URL, { params });
  return response.data;
};

export const getPortfolioItem = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createPortfolioItem = async (formData) => {
  const response = await axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updatePortfolioItem = async (id, formData) => {
  const response = await axios.put(`${API_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deletePortfolioItem = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const reorderPortfolioItems = async ({ category, orderedIds }) => {
  const response = await axios.put(`${API_URL}/reorder`, { category, orderedIds });
  return response.data;
};
