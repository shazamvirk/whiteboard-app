
import React from 'react';
import { Square, Circle, Pencil, Eraser, MousePointer, Ban, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setTool,
  setStrokeColor,
  setFillColor,
  setStrokeWidth,
  clearCanvas,
} from '../../store/canvasSlice';
import type { ToolType } from '../../types/canvas';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const ROOM_ID = import.meta.env.VITE_DEFAULT_ROOM || 'default-room';
const socket = io(SOCKET_URL);

export const Toolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedTool, strokeColor, fillColor, strokeWidth, elements } = useAppSelector(
    (state) => state.canvas
  );

  const tools: { id: ToolType; label: string; icon: React.ReactNode }[] = [
    { id: 'select', label: 'Select', icon: <MousePointer size={18} /> },
    { id: 'pen', label: 'Pen', icon: <Pencil size={18} /> },
    { id: 'rectangle', label: 'Rectangle', icon: <Square size={18} /> },
    { id: 'circle', label: 'Circle', icon: <Circle size={18} /> },
    { id: 'eraser', label: 'Eraser', icon: <Eraser size={18} /> },
  ];

  const strokeColors = [
    { label: 'Black', value: '#000000' },
    { label: 'Blue', value: '#2563eb' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Green', value: '#10b981' },
    { label: 'Purple', value: '#8b5cf6' },
  ];

  const fillColors = [
    { label: 'None', value: 'transparent' },
    { label: 'Dark (20%)', value: 'rgba(0, 0, 0, 0.2)' },
    { label: 'Blue (25%)', value: 'rgba(37, 99, 235, 0.25)' },
    { label: 'Red (25%)', value: 'rgba(239, 68, 68, 0.25)' },
    { label: 'Green (25%)', value: 'rgba(16, 185, 129, 0.25)' },
    { label: 'Yellow (25%)', value: 'rgba(245, 158, 11, 0.25)' },
  ];

  const handleClearAll = () => {
    if (elements.length === 0) return;
    if (window.confirm('Are you sure you want to clear the entire canvas?')) {
      dispatch(clearCanvas());
      socket.emit('clear-canvas', ROOM_ID);
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-auto sm:top-6 left-1/2 -translate-x-1/2 max-w-[95vw] bg-white/95 backdrop-blur-md px-3 sm:px-5 py-2 my-7 sm:py-2.5 rounded-2xl shadow-2xl border border-gray-200/80 z-50 select-none overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-3 sm:gap-6 min-w-max">
        {/* Tool Selector */}
        <div className="flex items-center gap-1 sm:gap-1.5 border-r border-gray-200 pr-3 sm:pr-5">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => dispatch(setTool(tool.id))}
              className={`p-2 rounded-xl transition-all flex items-center justify-center active:scale-95 ${
                selectedTool === tool.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Stroke Color Picker */}
        <div className="flex items-center gap-2 border-r border-gray-200 pr-3 sm:pr-5">
          <span className="hidden md:inline text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Stroke
          </span>
          <div className="flex items-center gap-1.5">
            {strokeColors.map((color) => (
              <button
                key={color.value}
                onClick={() => dispatch(setStrokeColor(color.value))}
                style={{ backgroundColor: color.value }}
                className={`w-6 h-6 rounded-full transition-all active:scale-90 ${
                  strokeColor === color.value
                    ? 'ring-2 ring-offset-2 ring-blue-600 scale-110'
                    : 'hover:scale-105'
                }`}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Fill Color Picker */}
        <div className="flex items-center gap-2 border-r border-gray-200 pr-3 sm:pr-5">
          <span className="hidden md:inline text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Fill
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => dispatch(setFillColor('transparent'))}
              className={`w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center transition-all active:scale-90 ${
                fillColor === 'transparent'
                  ? 'ring-2 ring-offset-2 ring-blue-600 scale-110 bg-white'
                  : 'hover:scale-105 bg-gray-50'
              }`}
              title="Transparent / No Fill"
            >
              <Ban size={12} className="text-gray-400" />
            </button>

            {fillColors.slice(1).map((color) => (
              <button
                key={color.value}
                onClick={() => dispatch(setFillColor(color.value))}
                style={{ backgroundColor: color.value }}
                className={`w-6 h-6 rounded-full border border-gray-200 transition-all active:scale-90 ${
                  fillColor === color.value
                    ? 'ring-2 ring-offset-2 ring-blue-600 scale-110'
                    : 'hover:scale-105'
                }`}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-2 sm:gap-3 border-r border-gray-200 pr-3 sm:pr-5">
          <span className="hidden md:inline text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Size
          </span>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => dispatch(setStrokeWidth(Number(e.target.value)))}
            className="w-16 sm:w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-xs text-gray-500 font-mono w-4">{strokeWidth}px</span>
        </div>

        {/* Clear Canvas Button */}
        <button
          onClick={handleClearAll}
          disabled={elements.length === 0}
          className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold active:scale-95 ${
            elements.length > 0
              ? 'text-red-600 hover:bg-red-50 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Clear entire canvas"
        >
          <Trash2 size={18} />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </div>
  );
};