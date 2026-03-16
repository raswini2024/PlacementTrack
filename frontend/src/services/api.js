import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Student
export const getMe = () => api.get('/student/me');
export const getProfile = () => api.get('/student/profile');
export const saveProfile = (data) => api.post('/student/profile', data);
export const getProgress = () => api.get('/student/progress');
export const getSuggestions = () => api.get('/student/suggestions');

// Questions
export const getTopics = (moduleType) => api.get(`/questions/topics/${moduleType}`);
export const getSubtopics = (topicId) => api.get(`/questions/subtopics/${topicId}`);
export const getQuestions = (subtopicId) => api.get(`/questions/practice/${subtopicId}`);
export const submitAnswer = (data) => api.post('/questions/submit', data);
export const getSubtopicProgress = (subtopicId) => api.get(`/questions/progress/${subtopicId}`);

// Interview
export const getCompanyQuestions = (company) => api.get(`/interview/company/${company}`);
export const getCompanyRoadmap = (company) => api.get(`/interview/company/${company}/roadmap`);
export const getHrQuestions = () => api.get('/interview/hr-questions');
export const startMockTest = (testType) => api.get(`/interview/mock-test/start/${testType}`);
export const submitMockTest = (data) => api.post('/interview/mock-test/submit', data);
export const getMockTestHistory = () => api.get('/interview/mock-test/history');

export default api;
