import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://nceylmoebyckcpjfofvm.supabase.co";
const supabaseAnonKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZXlsbW9lYnlja2NwamZvZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5ODYwNzYsImV4cCI6MjA3MjU2MjA3Nn0.tbE-vhFtehVdOFf0T-DW3hOltLxMEavnQkqgKAsRMxE`;

// Custom storage that handles SSR (no window) gracefully
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return null;
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
