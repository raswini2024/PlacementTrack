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

// Mock Interview
export const findInterviewPartner = () => api.post('/mock-interview/find-partner');
export const checkSessionStatus = (sessionId) => api.get(`/mock-interview/session/${sessionId}/status`);
export const submitInterviewFeedback = (sessionId, data) => api.post(`/mock-interview/session/${sessionId}/feedback`, data);
export const getInterviewHistory = () => api.get('/mock-interview/history');
export const cancelSession = (sessionId) => api.delete(`/mock-interview/session/${sessionId}/cancel`);

export const getExamPapers = (company) => api.get(`/exam/papers/${company}`);
export const getPaperQuestions = (paperId) => api.get(`/exam/papers/${paperId}/questions`);
export const submitPaper = (paperId, answers) => api.post(`/exam/papers/${paperId}/submit`, answers);
export default api;
