import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: [],
}

export const MembersSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    mountMembers: (state, action) => {
      state.value = action.payload
    },
    Addmember: (state, action) => {
      state.value.push(action.payload);
    },
    RemoveMember: (state, action) => {
      state.value = state.value.filter(
        (member) => member._id !== action.payload
      );
    },
    UpdateMember: (state, action) => {
      state.value = state.value.map((member) =>
        member._id === action.payload._id
          ? action.payload
          : member
      );
    },
  },
})

// Action creators are generated for each case reducer function
export const { mountMembers, Addmember, RemoveMember, UpdateMember } = MembersSlice.actions

export default MembersSlice.reducer