import { useState } from 'react';
import { AlertTriangle, Download, Trash2, LayoutGrid, MousePointer2, RefreshCw, Plus, ChevronDown, ChevronRight } from 'lucide-react';

export default function Sidebar({
  imageLoaded,
  mode,
  setMode,
  exportMode,
  setExportMode,
  gridSettings,
  setGridSettings,
  gridRegions,
  gridNames,
  setGridNames,
  customRegions,
  setCustomRegions,
  selectedRegionId,
  setSelectedRegionId,
  onExport,
  onReset
}) {

  const [customPresetW, setCustomPresetW] = useState(48);
  const [customPresetH, setCustomPresetH] = useState(48);
  
  const [isGridNamingOpen, setIsGridNamingOpen] = useState(false);

  const handleGridChange = (e) => {
    const { name, value } = e.target;
    setGridSettings(prev => ({
      ...prev,
      [name]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const updateRegionProperty = (id, prop, value) => {
    setCustomRegions(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, [prop]: prop === 'name' ? value : Math.max(0, parseInt(value) || 0) };
      }
      return r;
    }));
  };

  const removeRegion = (id) => {
    setCustomRegions(prev => prev.filter(r => r.id !== id));
    if (selectedRegionId === id) setSelectedRegionId(null);
  };

  const spawnPreset = (w, h) => {
    const newRegion = {
      id: `custom-${Date.now()}`,
      name: `slice_${w}x${h}_${customRegions.length + 1}`,
      x: 0,
      y: 0,
      width: w,
      height: h
    };
    setCustomRegions(prev => [...prev, newRegion]);
    setSelectedRegionId(newRegion.id);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✂️ SpriteCutter
        </h1>
      </div>

      <div className="sidebar-content">
        <div style={{ marginBottom: '2rem' }}>
          <label className="label">Operation Mode</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button 
              className={`btn btn-outline ${mode === 'grid' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setMode('grid')}
            >
              <LayoutGrid size={16} /> Grid
            </button>
            <button 
              className={`btn btn-outline ${mode === 'custom' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setMode('custom')}
            >
              <MousePointer2 size={16} /> Custom
            </button>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

        {mode === 'grid' && (
          <div className="config-section">
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>Grid Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="label" style={{ marginTop: 0 }}>Cell Width</label>
                <input type="number" className="input-number" name="width" value={gridSettings.width} onChange={handleGridChange} min="1" />
              </div>
              <div>
                <label className="label" style={{ marginTop: 0 }}>Cell Height</label>
                <input type="number" className="input-number" name="height" value={gridSettings.height} onChange={handleGridChange} min="1" />
              </div>
              <div>
                <label className="label" style={{ marginTop: 0 }}>Offset X</label>
                <input type="number" className="input-number" name="offsetX" value={gridSettings.offsetX} onChange={handleGridChange} min="0" />
              </div>
              <div>
                <label className="label" style={{ marginTop: 0 }}>Offset Y</label>
                <input type="number" className="input-number" name="offsetY" value={gridSettings.offsetY} onChange={handleGridChange} min="0" />
              </div>
              <div>
                <label className="label" style={{ marginTop: 0 }}>Spacing X</label>
                <input type="number" className="input-number" name="spacingX" value={gridSettings.spacingX} onChange={handleGridChange} min="0" />
              </div>
              <div>
                <label className="label" style={{ marginTop: 0 }}>Spacing Y</label>
                <input type="number" className="input-number" name="spacingY" value={gridSettings.spacingY} onChange={handleGridChange} min="0" />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
              The entire image is automatically sliced according to these grid rules. Any incomplete cells at the edges are ignored.
            </p>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0.5rem' }}
                onClick={() => setIsGridNamingOpen(!isGridNamingOpen)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isGridNamingOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span>Name Grid Slices</span>
                </div>
                <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-color)', padding: '2px 6px', borderRadius: '10px' }}>{gridRegions?.length || 0}</span>
              </button>
              
              {isGridNamingOpen && (
                <div style={{ marginTop: '0.5rem', maxHeight: '300px', overflowY: 'auto', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  {gridRegions?.length === 0 ? (
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.5rem' }}>No grid slices found.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {gridRegions.map((region) => (
                        <div key={region.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', width: '1.5rem', textAlign: 'right' }}>#{region.index}</div>
                          <input 
                            type="text" 
                            className="input-text" 
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', flex: 1 }}
                            placeholder={`${region.name.split('_')[0]}_${region.index}`}
                            value={gridNames[region.index] || ''}
                            onChange={(e) => setGridNames(prev => ({ ...prev, [region.index]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'custom' && (
          <div className="config-section">
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Shape Presets</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
              {[8, 16, 32, 64, 128].map(size => (
                <button 
                  key={size} 
                  className="btn btn-outline" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flex: '1 1 calc(33% - 0.35rem)' }}
                  onClick={() => spawnPreset(size, size)}
                  disabled={!imageLoaded}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <input type="number" className="input-number" style={{ padding: '0.25rem', height: '28px' }} value={customPresetW} onChange={(e) => setCustomPresetW(e.target.value)} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>x</span>
              <input type="number" className="input-number" style={{ padding: '0.25rem', height: '28px' }} value={customPresetH} onChange={(e) => setCustomPresetH(e.target.value)} />
              <button className="btn btn-primary" style={{ padding: '2px 8px', height: '28px' }} onClick={() => spawnPreset(parseInt(customPresetW) || 32, parseInt(customPresetH) || 32)} disabled={!imageLoaded}>
                <Plus size={14} /> Add
              </button>
            </div>

            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>Custom Slices</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Click and drag on the canvas to draw slices, or use the presets above.
            </p>
            
            {customRegions.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px dashed var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                No regions defined yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {customRegions.map(region => (
                  <div 
                    key={region.id} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '0.5rem', 
                      padding: '0.5rem',
                      backgroundColor: selectedRegionId === region.id ? '#eff6ff' : 'var(--bg-color)',
                      border: `1px solid ${selectedRegionId === region.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedRegionId(region.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={region.name} 
                        onChange={(e) => updateRegionProperty(region.id, 'name', e.target.value)}
                        className="input-text"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', flex: 1, marginRight: '0.5rem' }}
                      />
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.25rem' }} 
                        onClick={(e) => { e.stopPropagation(); removeRegion(region.id); }}
                        title="Remove Slice"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {/* Dimension Editors */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.25rem', fontSize: '0.7rem' }}>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>W:</div>
                        <input type="number" className="input-number" style={{ padding: '0.2rem', fontSize: '0.75rem', height: '24px' }} value={region.width} onChange={(e) => updateRegionProperty(region.id, 'width', e.target.value)} />
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>H:</div>
                        <input type="number" className="input-number" style={{ padding: '0.2rem', fontSize: '0.75rem', height: '24px' }} value={region.height} onChange={(e) => updateRegionProperty(region.id, 'height', e.target.value)} />
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>X:</div>
                        <input type="number" className="input-number" style={{ padding: '0.2rem', fontSize: '0.75rem', height: '24px' }} value={region.x} onChange={(e) => updateRegionProperty(region.id, 'x', e.target.value)} />
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Y:</div>
                        <input type="number" className="input-number" style={{ padding: '0.2rem', fontSize: '0.75rem', height: '24px' }} value={region.y} onChange={(e) => updateRegionProperty(region.id, 'y', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <div className="sidebar-footer">
        <label className="label">Export Settings</label>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <label className="checkbox-label">
            <input 
              type="radio" 
              name="exportMode" 
              value="zip" 
              checked={exportMode === 'zip'} 
              onChange={() => setExportMode('zip')} 
            /> 
            ZIP File (Recommended)
          </label>
          <label className="checkbox-label">
            <input 
              type="radio" 
              name="exportMode" 
              value="direct" 
              checked={exportMode === 'direct'} 
              onChange={() => setExportMode('direct')} 
            /> 
            Direct PNG Downloads
          </label>
        </div>

        {exportMode === 'direct' && (
          <div className="alert-warning" style={{ marginBottom: '1.25rem' }}>
            <AlertTriangle size={14} style={{ display: 'inline', marginRight: '0.25rem', marginBottom: '-2px' }} />
            <strong>Warning:</strong> Direct download triggers browser prompts for every single slice.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={!imageLoaded || (mode === 'custom' && customRegions.length === 0)}
            onClick={onExport}
          >
            <Download size={18} /> Export Slices
          </button>

          {imageLoaded && (
            <button className="btn btn-outline" style={{ width: '100%', borderStyle: 'dashed' }} onClick={onReset}>
              <RefreshCw size={16} /> Select New Image
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
