// Temporary placeholder for Supabase
// This file is kept for compatibility with legacy routes
// EdgeStore is now the primary storage solution

export const supabase = {
  storage: {
    from: () => ({
      list: () => Promise.resolve({ data: [], error: null }),
      upload: () => Promise.resolve({ data: null, error: null }),
      remove: () => Promise.resolve({ data: null, error: null }),
    }),
  },
};
