import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: {},
}

export const userSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    mountUser: (state,action) => {
      state.value = action.payload
    },
    unMountUser:(state,action) => {
      state.value = {}
    }
    
  },
})

// Action creators are generated for each case reducer function
export const { mountUser,unMountUser } = userSlice.actions

export default userSlice.reducer