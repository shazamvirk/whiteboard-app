import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CanvasElement, ToolType } from '../types/canvas';

interface CanvasState {
  selectedTool: ToolType;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  elements: CanvasElement[];
  history: CanvasElement[][];
  historyIndex: number;
}

const initialState: CanvasState = {
  selectedTool: 'pen',
  strokeColor: '#000000',
  fillColor: 'transparent',
  strokeWidth: 3,
  elements: [],
  history: [[]],
  historyIndex: 0,
};

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setTool: (state, action: PayloadAction<ToolType>) => {
      state.selectedTool = action.payload;
    },
    setStrokeColor: (state, action: PayloadAction<string>) => {
      state.strokeColor = action.payload;
    },
    setFillColor: (state, action: PayloadAction<string>) => {
      state.fillColor = action.payload;
    },
    setStrokeWidth: (state, action: PayloadAction<number>) => {
      state.strokeWidth = action.payload;
    },
    setElements: (state, action: PayloadAction<CanvasElement[]>) => {
      state.elements = action.payload;
    },
    addOrUpdateElement: (state, action: PayloadAction<CanvasElement>) => {
      const index = state.elements.findIndex((el) => el.id === action.payload.id);
      if (index !== -1) {
        state.elements[index] = action.payload;
      } else {
        state.elements.push(action.payload);
      }

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.elements]);
      state.history = newHistory;
      state.historyIndex = newHistory.length - 1;
    },
    clearCanvas: (state) => {
      state.elements = [];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([]);
      state.history = newHistory;
      state.historyIndex = newHistory.length - 1;
    },
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1;
        state.elements = state.history[state.historyIndex];
      }
    },
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex += 1;
        state.elements = state.history[state.historyIndex];
      }
    },
  },
});

export const {
  setTool,
  setStrokeColor,
  setFillColor,
  setStrokeWidth,
  setElements,
  addOrUpdateElement,
  clearCanvas,
  undo,
  redo,
} = canvasSlice.actions;

export default canvasSlice.reducer;