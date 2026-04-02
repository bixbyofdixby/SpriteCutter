import { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export default function Editor({
  imageSrc,
  imageMeta,
  mode,
  gridSettings,
  gridRegions,
  customRegions,
  setCustomRegions,
  selectedRegionId,
  setSelectedRegionId
}) {
  const containerRef = useRef(null);
  
  // Transform State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Interaction State
  // action can be: 'none', 'pan', 'draw', 'resize', 'move'
  const [actionData, setActionData] = useState({ type: 'none' });
  const [currentBox, setCurrentBox] = useState(null); // Used only while drawing a brand new box
  
  const HANDLE_SIZE = 8;
  const HANDLE_MARGIN = 0; // if we want handles to sit right on corner

  // Global key up/down for spacebar tracking
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') setIsSpacePressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- Coordinate Transformation Utilities ---

  // Get mouse coordinates relative to the underlying ORIGINAL image coordinates
  const getEventPos = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    
    // Reverse the screen translation and scaling to find the pixel coordinate of the image
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const imgX = (screenX - transform.x) / transform.scale;
    const imgY = (screenY - transform.y) / transform.scale;

    return { x: Math.round(imgX), y: Math.round(imgY) };
  };

  // --- Zoom & Pan ---

  const handleWheel = (e) => {
    e.preventDefault(); // Requires setting non-passive listener, but React limits this. 
    // Wait, onWheel in React is passive. We should just let it be, but visually scale.
    
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTransform(prev => {
      const newScale = Math.max(0.1, Math.min(prev.scale * zoomFactor, 10));
      
      // Calculate how much the mouse coordinates scale to maintain zooming "towards" the cursor
      // Formula: newx = mouseX - (mouseX - prevX) * (newScale / prevScale)
      const ratio = newScale / prev.scale;
      const newX = mouseX - (mouseX - prev.x) * ratio;
      const newY = mouseY - (mouseY - prev.y) * ratio;

      return { x: newX, y: newY, scale: newScale };
    });
  };

  const handleZoomIn = () => setTransform(p => ({ ...p, scale: Math.min(p.scale * 1.2, 10) }));
  const handleZoomOut = () => setTransform(p => ({ ...p, scale: Math.max(p.scale * 0.8, 0.1) }));
  const handleZoomReset = () => {
    // try to fit image into view
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = (rect.width - 40) / imageMeta.width;
    const scaleY = (rect.height - 40) / imageMeta.height;
    const scale = Math.min(1, Math.min(scaleX, scaleY));
    
    const x = (rect.width - imageMeta.width * scale) / 2;
    const y = (rect.height - imageMeta.height * scale) / 2;

    setTransform({ x, y, scale });
  };

  useEffect(() => {
    // Initial centering
    handleZoomReset();
  }, [imageSrc]); // Reset when new image loaded

  // --- Interaction Loop ---

  const handlePointerDown = (e) => {
    const pos = getEventPos(e);
    
    // Panning overrides everything
    if (e.button === 1 || isSpacePressed) {
      e.preventDefault();
      setActionData({ type: 'pan', startX: e.clientX, startY: e.clientY, initTx: transform.x, initTy: transform.y });
      return;
    }

    if (mode !== 'custom' || e.button !== 0) return;

    // Check handles first
    if (e.target.dataset.handle) {
      e.stopPropagation();
      const regionId = e.target.dataset.targetId;
      const handleType = e.target.dataset.handle;
      const region = customRegions.find(r => r.id === regionId);
      if (region) {
        setSelectedRegionId(regionId);
        setActionData({ type: 'resize', regionId, handleType, startPos: pos, initRegion: { ...region } });
        return;
      }
    }

    // Check if clicked inside an existing region to move it
    if (e.target.dataset.regionBox) {
      e.stopPropagation();
      const regionId = e.target.dataset.regionBox;
      const region = customRegions.find(r => r.id === regionId);
      if (region) {
        setSelectedRegionId(regionId);
        setActionData({ type: 'move', regionId, startPos: pos, initRegion: { ...region } });
        return;
      }
    }

    // Otherwise, start drawing new box
    setSelectedRegionId(null);
    setActionData({ type: 'draw', startPos: pos });
    setCurrentBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handlePointerMove = (e) => {
    if (actionData.type === 'none') return;

    if (actionData.type === 'pan') {
      const dx = e.clientX - actionData.startX;
      const dy = e.clientY - actionData.startY;
      setTransform(prev => ({ ...prev, x: actionData.initTx + dx, y: actionData.initTy + dy }));
      return;
    }

    const pos = getEventPos(e);

    if (actionData.type === 'draw') {
      const x = Math.min(actionData.startPos.x, pos.x);
      const y = Math.min(actionData.startPos.y, pos.y);
      const width = Math.abs(pos.x - actionData.startPos.x);
      const height = Math.abs(pos.y - actionData.startPos.y);
      setCurrentBox({ x, y, width, height });
    }

    if (actionData.type === 'move') {
      const dx = pos.x - actionData.startPos.x;
      const dy = pos.y - actionData.startPos.y;
      setCustomRegions(prev => prev.map(r => r.id === actionData.regionId ? {
        ...r, 
        x: actionData.initRegion.x + dx,
        y: actionData.initRegion.y + dy
      } : r));
    }

    if (actionData.type === 'resize') {
      const { handleType, initRegion } = actionData;
      let { x, y, width, height } = initRegion;
      const dx = pos.x - actionData.startPos.x;
      const dy = pos.y - actionData.startPos.y;

      if (handleType.includes('w')) {
        x = Math.min(initRegion.x + dx, initRegion.x + initRegion.width);
        width = Math.max(0, initRegion.width - dx);
      }
      if (handleType.includes('e')) {
        width = Math.max(0, initRegion.width + dx);
      }
      if (handleType.includes('n')) {
        y = Math.min(initRegion.y + dy, initRegion.y + initRegion.height);
        height = Math.max(0, initRegion.height - dy);
      }
      if (handleType.includes('s')) {
        height = Math.max(0, initRegion.height + dy);
      }

      setCustomRegions(prev => prev.map(r => r.id === actionData.regionId ? { ...r, x, y, width, height } : r));
    }
  };

  const handlePointerUp = () => {
    if (actionData.type === 'draw' && currentBox && currentBox.width > 2 && currentBox.height > 2) {
      const newRegion = {
        id: `custom-${Date.now()}`,
        name: `slice_${customRegions.length + 1}`,
        ...currentBox
      };
      setCustomRegions(prev => [...prev, newRegion]);
      setSelectedRegionId(newRegion.id);
    }
    setActionData({ type: 'none' });
    setCurrentBox(null);
  };

  // --- Rendering Helpers ---

  const renderGridOverlay = () => {
    if (mode !== 'grid' || !gridRegions || gridRegions.length === 0) return null;
    
    return (
      <g>
        {gridRegions.map(region => (
          <g key={region.id}>
            <rect 
              x={region.x} y={region.y} width={region.width} height={region.height}
              stroke="rgba(37, 99, 235, 0.8)" 
              strokeWidth={2 / transform.scale} 
              fill="rgba(37, 99, 235, 0.15)"
            />
            <text
              x={region.x + region.width / 2}
              y={region.y + region.height / 2 + (Math.min(region.height * 0.4, 24) * 0.35)}
              fill="rgba(255, 255, 255, 0.85)"
              fontSize={Math.min(region.height * 0.4, 24) / transform.scale}
              fontWeight="bold"
              textAnchor="middle"
              stroke="rgba(0, 0, 0, 0.4)"
              strokeWidth={2 / transform.scale}
              paintOrder="stroke"
              pointerEvents="none"
              style={{ userSelect: 'none' }}
            >
              {region.index}
            </text>
          </g>
        ))}
      </g>
    );
  };

  const renderHandles = (region) => {
    if (selectedRegionId !== region.id) return null;
    const hs = HANDLE_SIZE / transform.scale; // keep handle visual size consistent across zoom levels
    const coords = [
      { id: 'nw', x: region.x - hs/2, y: region.y - hs/2, cursor: 'nwse-resize' },
      { id: 'ne', x: region.x + region.width - hs/2, y: region.y - hs/2, cursor: 'nesw-resize' },
      { id: 'sw', x: region.x - hs/2, y: region.y + region.height - hs/2, cursor: 'nesw-resize' },
      { id: 'se', x: region.x + region.width - hs/2, y: region.y + region.height - hs/2, cursor: 'nwse-resize' },
      { id: 'n', x: region.x + region.width/2 - hs/2, y: region.y - hs/2, cursor: 'ns-resize' },
      { id: 's', x: region.x + region.width/2 - hs/2, y: region.y + region.height - hs/2, cursor: 'ns-resize' },
      { id: 'w', x: region.x - hs/2, y: region.y + region.height/2 - hs/2, cursor: 'ew-resize' },
      { id: 'e', x: region.x + region.width - hs/2, y: region.y + region.height/2 - hs/2, cursor: 'ew-resize' },
    ];

    return coords.map(c => (
      <rect
        key={c.id}
        x={c.x} y={c.y} width={hs} height={hs}
        fill="white"
        stroke="#ef4444"
        strokeWidth={1.5 / transform.scale}
        data-handle={c.id}
        data-target-id={region.id}
        style={{ cursor: c.cursor, pointerEvents: 'all' }}
      />
    ));
  };

  const activeRegion = customRegions.find(r => r.id === actionData.regionId) || currentBox;

  return (
    <div 
      style={{ 
        flex: 1, 
        position: 'relative',
        backgroundColor: '#e2e8f0',
        overflow: 'hidden', // hide overflow since we rely on internal transform
        display: 'flex',
      }}
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={e => e.preventDefault()}
    >
      {/* HUD overlay for Zoom */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, display: 'flex', gap: '0.5rem', backgroundColor: 'var(--panel-bg)', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold', width: '40px', justifyContent: 'center' }}>
          {Math.round(transform.scale * 100)}%
        </div>
        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={handleZoomIn} title="Zoom In">
          <ZoomIn size={18} />
        </button>
        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={handleZoomReset} title="Fit to View">
          <Maximize size={18} />
        </button>
      </div>

      <div 
        style={{
          position: 'absolute',
          transformOrigin: '0 0',
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          width: imageMeta.width,
          height: imageMeta.height,
          userSelect: 'none',
          cursor: isSpacePressed || actionData.type === 'pan' ? 'grab' : (mode === 'custom' ? 'crosshair' : 'default'),
          touchAction: 'none'
        }}
      >
        <img 
          src={imageSrc} 
          alt="Sprite Preview" 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', imageRendering: 'pixelated' }} 
          draggable={false}
        />
        
        <svg 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: mode === 'custom' ? 'auto' : 'none', overflow: 'visible' }}
          viewBox={`0 0 ${imageMeta.width} ${imageMeta.height}`}
        >
          {renderGridOverlay()}
          
          {mode === 'custom' && customRegions.map(region => (
            <g key={region.id}>
              <rect 
                x={region.x} y={region.y} width={region.width} height={region.height}
                stroke={selectedRegionId === region.id ? "#ef4444" : "#2563eb"} 
                strokeWidth={(selectedRegionId === region.id ? 3 : 2) / transform.scale}
                fill={selectedRegionId === region.id ? "rgba(239, 68, 68, 0.15)" : "rgba(37, 99, 235, 0.1)"}
                style={{ cursor: 'move', pointerEvents: 'all' }}
                data-region-box={region.id}
              />
              {renderHandles(region)}
            </g>
          ))}

          {/* Current drawing box outline */}
          {actionData.type === 'draw' && currentBox && (
            <rect 
              x={currentBox.x} y={currentBox.y} width={currentBox.width} height={currentBox.height}
              stroke="#22c55e" 
              strokeWidth={2 / transform.scale} 
              strokeDasharray={`${4/transform.scale} ${4/transform.scale}`}
              fill="rgba(34, 197, 94, 0.1)"
              pointerEvents="none"
            />
          )}

          {/* Tooltip text for size rendering if drawing or resizing */}
          {['draw', 'resize', 'move'].includes(actionData.type) && activeRegion && (
            <text
              x={activeRegion.x + activeRegion.width / 2}
              y={activeRegion.y - 10 / transform.scale}
              fill="white"
              fontSize={14 / transform.scale}
              fontWeight="bold"
              textAnchor="middle"
              stroke="black"
              strokeWidth={3 / transform.scale}
              paintOrder="stroke"
              pointerEvents="none"
            >
              {Math.round(activeRegion.width)} × {Math.round(activeRegion.height)}
            </text>
          )}

        </svg>
      </div>
    </div>
  );
}
