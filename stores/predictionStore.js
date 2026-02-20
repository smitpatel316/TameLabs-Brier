// Brier Store - State management for predictions
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const usePredictionStore = create(
  persist(
    (set, get) => ({
      predictions: [],
      
      // Add a new prediction
      addPrediction: (prediction) => {
        const newPrediction = {
          id: Date.now().toString(),
          ...prediction,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          predictions: [newPrediction, ...state.predictions],
        }));
        return newPrediction;
      },
      
      // Resolve a prediction (mark outcome)
      resolvePrediction: (id, outcome, notes = '') => {
        set((state) => ({
          predictions: state.predictions.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'resolved',
                  outcome,
                  notes,
                  resolvedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },
      
      // Delete a prediction
      deletePrediction: (id) => {
        set((state) => ({
          predictions: state.predictions.filter((p) => p.id !== id),
        }));
      },
      
      // Calculate Brier Score
      getBrierScore: () => {
        const { predictions } = get();
        const resolved = predictions.filter((p) => p.status === 'resolved');
        
        if (resolved.length === 0) return null;
        
        const sum = resolved.reduce((acc, p) => {
          const probability = p.probability / 100; // Convert 0-100 to 0-1
          const outcome = p.outcome ? 1 : 0;
          return acc + Math.pow(probability - outcome, 2);
        }, 0);
        
        return sum / resolved.length;
      },
      
      // Get predictions by category
      getByCategory: (category) => {
        const { predictions } = get();
        return predictions.filter((p) => p.category === category);
      },
      
      // Get pending predictions
      getPending: () => {
        const { predictions } = get();
        return predictions.filter((p) => p.status === 'pending');
      },
      
      // Get statistics
      getStats: () => {
        const { predictions } = get();
        const resolved = predictions.filter((p) => p.status === 'resolved');
        const correct = resolved.filter((p) => 
          (p.outcome && p.probability > 50) || (!p.outcome && p.probability < 50)
        );
        
        const categories = {};
        predictions.forEach((p) => {
          categories[p.category] = (categories[p.category] || 0) + 1;
        });
        
        return {
          total: predictions.length,
          resolved: resolved.length,
          pending: predictions.filter((p) => p.status === 'pending').length,
          accuracy: resolved.length > 0 ? (correct.length / resolved.length) * 100 : 0,
          categories,
        };
      },
      
      // Clear all predictions
      clearAll: () => set({ predictions: [] }),
    }),
    {
      name: 'brier-predictions',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
