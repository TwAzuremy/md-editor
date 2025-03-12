import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    expandedFolders: []
};

const folderSlice = createSlice({
    name: "folder",
    initialState,
    reducers: {}
});

export default folderSlice.reducer;