import React, { useEffect, useState } from 'react';
import { useGameStore } from './App';

const AnimationOverlay = () => {
    const animatingCards = useGameStore(state => state.animatingCards);
    const [positions, setPositions] = useState({});

    useEffect(() => {
        if (!animatingCards || animatingCards.length === 0) {
            setPositions({});
            return;
        }

        const newPositions = { ...positions };
        let needsUpdate = false;

        animatingCards.forEach((data) => {
            const id = data.card.id || data.card.uid || data.card.label;
            const currentPos = newPositions[id];

            if (!currentPos) {
                const slotEl = document.getElementById(`belt-slot-${data.stepIndex}`);
                if (slotEl) {
                    const rect = slotEl.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    newPositions[id] = { x: cx - 70, y: cy - 60, state: 'origin' };
                    needsUpdate = true;
                }
            } else if (data.isPlunging && currentPos.state !== 'plunging') {
                const discardEl = document.getElementById('discard-pile');
                if (discardEl) {
                    const rect = discardEl.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    newPositions[id] = { x: cx - 70, y: cy - 60, state: 'plunging' }; 
                    needsUpdate = true;
                }
            } else if (!data.isPlunging && currentPos.state === 'origin') {
                newPositions[id] = { x: data.targetX - 70, y: data.targetY - 60, state: 'floating' };
                needsUpdate = true;
            }
        });

        if (needsUpdate) {
            setPositions(newPositions);
            
            const hasOrigins = Object.values(newPositions).some(p => p.state === 'origin');
            if (hasOrigins) {
                setTimeout(() => {
                    setPositions(prev => {
                        const updated = { ...prev };
                        animatingCards.forEach(d => {
                            const id = d.card.id || d.card.uid || d.card.label;
                            if (updated[id] && updated[id].state === 'origin') {
                                updated[id] = { x: d.targetX - 70, y: d.targetY - 60, state: 'floating' };
                            }
                        });
                        return updated;
                    });
                }, 50);
            }
        }
    }, [animatingCards]);

    if (!animatingCards || animatingCards.length === 0) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 99999 }}>
            {animatingCards.map((data) => {
                const id = data.card.id || data.card.uid || data.card.label;
                const pos = positions[id];
                if (!pos) return null;

                // THE FIX: The resting scale now multiplies by the map's current zoom level 
                // so the cards match the depth perspective of the map perfectly.
                let scale = 1;
                if (pos.state === 'floating') scale = 0.4 * (data.targetZoom || 1); 
                if (pos.state === 'plunging') scale = 1.1; 

                let transition = 'none';
                if (pos.state === 'floating') transition = 'transform 1000ms cubic-bezier(0.25, 0.1, 0.25, 1)';
                if (pos.state === 'plunging') transition = 'transform 450ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 150ms ease-out 300ms';

                return (
                    <div key={id} style={{
                        position: 'absolute',
                        left: 0, top: 0,
                        transformOrigin: 'center center',
                        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})`,
                        transition: transition,
                        opacity: pos.state === 'plunging' ? 0 : 1,
                        filter: pos.state !== 'origin' ? 'drop-shadow(0 15px 15px rgba(0,0,0,0.6))' : 'none'
                    }}>
                        {data.imageUrl ? (
                            <img src={data.imageUrl} alt="Card Ghost" style={{ width: '140px', height: 'auto', borderRadius: '12px' }} />
                        ) : (
                            <div style={{ width: '140px', height: '117px', background: '#333', border: '2px solid red' }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default AnimationOverlay;