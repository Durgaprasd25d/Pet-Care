import { create } from 'zustand';
import { dataService } from '../services/dataService';

interface AdoptionState {
  adoptions: any[];
  myRequests: any[];
  loading: boolean;
  fetchAdoptions: (params?: any) => Promise<void>;
  fetchMyRequests: (token: string) => Promise<void>;
  submitRequest: (requestData: any, token: string) => Promise<void>;
}

export const useAdoptionStore = create<AdoptionState>((set) => ({
  adoptions: [],
  myRequests: [],
  loading: false,
  fetchAdoptions: async (params = {}) => {
    set({ loading: true });
    try {
      const adoptions = await dataService.getAdoptions(params);
      set({ adoptions, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
  fetchMyRequests: async (token: string) => {
    set({ loading: true });
    try {
      const myRequests = await dataService.getMyAdoptionRequests(token);
      set({ myRequests, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
  submitRequest: async (requestData, token) => {
    await dataService.submitAdoptionRequest(requestData, token);
  }
}));
