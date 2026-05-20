import api from "../api/api";

const roomService = {
  getAll: (page = 0, size = 10) =>
    api.get(`/rooms?page=${page}&size=${size}`),

  getById: (id) => api.get(`/rooms/${id}`),

  getAvailable: () => api.get("/rooms/available"),

  create: (data) => api.post("/rooms", data),

  update: (id, data) => api.put(`/rooms/${id}`, data),

  delete: (id) => api.delete(`/rooms/${id}`),
};

export default roomService;
