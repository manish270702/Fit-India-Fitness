import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: "",
}

export const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    mountToken: (state,action) => {
      state.value = action.payload
    },
    unMountToken: (state) => {
      state.value = ""
    },
  },
})

// Action creators are generated for each case reducer function
export const { mountToken, unMountToken } = tokenSlice.actions

export default tokenSlice.reducer