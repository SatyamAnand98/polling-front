import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
    name: "socket",
    initialState: {
        socketId: null,
        pollData: null,
    },
    reducers: {
        setSocketId: (state, action) => {
            state.socketId = action.payload.id;
        },
        setPollData: (state, action) => {
            state.pollData = action.payload;
        },
        resetSocket: (state) => {
            state.socketId = null;
            state.pollData = null;
        },
        setPollResult: (state, action) => {
            state.pollResult = action.payload;
        },
    },
});

export const { setSocketId, setPollData, resetSocket } = socketSlice.actions;

export default socketSlice.reducer;
