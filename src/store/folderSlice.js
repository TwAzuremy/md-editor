import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    expandedFolders: []
};

const folderSlice = createSlice({
    name: "folder",
    initialState,
    reducers: {
        toggleFolder: (state, action) => {
            const path = action.payload;
            const index = state.expandedFolders.indexOf(path);

            if (index === -1) {
                state.expandedFolders.push(path);
            } else {
                state.expandedFolders.splice(index, 1);
            }
        }
    }
});

export const {toggleFolder} = folderSlice.actions;
export const selectExpandedFolders = (state) => state.folder.expandedFolders;
export default folderSlice.reducer;