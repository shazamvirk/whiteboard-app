import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Canvas } from './components/canvas/Canvas';
import { Toolbar } from './components/toolbar/Toolbar';
import { Header } from './components/layout/Header';
import Konva from 'konva';

export const App: React.FC = () => {
  const stageRef = useRef<Konva.Stage | null>(null);

  return (
    <Provider store={store}>
      <div className="relative w-screen h-screen overflow-hidden bg-slate-50">
        <Header stageRef={stageRef} />
        <Toolbar />
        <Canvas ref={stageRef} />
      </div>
    </Provider>
  );
};

export default App;