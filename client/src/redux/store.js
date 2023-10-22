import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Combine all reducers into a root reducer
const rootReducer = combineReducers({ user: userReducer });

// Configuration for persisting Redux state
const persistConfig = {
  key: "root", // Key to access the persisted state in storage
  storage, // The storage engine (localStorage)
  version: 1, // Version of persisted state (useful for migrations)
};

// Create a persisted reducer with the specified configuration
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store
export const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializability checks
    }),
});

// Create a persistor to persist the store's state
export const persistor = persistStore(store);
