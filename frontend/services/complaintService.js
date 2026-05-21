import api from "../api/api";

const complaintService = {
  getAll: (page = 0, size = 10) =>
    api.get(`/complaints?page=${page}&size=${size}`),

  getById: (id) => api.get(`/complaints/${id}`),

  getByStudent: (studentId) => api.get(`/complaints/student/${studentId}`),

  create: (data) => api.post("/complaints", data),

  update: (id, data) => api.put(`/complaints/${id}`, data),

  delete: (id) => api.delete(`/complaints/${id}`),
};

export default complaintService;
