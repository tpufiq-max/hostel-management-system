import api from "../api/api";

const attendanceService = {
  getByDate: (date) => api.get(`/attendance/date/${date}`),

  getByStudent: (studentId, startDate, endDate) =>
    api.get(`/attendance/student/${studentId}?startDate=${startDate}&endDate=${endDate}`),

  mark: (data) => api.post("/attendance", data),

  markBulk: (dataList) => api.post("/attendance/bulk", dataList),

  update: (id, data) => api.put(`/attendance/${id}`, data),
};

export default attendanceService;
