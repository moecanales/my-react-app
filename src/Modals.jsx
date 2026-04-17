import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from './App';
import { getNativeCardInfo } from './NewCardsData';
import GameCard from './GameCard';
import { generateTownLore } from './LoreGenerator';

const useModalScale = () => {
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const handleResize = () => {
      const wScale = window.innerWidth / 1200;
      const hScale = window.innerHeight / 1100;
      setScale(Math.min(1, wScale, hScale));
    };
    
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return scale;
};

const PortfolioCardItem = ({ data, color, isDenseView }) => {
    const [activeTab, setActiveTab] = useState(1);
    const info1 = getNativeCardInfo({ ...data.baseCard, level: 1 });
    const info2 = getNativeCardInfo({ ...data.baseCard, level: 2 });
    const info3 = getNativeCardInfo({ ...data.baseCard, level: 3 });

    return (
        <GameCard
            type={color}
            name={info1.name}
            price={0}
            desc1={info1.desc}
            desc2={info2.desc}
            desc3={info3.desc}
            icon={info1.icon}
            invCounts={data.counts}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showTabs={true}
            disableZoom={true} 
            isDenseView={isDenseView}
            hidePrice={true}
        />
    );
};

const LedgerLineItem = ({ name, type, level, label, count, locationTag, coColor, hexColor }) => {
    const setTooltip = useGameStore(state => state.setHoveredTooltip);

    const cardData = { type, label, level };
    const nativeInfo = getNativeCardInfo(cardData);
    const stars = Array(level).fill('★').join('');
    
    const accents = { 
        'green': { main: '#33A02C', accent: '#4ade80' }, 
        'blue': { main: '#0A50A1', accent: '#60a5fa' }, 
        'red': { main: '#811788', accent: '#c084fc' } 
    };
    const theme = accents[type] || accents['blue'];

    const handleMouseEnter = (e) => {
        const typeLabel = type === 'red' ? 'PURPLE' : type.toUpperCase();
        
        const html = `
            <div style="display: flex; flex-direction: column; gap: 8px; font-family: 'Courier New', Courier, monospace; min-width: 280px; padding: 4px;">
                <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; text-shadow: 1px 1px 2px #000;">
                    ${name.toUpperCase()}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 13px; font-weight: 900; color: ${theme.accent}; letter-spacing: 1.5px; text-transform: uppercase;">
                        ${typeLabel} Asset (${label})
                    </span>
                    <span style="font-size: 18px; color: #FFD700; text-shadow: 0 0 5px rgba(255,215,0,0.5);">
                        ${stars}
                    </span>
                </div>
                <hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.2); margin: 6px 0;" />
                <div style="font-size: 14px; color: #cbd5e1; line-height: 1.5; font-weight: 500; font-family: Arial, sans-serif;">
                    ${nativeInfo.desc}
                </div>
            </div>
        `;
        setTooltip({ x: e.clientX, y: e.clientY, html });
    };

    const handleMouseLeave = () => { setTooltip(null); };

    const countDisplay = count > 1 ? `x${count}` : '';

    return (
        <div 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '10px 12px', borderBottom: '1px solid #334155', 
                cursor: 'help', transition: 'background-color 0.1s' 
            }}
            className="ledger-row" 
        >
            <style>{`.ledger-row:hover { background-color: rgba(255,255,255,0.05); }`}</style>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ 
                    fontFamily: 'Courier New, monospace', fontSize: '12px', fontWeight: 'bold', 
                    color: coColor || hexColor, backgroundColor: 'rgba(0,0,0,0.3)', 
                    padding: '2px 8px', borderRadius: '4px', border: `1px solid ${coColor || hexColor}`, 
                    opacity: 0.8, minWidth: '70px', textAlign: 'center' 
                }}>
                    {locationTag.toUpperCase()}
                </span>
                
                <span style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '15px' }}>
                    {name}
                </span>
                
                <span style={{ color: '#aaa', fontSize: '13px', opacity: 0.8 }}>
                    ({label} - Lvl {level})
                </span>
            </div>
            
            <span style={{ fontSize: '16px', fontWeight: '900', color: theme.accent, textShadow: `0 0 8px ${theme.main}` }}>
                {countDisplay}
            </span>
        </div>
    );
};

const TelegramDispatch = () => {
  const telegramQueue = useGameStore(state => state.telegramQueue);
  const dequeueTelegram = useGameStore(state => state.dequeueTelegram);
  const gameState = useGameStore(state => state.gameState);
  
  const showStartMenu = useGameStore(state => state.showStartMenu);
  const showLedger = useGameStore(state => state.showLedger);
  const selectedNodeId = useGameStore(state => state.selectedNodeId);
  const showTrashModal = useGameStore(state => state.showTrashModal);
  const showProxyModal = useGameStore(state => state.showProxyModal);
  const showLiquidation = useGameStore(state => state.showLiquidation);
  const showGameOver = useGameStore(state => state.showGameOver);
  const showAssetsModal = useGameStore(state => state.showAssetsModal);
  const showAudit = useGameStore(state => state.showAudit);
  const showDiscard = useGameStore(state => state.showDiscard);
  const showAudioSettings = useGameStore(state => state.showAudioSettings);

  const isBlockingModalOpen = 
    showStartMenu || showLedger || showTrashModal || showProxyModal || 
    showLiquidation || showGameOver || showAssetsModal || showAudit || 
    showDiscard || showAudioSettings || selectedNodeId !== null || 
    (gameState?.parlorOffers?.length > 0) || (gameState?.inIPOPhase);

  const [activeMsg, setActiveMsg] = useState(null);

  useEffect(() => {
    let timer;
    if (!activeMsg && !isBlockingModalOpen && telegramQueue.length > 0) {
        setActiveMsg(telegramQueue[0]);
    }
    if (activeMsg) {
        timer = setTimeout(() => {
            setActiveMsg(null);
            dequeueTelegram();
        }, 6000);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [activeMsg, isBlockingModalOpen, telegramQueue, dequeueTelegram]);

  if (!activeMsg) return null;

  return (
    <div key={activeMsg.id} style={{
        position: 'fixed',
        top: '80px', 
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10005,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, fadeOut 0.5s ease-in 5.5s forwards'
    }}>
        <style>{`
            @keyframes slideDown { 0% { top: -100px; opacity: 0; } 100% { top: 80px; opacity: 1; } }
            @keyframes fadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }
        `}</style>
        
        <div style={{
            backgroundColor: '#0f172a',
            border: `2px solid ${activeMsg.color || '#ca8a04'}`,
            borderRadius: '8px',
            padding: '20px 30px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)',
            minWidth: '400px',
            maxWidth: '600px',
            textAlign: 'center'
        }}>
            <div style={{ color: activeMsg.color || '#ca8a04', fontSize: '12px', letterSpacing: '4px', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase' }}>
                TELEGRAM DISPATCH: {activeMsg.town}
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#f8fafc', fontSize: '18px', lineHeight: '1.5' }}>
                "{activeMsg.text}"
            </div>
        </div>
    </div>
  );
};

const TrashModal = () => {
  const showTrashModal = useGameStore(state => state.showTrashModal);
  const trashCount = useGameStore(state => state.trashCount);
  const gameState = useGameStore(state => state.gameState);
  const executeTrashSelection = useGameStore(state => state.executeTrashSelection);
  const [selectedCards, setSelectedCards] = useState([]);

  useEffect(() => {
      if (showTrashModal) {
          setSelectedCards([]);
      }
  }, [showTrashModal]);

  if (!showTrashModal || !gameState) return null;

  const { inventory, discards, belt } = gameState;

  const compileDeck = () => {
      const list = [];
      ['green', 'blue', 'red'].forEach(color => {
          if (inventory && inventory[color]) inventory[color].forEach(c => list.push({ ...c, loc: 'Deck' }));
          if (discards && discards[color]) discards[color].forEach(c => list.push({ ...c, loc: 'Discard' }));
      });
      if (belt) belt.forEach(c => list.push({ ...c, loc: 'Belt' }));
      return list;
  };

  const deck = compileDeck();

  const handleToggleCard = (id) => {
      if (selectedCards.includes(id)) {
          setSelectedCards(selectedCards.filter(cId => cId !== id));
      } else if (selectedCards.length < trashCount) {
          setSelectedCards([...selectedCards, id]);
      }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '12px', border: '2px solid #E57373', color: 'white', maxWidth: '850px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
            <div>
                <h2 style={{ margin: 0, color: '#E57373', letterSpacing: '1px' }}>SCRAP CARDS</h2>
                <p style={{ margin: '5px 0 0 0', color: '#ccc', fontSize: '0.9em' }}>Select up to {trashCount} cards to permanently remove from your deck.</p>
            </div>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                Selected: <span style={{ color: selectedCards.length === trashCount ? '#E57373' : 'white' }}>{selectedCards.length}</span> / {trashCount}
            </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '10px 5px' }}>
            {deck.map((c, i) => {
                const isSelected = selectedCards.includes(c.id);
                const bgColors = { 'green': '#2e7d32', 'blue': '#1565c0', 'red': '#7e22ce' };
                const baseBg = bgColors[c.type] || '#555';

                const info = getNativeCardInfo(c);
                return (
                    <div 
                        key={c.id || i} 
                        onClick={() => handleToggleCard(c.id)}
                        style={{ 
                            width: '130px', padding: '15px', borderRadius: '8px', cursor: 'pointer',
                            backgroundColor: isSelected ? '#E57373' : baseBg,
                            color: isSelected ? '#000' : '#fff',
                            border: `3px solid ${isSelected ? '#fff' : 'transparent'}`,
                            boxShadow: isSelected ? '0 0 15px rgba(229, 115, 115, 0.8)' : 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                            transition: 'all 0.2s ease', opacity: (selectedCards.length >= trashCount && !isSelected) ? 0.4 : 1
                        }}
                    >
                        <span style={{ fontWeight: 'bold', fontSize: '1.05em', marginBottom: '5px', lineHeight: '1.2' }}>{info.name}</span>
                        <span style={{ fontSize: '0.85em', opacity: 0.9 }}>Lvl {c.level || 1} <span style={{fontSize:'0.8em', opacity: 0.7}}>({c.label})</span></span>
                        <span style={{ fontSize: '0.8em', marginTop: '10px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.8 }}>{c.loc}</span>
                    </div>
                );
            })}
            {deck.length === 0 && <div style={{ color: '#888', fontStyle: 'italic', padding: '20px' }}>No cards available to scrap.</div>}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
                onClick={() => executeTrashSelection(selectedCards)}
                style={{ padding: '15px 30px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1em', fontWeight: 'bold' }}
            >
                Confirm Scrap
            </button>
        </div>

      </div>
    </div>
  );
};

const ProxyModal = () => {
  const showProxyModal = useGameStore(state => state.showProxyModal);
  const proxyCompanyId = useGameStore(state => state.proxyCompanyId);
  const gameState = useGameStore(state => state.gameState);
  const executeProxySelection = useGameStore(state => state.executeProxySelection);

  if (!showProxyModal || !proxyCompanyId || !gameState) return null;

  const company = gameState.companies[proxyCompanyId];
  
  let choices = [];
  if (window.game && typeof window.game.getProxyOptions === 'function') {
      choices = window.game.getProxyOptions(proxyCompanyId) || [];
  } else if (company && company.proxyChoices) {
      choices = company.proxyChoices;
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#222', padding: '30px', borderRadius: '12px', border: `3px solid ${company?.colorStr || '#FFD700'}`, color: 'white', maxWidth: '500px', width: '90%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
        
        <h2 style={{ color: company?.colorStr || '#FFD700', marginTop: 0, letterSpacing: '1px' }}>ASSIGN CORPORATE PROXY</h2>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.5em' }}>{company?.name || proxyCompanyId}</h3>
        <p style={{ color: '#ccc', marginBottom: '25px', fontSize: '0.95em' }}>A corporate action demands a definitive direction. Select a proxy resolution below.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {choices.length > 0 ? (
                choices.map((choice, i) => (
                    <button 
                        key={choice.id || i}
                        onClick={() => executeProxySelection(choice.id)}
                        style={{ padding: '15px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1em', transition: 'all 0.2s', fontWeight: 'bold' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#444'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#333'}
                    >
                        {choice.label || choice.name || `Resolution Option ${i + 1}`}
                    </button>
                ))
            ) : (
                <div style={{ padding: '20px', backgroundColor: '#333', borderRadius: '6px' }}>
                    <p style={{ color: '#E57373', margin: '0 0 15px 0', fontStyle: 'italic' }}>No proxy directives found in vanilla engine.</p>
                    <button 
                        onClick={() => executeProxySelection('fallback')} 
                        style={{ padding: '12px', width: '100%', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Bypass / Force Continue
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export const AuditModal = () => {
  const showAudit = useGameStore(state => state.showAudit);
  const toggleAudit = useGameStore(state => state.toggleAudit);
  const gameState = useGameStore(state => state.gameState);
  
  const [viewMode, setViewMode] = useState('gallery'); 
  const [isDenseView, setIsDenseView] = useState(true); 
  const [ledgerSort, setLedgerSort] = useState('type'); 
  const scale = useModalScale();

  const portfolioData = useMemo(() => {
    if (!gameState) return { gallery: { green:{}, blue:{}, red:{} }, ledger: [], stats: { total:0, g:0, b:0, r:0 } };
    
    const { inventory, discards, belt } = gameState;
    const galleryDeck = { green: {}, blue: {}, red: {} };
    
    let stats = { total:0, g:0, b:0, r:0 };
    const ledgerMap = new Map(); 

    const processItem = (card, preciseLoc, coColor) => {
        stats.total++;
        if (card.type === 'green') stats.g++;
        if (card.type === 'blue') stats.b++;
        if (card.type === 'red') stats.r++;

        if (galleryDeck[card.type]) {
            const gKey = card.label;
            if (!galleryDeck[card.type][gKey]) {
                galleryDeck[card.type][gKey] = { baseCard: card, counts: { 1: 0, 2: 0, 3: 0 } };
            }
            galleryDeck[card.type][gKey].counts[card.level || 1]++;
        }

        const lKey = `${card.type}_${card.label}_L${card.level || 1}_${preciseLoc}`;
        
        if (!ledgerMap.has(lKey)) {
            const info = getNativeCardInfo(card);
            ledgerMap.set(lKey, {
                key: lKey,
                name: info.name,
                label: card.label,
                level: card.level || 1,
                type: card.type,
                locationTag: preciseLoc,
                coColor: coColor,
                count: 0
            });
        }
        ledgerMap.get(lKey).count++;
    };

    ['green', 'blue', 'red'].forEach(color => {
        (inventory[color] || []).forEach(c => processItem(c, 'DECK', null));
        (discards[color] || []).forEach(c => processItem(c, 'DISCARD', null));
    });
    (belt || []).forEach((c, idx) => processItem(c, `BELT: ${idx+1}`, null));

    return { gallery: galleryDeck, rawLedger: Array.from(ledgerMap.values()), stats };
  }, [gameState]);

  if (!showAudit || !gameState) return null;

  const renderGalleryRow = (title, colorDict, colorHex) => {
      const cards = Object.values(colorDict);
      if (cards.length === 0) return null;
      const gapSize = isDenseView ? '15px' : '30px';

      return (
          <div style={{ marginBottom: isDenseView ? '15px' : '30px' }}>
              <h3 style={{ color: colorHex, borderBottom: `1px solid ${colorHex}`, paddingBottom: '10px', marginTop: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {title} ({cards.length})
              </h3>
              <div style={{ display: 'flex', overflowX: 'auto', gap: gapSize, padding: '20px 10px', paddingBottom: '30px', scrollbarWidth: 'thin', scrollbarColor: `${colorHex} #1e293b` }}>
                  {cards.map(data => (
                      <PortfolioCardItem key={data.baseCard.label} data={data} color={data.baseCard.type} isDenseView={isDenseView} />
                  ))}
              </div>
          </div>
      );
  };

  const renderSortedLedger = (rawLedgerArray) => {
      const renderSection = (title, items, hex) => {
          if (items.length === 0) return null;
          return (
              <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: hex, borderBottom: `1px solid ${hex}`, paddingBottom: '10px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {title} ({items.length} lines)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {items.map(({ key, ...item }) => <LedgerLineItem key={key} {...item} hexColor={hex} />)}
                  </div>
              </div>
          );
      };

      let sorted = [...rawLedgerArray];

      if (ledgerSort === 'location') {
          const locOrder = (loc) => {
              if (loc.startsWith('BELT')) return 1;
              if (loc === 'DECK') return 2;
              if (loc === 'DISCARD') return 3;
              return 4;
          };
          sorted.sort((a, b) => locOrder(a.locationTag) - locOrder(b.locationTag) || a.name.localeCompare(b.name));
      } else {
          sorted.sort((a, b) => a.name.localeCompare(b.name) || a.level - b.level);
      }

      const gList = sorted.filter(i => i.type === 'green');
      const bList = sorted.filter(i => i.type === 'blue');
      const rList = sorted.filter(i => i.type === 'red');

      return (
          <div style={{ padding: '10px' }}>
              {renderSection('Infrastructure Assets', gList, '#4ade80')}
              {renderSection('Blue Contract Agreements', bList, '#60a5fa')}
              {renderSection('Purple Market Actions', rList, '#c084fc')} 
          </div>
      );
  };

  const { gallery, rawLedger, stats } = portfolioData;

  const btnStyle = (isActive) => ({
      padding: '6px 12px',
      backgroundColor: isActive ? '#facc15' : '#1e293b',
      color: isActive ? '#000' : '#94a3b8',
      border: '1px solid #facc15',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '12px'
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(6px)' }}>
      <div style={{ 
          backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: 'white', 
          width: '95%', maxWidth: '1400px', height: '85vh', display: 'flex', 
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)', zoom: scale, overflow: 'hidden'
      }}>
        
        <div style={{ width: '280px', backgroundColor: '#020617', borderRight: '1px solid #334155', padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '0 0 40px 0', color: '#facc15', letterSpacing: '2px', fontSize: '24px', fontWeight: '900' }}>DECK PORTFOLIO</h2>
            <div style={{ marginBottom: '30px' }}><div style={{ color: '#94a3b8', fontSize: '12px', letterSpacing: '1px', marginBottom: '5px' }}>TOTAL ASSETS</div><div style={{ color: '#f8fafc', fontSize: '48px', fontWeight: '900' }}>{stats.total}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div><div style={{ color: '#4ade80', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px' }}>GREEN (INFRA)</div><div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{stats.g}</div></div>
                <div><div style={{ color: '#60a5fa', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px' }}>BLUE (CONTRACTS)</div><div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{stats.b}</div></div>
                <div><div style={{ color: '#c084fc', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px' }}>PURPLE (MARKET)</div><div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{stats.r}</div></div>
            </div>
            <button onClick={toggleAudit} style={{ marginTop: 'auto', padding: '15px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; e.currentTarget.style.color = '#fff'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>CLOSE BINDER</button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '30px', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '20px', gap: '20px' }}>
                
                {viewMode === 'ledger' && (
                    <div style={{ display: 'flex', gap: '8px', marginRight: '20px', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', marginRight: '5px' }}>SORT BY:</span>
                        <button onClick={() => setLedgerSort('type')} style={{...btnStyle(ledgerSort==='type')}}>TYPE</button>
                        <button onClick={() => setLedgerSort('location')} style={{...btnStyle(ledgerSort==='location')}}>LOCATION</button>
                    </div>
                )}

                {viewMode === 'gallery' && (
                    <button 
                        onClick={() => setIsDenseView(!isDenseView)}
                        style={{ padding: '10px', backgroundColor: isDenseView ? '#facc15' : '#1e293b', color: isDenseView ? '#000' : '#facc15', border: '1px solid #facc15', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}
                        title={isDenseView ? "Switch to Normal View" : "Switch to Dense Grid View"}
                    >
                        [::: DENSE {isDenseView ? 'ON' : 'OFF'}]
                    </button>
                )}

                <div style={{ display: 'flex', backgroundColor: '#1e293b', borderRadius: '8px', padding: '4px' }}>
                    <button onClick={() => setViewMode('gallery')} style={{ padding: '8px 20px', backgroundColor: viewMode === 'gallery' ? '#334155' : 'transparent', color: viewMode === 'gallery' ? '#facc15' : '#94a3b8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>GALLERY VIEW</button>
                    <button onClick={() => setViewMode('ledger')} style={{ padding: '8px 20px', backgroundColor: viewMode === 'ledger' ? '#334155' : 'transparent', color: viewMode === 'ledger' ? '#facc15' : '#94a3b8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>LEDGER VIEW</button>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                <style>{`
                    ::-webkit-scrollbar { height: 8px; width: 8px; }
                    ::-webkit-scrollbar-track { background: #0f172a; }
                    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
                    ::-webkit-scrollbar-thumb:hover { background: #475569; }
                `}</style>
                
                {viewMode === 'gallery' ? (
                    <div>
                        {renderGalleryRow('Infrastructure Assets', gallery.green, '#4ade80')}
                        {renderGalleryRow('Blue Contract Agreements', gallery.blue, '#60a5fa')}
                        {renderGalleryRow('Purple Market Actions', gallery.red, '#c084fc')}
                    </div>
                ) : (
                    <div>
                        {renderSortedLedger(rawLedger)}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const NodeActionModal = () => {
  const selectedNodeId = useGameStore(state => state.selectedNodeId);
  const closeNodeModal = useGameStore(state => state.closeNodeModal);
  const executeBuild = useGameStore(state => state.executeBuild);
  const gameState = useGameStore(state => state.gameState);

  const targetNode = gameState?.nodes.find(n => n.id === selectedNodeId);
  
  const eligibleCompanies = React.useMemo(() => {
      if (!gameState || selectedNodeId === null) return [];
      return Object.values(gameState.companies).filter(comp => {
          const isAdjacent = gameState.connections.some(c => 
              (comp.activeLines.includes(c.from) && c.to === selectedNodeId) || 
              (comp.activeLines.includes(c.to) && c.from === selectedNodeId)
          );
          const alreadyBuilt = comp.builtNodes.includes(selectedNodeId);
          return isAdjacent && !alreadyBuilt;
      });
  }, [gameState, selectedNodeId]);

  const gossipText = React.useMemo(() => {
      if (!targetNode) return "";
      const compName = eligibleCompanies.length > 0 ? eligibleCompanies[0].name : "The Syndicate";
      return generateTownLore(targetNode.name, compName, 'anticipation');
  }, [selectedNodeId]);

  if (selectedNodeId === null || !gameState) return null;

  return (
    <div onClick={closeNodeModal} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <style>{`
        .charter-btn { transition: transform 0.15s, box-shadow 0.15s, filter 0.15s; }
        .charter-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.2); box-shadow: 0 8px 15px rgba(0,0,0,0.5); }
        .charter-btn:active:not(:disabled) { transform: translateY(1px); box-shadow: 0 2px 5px rgba(0,0,0,0.5); }
      `}</style>
      
      <div onClick={(e) => e.stopPropagation()} style={{ 
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)',
          padding: '0', 
          borderRadius: '12px', 
          border: '2px solid #ca8a04', 
          color: 'white', 
          width: '500px', 
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(202, 138, 4, 0.2)',
          overflow: 'hidden',
          fontFamily: 'Arial, sans-serif'
      }}>
        
        <div style={{ padding: '30px 30px 20px 30px', textAlign: 'center', borderBottom: '1px solid rgba(202, 138, 4, 0.3)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <div style={{ color: '#ca8a04', fontSize: '12px', letterSpacing: '3px', fontWeight: '900', marginBottom: '10px' }}>ESTABLISH RAIL SERVICE</div>
            <h2 style={{ margin: 0, fontSize: '36px', fontWeight: '900', fontFamily: 'Georgia, serif', color: '#f8fafc', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                {targetNode?.name || 'Wilderness'}
            </h2>
        </div>

        <div style={{ padding: '25px 30px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                color: '#cbd5e1',
                fontSize: '16px',
                lineHeight: '1.6',
                textAlign: 'center',
                padding: '15px',
                borderLeft: '3px solid #ca8a04',
                borderRight: '3px solid #ca8a04',
                backgroundColor: 'rgba(0,0,0,0.2)'
            }}>
                "{gossipText}"
            </div>
        </div>
        
        <div style={{ padding: '10px 30px 30px 30px' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center' }}>Available Charters:</p>
            
            {eligibleCompanies.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {eligibleCompanies.map(comp => {
                        let sourceNodeId = comp.headNode;
                        const conn = gameState.connections.find(c => 
                            (comp.activeLines.includes(c.from) && c.to === selectedNodeId) || 
                            (comp.activeLines.includes(c.to) && c.from === selectedNodeId)
                        );
                        if (conn) {
                            sourceNodeId = comp.activeLines.includes(conn.from) ? conn.from : conn.to;
                        }
                        
                        const b = window.game.getSegmentCostBreakdown(comp.id, sourceNodeId, selectedNodeId);
                        const totalCost = b.total;
                        
                        const canAfford = comp.treasury >= totalCost;
                        const hasFuel = comp.trackSegments >= b.units;

                        let statusText = `(Cost: $${totalCost})`;
                        let btnAction = null;
                        let isClickable = false;
                        let textColor = '#94a3b8';
                        let borderColor = comp.colorStr || '#555';

                        if (!hasFuel) {
                            statusText = `(Needs ${b.units} Steel)`;
                            textColor = '#f87171';
                        } else if (canAfford) {
                            btnAction = () => executeBuild(comp.id, selectedNodeId);
                            isClickable = true;
                            textColor = '#4ade80';
                        } else {
                            const deficit = totalCost - comp.treasury;
                            const marketTrack = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 225, 250, 275, 300, 350, 400, 450, 500];
                            const stockIndex = comp.stockIndex !== undefined ? comp.stockIndex : 4;
                            const sharePrice = marketTrack[stockIndex] || 15;
                            const sharesNeeded = Math.ceil(deficit / sharePrice);
                            const autoFundCost = sharesNeeded * sharePrice;
                            const sharesAvailable = comp.maxShares - comp.sharesIssued;

                            if (sharesNeeded > sharesAvailable) {
                                statusText = `(Short $${deficit} - Max Shares)`;
                                textColor = '#f87171';
                            } else if (gameState.playerCash < autoFundCost) {
                                statusText = `(Short $${deficit} - Need $${autoFundCost})`;
                                textColor = '#f87171';
                            } else {
                                statusText = `(Auto-Fund: -$${autoFundCost} Cash)`;
                                textColor = '#facc15'; 
                                isClickable = true;
                                btnAction = () => {
                                    if (window.game) {
                                        for (let i = 0; i < sharesNeeded; i++) {
                                            window.game.buyShare(comp.id);
                                        }
                                    }
                                    executeBuild(comp.id, selectedNodeId);
                                };
                            }
                        }

                        return (
                            <button 
                                key={comp.id}
                                onClick={btnAction}
                                disabled={!isClickable}
                                className="charter-btn"
                                style={{ 
                                    padding: '0', 
                                    borderRadius: '6px', 
                                    cursor: isClickable ? 'pointer' : 'not-allowed', 
                                    backgroundColor: isClickable ? '#1e293b' : '#0f172a',
                                    border: `1px solid ${isClickable ? borderColor : '#334155'}`, 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                    boxShadow: isClickable ? '0 4px 6px rgba(0,0,0,0.3)' : 'none'
                                }}
                            >
                                <div style={{ backgroundColor: isClickable ? borderColor : '#334155', width: '8px', alignSelf: 'stretch' }}></div>
                                <div style={{ padding: '15px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: isClickable ? '#f8fafc' : '#64748b' }}>{comp.name}</span>
                                    <span style={{ fontSize: '14px', color: textColor, fontWeight: isClickable ? 'normal' : 'bold' }}>
                                        {statusText}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div style={{ padding: '15px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                    No active railheads adjacent to this location.
                </div>
            )}

            <button onClick={closeNodeModal} style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; e.currentTarget.style.color = '#f8fafc'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                CLOSE PORTFOLIO
            </button>
        </div>
      </div>
    </div>
  );
};

const LedgerModal = () => {
  const showLedger = useGameStore(state => state.showLedger);
  const closeLedger = useGameStore(state => state.closeLedger);
  const gameState = useGameStore(state => state.gameState);
  if (!showLedger || !gameState) return null;

  const ledger = gameState.turnLedger || { operations: [], settlements: [], boardMeetings: [] };
  const renderRow = (entry, i) => (
    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #444', fontSize: '0.95em' }}>
      <span style={{ flex: 2 }}>{entry.desc}</span>
      <span style={{ flex: 1, textAlign: 'right', color: entry.playerNet >= 0 ? '#4CAF50' : '#F44336' }}>{entry.playerNet > 0 ? '+' : ''}${entry.playerNet}</span>
      <span style={{ flex: 1, textAlign: 'right', color: entry.baronNet >= 0 ? '#4CAF50' : '#F44336' }}>{entry.baronNet > 0 ? '+' : ''}${entry.baronNet}</span>
    </div>
  );

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9998, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '8px', border: '1px solid #555', color: 'white', width: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '15px' }}>Year {gameState.year} / Turn {gameState.turn - 1} Summary</h2>
        <div style={{ overflowY: 'auto', paddingRight: '10px', flex: 1 }}>
            <h3 style={{ color: '#64B5F6', margin: '15px 0 5px 0' }}>Operations</h3>
            {ledger.operations.length > 0 ? ledger.operations.map(renderRow) : <div style={{ color: '#666', fontStyle: 'italic' }}>No operations this turn.</div>}
            <h3 style={{ color: '#E57373', margin: '20px 0 5px 0' }}>Settlements & Penalties</h3>
            {ledger.settlements.length > 0 ? ledger.settlements.map(renderRow) : <div style={{ color: '#666', fontStyle: 'italic' }}>No settlements this turn.</div>}
            <h3 style={{ color: '#FFD700', margin: '20px 0 5px 0' }}>Board Meetings (Dividends)</h3>
            {ledger.boardMeetings.length > 0 ? ledger.boardMeetings.map(renderRow) : <div style={{ color: '#666', fontStyle: 'italic' }}>No dividends paid.</div>}
        </div>
        <button style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1em', fontWeight: 'bold' }} onClick={closeLedger}>Accept & Advance Year</button>
      </div>
    </div>
  );
};

const LiquidationModal = () => {
  const showLiquidation = useGameStore(state => state.showLiquidation);
  const gameState = useGameStore(state => state.gameState);

  if (!showLiquidation || !gameState) return null;

  const deficit = Math.abs(gameState.playerCash);
  const isSafe = gameState.playerCash >= 0;

  const handleSell = (id) => { 
      window.game.liquidateOne(id); 
  };
  const handleUndo = () => { 
      window.game.undoLiquidation(); 
  };
  const handleConfirm = () => { 
      useGameStore.setState({ showLiquidation: false });
      window.game.completeEndTurn(); 
  };

  const MARKET_TRACK = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 225, 250, 275, 300, 350, 400, 450, 500];

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#222', padding: '30px', borderRadius: '8px', border: `2px solid ${isSafe ? '#4CAF50' : '#F44336'}`, color: 'white', minWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ color: isSafe ? '#4CAF50' : '#F44336', marginTop: 0 }}>{isSafe ? 'DEBT CLEARED' : 'LIQUIDATION REQUIRED'}</h2>
        <p style={{ color: '#ccc', marginBottom: '20px' }}>
            {isSafe ? `You have raised enough funds. Cash: $${gameState.playerCash}` : `You are $${deficit} in debt. Sell shares to cover costs.`}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
            {['bo', 'nyc', 'prr'].map(id => {
                const comp = gameState.companies[id];
                const shares = gameState.playerShares[id] || 0;
                if (!comp || shares <= 0) return null;
                const price = MARKET_TRACK[comp.stockIndex] || 0;
                return (
                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '10px', borderLeft: `4px solid ${comp.colorStr}` }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', color: comp.colorStr }}>{comp.name}</div>
                            <div style={{ fontSize: '0.85em', color: '#aaa' }}>Own: {shares} (Val: ${price})</div>
                        </div>
                        <button onClick={() => handleSell(id)} style={{ padding: '6px 12px', backgroundColor: '#F44336', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>SELL 1</button>
                    </div>
                );
            })}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleUndo} style={{ flex: 1, padding: '10px', backgroundColor: '#555', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>UNDO LAST SALE</button>
            <button onClick={handleConfirm} disabled={!isSafe} style={{ flex: 2, padding: '10px', backgroundColor: isSafe ? '#4CAF50' : '#444', color: isSafe ? 'black' : '#888', border: 'none', cursor: isSafe ? 'pointer' : 'not-allowed', borderRadius: '4px', fontWeight: 'bold' }}>CONFIRM & END TURN</button>
        </div>
      </div>
    </div>
  );
};

const GameOverModal = () => {
    const showGameOver = useGameStore(state => state.showGameOver);
    const gameOverData = useGameStore(state => state.gameOverData);
    const restartGame = useGameStore(state => state.restartGame);

    if (!showGameOver || !gameOverData) return null;

    const { baronScore, playerScore, reason } = gameOverData;
    const win = playerScore > baronScore && reason !== "BANKRUPTCY" && reason !== "FORFEIT" && reason !== "DEADLINE PASSED" && reason !== "BARON TAKEOVER" && reason !== "ALL COMPANIES BANKRUPT";
    const msg = win ? "YOU WIN!" : "BARON WINS.";

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#1a1a24', padding: '40px', borderRadius: '8px', border: `3px solid ${win ? '#4CAF50' : '#F44336'}`, color: 'white', textAlign: 'center', minWidth: '500px', boxShadow: '0 0 40px rgba(0,0,0,0.9)' }}>
                <h1 style={{ color: win ? '#4CAF50' : '#F44336', marginTop: 0, fontSize: '3em', letterSpacing: '2px' }}>{msg}</h1>
                <h3 style={{ color: '#aaa', margin: '10px 0 30px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>{reason}</h3>

                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '40px', backgroundColor: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
                    <div>
                        <div style={{ color: '#FFD700', fontSize: '1.2em', fontWeight: 'bold', marginBottom: '10px' }}>YOUR NET WORTH</div>
                        <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>${playerScore}</div>
                    </div>
                    <div style={{ borderLeft: '2px solid #333', paddingLeft: '40px' }}>
                        <div style={{ color: '#BF40BF', fontSize: '1.2em', fontWeight: 'bold', marginBottom: '10px' }}>BARON NET WORTH</div>
                        <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>${baronScore}</div>
                    </div>
                </div>

                <button onClick={restartGame} style={{ padding: '15px 30px', backgroundColor: '#d32f2f', color: 'white', border: '2px solid #fff', borderRadius: '4px', cursor: 'pointer', fontSize: '1.3em', fontWeight: 'bold', width: '100%', textTransform: 'uppercase' }}>
                    PLAY AGAIN
                </button>
            </div>
        </div>
    );
};

const PrivateAssetsModal = () => {
  const showAssetsModal = useGameStore(state => state.showAssetsModal);
  const toggleAssetsModal = useGameStore(state => state.toggleAssetsModal);
  const gameState = useGameStore(state => state.gameState);
  const embezzleAsset = useGameStore(state => state.embezzleAsset);

  const [formState, setFormState] = React.useState({});

  if (!showAssetsModal || !gameState) return null;

  const assets = Object.values(gameState.privateCompanies || {});
  const eligiblePublicCompanies = Object.keys(gameState.companies)
    .filter(id => gameState.playerShares[id] > 0)
    .map(id => gameState.companies[id]);

  const handleEmbezzle = (assetId) => {
    const data = formState[assetId];
    if (!data || !data.targetId || !data.price) {
        alert("Please select a company and set a price.");
        return;
    }
    embezzleAsset(assetId, data.targetId, data.price);
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#252533', padding: '30px', borderRadius: '8px', border: '2px solid #ffd700', color: 'white', minWidth: '400px', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ color: '#ffd700', borderBottom: '1px solid #555', paddingBottom: '10px', marginTop: 0 }}>PRIVATE ASSETS (CHARTERS)</h2>
        {assets.length === 0 && <p style={{ color: '#888' }}>No private assets exist on this map.</p>}
        {assets.map(asset => {
            const isOwnedByPlayer = asset.owner === 'player';
            const stickerPrice = asset.purchasePrice || asset.baseValue;
            const absoluteMaxPrice = stickerPrice * 2;
            let ownerText = "Unowned";
            let ownerColor = "#888";
            if (isOwnedByPlayer) { ownerText = "Owned by You"; ownerColor = "#4dff4d"; }
            else if (asset.owner === 'baron') { ownerText = "Owned by Baron"; ownerColor = "#bf40bf"; }
            else if (asset.owner) { ownerText = `Owned by ${gameState.companies[asset.owner]?.short}`; ownerColor = gameState.companies[asset.owner]?.colorStr; }

            return (
                <div key={asset.id} style={{ backgroundColor: '#1a1a24', border: `1px solid ${isOwnedByPlayer ? '#ffd700' : '#444'}`, padding: '15px', marginBottom: '15px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: '0', color: isOwnedByPlayer ? '#ffd700' : '#fff' }}>[{asset.mapLabel}] {asset.name}</h3>
                        <span style={{ color: ownerColor, fontWeight: 'bold', fontSize: '0.8em', textTransform: 'uppercase' }}>{ownerText}</span>
                    </div>
                    <div style={{ fontSize: '0.85em', color: '#aaa', margin: '10px 0' }}>
                        Acquired Price: ${stickerPrice} | Income: ${asset.incomeValue}/yr
                    </div>
                    {isOwnedByPlayer && (
                        <div style={{ backgroundColor: '#111', padding: '10px', border: '1px solid #444', marginTop: '10px' }}>
                            <strong style={{ fontSize: '0.8em', color: '#fff' }}>EMBEZZLE (TELEPORT RAILHEAD)</strong>
                            <p style={{ fontSize: '0.75em', color: '#888', margin: '5px 0' }}>Sell to a public company for up to ${absoluteMaxPrice}.</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <select 
                                    style={{ flex: 1, backgroundColor: '#000', color: '#fff', padding: '5px', border: '1px solid #555' }}
                                    onChange={(e) => setFormState({...formState, [asset.id]: {...formState[asset.id], targetId: e.target.value}})}
                                    value={formState[asset.id]?.targetId || ""}
                                >
                                    <option value="">-- Select Company --</option>
                                    {eligiblePublicCompanies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} (Treasury: ${c.treasury})</option>
                                    ))}
                                </select>
                                <input 
                                    type="number" min="1" max={absoluteMaxPrice} placeholder="Price"
                                    style={{ width: '80px', backgroundColor: '#000', color: '#fff', padding: '5px', border: '1px solid #555' }}
                                    onChange={(e) => setFormState({...formState, [asset.id]: {...formState[asset.id], price: e.target.value}})}
                                    value={formState[asset.id]?.price || ""}
                                />
                                <button 
                                    onClick={() => handleEmbezzle(asset.id)}
                                    style={{ backgroundColor: '#1a1a20', color: '#ffd700', border: '1px solid #ffd700', padding: '5px 15px', cursor: 'pointer', fontWeight: 'bold' }}
                                >SELL</button>
                            </div>
                        </div>
                    )}
                </div>
            )
        })}
        <button onClick={toggleAssetsModal} style={{ width: '100%', marginTop: '10px', padding: '12px', backgroundColor: '#444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>CLOSE</button>
      </div>
    </div>
  );
};

const TooltipOverlay = () => {
  const tooltip = useGameStore(state => state.hoveredTooltip);
  if (!tooltip) return null;

  let leftPos = tooltip.x + 15;
  let topPos = tooltip.y + 15;

  if (leftPos > window.innerWidth - 260) leftPos = tooltip.x - 260;
  if (topPos > window.innerHeight - 150) topPos = tooltip.y - 150;

  return (
    <>
      <style>{`
        @keyframes tooltipSnap {
          0% { opacity: 0; transform: translateY(8px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div style={{
        position: 'fixed', left: leftPos, top: topPos,
        background: 'linear-gradient(145deg, rgba(20, 20, 25, 0.95), rgba(10, 10, 15, 0.98))', 
        border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '3px solid #facc15',
        padding: '16px', pointerEvents: 'none', textAlign: 'left',
        zIndex: 10005, minWidth: '240px', maxWidth: '300px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.05)', 
        borderRadius: '6px', backdropFilter: 'blur(6px)',
        animation: 'tooltipSnap 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
      }} dangerouslySetInnerHTML={{ __html: tooltip.html }} />
    </>
  );
};

const AudioSettingsModal = () => {
    const show = useGameStore(state => state.showAudioSettings);
    const toggle = useGameStore(state => state.toggleAudioSettings);
    const toggleAudio = useGameStore(state => state.toggleAudio);
    const isMuted = useGameStore(state => state.gameState?.isMuted);

    const [musicVol, setMusicVol] = useState(0.4);
    const [sfxVol, setSfxVol] = useState(0.8);
    const [voiceVol, setVoiceVol] = useState(0.8);

    useEffect(() => {
        if (show && window.game?.audio) {
            if (window.game.audio.musicGain) setMusicVol(window.game.audio.musicGain.gain.value);
            if (window.game.audio.sfxGain) setSfxVol(window.game.audio.sfxGain.gain.value);
            setVoiceVol(window.tutorialVolume || 0.8);
        }
    }, [show]);

    if (!show) return null;

    const handleMusic = (e) => {
        const val = parseFloat(e.target.value);
        setMusicVol(val);
        if (window.game?.audio?.setMusicVolume) window.game.audio.setMusicVolume(val);
    };

    const handleSfx = (e) => {
        const val = parseFloat(e.target.value);
        setSfxVol(val);
        if (window.game?.audio?.setSfxVolume) window.game.audio.setSfxVolume(val);
    };

    const handleVoice = (e) => {
        const val = parseFloat(e.target.value);
        setVoiceVol(val);
        window.tutorialVolume = val;
        if (window.game?.audio?.setVoiceVolume) window.game.audio.setVoiceVolume(val);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10005, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#1a1a20', border: '2px solid #ffd700', padding: '30px', borderRadius: '8px', width: '400px', color: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.9)' }}>
                <h2 style={{ color: '#ffd700', marginTop: 0, borderBottom: '1px solid #555', paddingBottom: '10px' }}>AUDIO SETTINGS</h2>

                <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
                    <button onClick={toggleAudio} style={{ padding: '12px', backgroundColor: '#111', color: isMuted ? '#ff4d4d' : '#4dff4d', border: '1px solid #ffd700', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2em', width: '100%' }}>
                        {isMuted ? '🔇 MUTED' : '🔊 AUDIO'}
                    </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#aaa', fontWeight: 'bold' }}>
                        <span>Background Music</span> <span>{Math.round(musicVol * 100)}%</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={musicVol} onChange={handleMusic} style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#aaa', fontWeight: 'bold' }}>
                        <span>Sound Effects (SFX)</span> <span>{Math.round(sfxVol * 100)}%</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={sfxVol} onChange={handleSfx} style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#aaa', fontWeight: 'bold' }}>
                        <span>Baron's Voice (Tutorial MP3s)</span> <span>{Math.round(voiceVol * 100)}%</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={voiceVol} onChange={handleVoice} style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                <button onClick={toggle} style={{ width: '100%', padding: '12px', backgroundColor: '#333', color: 'white', border: '1px solid #666', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>CLOSE</button>
            </div>
        </div>
    );
};

export const StartMenuModal = () => {
  const showStartMenu = useGameStore(state => state.showStartMenu);
  const closeStartMenu = useGameStore(state => state.closeStartMenu);
  const restartGame = useGameStore(state => state.restartGame);
  const gameState = useGameStore(state => state.gameState);
  
  const [phase, setPhase] = useState('confidential');
  const scale = useModalScale();

  if (!showStartMenu || !gameState) return null;

  const handleStart = () => {
      restartGame(); 
      closeStartMenu(); 
  };

  if (phase === 'confidential') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 999999, backgroundColor: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', cursor: 'pointer', overflowY: 'auto' }} onClick={() => setPhase('menu')}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zoom: scale, padding: '20px' }}>
          <h1 style={{ color: '#fff', fontSize: '36px', fontWeight: 'normal', letterSpacing: '4px', margin: '0 0 10px 0' }}>RIGHT OF WAY: EASTWARD BOUND</h1>
          <div style={{ color: '#666', fontSize: '18px', letterSpacing: '2px', marginBottom: '60px' }}>INTERNAL DESIGN PROTOTYPE / VERTICAL SLICE</div>
          
          <div style={{ border: '6px solid #ef4444', padding: '10px 40px', transform: 'rotate(-5deg)', marginBottom: '60px' }}>
              <div style={{ color: '#ef4444', fontSize: '64px', fontWeight: '900', letterSpacing: '8px' }}>CONFIDENTIAL</div>
          </div>

          <p style={{ color: '#aaa', fontSize: '18px', textAlign: 'center', maxWidth: '600px', lineHeight: '1.6', marginBottom: '30px' }}>
              This software is a proof-of-concept demonstration intended for publisher review and internal testing only.
          </p>
          <p style={{ color: '#ef4444', fontSize: '18px', fontWeight: 'bold', marginBottom: '30px' }}>NOT FOR COMMERCIAL DISTRIBUTION</p>
          <p style={{ color: '#555', fontSize: '16px', textAlign: 'center', maxWidth: '700px', lineHeight: '1.6', marginBottom: '80px' }}>
              This build demonstrates core mechanics, economic logic, and AI systems. It is not a final commercial product.<br/>© 2026 Armando Canales. All Rights Reserved.
          </p>

          <div style={{ color: '#4ade80', fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', animation: 'pulse 2s infinite' }}>
              [ CLICK TO INITIALIZE ]
          </div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, backgroundColor: '#1a1a20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', zoom: scale, padding: '20px', boxSizing: 'border-box' }}>
        <h1 style={{ color: '#facc15', fontSize: '64px', margin: '0 0 10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>RIGHT OF WAY</h1>
        <h2 style={{ color: '#94a3b8', fontSize: '24px', letterSpacing: '8px', fontWeight: 'normal', margin: '0 0 40px 0' }}>EASTWARD BOUND</h2>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', width: '100%' }}>
          <button style={{ flex: 1, padding: '15px', backgroundColor: 'transparent', border: '2px solid #4ade80', color: '#16a34a', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(74, 222, 128, 0.2)' }}>? HOW TO PLAY</button>
          <button style={{ flex: 1, padding: '15px', backgroundColor: 'transparent', border: '1px solid #475569', color: '#facc15', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>i ABOUT / DEV</button>
          <button style={{ flex: 1, padding: '15px', backgroundColor: 'transparent', border: '1px solid #475569', color: '#64748b', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>⚙ CONFIG</button>
        </div>

        <div style={{ width: '100%', backgroundColor: '#222', border: '1px solid #334155', borderRadius: '4px', padding: '20px', display: 'flex', justifyContent: 'space-around', marginBottom: '30px', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#94a3b8', marginBottom: '10px' }}>TOTAL POINTS</div><div style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>{gameState.metaData.totalPoints}</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#94a3b8', marginBottom: '10px' }}>HIGH SCORE</div><div style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>${gameState.metaData.highScore}</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#94a3b8', marginBottom: '10px' }}>ACTIVE PERKS</div><div style={{ color: '#4ade80', fontSize: '32px', fontWeight: 'bold' }}>0 READY</div></div>
        </div>

        <div style={{ width: '100%', backgroundColor: '#222', border: '1px solid #334155', borderLeft: '6px solid #facc15', padding: '20px', marginBottom: '30px', boxSizing: 'border-box' }}>
          <h3 style={{ color: '#facc15', fontSize: '20px', margin: '0 0 15px 0' }}>MISSION OBJECTIVE: THE IRON CITY</h3>
          <p style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6', margin: '0 0 15px 0' }}>You have <strong>12 Years</strong> to connect the West Coast to Chicago. The Baron is expanding aggressively.</p>
          <ul style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
            <li>Manage your <strong>Steel Supply</strong> to minimize costs.</li>
            <li>Reach <strong>Chicago</strong> before time runs out.</li>
            <li>Maintain a higher <strong>Net Worth</strong> than the Baron.</li>
          </ul>
        </div>

        <div style={{ width: '100%', backgroundColor: '#222', border: '1px solid #334155', padding: '20px', marginBottom: '30px', textAlign: 'center', boxSizing: 'border-box' }}>
          <div style={{ color: '#94a3b8', marginBottom: '10px' }}>CUSTOM RUN SEED</div>
          <input type="text" placeholder="LEAVE BLANK FOR RANDOM..." style={{ width: '100%', backgroundColor: '#111', border: '1px solid #475569', color: '#fff', padding: '15px', fontSize: '18px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box' }} />
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={handleStart} style={{ flex: 1, padding: '20px', backgroundColor: '#facc15', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(250, 204, 21, 0.4)' }}>STANDARD RUN</button>
              <button style={{ flex: 1, padding: '20px', backgroundColor: '#06b6d4', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>DAILY [2026-04-09]</button>
          </div>
          <button style={{ width: '100%', padding: '20px', backgroundColor: '#4ade80', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>PLAY TUTORIAL</button>
          <button style={{ width: '100%', padding: '20px', backgroundColor: '#334155', color: '#fff', fontSize: '24px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>ACCESS PERK STORE</button>
        </div>

      </div>
    </div>
  );
};

export const IPOModal = () => {
  const gameState = useGameStore(state => state.gameState);
  const applyPackage = useGameStore(state => state.applyPackage);
  const [isHidden, setIsHidden] = useState(false);
  const scale = useModalScale();

  if (!gameState || !gameState.inIPOPhase || !gameState.currentPackages) return null;

  const getCardTheme = (highCoId) => {
      if (highCoId === 'prr') return { background: 'linear-gradient(to bottom, #e31818 0%, #7a0909 100%)', border: '3px solid #4a0303', glow: 'rgba(227, 24, 24, 0.6)' };
      if (highCoId === 'bo') return { background: 'linear-gradient(to bottom, #39b54a 0%, #1c5e25 100%)', border: '3px solid #0f3d16', glow: 'rgba(57, 181, 74, 0.6)' };
      if (highCoId === 'nyc') return { background: 'linear-gradient(to bottom, #32b5cc 0%, #156d7d 100%)', border: '3px solid #0a4652', glow: 'rgba(50, 181, 204, 0.6)' };
      return { background: '#222', border: '3px solid #111', glow: 'rgba(255,255,255,0.2)' };
  };

  if (isHidden) {
    return (
      <>
        <style>{`.ipo-btn:active { transform: scale(0.95) !important; box-shadow: inset 0 4px 8px rgba(0,0,0,0.5) !important; }`}</style>
        <button 
          className="ipo-btn"
          onPointerDown={(e) => { e.stopPropagation(); setIsHidden(false); }}
          style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 2147483647, padding: '15px 30px', backgroundColor: '#facc15', color: '#000', fontSize: '20px', fontWeight: '900', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.9)', pointerEvents: 'auto', transition: 'transform 0.1s', fontFamily: 'Arial, sans-serif' }}
        >
          👁 VIEW IPO CHOICES
        </button>
      </>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(15, 23, 42, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', backdropFilter: 'blur(6px)', pointerEvents: 'auto', overflowY: 'auto' }}>
      <style>{`.ipo-btn:active { transform: scale(0.95) !important; box-shadow: inset 0 4px 8px rgba(0,0,0,0.5) !important; }`}</style>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zoom: scale, padding: '40px 20px' }}>
        <button 
          className="ipo-btn"
          onPointerDown={(e) => { e.stopPropagation(); setIsHidden(true); }}
          style={{ padding: '12px 40px', border: '2px solid #334155', borderRadius: '8px', color: '#facc15', marginBottom: '30px', backgroundColor: '#020617', cursor: 'pointer', fontSize: '16px', fontWeight: '900', boxShadow: '0 6px 12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)', transition: 'transform 0.1s', letterSpacing: '1px', fontFamily: 'Arial, sans-serif' }}>
          👁 HIDE TO VIEW MAP
        </button>
        
        <h1 style={{ color: '#facc15', fontSize: '56px', margin: '0 0 5px 0', textShadow: '3px 4px 6px rgba(0,0,0,0.9), 0 0 20px rgba(250,204,21,0.3)', letterSpacing: '2px', fontFamily: 'Arial, sans-serif', fontWeight: '900', textAlign: 'center' }}>IPO SELECTION</h1>
        <p style={{ color: '#cbd5e1', fontSize: '18px', marginBottom: '40px', textShadow: '1px 1px 2px #000', textAlign: 'center' }}>Select your Tycoon Package (Stock Portfolio + Steel Contract).</p>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {gameState.currentPackages.map((pkg, idx) => {
            const highCo = gameState.companies[pkg.profile.high];
            const midCo = gameState.companies[pkg.profile.mid];
            const lowCo = gameState.companies[pkg.profile.low];
            const theme = getCardTheme(pkg.profile.high);
            const unitPrice = pkg.contract.tier.price;
            const volume = pkg.contract.volume;
            const totalPrice = unitPrice * volume;

            let formattedBonusDesc = pkg.bonus.desc;
            formattedBonusDesc = formattedBonusDesc.replace(/High Tier Company/gi, highCo.name);
            formattedBonusDesc = formattedBonusDesc.replace(/High Tier Co:/gi, `${highCo.name}:`);
            formattedBonusDesc = formattedBonusDesc.replace(/Low Tier Company/gi, lowCo.name);
            formattedBonusDesc = formattedBonusDesc.replace(/Low Tier Co:/gi, `${lowCo.name}:`);
            formattedBonusDesc = formattedBonusDesc.replace(/Mid Tier Company/gi, midCo.name);
            formattedBonusDesc = formattedBonusDesc.replace(/Mid Tier Co:/gi, `${midCo.name}:`);

            return (
              <div 
                key={idx} 
                onPointerDown={(e) => { e.stopPropagation(); applyPackage(idx); }} 
                style={{ width: '320px', background: theme.background, border: theme.border, borderRadius: '16px', padding: '25px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: `0 15px 30px rgba(0,0,0,0.8), inset 0 2px 6px rgba(255,255,255,0.4)`, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }} 
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px) scale(1.03)'; e.currentTarget.style.boxShadow = `0 25px 40px rgba(0,0,0,0.9), 0 0 30px ${theme.glow}, inset 0 2px 6px rgba(255,255,255,0.6)`; }} 
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = `0 15px 30px rgba(0,0,0,0.8), inset 0 2px 6px rgba(255,255,255,0.4)`; }}
              >
                <h2 style={{ color: '#fef08a', margin: '0 0 20px 0', textTransform: 'uppercase', fontSize: '26px', letterSpacing: '2px', textShadow: '2px 2px 0px #000, 0 4px 8px rgba(0,0,0,0.8)', textAlign: 'center', fontFamily: 'Arial, sans-serif', fontWeight: '900' }}>
                    {pkg.profile.name}
                </h2>
                
                <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center', marginBottom: '25px', boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.6)', fontFamily: 'Arial, sans-serif' }}>
                  <span style={{ fontSize: '32px', color: '#fff', fontWeight: '900', textShadow: '2px 2px 4px #000' }}>{volume}</span>
                  <span style={{ fontSize: '16px', color: '#94a3b8', marginLeft: '10px', fontWeight: '900', letterSpacing: '1px' }}>STEEL / TURN</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.6)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}>
                  {[ { co: highCo, label: 'HIGH', val: '$25' }, { co: midCo, label: 'MID', val: '$20' }, { co: lowCo, label: 'LOW', val: '$15' } ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ backgroundColor: row.co.colorStr, color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '15px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)', border: '1px solid rgba(0,0,0,0.5)', minWidth: '55px', textAlign: 'center', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)', fontFamily: 'Arial, sans-serif' }}>
                                  {row.co.short}
                              </span>
                              <span style={{ color: '#cbd5e1', fontSize: '15px', fontWeight: 'bold', opacity: 0.9 }}>({row.label})</span>
                          </div>
                          <span style={{ color: '#fff', fontWeight: '900', fontSize: '20px', textShadow: '1px 1px 3px rgba(0,0,0,0.9)', fontFamily: 'Arial, sans-serif' }}>{row.val}</span>
                      </div>
                  ))}
                </div>

                <div style={{ border: '2px solid #000', borderRadius: '10px', padding: '15px', color: '#fff', fontSize: '24px', fontWeight: '900', marginBottom: '20px', backgroundColor: '#020617', textAlign: 'center', boxShadow: '0 6px 12px rgba(0,0,0,0.6), inset 0 2px 5px rgba(255,255,255,0.15)', textShadow: '2px 2px 4px #000', letterSpacing: '1px', fontFamily: 'Arial, sans-serif' }}>
                  PRICE: ${unitPrice}.00 <span style={{ color: '#94a3b8', fontSize: '18px', fontWeight: 'bold' }}>(${totalPrice})</span>
                </div>

                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', color: '#fde047', fontSize: '15px', lineHeight: '1.5', textAlign: 'center', padding: '15px', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: '8px', textShadow: '1px 1px 2px #000', borderTop: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
                  {formattedBonusDesc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ParlorModal = () => {
  const gameState = useGameStore(state => state.gameState);
  const completeParlorPurchase = useGameStore(state => state.completeParlorPurchase);
  const leaveParlor = useGameStore(state => state.leaveParlor);
  const rerollParlor = useGameStore(state => state.rerollParlor);

  const scale = useModalScale();

  if (!gameState || !gameState.parlorOffers || gameState.parlorOffers.length === 0) return null;

  const rerollCost = gameState.parlorRerollCost || 25;
  const canReroll = gameState.playerCash >= rerollCost;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(15, 23, 42, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', backdropFilter: 'blur(6px)', pointerEvents: 'auto', overflowY: 'auto' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zoom: scale, padding: '40px 20px' }}>
        <h1 style={{ color: '#e066ff', fontSize: '56px', margin: '0 0 5px 0', textShadow: '3px 4px 6px rgba(0,0,0,0.9), 0 0 20px rgba(224, 102, 255, 0.3)', letterSpacing: '2px', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center' }}>
          THE PARLOR
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '18px', marginBottom: '50px', textShadow: '1px 1px 2px #000', fontWeight: 'bold', textAlign: 'center' }}>
          Industrialists whisper secrets in the cigar smoke. Choose an asset.
        </p>

        <div style={{ display: 'flex', gap: '40px', marginBottom: '50px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {gameState.parlorOffers.map((offer, idx) => (
            <ParlorOfferItem key={idx} offer={offer} completeParlorPurchase={completeParlorPurchase} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={rerollParlor}
              disabled={!canReroll}
              style={{ padding: '15px 30px', backgroundColor: canReroll ? '#f59e0b' : '#334155', color: canReroll ? '#000' : '#64748b', border: canReroll ? '2px solid #b45309' : '2px solid #1e293b', borderRadius: '8px', fontWeight: '900', fontSize: '18px', cursor: canReroll ? 'pointer' : 'not-allowed', boxShadow: canReroll ? '0 6px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4)' : 'none', transition: 'all 0.1s' }}
              onMouseOver={(e) => { if(canReroll) { e.currentTarget.style.backgroundColor = '#d97706'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseOut={(e) => { if(canReroll) { e.currentTarget.style.backgroundColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(0)'; } }}
              onPointerDown={(e) => { if(canReroll) e.currentTarget.style.transform = 'scale(0.95)'; }}
            >
              ↻ REROLL OFFERS (${rerollCost})
            </button>
            
            <button 
              onClick={leaveParlor}
              style={{ padding: '15px 30px', backgroundColor: '#ef4444', color: '#fff', border: '2px solid #991b1b', borderRadius: '8px', fontWeight: '900', fontSize: '18px', cursor: 'pointer', boxShadow: '0 6px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)', transition: 'all 0.1s' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.transform = 'translateY(0)'; }}
              onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            >
              LEAVE PARLOR
            </button>
        </div>
      </div>
    </div>
  );
};

const ParlorOfferItem = ({ offer, completeParlorPurchase }) => {
  const gameState = useGameStore(state => state.gameState);
  const [activeTab, setActiveTab] = useState(1);

  const info1 = getNativeCardInfo({ ...offer, level: 1 });
  const info2 = getNativeCardInfo({ ...offer, level: 2 });
  const info3 = getNativeCardInfo({ ...offer, level: 3 });

  const invCounts = { 1: 0, 2: 0, 3: 0 };
  const checkCard = (c) => {
      if (c.type === offer.type && c.label === offer.label) {
          const lvl = c.level || 1;
          if (invCounts[lvl] !== undefined) invCounts[lvl]++;
      }
  };
  
  if (gameState.inventory?.[offer.type]) gameState.inventory[offer.type].forEach(checkCard);
  if (gameState.discards?.[offer.type]) gameState.discards[offer.type].forEach(checkCard);
  if (gameState.belt) gameState.belt.forEach(checkCard);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div 
        style={{ transform: 'scale(1)', transformOrigin: 'center', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'pointer', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.7))' }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05) translateY(-10px)'; e.currentTarget.style.filter = 'drop-shadow(0 25px 35px rgba(0,0,0,0.9)) brightness(1.1)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.filter = 'drop-shadow(0 15px 25px rgba(0,0,0,0.7)) brightness(1)'; }}
      >
        <GameCard 
          type={offer.type} 
          name={info1.name} 
          desc1={info1.desc} 
          desc2={info2.desc} 
          desc3={info3.desc} 
          icon={info1.icon}
          invCounts={invCounts}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showTabs={true}
          hidePrice={true} 
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
        <button 
          onClick={() => completeParlorPurchase(offer, 0, 'new')}
          style={{ flex: 1, padding: '12px 5px', backgroundColor: '#3b82f6', color: '#fff', border: '2px solid #1d4ed8', borderRadius: '8px', fontWeight: '900', fontSize: '14px', letterSpacing: '1px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2)', transition: 'all 0.1s' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(0)'; }}
          onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
        >
          ACQUIRE (Lvl 1)
        </button>
        <button 
          onClick={() => completeParlorPurchase(offer, 0, 'evolve', null, activeTab)}
          style={{ flex: 1, padding: '12px 5px', backgroundColor: '#a855f7', color: '#fff', border: '2px solid #7e22ce', borderRadius: '8px', fontWeight: '900', fontSize: '14px', letterSpacing: '1px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2)', transition: 'all 0.1s' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#9333ea'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#a855f7'; e.currentTarget.style.transform = 'translateY(0)'; }}
          onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
        >
          EVOLVE (Lvl {activeTab})
        </button>
      </div>
    </div>
  );
};

export const DiscardModal = () => {
  const showDiscard = useGameStore(state => state.showDiscard);
  const toggleDiscard = useGameStore(state => state.toggleDiscard);
  const gameState = useGameStore(state => state.gameState);

  const [viewMode, setViewMode] = useState('gallery'); 
  const [isDenseView, setIsDenseView] = useState(true); 
  const [ledgerSort, setLedgerSort] = useState('type'); 
  const scale = useModalScale();

  const portfolioData = useMemo(() => {
    if (!gameState) return { gallery: { green:{}, blue:{}, red:{} }, ledger: [], stats: { total:0, g:0, b:0, r:0 } };
    
    const { discards } = gameState;
    const galleryDeck = { green: {}, blue: {}, red: {} };
    
    let stats = { total:0, g:0, b:0, r:0 };
    const ledgerMap = new Map(); 

    const processItem = (card, preciseLoc, coColor) => {
        stats.total++;
        if (card.type === 'green') stats.g++;
        if (card.type === 'blue') stats.b++;
        if (card.type === 'red') stats.r++;

        if (galleryDeck[card.type]) {
            const gKey = card.label;
            if (!galleryDeck[card.type][gKey]) {
                galleryDeck[card.type][gKey] = { baseCard: card, counts: { 1: 0, 2: 0, 3: 0 } };
            }
            galleryDeck[card.type][gKey].counts[card.level || 1]++;
        }

        const lKey = `${card.type}_${card.label}_L${card.level || 1}_${preciseLoc}`;
        
        if (!ledgerMap.has(lKey)) {
            const info = getNativeCardInfo(card);
            ledgerMap.set(lKey, {
                key: lKey,
                name: info.name,
                label: card.label,
                level: card.level || 1,
                type: card.type,
                locationTag: preciseLoc,
                coColor: coColor,
                count: 0
            });
        }
        ledgerMap.get(lKey).count++;
    };

    ['green', 'blue', 'red'].forEach(color => {
        (discards?.[color] || []).forEach(c => processItem(c, 'DISCARD', null));
    });

    return { gallery: galleryDeck, rawLedger: Array.from(ledgerMap.values()), stats };
  }, [gameState]);

  if (!showDiscard || !gameState) return null;

  const renderGalleryRow = (title, colorDict, colorHex) => {
      const cards = Object.values(colorDict);
      if (cards.length === 0) return null;
      const gapSize = isDenseView ? '15px' : '30px';

      return (
          <div style={{ marginBottom: isDenseView ? '15px' : '30px' }}>
              <h3 style={{ color: colorHex, borderBottom: `1px solid ${colorHex}`, paddingBottom: '10px', marginTop: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {title} ({cards.length})
              </h3>
              <div style={{ display: 'flex', overflowX: 'auto', gap: gapSize, padding: '20px 10px', paddingBottom: '30px', scrollbarWidth: 'thin', scrollbarColor: `${colorHex} #1e293b` }}>
                  {cards.map(data => (
                      <PortfolioCardItem key={data.baseCard.label} data={data} color={data.baseCard.type} isDenseView={isDenseView} />
                  ))}
              </div>
          </div>
      );
  };

  const renderSortedLedger = (rawLedgerArray) => {
      const renderSection = (title, items, hex) => {
          if (items.length === 0) return null;
          return (
              <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: hex, borderBottom: `1px solid ${hex}`, paddingBottom: '10px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {title} ({items.length} lines)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {items.map(({ key, ...item }) => <LedgerLineItem key={key} {...item} hexColor={hex} />)}
                  </div>
              </div>
          );
      };

      let sorted = [...rawLedgerArray];
      sorted.sort((a, b) => a.name.localeCompare(b.name) || a.level - b.level);

      const gList = sorted.filter(i => i.type === 'green');
      const bList = sorted.filter(i => i.type === 'blue');
      const rList = sorted.filter(i => i.type === 'red');

      return (
          <div style={{ padding: '10px' }}>
              {renderSection('Infrastructure Assets', gList, '#4ade80')}
              {renderSection('Blue Contract Agreements', bList, '#60a5fa')}
              {renderSection('Purple Market Actions', rList, '#c084fc')} 
          </div>
      );
  };

  const { gallery, rawLedger, stats } = portfolioData;

  const btnStyle = (isActive) => ({
      padding: '6px 12px',
      backgroundColor: isActive ? '#facc15' : '#1e293b',
      color: isActive ? '#000' : '#94a3b8',
      border: '1px solid #facc15',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '12px'
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(6px)' }}>
      <div style={{ 
          backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: 'white', 
          width: '95%', maxWidth: '1400px', height: '85vh', display: 'flex', 
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)', zoom: scale, overflow: 'hidden'
      }}>
        
        <div style={{ width: '280px', backgroundColor: '#020617', borderRight: '1px solid #334155', padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '0 0 40px 0', color: '#facc15', letterSpacing: '2px', fontSize: '24px', fontWeight: '900' }}>DISCARD PILE</h2>
            <div style={{ marginBottom: '30px' }}><div style={{ color: '#94a3b8', fontSize: '12px', letterSpacing: '1px', marginBottom: '5px' }}>TOTAL TRASHED</div><div style={{ color: '#f8fafc', fontSize: '48px', fontWeight: '900' }}>{stats.total}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div><div style={{ color: '#4ade80', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px' }}>GREEN (INFRA)</div><div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{stats.g}</div></div>
                <div><div style={{ color: '#60a5fa', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px' }}>BLUE (CONTRACTS)</div><div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{stats.b}</div></div>
                <div><div style={{ color: '#c084fc', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px' }}>PURPLE (MARKET)</div><div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{stats.r}</div></div>
            </div>
            <button onClick={toggleDiscard} style={{ marginTop: 'auto', padding: '15px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; e.currentTarget.style.color = '#fff'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>CLOSE PILE</button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '30px', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '20px', gap: '20px' }}>
                
                {viewMode === 'ledger' && (
                    <div style={{ display: 'flex', gap: '8px', marginRight: '20px', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', marginRight: '5px' }}>SORT BY:</span>
                        <button onClick={() => setLedgerSort('type')} style={{...btnStyle(ledgerSort==='type')}}>TYPE</button>
                    </div>
                )}

                {viewMode === 'gallery' && (
                    <button 
                        onClick={() => setIsDenseView(!isDenseView)}
                        style={{ padding: '10px', backgroundColor: isDenseView ? '#facc15' : '#1e293b', color: isDenseView ? '#000' : '#facc15', border: '1px solid #facc15', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}
                        title={isDenseView ? "Switch to Normal View" : "Switch to Dense Grid View"}
                    >
                        [::: DENSE {isDenseView ? 'ON' : 'OFF'}]
                    </button>
                )}

                <div style={{ display: 'flex', backgroundColor: '#1e293b', borderRadius: '8px', padding: '4px' }}>
                    <button onClick={() => setViewMode('gallery')} style={{ padding: '8px 20px', backgroundColor: viewMode === 'gallery' ? '#334155' : 'transparent', color: viewMode === 'gallery' ? '#facc15' : '#94a3b8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>GALLERY VIEW</button>
                    <button onClick={() => setViewMode('ledger')} style={{ padding: '8px 20px', backgroundColor: viewMode === 'ledger' ? '#334155' : 'transparent', color: viewMode === 'ledger' ? '#facc15' : '#94a3b8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>LEDGER VIEW</button>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                <style>{`
                    ::-webkit-scrollbar { height: 8px; width: 8px; }
                    ::-webkit-scrollbar-track { background: #0f172a; }
                    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
                    ::-webkit-scrollbar-thumb:hover { background: #475569; }
                `}</style>
                
                {viewMode === 'gallery' ? (
                    <div>
                        {renderGalleryRow('Infrastructure Assets', gallery.green, '#4ade80')}
                        {renderGalleryRow('Blue Contract Agreements', gallery.blue, '#60a5fa')}
                        {renderGalleryRow('Purple Market Actions', gallery.red, '#c084fc')}
                    </div>
                ) : (
                    <div>
                        {renderSortedLedger(rawLedger)}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export const AllModals = () => (
    <>
        <StartMenuModal />
        <TooltipOverlay />
        <AudioSettingsModal />
        <IPOModal />
        <LiquidationModal />
        <LedgerModal />
        <NodeActionModal />
        <ParlorModal />
        <AuditModal />
        <DiscardModal />
        <GameOverModal />
        <PrivateAssetsModal />
        <TrashModal />
        <ProxyModal />
        <TelegramDispatch /> 
    </>
);