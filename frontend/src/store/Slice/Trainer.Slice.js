import { createSlice } from "@reduxjs/toolkit";

const initialState = { value: [] };

export const TrainersSlice = createSlice({
    name: "trainers",
    initialState,
    reducers: {
        mountTrainers: (state, action) => {
            state.value = action.payload;
        },
        addTrainer: (state, action) => {
            state.value.push(action.payload);
        },
        updateTrainer: (state, action) => {
            state.value = state.value.map((trainer) =>
                trainer._id === action.payload._id ? action.payload : trainer
            );
        },
        removeTrainer: (state, action) => {
            state.value = state.value.filter((trainer) => trainer._id !== action.payload);
        },
    },
});

export const { mountTrainers, addTrainer, updateTrainer, removeTrainer } = TrainersSlice.actions;
export default TrainersSlice.reducer;