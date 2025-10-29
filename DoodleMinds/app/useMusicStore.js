import { create } from 'zustand';

export const useMusicStore = create((set) => ({
  player: null,
  isPlaying: false,

  setPlayer: (player) => set({ player }),
  setIsPlaying: (state) => set({ isPlaying: state }),
}));