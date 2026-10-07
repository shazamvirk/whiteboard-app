export type ToolType = 'select' | 'pen' | 'rectangle' | 'circle' | 'eraser';

export interface BaseElement {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  stroke: string;
  strokeWidth: number;
  fillColor?: string;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface RectElement extends BaseElement {
  type: 'rectangle';
  width: number;
  height: number;
}

export interface CircleElement extends BaseElement {
  type: 'circle';
  radius: number;
}

export interface FreehandElement extends BaseElement {
  type: 'pen' | 'eraser';
  points: number[];
}

export type CanvasElement = RectElement | CircleElement | FreehandElement;

export interface RemoteUser {
  userId: string;
  userName: string;
  cursor?: { x: number; y: number };
}