import api from "../api/api";

const feeService = {
  getAll: (page = 0, size = 10) =>
    api.get(`/fees?page=${page}&size=${size}`),

  getById: (id) => api.get(`/fees/${id}`),

  getByStudent: (studentId) => api.get(`/fees/student/${studentId}`),

  create: (data) => api.post("/fees", data),

  update: (id, data) => api.put(`/fees/${id}`, data),

  delete: (id) => api.delete(`/fees/${id}`),
};

export default feeService;
