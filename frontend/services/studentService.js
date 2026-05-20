import api from "../api/api";

const studentService = {
  getAll: (page = 0, size = 10) =>
    api.get(`/students?page=${page}&size=${size}`),

  getById: (id) => api.get(`/students/${id}`),

  search: (query, page = 0, size = 10) =>
    api.get(`/students/search?query=${query}&page=${page}&size=${size}`),

  create: (data) => api.post("/students", data),

  update: (id, data) => api.put(`/students/${id}`, data),

  delete: (id) => api.delete(`/students/${id}`),
};

export default studentService;
