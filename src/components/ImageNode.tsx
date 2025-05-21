import { memo, useState, useCallback, useRef, useEffect } from 'react';

interface ImageNodeProps {
  data: {
    imageUrl: string;
    width: number;
    height: number;
  };
  id: string;
  selected?: boolean;
  draggable?: boolean;
}

const ImageNode = ({ data, selected, draggable = true }: ImageNodeProps) => {
  const [size, setSize] = useState({ width: data.width, height: data.height });
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageRef.current) {
      const img = new Image();
      img.src = data.imageUrl;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const containerWidth = size.width;
        const containerHeight = size.height;
        
        let width = containerWidth;
        let height = containerHeight;
        
        if (containerWidth / containerHeight > aspectRatio) {
          width = containerHeight * aspectRatio;
          height = containerHeight;
        } else {
          width = containerWidth;
          height = containerWidth / aspectRatio;
        }
        
        setImageDimensions({ width, height });
      };
    }
  }, [data.imageUrl, size]);

  const handleMouseDown = useCallback((e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    const aspect = startWidth / startHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      let dx = moveEvent.clientX - startX;
      let dy = moveEvent.clientY - startY;

      if (corner.includes('left')) dx = -dx;
      if (corner.includes('top')) dy = -dy;

      const newWidth = Math.max(50, startWidth + dx);
      const newHeight = newWidth / aspect;
      
      setSize({
        width: Math.min(800, newWidth),
        height: Math.min(800, newHeight)
      });
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      upEvent.preventDefault();
      upEvent.stopPropagation();
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [size]);

  return (
    <div 
      style={{
        width: size.width,
        height: size.height,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      className={!draggable || isResizing ? 'nodrag' : ''}
    >
      <div 
        className="cursor-move"
        style={{
          width: imageDimensions.width,
          height: imageDimensions.height,
          position: 'relative'
        }}
      >
        <img
          ref={imageRef}
          src={data.imageUrl}
          alt="Flow node"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
          className="rounded-lg"
          draggable={false}
        />

        {selected && (
          <>
            <div 
              className="absolute inset-0 border border-blue-500 rounded-lg pointer-events-none"
              style={{
                width: imageDimensions.width,
                height: imageDimensions.height
              }}
            />

            <div 
              className="absolute w-3 h-3 -top-1.5 -left-1.5 bg-blue-500 rounded-full cursor-nwse-resize nodrag"
              onMouseDown={(e) => handleMouseDown(e, 'top-left')}
            />
            <div 
              className="absolute w-3 h-3 -top-1.5 -right-1.5 bg-blue-500 rounded-full cursor-nesw-resize nodrag"
              onMouseDown={(e) => handleMouseDown(e, 'top-right')}
            />
            <div 
              className="absolute w-3 h-3 -bottom-1.5 -left-1.5 bg-blue-500 rounded-full cursor-nesw-resize nodrag"
              onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
            />
            <div 
              className="absolute w-3 h-3 -bottom-1.5 -right-1.5 bg-blue-500 rounded-full cursor-nwse-resize nodrag"
              onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
            />

            <div 
              className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize nodrag hover:bg-blue-500/20"
              onMouseDown={(e) => handleMouseDown(e, 'top')}
            />
            <div 
              className="absolute top-0 right-0 w-1 h-full cursor-ew-resize nodrag hover:bg-blue-500/20"
              onMouseDown={(e) => handleMouseDown(e, 'right')}
            />
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize nodrag hover:bg-blue-500/20"
              onMouseDown={(e) => handleMouseDown(e, 'bottom')}
            />
            <div 
              className="absolute top-0 left-0 w-1 h-full cursor-ew-resize nodrag hover:bg-blue-500/20"
              onMouseDown={(e) => handleMouseDown(e, 'left')}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default memo(ImageNode);