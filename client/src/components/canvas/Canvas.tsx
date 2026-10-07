
import { useState, useEffect, useRef, forwardRef, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Transformer } from 'react-konva';
import Konva from 'konva';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addOrUpdateElement, setElements } from '../../store/canvasSlice';
import type { CanvasElement, RemoteUser } from '../../types/canvas';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const ROOM_ID = import.meta.env.VITE_DEFAULT_ROOM || 'default-room';

const socket: Socket = io(SOCKET_URL);

export const Canvas = forwardRef<Konva.Stage>((_, ref) => {
  const dispatch = useAppDispatch();
  const { selectedTool, strokeColor, fillColor, strokeWidth, elements } = useAppSelector(
    (state) => state.canvas
  );

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Record<string, RemoteUser>>({});

  const shapeRefs = useRef<{ [key: string]: Konva.Node | null }>({});
  const transformerRef = useRef<Konva.Transformer | null>(null);

  // Handle window resizing for mobile orientation changes
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Sync Transformer nodes
  useEffect(() => {
    if (transformerRef.current) {
      if (selectedId && shapeRefs.current[selectedId]) {
        transformerRef.current.nodes([shapeRefs.current[selectedId]!]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, elements]);

  // Update selected shape stroke/fill color when changed in toolbar
  useEffect(() => {
    if (!selectedId) return;
    const selectedEl = elements.find((el) => el.id === selectedId);
    if (!selectedEl) return;

    if (selectedEl.stroke !== strokeColor || selectedEl.fillColor !== fillColor) {
      const updated: CanvasElement = {
        ...selectedEl,
        stroke: strokeColor,
        fillColor: fillColor,
      };
      dispatch(addOrUpdateElement(updated));
      socket.emit('draw-element', { roomId: ROOM_ID, element: updated });
    }
  }, [strokeColor, fillColor, selectedId, dispatch, elements]);

  // Socket listeners
  useEffect(() => {
    socket.emit('join-room', ROOM_ID);

    socket.on('load-canvas', (savedElements: CanvasElement[]) => {
      dispatch(setElements(savedElements));
    });

    socket.on('element-updated', (element: CanvasElement) => {
      dispatch(addOrUpdateElement(element));
    });

    socket.on('canvas-cleared', () => {
      dispatch(setElements([]));
    });

    socket.on('cursor-updated', ({ userId, cursor, userName }) => {
      setRemoteUsers((prev) => ({
        ...prev,
        [userId]: { userId, userName, cursor },
      }));
    });

    socket.on('user-disconnected', (userId: string) => {
      setRemoteUsers((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    });

    return () => {
      socket.off('load-canvas');
      socket.off('element-updated');
      socket.off('canvas-cleared');
      socket.off('cursor-updated');
      socket.off('user-disconnected');
    };
  }, [dispatch]);

  const getCanvasCursor = () => {
    if (isDrawing) return 'crosshair';
    switch (selectedTool) {
      case 'select':
        return 'default';
      case 'pen':
      case 'rectangle':
      case 'circle':
        return 'crosshair';
      case 'eraser':
        return 'cell';
      default:
        return 'default';
    }
  };

  const startDrawing = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }

    if (selectedTool === 'select') return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    setIsDrawing(true);
    const id = uuidv4();
    let newEl: CanvasElement;

    if (selectedTool === 'rectangle') {
      newEl = {
        id,
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        stroke: strokeColor,
        strokeWidth,
        fillColor: fillColor || 'transparent',
      };
    } else if (selectedTool === 'circle') {
      newEl = {
        id,
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 0,
        stroke: strokeColor,
        strokeWidth,
        fillColor: fillColor || 'transparent',
      };
    } else {
      newEl = {
        id,
        type: selectedTool,
        x: 0,
        y: 0,
        points: [pos.x, pos.y],
        stroke: selectedTool === 'eraser' ? '#f8fafc' : strokeColor,
        strokeWidth: selectedTool === 'eraser' ? strokeWidth * 3 : strokeWidth,
      };
    }

    setCurrentElement(newEl);
  };

  const drawMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    socket.emit('cursor-move', { roomId: ROOM_ID, cursor: pos, userName: 'Peer User' });

    if (!isDrawing || !currentElement) return;

    const updatedEl: CanvasElement = { ...currentElement };

    if (updatedEl.type === 'rectangle') {
      updatedEl.width = pos.x - updatedEl.x;
      updatedEl.height = pos.y - updatedEl.y;
    } else if (updatedEl.type === 'circle') {
      const dx = pos.x - updatedEl.x;
      const dy = pos.y - updatedEl.y;
      updatedEl.radius = Math.sqrt(dx * dx + dy * dy);
    } else if (updatedEl.type === 'pen' || updatedEl.type === 'eraser') {
      updatedEl.points = [...updatedEl.points, pos.x, pos.y];
    }

    setCurrentElement(updatedEl);
  };

  const endDrawing = () => {
    if (!isDrawing || !currentElement) return;
    setIsDrawing(false);

    let finalEl: CanvasElement = { ...currentElement };

    if (finalEl.type === 'rectangle') {
      const x = finalEl.width < 0 ? finalEl.x + finalEl.width : finalEl.x;
      const y = finalEl.height < 0 ? finalEl.y + finalEl.height : finalEl.y;
      const width = Math.abs(finalEl.width);
      const height = Math.abs(finalEl.height);

      if (width < 3 && height < 3) {
        setCurrentElement(null);
        return;
      }

      finalEl = { ...finalEl, x, y, width, height };
    } else if (finalEl.type === 'circle') {
      if (finalEl.radius < 3) {
        setCurrentElement(null);
        return;
      }
    }

    dispatch(addOrUpdateElement(finalEl));
    socket.emit('draw-element', { roomId: ROOM_ID, element: finalEl });
    setCurrentElement(null);
  };

  const handleSelectShape = (id: string, e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (selectedTool === 'select') {
      e.cancelBubble = true;
      setSelectedId(id);
    }
  };

  const handleDragEnd = (el: CanvasElement, e: Konva.KonvaEventObject<DragEvent>) => {
    const updated: CanvasElement = {
      ...el,
      x: e.target.x(),
      y: e.target.y(),
    };
    dispatch(addOrUpdateElement(updated));
    socket.emit('draw-element', { roomId: ROOM_ID, element: updated });
  };

  const handleTransformEnd = (el: CanvasElement, node: Konva.Node) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const baseUpdates = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };

    let updatedEl: CanvasElement;

    if (el.type === 'rectangle') {
      updatedEl = {
        ...el,
        ...baseUpdates,
        width: Math.max(5, Math.abs(node.width() * scaleX)),
        height: Math.max(5, Math.abs(node.height() * scaleY)),
      };
    } else if (el.type === 'circle') {
      const circleNode = node as Konva.Circle;
      updatedEl = {
        ...el,
        ...baseUpdates,
        radius: Math.max(5, Math.abs(circleNode.radius() * scaleX)),
      };
    } else {
      updatedEl = {
        ...el,
        ...baseUpdates,
      };
    }

    dispatch(addOrUpdateElement(updatedEl));
    socket.emit('draw-element', { roomId: ROOM_ID, element: updatedEl });
  };

  const renderElement = (el: CanvasElement) => {
    const isSelectMode = selectedTool === 'select';

    const commonProps = {
      key: el.id,
      ref: (node: Konva.Node | null) => {
        shapeRefs.current[el.id] = node;
      },
      draggable: isSelectMode,
      onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (isSelectMode) {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = 'grab';
        }
      },
      onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (isSelectMode) {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = 'default';
        }
      },
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleSelectShape(el.id, e),
      onTap: (e: Konva.KonvaEventObject<TouchEvent>) => handleSelectShape(el.id, e),
      onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = 'grabbing';
      },
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = isSelectMode ? 'grab' : 'default';
        handleDragEnd(el, e);
      },
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(el, e.target),
      rotation: el.rotation || 0,
    };

    const activeFill =
      el.fillColor && el.fillColor !== 'transparent' ? el.fillColor : 'rgba(0,0,0,0.001)';

    if (el.type === 'rectangle') {
      return (
        <Rect
          {...commonProps}
          x={el.x}
          y={el.y}
          width={el.width}
          height={el.height}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          fill={activeFill}
          cornerRadius={4}
        />
      );
    }
    if (el.type === 'circle') {
      return (
        <Circle
          {...commonProps}
          x={el.x}
          y={el.y}
          radius={el.radius}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          fill={activeFill}
        />
      );
    }
    if (el.type === 'pen' || el.type === 'eraser') {
      return (
        <Line
          {...commonProps}
          x={el.x || 0}
          y={el.y || 0}
          points={el.points}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          hitStrokeWidth={30}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          globalCompositeOperation={
            el.type === 'eraser' ? 'destination-out' : 'source-over'
          }
        />
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full overflow-hidden touch-none select-none">
      <Stage
        ref={ref}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={startDrawing}
        onMouseMove={drawMove}
        onMouseUp={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={drawMove}
        onTouchEnd={endDrawing}
        style={{ cursor: getCanvasCursor() }}
        className="bg-slate-50 pt-16 sm:pt-0"
      >
        <Layer>
          {elements.map((el: CanvasElement) => renderElement(el))}
          {currentElement && renderElement(currentElement)}
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
              'middle-left',
              'middle-right',
              'top-center',
              'bottom-center',
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox;
              return newBox;
            }}
          />
          {Object.values(remoteUsers).map(
            (user) =>
              user.cursor && (
                <Circle
                  key={user.userId}
                  x={user.cursor.x}
                  y={user.cursor.y}
                  radius={5}
                  fill="#ef4444"
                />
              )
          )}
        </Layer>
      </Stage>
    </div>
  );
});