import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    expandedFolders: [],
    selectedPath: null
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
        },
        setSelectedPath: (state, action) => {
            state.selectedPath = action.payload;
        },
        clearSelectedPath: (state) => {
            state.selectedPath = null;
        }
    }
});

export const {
    toggleFolder,
    setSelectedPath,
    clearSelectedPath
} = folderSlice.actions;

export const selectExpandedFolders = (state) => state.folder.expandedFolders;
export const selectSelectedFolder = (state) => state.folder.selectedPath;

export default folderSlice.reducer;