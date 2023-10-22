import { createSlice } from "@reduxjs/toolkit";

// Define the initial state for the user slice
const initialState = {
  currentUser: null,
  error: null,
  loading: false,
};

// Create a user slice with actions and a reducer
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Action for starting the sign-in process
    signInStart: (state) => {
      state.loading = true;
      state.error = null; // Clear any previous errors
    },
    // Action for successful sign-in
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null; // Clear any previous errors
    },
    // Action for sign-in failure
    signInFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Action for starting the user update process
    updateUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // Action for successful user update
    updateUserSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    // Action for user update failure
    updateUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Action for starting the user deletion process
    deleteUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // Action for successful user deletion
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    // Action for user deletion failure
    deleteUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Action for starting the user signout process
    signOutUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // Action for successful user signout
    signOutUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    // Action for user signout failure
    signOutUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

// Extract the action creators for easy access in other parts of the app
export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} = userSlice.actions;

// Export the user reducer for use in the Redux store
export default userSlice.reducer;
