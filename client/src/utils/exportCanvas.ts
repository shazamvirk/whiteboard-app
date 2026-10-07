// client/src/utils/exportCanvas.ts
import Konva from 'konva';

export const exportStageToPNG = (stageRef: Konva.Stage | null, fileName = 'whiteboard.png') => {
  if (!stageRef) return;

  // 1. Get the background color of the canvas or default to slate-50 (#f8fafc)
  const dataURL = stageRef.toDataURL({
    pixelRatio: 2,
    mimeType: 'image/png',
  });

  // 2. Create an offscreen canvas to render with a solid background
  const img = new Image();
  img.src = dataURL;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Fill background with slate-50 color matching your board canvas
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Download
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
};