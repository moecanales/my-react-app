import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from './App';
import { getNativeCardInfo } from './NewCardsData';
import GameCard from './GameCard';

const AnimatedCardWrapper = ({ item, index, children }) => {
    const [flyStyle, setFlyStyle] = useState({});
    const prevIndex = useRef(index);
    const isFirstMount = useRef(true);

    useEffect(() => {
        if (!item) return;

        if (isFirstMount.current) {
            isFirstMount.current = false;
            const deckEl = document.querySelector('.deck-box'); 
            const targetEl = document.getElementById(`belt-slot-container-${index}`);
            
            if (deckEl && targetEl) {
                const dRect = deckEl.getBoundingClientRect();
                const tRect = targetEl.getBoundingClientRect();
                
                setFlyStyle({ transform: `translate(${dRect.left - tRect.left}px, ${dRect.top - tRect.top}px)`, transition: 'none', zIndex: 100 });

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setFlyStyle({ transform: 'translate(0px, 0px)', transition: 'transform 1000ms cubic-bezier(0.25, 0.1, 0.25, 1)', zIndex: 100 });
                        setTimeout(() => setFlyStyle({}), 1050);
                    });
                });
            }
        } else if (prevIndex.current !== index) {
            const oldSlotEl = document.getElementById(`belt-slot-container-${prevIndex.current}`);
            const newSlotEl = document.getElementById(`belt-slot-container-${index}`);
            
            if (oldSlotEl && newSlotEl) {
                const oRect = oldSlotEl.getBoundingClientRect();
                const nRect = newSlotEl.getBoundingClientRect();
                
                setFlyStyle({ transform: `translate(${oRect.left - nRect.left}px, ${oRect.top - nRect.top}px)`, transition: 'none', zIndex: 50 });

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setFlyStyle({ transform: 'translate(0px, 0px)', transition: 'transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)', zIndex: 50 });
                        setTimeout(() => setFlyStyle({}), 450);
                    });
                });
            }
            prevIndex.current = index;
        }
    }, [item, index]);

    return <div style={{ position: 'relative', ...flyStyle, width: '100%', display: 'flex', justifyContent: 'center' }}>{children}</div>;
};

const ConveyorBelt = () => {
  const gameState = useGameStore(state => state.gameState);
  const swapBeltCards = useGameStore(state => state.swapBeltCards);
  const toggleAudit = useGameStore(state => state.toggleAudit); 
  const toggleDiscardAction = useGameStore(state => state.toggleDiscard);
  const animatingCards = useGameStore(state => state.animatingCards);
  const targetedCardIndices = useGameStore(state => state.targetedCardIndices);
  
  const hoveredCardFinancials = useGameStore(state => state.hoveredCardFinancials) || [];
  console.log("Hover Data:", hoveredCardFinancials);
  
  const toggleDiscard = toggleDiscardAction || (() => console.log('Discard inspector not wired yet'));
  
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  // --- NEW: Auto-deselect timer (7 seconds) ---
  useEffect(() => {
      let timer;
      if (selectedIndex !== null) {
          timer = setTimeout(() => {
              setSelectedIndex(null);
          }, 7000);
      }
      return () => {
          if (timer) clearTimeout(timer);
      };
  }, [selectedIndex]);

  const belt = gameState?.abacus?.belt || [];

  const windowRef = useRef(null);
  const trackRef = useRef(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);

  useEffect(() => {
      let timeoutId;

      const checkBounds = () => {
          if (windowRef.current && trackRef.current) {
              const winW = windowRef.current.clientWidth;
              const trackW = trackRef.current.scrollWidth;
              
              let diff = trackW - winW;
              if (diff < 5) diff = 0; 
              
              const newMax = Math.max(0, diff);
              setMaxOffset(newMax);
              
              setScrollOffset(prev => {
                  if (prev > newMax) return newMax;
                  if (prev < 0) return 0;
                  return prev;
              });
          }
      };

      checkBounds(); 

      let observer;
      if (trackRef.current) {
          observer = new ResizeObserver(() => {
              checkBounds(); 
              clearTimeout(timeoutId);
              timeoutId = setTimeout(checkBounds, 250); 
          });
          observer.observe(trackRef.current);
      }

      window.addEventListener('resize', checkBounds);
      
      return () => {
          window.removeEventListener('resize', checkBounds);
          if (observer) observer.disconnect();
          clearTimeout(timeoutId);
      };
  }, [belt.length]); 

  const canScrollLeft = scrollOffset < (maxOffset - 2);
  const canScrollRight = scrollOffset > 2;

  const slideLeft = () => { if (canScrollLeft) setScrollOffset(prev => Math.min(prev + 200, maxOffset)); };
  const slideRight = () => { if (canScrollRight) setScrollOffset(prev => Math.max(prev - 200, 0)); };

  const [activeDiscardTab, setActiveDiscardTab] = useState('green');
  
  const discards = gameState?.discards;
  const activePile = discards?.[activeDiscardTab] || [];
  const topDiscardItem = activePile[activePile.length - 1];
  const topDiscardInfo = topDiscardItem ? getNativeCardInfo(topDiscardItem) : null;

  const handleCardClick = (index) => {
    if (selectedIndex === null) setSelectedIndex(index);
    else if (selectedIndex === index) setSelectedIndex(null);
    else { swapBeltCards(selectedIndex, index); setSelectedIndex(null); }
  };

  const MAX_SLOTS = 5;
  const displayBelt = belt.map((item, index) => ({ item, index })).reverse();
  
  const currentLen = displayBelt.length;
  for (let i = currentLen; i < MAX_SLOTS; i++) {
      displayBelt.push({ item: null, index: i });
  }

  return (
    <div style={{ 
        gridArea: '3 / 2 / 4 / 3', 
        backgroundColor: '#1a1a20', 
        padding: '10px 30px', 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'flex-start', 
        borderTop: '4px solid #333', 
        gap: '20px', 
        overflow: 'visible', 
        position: 'relative', 
        zIndex: 50, 
        width: '100%', 
        boxSizing: 'border-box' 
    }}>
      
      <style>
        {`
          .deck-box {
            width: 135px; height: 135px; background: #4a154b;
            border: 4px solid #2d0d2e; border-radius: 12px; display: flex; flex-direction: column;
            align-items: center; justify-content: center; color: #fff; font-weight: 900;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.8);
            cursor: pointer; transition: all 0.2s;
            flex-shrink: 0; margin-top: 5px; position: relative; overflow: hidden;
          }
          .deck-box:hover { 
            transform: translateY(-3px); 
            filter: drop-shadow(0 0 8px #ffd700); 
            box-shadow: inset 0 0 20px rgba(0,0,0,0.9), 0 15px 25px rgba(0,0,0,1); 
          }
          .slot-number { color: #888; font-weight: 900; font-size: 1.2em; text-align: center; margin-top: 10px; text-shadow: 1px 1px 2px #000; }
          .copper-text { font-family: Copperplate, 'Copperplate Gothic Light', fantasy, serif; }

          @keyframes arrowPulse {
            0% { box-shadow: 0 0 5px #ffd700, inset 0 0 5px #ffd700; filter: brightness(1); }
            50% { box-shadow: 0 0 20px #ffd700, inset 0 0 10px #ffd700; filter: brightness(1.3); }
            100% { box-shadow: 0 0 5px #ffd700, inset 0 0 5px #ffd700; filter: brightness(1); }
          }
          
          @keyframes energyPulse {
              0% { filter: brightness(1.1); }
              50% { filter: brightness(1.4); }
              100% { filter: brightness(1.1); }
          }
          @keyframes errorFlash {
              0% { border-color: #ff4444; background-color: rgba(255, 68, 68, 0.4); box-shadow: inset 0 0 20px rgba(255, 68, 68, 0.8); }
              50% { border-color: #555; background-color: rgba(0,0,0,0.3); box-shadow: inset 0 5px 15px rgba(0,0,0,0.8); }
              100% { border-color: #ff4444; background-color: rgba(255, 68, 68, 0.4); box-shadow: inset 0 0 20px rgba(255, 68, 68, 0.8); }
          }
        `}
      </style>

      {/* --- LEFT BREAD: SCALED DOWN CARD BACK DECK BOX --- */}
      <div style={{ flexShrink: 0, zIndex: 10 }}>
        <div className="deck-box" onClick={toggleAudit} title="Click to view Audit Ledger">
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30px', background: 'linear-gradient(to bottom, #b666d2, #8c3aab)', zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="copper-text" style={{ 
                  fontSize: '22px', 
                  fontWeight: '900', 
                  color: '#000', 
                  letterSpacing: '6px', 
                  marginRight: '-6px',
                  WebkitTextStroke: '1px #000',
                  textShadow: '3px 3px 5px rgba(0,0,0,0.7)'
              }}>
                  TILE
              </div>
           </div>
           
           <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px', background: 'linear-gradient(to bottom, #8c3aab, #b666d2)', zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="copper-text" style={{ 
                  fontSize: '22px', 
                  fontWeight: '900', 
                  color: '#000', 
                  letterSpacing: '5px', 
                  marginRight: '-5px',
                  WebkitTextStroke: '1px #000',
                  textShadow: '3px 3px 5px rgba(0,0,0,0.7)'
              }}>
                  DECK
              </div>
           </div>

           <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '34px 0' }}>
             <div className="copper-text" style={{ position: 'relative', top: '4px', fontSize: '9px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>
                 RIGHT OF WAY
             </div>

             <div style={{ position: 'relative', width: '80px', height: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               {[1, 2, 3, 4, 5, 6].map((tie) => (
                 <div key={tie} style={{ width: '6px', height: '100%', backgroundColor: '#78350f', borderLeft: '1px solid #b45309', borderRight: '1px solid #451a03', boxShadow: '2px 2px 2px rgba(0,0,0,0.6)' }}></div>
               ))}
               <div style={{ position: 'absolute', top: '5px', left: '-6px', width: '92px', height: '6px', background: 'linear-gradient(90deg, #64748b 0%, #94a3b8 50%, #ffffff 80%, #475569 100%)', borderTop: '1px solid #ffffff', borderBottom: '1px solid #1e293b', boxShadow: '0 2px 3px rgba(0,0,0,0.7)' }}></div>
               <div style={{ position: 'absolute', bottom: '5px', left: '-6px', width: '92px', height: '6px', background: 'linear-gradient(90deg, #64748b 0%, #94a3b8 50%, #ffffff 80%, #475569 100%)', borderTop: '1px solid #ffffff', borderBottom: '1px solid #1e293b', boxShadow: '0 2px 3px rgba(0,0,0,0.7)' }}></div>
             </div>

             <div className="copper-text" style={{ position: 'relative', bottom: '4px', fontSize: '8px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' }}>
                 EASTWARD BOUND
             </div>
           </div>
        </div>
      </div>

      {/* --- THE MEAT: THE CONCRETE CAROUSEL WINDOW --- */}
      <div style={{ flex: '0 0 820px', position: 'relative', height: '240px', boxSizing: 'border-box' }}>
        
        <button 
            disabled={!canScrollLeft} 
            onClick={slideLeft} 
            style={{ position: 'absolute', left: '-20px', top: '85px', transform: 'translateY(-50%)', zIndex: 200, background: '#333', color: '#ffd700', border: '2px solid #555', borderRadius: '50%', width: '40px', height: '40px', cursor: canScrollLeft ? 'pointer' : 'not-allowed', opacity: canScrollLeft ? 1 : 0.3, fontWeight: 'bold', animation: canScrollLeft ? 'arrowPulse 1.5s infinite' : 'none', transition: 'opacity 0.3s' }}
        > 
            ◀ 
        </button>

        <div ref={windowRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', clipPath: 'inset(-200% 0 -200% 0)', overflow: 'visible' }}>
          
          <div ref={trackRef} style={{
              position: 'absolute',
              right: 0,
              top: 0,
              height: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              gap: '5px',
              paddingTop: '5px',
              transform: `translateX(${scrollOffset}px)`,
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}>
            {displayBelt.map(({ item, index }) => {
                const slotNumber = index + 1;
                const uniqueAnimKey = item ? `card-instance-${item.id}` : `empty-slot-${index}`;
                const isFlying = animatingCards?.some(ac => ac.stepIndex === index);
                
                const financialData = hoveredCardFinancials.find(d => d.index === index);
                const isTargeted = !!financialData;
                const currentGlow = financialData ? financialData.glowColor : '#ffd700';

                return (
                  <div key={uniqueAnimKey} id={`belt-slot-container-${index}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {item ? (
                        <AnimatedCardWrapper item={item} index={index}>
                            <div 
                                id={`belt-slot-${index}`}
                                onClick={() => handleCardClick(index)}
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                                style={{ 
                                    opacity: isFlying ? 0 : 1, 
                                    pointerEvents: isFlying ? 'none' : 'auto',
                                    transition: 'transform 0.2s ease-out', 
                                    transformOrigin: 'top center',
                                    transform: selectedIndex === index ? 'scale(0.65) translateY(-15px)' : (hoverIndex === index || isTargeted ? 'scale(0.65) translateY(-5px)' : 'scale(0.65)'), 
                                    margin: '0 -30px -60px -30px', 
                                    cursor: isFlying ? 'default' : 'pointer'
                                }}
                            >
                                {/* THE FIX: Separated the Filter from the Animation to protect complex SVGs from tearing */}
                                <div style={{
                                    filter: selectedIndex === index ? `drop-shadow(0 0 20px ${currentGlow}) brightness(1.15)` : (isTargeted ? `drop-shadow(0 0 15px ${currentGlow}) brightness(1.2)` : (hoverIndex === index ? `drop-shadow(0 0 8px #ffd700)` : 'none')),
                                    transform: 'translateZ(0)',
                                    willChange: 'filter',
                                    position: 'relative' // REQUIRED HUD ANCHOR
                                }}>
                                    
                                    {/* --- FLOATING MENU HUD --- */}
                                    <div style={{ 
                                        position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', 
                                        marginBottom: '15px', zIndex: 1000, pointerEvents: 'none', 
                                        opacity: financialData ? 1 : 0, transition: 'opacity 0.2s', 
                                        display: 'flex', flexDirection: 'column', alignItems: 'center' 
                                    }}>
                                        {financialData && (
                                            financialData.type === 'red' ? (
                                                <div style={{ fontSize: '2.5em', fontWeight: '900', color: '#c084fc', textShadow: '0 0 15px #c084fc, 2px 2px 4px #000', borderBottom: '3px solid #94a3b8', paddingBottom: '4px' }}>
                                                    -${financialData.value}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.85)', padding: '12px 16px', borderRadius: '8px', border: '2px solid #555', boxShadow: '0 5px 15px rgba(0,0,0,0.9)', minWidth: '180px' }}>
                                                    
                                                    {/* --- TRACK REVENUE (I-BEAMS) --- */}
                                                    {financialData.trackStacks && financialData.trackStacks.length > 0 && (
                                                        <div style={{ fontSize: '0.75em', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '2px' }}>
                                                            Track Steel
                                                        </div>
                                                    )}
                                                    {financialData.trackStacks && financialData.trackStacks.map((stack, i) => (
                                                        <React.Fragment key={`track-${i}`}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', width: '100%' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    {stack.isUniversal ? (
                                                                        <svg width="16" height="16" viewBox="0 0 16 16" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.8))' }}>
                                                                            <path d="M2 2h12v3H10v6h4v3H2v-3h4V5H2V2z" fill="#fff" stroke="#aaa" strokeWidth="1" strokeLinejoin="round" />
                                                                        </svg>
                                                                    ) : (
                                                                        stack.colors.map((color, cIdx) => (
                                                                            <React.Fragment key={cIdx}>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                    <svg width="16" height="16" viewBox="0 0 16 16" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.8))' }}>
                                                                                        <path d="M2 2h12v3H10v6h4v3H2v-3h4V5H2V2z" fill={color} stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
                                                                                    </svg>
                                                                                    <span style={{ color: '#fff', fontSize: '1.2em', fontWeight: 'bold', textShadow: '1px 1px 2px #000' }}>{stack.shortNames[cIdx]}</span>
                                                                                </div>
                                                                                {cIdx < stack.colors.length - 1 && <span style={{ color: '#888', fontWeight: '900', fontSize: '1.2em', margin: '0 2px' }}>/</span>}
                                                                            </React.Fragment>
                                                                        ))
                                                                    )}
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                                    <div style={{ fontSize: '0.65em', color: stack.recipientColor, fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '-2px', whiteSpace: 'nowrap' }}>{stack.recipientTag}</div>
                                                                    <div style={{ fontSize: '2.2em', fontWeight: '900', color: stack.recipientColor, textShadow: `0 0 12px ${stack.recipientColor}80, 2px 2px 4px #000`, whiteSpace: 'nowrap' }}>
                                                                        +${stack.value}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {i < financialData.trackStacks.length - 1 && <div style={{ color: '#888', fontWeight: 'bold', textAlign: 'center', fontSize: '0.9em', margin: '2px 0' }}>OR</div>}
                                                        </React.Fragment>
                                                    ))}

                                                    {/* --- CARD EFFECTS (CIRCLES) --- */}
                                                    {financialData.cardStacks && financialData.cardStacks.length > 0 && (
                                                        <div style={{ fontSize: '0.75em', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '2px', marginTop: '4px' }}>
                                                            Card Effect
                                                        </div>
                                                    )}
                                                    {financialData.cardStacks && financialData.cardStacks.map((stack, i) => (
                                                        <React.Fragment key={`card-${i}`}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', width: '100%' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    {stack.isUniversal ? (
                                                                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #aaa', boxShadow: '0 2px 4px rgba(0,0,0,0.8)' }} />
                                                                    ) : (
                                                                        stack.colors.map((color, cIdx) => (
                                                                            <React.Fragment key={cIdx}>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: color, border: '1px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.8)' }} />
                                                                                    <span style={{ color: '#fff', fontSize: '1.2em', fontWeight: 'bold', textShadow: '1px 1px 2px #000' }}>{stack.shortNames[cIdx]}</span>
                                                                                </div>
                                                                                {cIdx < stack.colors.length - 1 && <span style={{ color: '#888', fontWeight: '900', fontSize: '1.2em', margin: '0 2px' }}>/</span>}
                                                                            </React.Fragment>
                                                                        ))
                                                                    )}
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                                    <div style={{ fontSize: '0.65em', color: stack.recipientColor, fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '-2px', whiteSpace: 'nowrap' }}>{stack.recipientTag}</div>
                                                                    <div style={{ fontSize: '2.2em', fontWeight: '900', color: stack.recipientColor, textShadow: `0 0 12px ${stack.recipientColor}80, 2px 2px 4px #000`, whiteSpace: 'nowrap' }}>
                                                                        {stack.isPositive ? '+' : '-'}${stack.value}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {i < financialData.cardStacks.length - 1 && <div style={{ color: '#888', fontWeight: 'bold', textAlign: 'center', fontSize: '0.9em', margin: '2px 0' }}>OR</div>}
                                                        </React.Fragment>
                                                    ))}
                                                    
                                                </div>
                                            )
                                        )}
                                    </div>
                                    {/* --- END FLOATING MENU HUD --- */}

                                    <div style={{
                                        animation: isTargeted ? 'energyPulse 1.2s ease-in-out infinite' : 'none',
                                        transformOrigin: 'center center',
                                        transform: 'translateZ(0)',
                                        willChange: 'filter'
                                    }}>
                                        <GameCard 
                                            type={item.type} 
                                            name={getNativeCardInfo(item).name} 
                                            level={item.level || 1} 
                                            price={window.game ? window.game.calculateSlotPrice(index) : 0} 
                                            desc={getNativeCardInfo(item).desc} 
                                            icon={getNativeCardInfo(item).icon} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </AnimatedCardWrapper>
                    ) : (
                        <div style={{ 
                            transform: 'scale(0.65)', transformOrigin: 'top center', 
                            margin: '0 -30px -60px -30px', width: '219px', height: '216px', 
                            borderRadius: '16.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            border: isTargeted ? `4px solid ${currentGlow}` : '4px dashed #555',
                            backgroundColor: isTargeted ? `${currentGlow}33` : 'rgba(0,0,0,0.3)',
                            boxShadow: isTargeted ? `inset 0 0 20px ${currentGlow}cc` : 'inset 0 5px 15px rgba(0,0,0,0.8)',
                            animation: isTargeted ? 'errorFlash 0.5s infinite' : 'none'
                        }}>
                            <span style={{ color: isTargeted ? currentGlow : '#555', fontWeight: '900', fontSize: '1.8em', letterSpacing: '2px' }}>EMPTY</span>
                        </div>
                    )}
                    <div className="slot-number" style={{ color: isTargeted ? (item ? currentGlow : '#ff4444') : '#888' }}>{slotNumber}</div>
                  </div>
                );
            })}
          </div>
        </div>

        <button 
            disabled={!canScrollRight} 
            onClick={slideRight} 
            style={{ position: 'absolute', right: '-20px', top: '85px', transform: 'translateY(-50%)', zIndex: 200, background: '#333', color: '#ffd700', border: '2px solid #555', borderRadius: '50%', width: '40px', height: '40px', cursor: canScrollRight ? 'pointer' : 'not-allowed', opacity: canScrollRight ? 1 : 0.3, fontWeight: 'bold', animation: canScrollRight ? 'arrowPulse 1.5s infinite' : 'none', transition: 'opacity 0.3s' }}
        > 
            ▶ 
        </button>

      </div>

      {/* --- RIGHT BREAD: TABBED DISCARD PILE --- */}
      <div style={{ flexShrink: 0, zIndex: 10 }}>
        <div style={{ position: 'relative', marginLeft: '15px', display: 'flex', flexShrink: 0 }}>
            
            <div id="discard-pile" className="deck-box" onClick={toggleDiscard} title="Click to view Discard Pile" style={{ margin: 0, zIndex: 10 }}>
               {topDiscardItem && topDiscardInfo ? (
                  <>
                    <div style={{ width: '100%', height: '100%', clipPath: 'inset(0 round 12px)', filter: 'grayscale(100%) opacity(0.5)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ transform: 'scale(0.65)' }}>
                            <GameCard 
                                type={topDiscardItem.type} 
                                name={topDiscardInfo.name} 
                                level={topDiscardItem.level || 1} 
                                price={0} 
                                desc={topDiscardInfo.desc} 
                                icon={topDiscardInfo.icon}
                                hidePrice={true} 
                            />
                        </div>
                    </div>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, overflow: 'hidden', clipPath: 'inset(0 round 12px)' }}>
                        <div className="copper-text" style={{ 
                            transform: 'rotate(-35deg)', 
                            fontSize: '18px', 
                            fontWeight: '900', 
                            color: '#fff', 
                            letterSpacing: '4px',
                            textShadow: '0 0 10px #000, 2px 2px 0px rgba(0,0,0,0.9), -1px -1px 0px rgba(0,0,0,0.9)',
                            borderTop: '2px solid rgba(255, 255, 255, 0.3)',
                            borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
                            padding: '4px 0',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            width: '140%',
                            textAlign: 'center',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.8)'
                        }}>
                            DISCARD
                        </div>
                    </div>
                  </>
               ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                      <div className="copper-text" style={{ fontSize: '14px', color: '#fff', letterSpacing: '3px' }}>DISCARD</div>
                      <div className="copper-text" style={{ fontSize: '10px', color: '#fff', letterSpacing: '1px', marginTop: '4px' }}>PILE</div>
                  </div>
               )}
            </div>

            <div style={{ position: 'absolute', top: '50%', right: '-16px', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 5 }}>
                {['green', 'blue', 'red'].map(color => {
                    const count = discards?.[color]?.length || 0;
                    const isActive = activeDiscardTab === color;
                    
                    const baseHex = color === 'green' ? '#33A02C' : color === 'blue' ? '#0A50A1' : '#811788';
                    const isDepleted = count === 0;
                    
                    return (
                        <div 
                            key={color}
                            onClick={() => { if (!isDepleted) setActiveDiscardTab(color); }}
                            style={{
                                width: isDepleted ? '8px' : (isActive ? '18px' : '14px'), 
                                height: '32px', 
                                borderRadius: '0 8px 8px 0',
                                backgroundColor: isDepleted ? '#1a1a20' : baseHex,
                                border: isActive ? '2px solid #ffd700' : '2px solid #111',
                                borderLeft: 'none',
                                opacity: isDepleted ? 0.8 : (isActive ? 1 : 0.7),
                                cursor: isDepleted ? 'default' : 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                boxShadow: isDepleted ? 'inset 2px 0px 4px rgba(0,0,0,0.8)' : '4px 4px 6px rgba(0,0,0,0.8)'
                            }}
                            title={`${color.toUpperCase()} Discards (${count})`}
                        />
                    );
                })}
            </div>
        </div>
      </div>

    </div>
  );
};

export default ConveyorBelt;