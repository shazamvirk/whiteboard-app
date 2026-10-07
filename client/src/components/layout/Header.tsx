import React from 'react';
import { Download, RotateCcw, RotateCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { undo, redo } from '../../store/canvasSlice';
import Konva from 'konva';
import { exportStageToPNG } from '../../utils/exportCanvas';

interface HeaderProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export const Header: React.FC<HeaderProps> = ({ stageRef }) => {
  const dispatch = useAppDispatch();
  const { historyIndex, history } = useAppSelector((state) => state.canvas);

  return (
    <header className="absolute top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 flex items-center justify-between z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          W
        </div>
        <h1 className="font-bold text-gray-800 text-lg">Collaborative Board</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(undo())}
          disabled={historyIndex === 0}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => dispatch(redo())}
          disabled={historyIndex >= history.length - 1}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw size={18} />
        </button>
        <div className="h-6 w-px bg-gray-200 mx-1" />
        <button
          onClick={() => exportStageToPNG(stageRef.current)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
        >
          <Download size={16} /> Export Image
        </button>
      </div>
    </header>
  );
};