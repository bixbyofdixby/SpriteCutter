import { useState, useMemo } from 'react';
import './App.css';
import UploadArea from './components/UploadArea';
import Editor from './components/Editor';
import Sidebar from './components/Sidebar';
import { exportSlices } from './utils/exporter';
import { HelpCircle } from 'lucide-react';

function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageMeta, setImageMeta] = useState(null); // { originalFile, width, height }
  
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  const [mode, setMode] = useState('grid'); // 'grid' | 'custom'
  const [exportMode, setExportMode] = useState('zip'); // 'zip' | 'direct'
  
  const [gridSettings, setGridSettings] = useState({
    width: 64,
    height: 64,
    offsetX: 0,
    offsetY: 0,
    spacingX: 0,
    spacingY: 0
  });
  
  const [customRegions, setCustomRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);

  const [gridNames, setGridNames] = useState({});

  const gridRegions = useMemo(() => {
    if (!imageMeta) return [];
    const regions = [];
    let idCounter = 1;
    const { width, height, offsetX, offsetY, spacingX, spacingY } = gridSettings;
    
    if (width <= 0 || height <= 0) return regions;

    const baseName = imageMeta.name ? imageMeta.name.split('.')[0] : "sprite";

    for (let y = offsetY; y + height <= imageMeta.height; y += height + spacingY) {
      for (let x = offsetX; x + width <= imageMeta.width; x += width + spacingX) {
        regions.push({
          id: `grid-${idCounter}`,
          index: idCounter,
          name: gridNames[idCounter] || `${baseName}_${idCounter}`,
          x,
          y,
          width,
          height
        });
        idCounter++;
      }
    }
    return regions;
  }, [imageMeta, gridSettings, gridNames]);

  const handleImageUploaded = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageSrc(e.target.result);
        setImageMeta({ originalFile: file, width: img.width, height: img.height, name: file.name });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleExport = async () => {
    if (!imageSrc || !imageMeta) return;
    
    // Determine the regions to slice
    let regionsToSlice = [];
    
    if (mode === 'grid') {
      regionsToSlice = [...gridRegions];
    } else {
      regionsToSlice = [...customRegions];
      if (regionsToSlice.length === 0) {
        alert("No custom regions defined!");
        return;
      }
    }

    try {
      await exportSlices(imageSrc, regionsToSlice, exportMode, imageMeta.name);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export: " + err.message);
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        {!imageSrc ? (
          <UploadArea onUpload={handleImageUploaded} />
        ) : (
          <Editor 
            imageSrc={imageSrc}
            imageMeta={imageMeta}
            mode={mode}
            gridSettings={gridSettings}
            gridRegions={gridRegions}
            customRegions={customRegions}
            setCustomRegions={setCustomRegions}
            selectedRegionId={selectedRegionId}
            setSelectedRegionId={setSelectedRegionId}
          />
        )}
      </main>

      <Sidebar 
        imageLoaded={!!imageSrc}
        mode={mode}
        setMode={setMode}
        exportMode={exportMode}
        setExportMode={setExportMode}
        gridSettings={gridSettings}
        setGridSettings={setGridSettings}
        gridRegions={gridRegions}
        gridNames={gridNames}
        setGridNames={setGridNames}
        customRegions={customRegions}
        setCustomRegions={setCustomRegions}
        selectedRegionId={selectedRegionId}
        setSelectedRegionId={setSelectedRegionId}
        onExport={handleExport}
        onReset={() => setImageSrc(null)}
      />

      {/* Floating About Button */}
      <button 
        className="btn btn-primary"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          padding: 0,
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
          zIndex: 50
        }}
        title="who did this?"
        onClick={() => setIsAboutOpen(true)}
      >
        <HelpCircle size={14} />
      </button>

      {/* About Modal */}
      {isAboutOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(3px)'
        }} onClick={() => setIsAboutOpen(false)}>
          <div style={{
             backgroundColor: 'var(--panel-bg)',
             padding: '2.5rem',
             borderRadius: '12px',
             maxWidth: '350px',
             width: '90%',
             boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
             textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Hi, its <a href="https://github.com/bixbyofdixby" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>bixbyofdixby</a>!
            </h2>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Wanna play some bad games?<br/><br/>
              <span style={{ fontSize: '1.2rem' }}>🎮</span> <a href="https://play.google.com/store/apps/details?id=com.casuallane.neoncircle" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline', fontWeight: 'bold' }}>Check it out!</a>
            </p>
            <button className="btn btn-outline" style={{width: '100%'}} onClick={() => setIsAboutOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
