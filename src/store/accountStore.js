import { create } from 'zustand';

const useAccountStore = create((set) => ({
  accountStatus: 'Regular', // Default to Regular account status
  setAccountStatus: (status) => set({ accountStatus: status }),
}));

export default useAccountStore;
