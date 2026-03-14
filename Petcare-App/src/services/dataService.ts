import data from '../mock/data.json';
import { User, Pet, Appointment, Vet, Adoption, Post, LostAndFound, Emergency } from '../types';

import { API_URL as ENV_API_URL } from '@env';

export const API_URL = ENV_API_URL || 'http://192.168.1.3:5000/api'; // Primary (Wi-Fi)
// const API_URL = ENV_API_URL || 'http://10.31.42.78:5000/api'; // Alternative (Ethernet)
console.log('[DataService] Using API_URL:', API_URL);

export const dataService = {
  // Auth
  login: async (credentials: any): Promise<any> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },
  register: async (userData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  verifyOTP: async (email: string, otp: string): Promise<any> => {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return response.json();
  },
  resendOTP: async (email: string): Promise<any> => {
    const response = await fetch(`${API_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },
  updateUserProfile: async (userData: any, token: string): Promise<User> => {
    let body: any;
    let headers: any = { 
      'Authorization': `Bearer ${token}`
    };

    if (userData.avatar && typeof userData.avatar === 'object' && userData.avatar.uri) {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (key === 'avatar') {
          formData.append('avatar', {
            uri: userData.avatar.uri,
            type: userData.avatar.type || 'image/jpeg',
            name: userData.avatar.fileName || 'avatar.jpg',
          } as any);
        } else if (userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });
      body = formData;
    } else {
      body = JSON.stringify(userData);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers,
      body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    return response.json();
  },

  // Pets
  getPets: async (token: string): Promise<Pet[]> => {
    const response = await fetch(`${API_URL}/pets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch pets');
    const pets = await response.json();
    return pets.map((p: any) => ({ ...p, id: p._id }));
  },
  getPetById: async (id: string, token: string): Promise<Pet> => {
    const response = await fetch(`${API_URL}/pets/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Pet not found');
    const pet = await response.json();
    return { ...pet, id: pet._id };
  },
  addPet: async (petData: any, token: string): Promise<Pet> => {
    let body: any;
    let headers: any = { 
      'Authorization': `Bearer ${token}`
    };

    if (petData.image && typeof petData.image === 'object') {
      const formData = new FormData();
      Object.keys(petData).forEach(key => {
        if (key === 'image') {
          formData.append('image', {
            uri: petData.image.uri,
            type: petData.image.type || 'image/jpeg',
            name: petData.image.name || 'pet.jpg',
          } as any);
        } else {
          formData.append(key, petData[key]);
        }
      });
      body = formData;
    } else {
      body = JSON.stringify(petData);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/pets`, {
      method: 'POST',
      headers,
      body
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add pet');
    }
    const pet = await response.json();
    return { ...pet, id: pet._id };
  },
  updatePet: async (id: string, petData: any, token: string): Promise<Pet> => {
    let body: any;
    let headers: any = { 
      'Authorization': `Bearer ${token}`
    };

    if (petData.image && typeof petData.image === 'object') {
      const formData = new FormData();
      Object.keys(petData).forEach(key => {
        if (key === 'image') {
          formData.append('image', {
            uri: petData.image.uri,
            type: petData.image.type || 'image/jpeg',
            name: petData.image.name || 'pet.jpg',
          } as any);
        } else {
          formData.append(key, petData[key]);
        }
      });
      body = formData;
    } else {
      body = JSON.stringify(petData);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/pets/${id}`, {
      method: 'PUT',
      headers,
      body
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update pet');
    }
    const pet = await response.json();
    return { ...pet, id: pet._id };
  },
  deletePet: async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/pets/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete pet');
  },

  // Vets
  getVets: async (): Promise<Vet[]> => {
    const response = await fetch(`${API_URL}/vets`);
    const vets = await response.json();
    return vets.map((v: any) => ({ ...v, id: v._id }));
  },
  getVetById: async (id: string): Promise<Vet> => {
    const response = await fetch(`${API_URL}/vets/${id}`);
    const vet = await response.json();
    return { ...vet, id: vet._id };
  },
  getNearbyVets: async (lat: number, lng: number): Promise<Vet[]> => {
    const response = await fetch(`${API_URL}/vets/nearby?lat=${lat}&lng=${lng}`);
    if (!response.ok) throw new Error('Failed to fetch nearby vets');
    const vets = await response.json();
    return vets.map((v: any) => ({ ...v, id: v._id }));
  },

  // Appointments
  getAppointments: async (token: string): Promise<Appointment[]> => {
    const response = await fetch(`${API_URL}/appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const appointments = await response.json();
    return appointments.map((a: any) => ({ 
      ...a, 
      id: a._id,
      petId: a.petId?._id || a.petId,
      vetId: a.vetId?._id || a.vetId
    }));
  },
  bookAppointment: async (appointmentData: any, token: string): Promise<Appointment> => {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });
    const a = await response.json();
    return { 
      ...a, 
      id: a._id,
      petId: a.petId?._id || a.petId,
      vetId: a.vetId?._id || a.vetId
    };
  },
  cancelAppointment: async (id: string, token: string): Promise<void> => {
    await fetch(`${API_URL}/appointments/${id}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Adoption
  getAdoptions: async (params: any = {}): Promise<any[]> => {
    let url = `${API_URL}/adoptions/pets`;
    const queryParams = [];
    if (params.type) queryParams.push(`type=${params.type}`);
    if (params.breed) queryParams.push(`breed=${params.breed}`);
    if (params.location) queryParams.push(`location=${params.location}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch adoptions');
    const adoptions = await response.json();
    return adoptions.map((a: any) => ({ ...a, id: a._id }));
  },
  getAdoptionPetById: async (id: string): Promise<any> => {
    const response = await fetch(`${API_URL}/adoptions/pets/${id}`);
    if (!response.ok) throw new Error('Pet not found');
    const pet = await response.json();
    return { ...pet, id: pet._id };
  },
  submitAdoptionRequest: async (requestData: any, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/adoptions/requests`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    if (!response.ok) throw new Error('Failed to submit application');
    return response.json();
  },
  getMyAdoptionRequests: async (token: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/adoptions/requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch requests');
    const requests = await response.json();
    return requests.map((r: any) => ({ ...r, id: r._id }));
  },

  // Community (Phase 2)
  getPosts: async (): Promise<Post[]> => {
    const response = await fetch(`${API_URL}/community`);
    const posts = await response.json();
    return posts.map((p: any) => ({ 
      ...p, 
      id: p._id,
      userName: p.user?.name || 'Anonymous',
      userAvatar: p.user?.avatar || 'https://via.placeholder.com/150',
      image: p.images && p.images.length > 0 ? p.images[0] : undefined,
      likes: Array.isArray(p.likes) ? p.likes.length : (p.likes || 0),
      likedBy: Array.isArray(p.likes) ? p.likes.map((id: any) => id.toString()) : [],
      comments: p.commentCount || 0,
      timeAgo: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Just now'
    }));
  },
  createPost: async (postData: any, token: string): Promise<Post> => {
    let body: any;
    let headers: any = { 
      'Authorization': `Bearer ${token}`
    };

    if (postData.images && postData.images.length > 0) {
      const formData = new FormData();
      formData.append('content', postData.content);
      if (postData.category) formData.append('category', postData.category);
      if (postData.petId) formData.append('petId', postData.petId);
      if (postData.location) formData.append('location', postData.location);
      
      postData.images.forEach((img: any) => {
        formData.append('images', {
          uri: img.uri,
          type: img.type || 'image/jpeg',
          name: img.name || 'image.jpg',
        } as any);
      });
      body = formData;
      // Do not set Content-Type, fetch will set it correctly for FormData
    } else {
      body = JSON.stringify(postData);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/community`, {
      method: 'POST',
      headers,
      body
    });
    return response.json();
  },
  addComment: async (postId: string, text: string, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/community/${postId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });
    return response.json();
  },
  getPostComments: async (postId: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/community/${postId}/comments`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    const comments = await response.json();
    return comments.map((c: any) => ({
      ...c,
      id: c._id,
      user: {
        id: c.user?._id || c.user?.id,
        name: c.user?.name || 'Anonymous',
        avatar: c.user?.avatar || 'https://via.placeholder.com/150'
      }
    }));
  },
  likePost: async (postId: string, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/community/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  // Notifications
  getNotifications: async (token: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const notifications = await response.json();
    return notifications.map((n: any) => ({ ...n, id: n._id }));
  },
  markNotificationAsRead: async (id: string, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getLostPets: async (type?: string): Promise<LostAndFound[]> => {
    const url = type ? `${API_URL}/lostpets?type=${type}` : `${API_URL}/lostpets`;
    const response = await fetch(url);
    const results = await response.json();
    return results.map((r: any) => ({ ...r, id: r._id }));
  },
  getLostPetById: async (id: string): Promise<LostAndFound> => {
    const response = await fetch(`${API_URL}/lostpets/${id}`);
    if (!response.ok) throw new Error('Report not found');
    const result = await response.json();
    return { ...result, id: result._id };
  },
  reportLostPet: async (reportData: any, token: string): Promise<LostAndFound> => {
    let body: any;
    let headers: any = { 
      'Authorization': `Bearer ${token}`
    };

    if (reportData.image && typeof reportData.image === 'object') {
      const formData = new FormData();
      Object.keys(reportData).forEach(key => {
        if (key === 'image') {
          formData.append('image', {
            uri: reportData.image.uri,
            type: reportData.image.type || 'image/jpeg',
            name: reportData.image.name || 'report.jpg',
          } as any);
        } else if (key === 'contactInfo') {
          formData.append(key, JSON.stringify(reportData[key]));
        } else {
          formData.append(key, reportData[key]);
        }
      });
      body = formData;
    } else {
      body = JSON.stringify(reportData);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/lostpets`, {
      method: 'POST',
      headers,
      body
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit report');
    }
    return response.json();
  },

  // Emergency SOS
  triggerSOS: async (sosData: any, token: string): Promise<Emergency> => {
    const response = await fetch(`${API_URL}/emergency`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sosData)
    });
    return response.json();
  },
  getEmergenciesByToken: async (token: string): Promise<Emergency[]> => {
    const response = await fetch(`${API_URL}/emergency`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // AI Chat
  chatWithAI: async (message: string, token: string) => {
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });
    return response.json();
  },

  chatWithAIStream: async (message: string, token: string, onChunk: (text: string) => void) => {
    // Note: React Native's default fetch doesn't support streaming well.
    // We'll implement this using a standard fetch but the UI will handle the response.
    // For true streaming in RN, consider adding 'react-native-fetch-api'
    const response = await fetch(`${API_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error('Streaming failed');
    
    // Fallback for non-streaming environments: 
    // If response.body is not available, we just return the full response.
    // In a production app, you'd use a polyfill or specific RN streaming library.
    const text = await response.text();
    onChunk(text); // Placeholder for streaming logic
  },
  
  // Vaccinations
  getVaccinations: async (petId: string, token: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/vaccinations/pet/${petId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const vaccinations = await response.json();
    return vaccinations.map((v: any) => ({ ...v, id: v._id }));
  },
  getUpcomingVaccinations: async (token: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/vaccinations/upcoming`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const vaccinations = await response.json();
    return vaccinations.map((v: any) => ({ ...v, id: v._id }));
  },
  addVaccination: async (vaccinationData: any, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/vaccinations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(vaccinationData)
    });
    const vaccination = await response.json();
    return { ...vaccination, id: vaccination._id };
  },
  deleteVaccination: async (id: string, token: string): Promise<void> => {
    await fetch(`${API_URL}/vaccinations/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Medical Records (Phase 2)
  getMedicalRecords: async (petId: string, token: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/medical-records/pet/${petId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const records = await response.json();
    return records.map((r: any) => ({ ...r, id: r._id }));
  },
  addMedicalRecord: async (recordData: any, token: string): Promise<any> => {
    let body: any;
    let headers: any = { 
      'Authorization': `Bearer ${token}`
    };

    if (recordData.document) {
      const formData = new FormData();
      Object.keys(recordData).forEach(key => {
        if (key === 'document') {
          formData.append('document', {
            uri: recordData.document.uri,
            type: recordData.document.type || 'image/jpeg',
            name: recordData.document.name || 'document.jpg',
          } as any);
        } else {
          formData.append(key, recordData[key]);
        }
      });
      body = formData;
    } else {
      body = JSON.stringify(recordData);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/medical-records`, {
      method: 'POST',
      headers,
      body
    });
    const record = await response.json();
    return { ...record, id: record._id };
  },
  deleteMedicalRecord: async (id: string, token: string): Promise<void> => {
    await fetch(`${API_URL}/medical-records/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  getPetHealth: async (petId: string, token: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/pets/${petId}/health`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Store & Products
  getProducts: async (params: any = {}): Promise<any[]> => {
    let url = `${API_URL}/products`;
    const queryParams = [];
    if (params.category) queryParams.push(`category=${params.category}`);
    if (params.storeId) queryParams.push(`storeId=${params.storeId}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  },

  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_URL}/products/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  },

  // Orders
  createOrder: async (orderData: any, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to place order');
    }
    return await response.json();
  },

  getMyOrders: async (token: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/orders/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  },

  getOrderById: async (id: string, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch order details');
    return await response.json();
  },
};
