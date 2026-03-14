import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Add Interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const dashboardService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  register: async (name, email, password, role) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  updateProfile: async (data) => {
    const response = await api.put("/auth/profile", data);
    if (response.data.token) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  getRecentAppointments: async () => {
    const response = await api.get("/appointments"); // Could add limit if supported
    return response.data;
  },

  // Pets
  getPets: async () => {
    const response = await api.get("/pets");
    return response.data;
  },
  deletePet: async (id) => {
    await api.delete(`/pets/${id}`);
  },

  // Vets
  getVets: async () => {
    const response = await api.get("/vets");
    return response.data;
  },

  // Appointments
  getAppointments: async () => {
    const response = await api.get("/appointments");
    return response.data;
  },
  cancelAppointment: async (id) => {
    await api.put(`/appointments/${id}/status`, { status: "cancelled" });
  },
  completeAppointment: async (id) => {
    await api.put(`/appointments/${id}/status`, { status: "completed" });
  },

  // Users
  getUsers: async () => {
    const response = await api.get("/auth/users"); // Assuming this exists or needs to be added
    return response.data;
  },

  // Adoption
  getAdoptions: async () => {
    const response = await api.get("/adoptions");
    return response.data;
  },
  deleteAdoption: async (id) => {
    await api.delete(`/adoptions/pets/${id}`);
  },
  getShelterPets: async () => {
    const response = await api.get("/adoptions/shelter/pets");
    return response.data;
  },
  createAdoptionPet: async (data) => {
    const config = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    const response = await api.post("/adoptions/pets", data, config);
    return response.data;
  },
  getAdoptionRequests: async () => {
    const response = await api.get("/adoptions/requests");
    return response.data;
  },
  updateAdoptionRequestStatus: async (id, data) => {
    const response = await api.put(`/adoptions/requests/${id}`, data);
    return response.data;
  },

  // Lost & Found
  getLostPets: async () => {
    const response = await api.get("/lostpets");
    return response.data;
  },
  updateLostPetStatus: async (id, status) => {
    await api.put(`/lostpets/${id}`, { status });
  },

  // Community
  getPosts: async () => {
    const response = await api.get("/community");
    return response.data;
  },
  deletePost: async (id) => {
    await api.delete(`/community/${id}`);
  },

  // Prescriptions
  getPrescriptions: async () => {
    const response = await api.get("/prescriptions");
    return response.data;
  },
  createPrescription: async (data) => {
    const response = await api.post("/prescriptions", data);
    return response.data;
  },
  deletePrescription: async (id) => {
    await api.delete(`/prescriptions/${id}`);
  },
  getPetPrescriptions: async (petId) => {
    const response = await api.get(`/prescriptions?petId=${petId}`);
    return response.data;
  },
  getPetHistory: async (petId) => {
    const response = await api.get(`/pets/${petId}/history`);
    return response.data;
  },

  // Store & Products
  getProducts: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get("/products/categories");
    return response.data;
  },
  createProduct: async (data) => {
    const config = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    const response = await api.post("/products", data, config);
    return response.data;
  },
  updateProduct: async (id, data) => {
    const config = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    const response = await api.put(`/products/${id}`, data, config);
    return response.data;
  },
  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
  },
  getStoreOrders: async () => {
    const response = await api.get("/orders/store");
    return response.data;
  },
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  // Emergency SOS
  getEmergencies: async () => {
    const response = await api.get("/emergency");
    return response.data;
  },
  updateEmergencyStatus: async (id, status) => {
    const response = await api.put(`/emergency/${id}`, { status });
    return response.data;
  },
};
