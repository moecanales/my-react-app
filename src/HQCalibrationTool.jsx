import React, { useState } from 'react';

export const HQCalibrationTool = () => {
  const [pins, setPins] = useState([
    { id: 1, name: "Seattle", x: 260, y: 50 },
    { id: 2, name: "Portland", x: 240, y: 150 },
    { id: 3, name: "San Francisco", x: 250, y: 600 }
  ]);
  const [activePin, setActivePin] = useState(1);

  const updatePin = (dx, dy) => {
    setPins(pins.map(p => p.id === activePin ? { ...p, x: p.x + dx, y: p.y + dy } : p));
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 99999, pointerEvents: 'none', width: '100%', height: '100%' }}>
      {/* MAP PINS */}
      {pins.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%, -50%)',
          width: '30px', height: '30px', backgroundColor: activePin === p.id ? '#ff4444' : '#3b82f6',
          color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontWeight: '900', fontSize: '16px', border: '3px solid white', boxShadow: '0 0 10px rgba(0,0,0,0.8)'
        }}>
          {p.id}
        </div>
      ))}

      {/* FLOATING CONTROL PANEL - POSITIONED JUST RIGHT OF THE COAST */}
      <div style={{ position: 'fixed', top: '20px', left: '350px', backgroundColor: 'rgba(15, 23, 42, 0.95)', color: 'white', padding: '15px', borderRadius: '8px', pointerEvents: 'auto', border: '2px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '300px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#0ea5e9', textAlign: 'center', fontFamily: 'monospace' }}>HQ CALIBRATOR</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          {pins.map(p => (
            <button key={p.id} onClick={() => setActivePin(p.id)} style={{ backgroundColor: activePin === p.id ? '#ff4444' : '#334155', color: 'white', padding: '8px', cursor: 'pointer', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
              {p.id}: {p.name.substring(0,3)}
            </button>
          ))}
        </div>

        {/* NUDGE CONTROLS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '15px', textAlign: 'center' }}>
          <div />
          <button onClick={() => updatePin(0, -1)} style={{ padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>↑ 1px</button>
          <div />
          <button onClick={() => updatePin(-1, 0)} style={{ padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>← 1px</button>
          <button onClick={() => updatePin(0, 1)} style={{ padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>↓ 1px</button>
          <button onClick={() => updatePin(1, 0)} style={{ padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>→ 1px</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '15px' }}>
          <button onClick={() => updatePin(0, -10)} style={{ padding: '5px', cursor: 'pointer' }}>↑ 10px</button>
          <button onClick={() => updatePin(0, 10)} style={{ padding: '5px', cursor: 'pointer' }}>↓ 10px</button>
          <button onClick={() => updatePin(-10, 0)} style={{ padding: '5px', cursor: 'pointer' }}>← 10px</button>
          <button onClick={() => updatePin(10, 0)} style={{ padding: '5px', cursor: 'pointer' }}>→ 10px</button>
        </div>

        {/* OUTPUT BOX */}
        <textarea readOnly value={JSON.stringify(pins, null, 2)} style={{ width: '100%', height: '140px', backgroundColor: '#020617', color: '#4ade80', border: '1px solid #334155', padding: '10px', fontFamily: 'monospace', resize: 'none' }} />
      </div>
    </div>
  );
};