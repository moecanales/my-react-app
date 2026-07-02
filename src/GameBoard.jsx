// GameBoard.jsx
import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { Stage } from '@pixi/react';
import { useGameStore } from './App';
import { GrantLine, RustBeltLine, ConnectionLines, BuiltLines, NodeItem } from './MapPixiElements';
import { PacificOceanOverlay, CartographicMountainRange, RustBeltLandscape } from './MapEnvironment';
import { HTMLOverlayLayer, DevGridOverlay, CostBubblesHTMLOverlay } from './MapBuildings';
import { generateTownLore } from './LoreGenerator';

const getGlowingHandCursor = (hexColor) => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="${hexColor}" flood-opacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="1" flood-color="${hexColor}" flood-opacity="1" />
            </filter>
        </defs>
        <path filter="url(#glow)" fill="#1e293b" stroke="${hexColor}" stroke-width="2" d="M12.5,14 L12.5,5.5 C12.5,4.1 13.6,3 15,3 C16.4,3 17.5,4.1 17.5,5.5 L17.5,14.5 C18.3,13.8 19.4,13.6 20.4,14 C21.4,14.4 22,15.4 22,16.5 L22,17 C22.7,16.5 23.7,16.5 24.5,17 C25.3,17.5 25.8,18.4 25.8,19.4 L25.8,20 C26.6,19.6 27.6,19.8 28.3,20.4 C29,21.1 29.2,22.2 29.2,23.2 L29.2,25 C29.2,29.4 25.6,33 21.2,33 L15.5,33 C11.6,33 8.5,30.1 8,26.2 L7.5,20.4 C7.3,18.8 8.4,17.3 10,17.2 C11.1,17.1 12.1,17.8 12.5,18.8 L12.5,14 Z" />
    </svg>`;
    return `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}') 15 3, pointer`;
};

const GameBoard = () => {
  const gameState = useGameStore(state => state.gameState);
  const handleNodeClick = useGameStore(state => state.handleNodeClick);
  const setTooltip = useGameStore(state => state.setHoveredTooltip);
  const executeBuild = useGameStore(state => state.executeBuild); 
  const setTargetedCardIndices = useGameStore(state => state.setTargetedCardIndices);
  const containerRef = useRef(null);
  
  const [showOnlyRailheads, setShowOnlyRailheads] = useState(true);
  const [showLinkCosts, setShowLinkCosts] = useState(1); 
  const [cleanMap, setCleanMap] = useState(false);
  const [mutedCompanies, setMutedCompanies] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [ripples, setRipples] = useState([]);

  // --- TUTORIAL STATUS FLAGS ---
  const isTutorial = gameState?.tutorial?.isActive;

  const connections = gameState?.connections || [];
  const companies = gameState?.companies || {};
  const nodes = gameState?.nodes || [];
  const privateCompanies = gameState?.privateCompanies || {};

  const visibleNodes = nodes.filter(n => n.revealed || n.type === 'start');
  const lowestNodeY = visibleNodes.length > 0 ? Math.max(...visibleNodes.map(n => n.y)) : 800;
  const dynamicBoardHeight = Math.max(lowestNodeY + 250, 800);

  const getMinZoom = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    const availableHeight = window.innerHeight - 60; 
    return availableHeight / dynamicBoardHeight;
  }, [dynamicBoardHeight]);

  const [zoomScale, setZoomScale] = useState(() => getMinZoom());
  const [showGrid, setShowGrid] = useState(false);

  // --- RESPONSIVE VECTOR SCALING ---
  // Pure dynamic multiplier so the map proportionally shrinks on small screens
  const optimalTutorialZoom = typeof getMinZoom === 'function' ? getMinZoom() * 1.3 : 1.3;
  const currentZoom = isTutorial ? optimalTutorialZoom : zoomScale;

  useLayoutEffect(() => {
      if (isTutorial && containerRef.current) {
          const tutCameraX = gameState?.tutorial?.stepData?.cameraX || 0;
          // Scale the pan distance by the current zoom to maintain consistent framing
          containerRef.current.scrollTo({
              left: tutCameraX * currentZoom,
              top: 0, // Flexbox handles vertical centering natively now
              behavior: 'smooth'
          });
      }
  }, [isTutorial, nodes, gameState?.tutorial?.stepData?.cameraX, currentZoom]);

  // Handle standard zoom boundaries when NOT in tutorial
  useEffect(() => {
    if (!isTutorial) {
        const handleResize = () => {
          const newMinZoom = getMinZoom();
          setZoomScale(prev => Math.max(prev, newMinZoom));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }
  }, [getMinZoom, isTutorial]);

  useEffect(() => {
    if (containerRef.current && !isTutorial) {
      const targetContentHeight = dynamicBoardHeight * currentZoom;
      const maxScrollTop = Math.max(0, targetContentHeight - containerRef.current.clientHeight);
      if (containerRef.current.scrollTop > maxScrollTop) {
        containerRef.current.scrollTop = maxScrollTop;
      }
    }
  }, [currentZoom, dynamicBoardHeight, isTutorial]);

  // --- NETWORK STATE HELPERS ---
  const activeNetwork = new Set();
  nodes.forEach(n => { if (n.type === 'start') activeNetwork.add(n.id); });
  
  const builtConnSet = new Set();
  const activeRailheadsForCities = new Set();
  
  Object.values(companies).forEach(c => {
      if (c.builtNodes) c.builtNodes.forEach(nId => activeNetwork.add(nId));
      if (c.activeLines) c.activeLines.forEach(nId => activeRailheadsForCities.add(nId));
      if (c.builtConnections) c.builtConnections.forEach(str => builtConnSet.add(str));
  });

  const frontierNodes = new Set();
  connections.forEach(conn => {
      if (activeNetwork.has(conn.from)) frontierNodes.add(conn.to);
      if (activeNetwork.has(conn.to)) frontierNodes.add(conn.from);
  });

  const relevantNodes = new Set([...activeNetwork]);
  connections.forEach(conn => {
      if (activeRailheadsForCities.has(conn.from)) relevantNodes.add(conn.to);
      if (activeRailheadsForCities.has(conn.to)) relevantNodes.add(conn.from);
  });

  Object.values(privateCompanies || {}).forEach(asset => {
      if (asset.railheadId) relevantNodes.add(asset.railheadId);
  });

  // --- NEW: MUTED NODES (GHOSTING) ---
  const mutedNodes = new Set();
  nodes.forEach(n => {
      if (n.type === 'start') {
          let compId = '';
          if (n.id == 0 || n.name === 'Seattle' || n.name === 'Northern Hub') compId = 'bo';
          else if (n.id == 1 || n.name === 'Portland' || n.name === 'Central Hub') compId = 'nyc';
          else if (n.id == 2 || n.name === 'San Francisco' || n.name === 'Southern Hub') compId = 'prr';
          if (mutedCompanies.includes(compId)) mutedNodes.add(n.id);
      } else {
          let builtByMuted = false;
          let builtByUnmuted = false;
          let frontierOfMuted = false;
          let frontierOfUnmuted = false;

          Object.entries(companies).forEach(([compId, c]) => {
              const isMuted = mutedCompanies.includes(compId);
              if (c.builtNodes && c.builtNodes.includes(n.id)) {
                  if (isMuted) builtByMuted = true;
                  else builtByUnmuted = true;
              }
              if (c.activeLines) {
                  const isFrontier = connections.some(conn => 
                      (conn.from === n.id && c.activeLines.includes(conn.to)) ||
                      (conn.to === n.id && c.activeLines.includes(conn.from))
                  );
                  if (isFrontier) {
                      if (isMuted) frontierOfMuted = true;
                      else frontierOfUnmuted = true;
                  }
              }
          });

          // Ghost the node if ONLY muted companies have reached or scouted it
          if (builtByMuted && !builtByUnmuted) {
              mutedNodes.add(n.id);
          } else if (!builtByMuted && !builtByUnmuted && frontierOfMuted && !frontierOfUnmuted) {
              mutedNodes.add(n.id);
          }
      }
  });

  const distToSegment = (p, v, w) => {
      const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
      if (l2 === 0) return Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
      let t = Math.max(0, Math.min(1, ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2));
      return Math.sqrt(Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.y - (v.y + t * (w.y - v.y)), 2));
  };

  const generateTargetedCardData = (builderData) => {
      if (!builderData || builderData.length === 0) return [];
      let data = [];
      const belt = useGameStore.getState().gameState?.belt || [];
      const maxUnits = Math.max(...builderData.map(b => b.units));

      for (let i = 0; i < maxUnits; i++) {
          const card = belt[i];
          if (!card) break;
          const effectCard = card.proxy ? card.proxy : card;

          const activeBuilders = builderData.filter(b => i < b.units);
          if (activeBuilders.length === 0) continue;

          const isMulti = activeBuilders.length > 1;
          const glowColor = isMulti ? '#ffffff' : (activeBuilders[0].comp.id === 'nyc' ? '#34B3D1' : (activeBuilders[0].comp.colorStr || '#ffffff'));

          if (effectCard.type === 'red') {
              const price = window.game ? window.game.calculateSlotPrice(i) : 15;
              data.push({ index: i, type: 'red', value: price, glowColor });
          } else {
              let trackGroups = {};
              let cardGroups = {};

              activeBuilders.forEach(b => {
                  const comp = b.comp;
                  const dotColor = comp.id === 'nyc' ? '#34B3D1' : (comp.colorStr || '#fff');

                  // 1. Calculate Track Revenue
                  const trackRev = 10;
                  const trackKey = `+${trackRev}`;
                  if (!trackGroups[trackKey]) trackGroups[trackKey] = { colors: [], shortNames: [], value: trackRev, isPositive: true, recipientColor: '#dfb127', recipientTag: '[ TO YOU ]' };
                  trackGroups[trackKey].colors.push(dotColor);
                  trackGroups[trackKey].shortNames.push(comp.short);

                  // 2. Calculate Card Effect
                  let value = 0;
                  let isPositive = true;
                  let recipientColor = '#ffffff';
                  let recipientTag = '[ TO TREASURY ]';

                  if (effectCard.type === 'blue') {
                      const kickback = window.game ? window.game.calculateBaronKickback(effectCard.label, comp.id, b.targetNodeId, effectCard.level || 1) : 0;
                      value = Math.abs(kickback);
                      isPositive = kickback <= 0; 
                      recipientColor = isPositive ? '#dfb127' : '#c084fc'; 
                      recipientTag = isPositive ? '[ TO YOU ]' : '[ TO BARON ]';
                  } else if (effectCard.type === 'green') {
                      const char = effectCard.label.charAt(0);
                      const lvl = effectCard.level || 1;
                      if (char === 'A') { 
                          const isValid = comp.activeLines.some(id => {
                              const n = nodes.find(x => x.id === id);
                              return n && (n.type === 'start' || n.subType === 'union_yard');
                          });
                          value = isValid ? (lvl === 3 ? 75 : (lvl === 2 ? 50 : 25)) : 0;
                          recipientColor = '#dfb127';
                          recipientTag = '[ TO YOU ]';
                      } else if (char === 'B') { 
                          value = lvl === 3 ? 60 : (lvl === 2 ? 30 : 15);
                          recipientColor = '#ffffff';
                          recipientTag = '[ TO TREASURY ]';
                      } else if (char === 'C') { 
                          value = 0; 
                          recipientColor = '#ffffff';
                          recipientTag = '[ TO TREASURY ]';
                      } else if (char === 'D') { 
                          let cities = comp.builtNodes.filter(nId => nodes.find(n => n.id === nId)?.subType === 'standard').length;
                          const targetN = nodes.find(n => n.id === b.targetNodeId);
                          if (targetN && targetN.subType === 'standard' && !comp.builtNodes.includes(b.targetNodeId)) cities++;
                          value = (lvl === 3 ? 15 : (lvl === 2 ? 10 : 5)) * Math.max(0, cities);
                          recipientColor = '#dfb127';
                          recipientTag = '[ TO YOU ]';
                      }
                  }

                  if (value !== 0) {
                      const cardKey = `${isPositive ? '+' : '-'}${value}-${recipientTag}`;
                      if (!cardGroups[cardKey]) cardGroups[cardKey] = { colors: [], shortNames: [], value, isPositive, recipientColor, recipientTag };
                      cardGroups[cardKey].colors.push(dotColor);
                      cardGroups[cardKey].shortNames.push(comp.short);
                  }
              });

              const processGroups = (groupsObj) => {
                  const arr = Object.values(groupsObj);
                  if (arr.length === 1 && activeBuilders.length > 1) arr[0].isUniversal = true;
                  return arr;
              };

              data.push({ 
                  index: i, 
                  type: effectCard.type, 
                  trackStacks: processGroups(trackGroups), 
                  cardStacks: processGroups(cardGroups),
                  glowColor
              });
          }
      }
      return data;
  };

  const handlePointerDown = (e) => {
    // --- KILL DRAGGING IN TUTORIAL ---
    if (isTutorial) return;

    if (!containerRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setDragStart({ x: e.pageX, y: e.pageY, scrollLeft: containerRef.current.scrollLeft, scrollTop: containerRef.current.scrollTop });

    // --- NEW UNIFIED HITBOX MATH ---
    const mapLayer = document.querySelector('.map-layer');
    const layerRect = mapLayer ? mapLayer.getBoundingClientRect() : { left: 0, top: 0 };
    const clickX = (e.clientX - layerRect.left) / currentZoom;
    const clickY = (e.clientY - layerRect.top) / currentZoom;

    if (clickX < 143) {
      const newRipple = { id: Date.now(), x: clickX, y: clickY };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1500);
    }
  };

  const attemptFastBuild = (targetNodeId) => {
    const companyId = window.game?.activeCompanyForBuild || gameState.activeCompanyForBuild;
    if (!companyId || !window.game) return;

    const comp = window.game.companies[companyId];
    if (!comp) return;

    const conn = window.game.connections.find(c => 
        (comp.activeLines.includes(c.from) && c.to === targetNodeId) || 
        (comp.activeLines.includes(c.to) && c.from === targetNodeId)
    );

    if (conn) {
        const sourceNodeId = comp.activeLines.includes(conn.from) ? conn.from : conn.to;
        const b = window.game.getSegmentCostBreakdown(companyId, sourceNodeId, targetNodeId);

        if (comp.treasury >= b.total && comp.trackSegments >= 1) {
            useGameStore.getState().executeBuild(companyId, targetNodeId);
        } else {
            if (window.game && window.game.audio) window.game.audio.playError();
        }
    }
  };

  const handlePointerUpOrLeave = (e) => {
    setIsDragging(false);
    
    if (e.type === 'pointerleave' || e.type === 'pointerup') {
        setTargetedCardIndices([]);
        useGameStore.getState().setHoveredCardFinancials([]);
        if (e.type === 'pointerleave') setTooltip(null);
    }

    if (!hasDragged && containerRef.current && e.type === 'pointerup') {
        // --- NEW UNIFIED HITBOX MATH ---
        const mapLayer = document.querySelector('.map-layer');
        const layerRect = mapLayer ? mapLayer.getBoundingClientRect() : { left: 0, top: 0 };
        const clickX = (e.clientX - layerRect.left) / currentZoom;
        const clickY = (e.clientY - layerRect.top) / currentZoom;

        // Ignore clicks on muted nodes
        const clickedNode = nodes.find(n => !mutedNodes.has(n.id) && Math.sqrt((n.x - clickX) ** 2 + (n.y - clickY) ** 2) <= 25);

        if (clickedNode && clickedNode.revealed && (!cleanMap || relevantNodes.has(clickedNode.id) || clickedNode.type === 'start')) {
          if (gameState.activeCompanyForBuild) {
              attemptFastBuild(clickedNode.id);
          } else {
              if (gameState?.tutorial?.isActive) {
                  if (window.game?.audio) window.game.audio.playError();
                  return;
              }
              handleNodeClick(clickedNode.id);
          }
          return; 
        }
        
        let hitConn = null;
        for (const conn of connections) {
            if (mutedNodes.has(conn.from) || mutedNodes.has(conn.to)) continue; // Ignore ghosted connections
            
            const n1 = nodes.find(n => n.id === conn.from);
            const n2 = nodes.find(n => n.id === conn.to);
            if (n1 && n2 && (activeNetwork.has(conn.from) || activeNetwork.has(conn.to))) {
                if (distToSegment({ x: clickX, y: clickY }, n1, n2) < 15) {
                    hitConn = conn; 
                    break;
                }
            }
        }

        if (hitConn) {
            let targetNodeId = null;
            const companyId = window.game?.activeCompanyForBuild || gameState.activeCompanyForBuild;
            
            if (companyId && window.game?.companies[companyId]) {
                const comp = window.game.companies[companyId];
                if (comp.activeLines.includes(hitConn.from) && !comp.activeLines.includes(hitConn.to)) targetNodeId = hitConn.to;
                else if (comp.activeLines.includes(hitConn.to) && !comp.activeLines.includes(hitConn.from)) targetNodeId = hitConn.from;
            }
            
            if (!targetNodeId) {
                const fromInNetwork = activeNetwork.has(hitConn.from);
                const toInNetwork = activeNetwork.has(hitConn.to);
                if (fromInNetwork && !toInNetwork) targetNodeId = hitConn.to;
                else if (toInNetwork && !fromInNetwork) targetNodeId = hitConn.from;
                else targetNodeId = hitConn.to; 
            }

            if (targetNodeId && (!cleanMap || relevantNodes.has(targetNodeId))) {
                if (gameState.activeCompanyForBuild) {
                    attemptFastBuild(targetNodeId);
                } else {
                    if (gameState?.tutorial?.isActive) {
                        if (window.game?.audio) window.game.audio.playError();
                        return;
                    }
                    handleNodeClick(targetNodeId);
                }
                return;
            }
        }
    }
  };

  const handlePointerMove = (e) => {
    // --- KILL DRAGGING IN TUTORIAL ---
    if (isDragging && !isTutorial && containerRef.current) {
      e.preventDefault();
      const moveX = Math.abs(e.pageX - dragStart.x);
      const moveY = Math.abs(e.pageY - dragStart.y);
      if (moveX > 5 || moveY > 5) setHasDragged(true);
      
      containerRef.current.scrollLeft = dragStart.scrollLeft - (e.pageX - dragStart.x);
      
      const newScrollTop = dragStart.scrollTop - (e.pageY - dragStart.y);
      const targetContentHeight = dynamicBoardHeight * currentZoom;
      const maxScrollTop = Math.max(0, targetContentHeight - containerRef.current.clientHeight);
      
      containerRef.current.scrollTop = Math.min(maxScrollTop, Math.max(0, newScrollTop));
      return;
    }

    if (!containerRef.current || !gameState) return;
    
    // --- NEW: TUTORIAL HOVER SHIELD ---
    // If the tutorial is active and the map is veiled (no focusNodes), kill all hover interaction.
    if (isTutorial) {
        const focusNodes = gameState.tutorial?.stepData?.focusNodes;
        if (!focusNodes || focusNodes.length === 0) {
            setTooltip(null);
            setTargetedCardIndices([]);
            useGameStore.getState().setHoveredCardFinancials([]);
            return;
        }
    }

    // --- NEW UNIFIED HITBOX MATH ---
    const mapLayer = document.querySelector('.map-layer');
    const layerRect = mapLayer ? mapLayer.getBoundingClientRect() : { left: 0, top: 0 };
    const hoverX = (e.clientX - layerRect.left) / currentZoom;
    const hoverY = (e.clientY - layerRect.top) / currentZoom;
    const p = { x: hoverX, y: hoverY };

    // Ignore hovers on muted nodes
    let hitNode = nodes.find(n => !mutedNodes.has(n.id) && n.revealed && (!cleanMap || relevantNodes.has(n.id) || n.type === 'start') && Math.sqrt((n.x - hoverX)**2 + (n.y - hoverY)**2) <= 20);
    
    if (hitNode) {
        
        const isAlreadyBuiltNode = activeNetwork.has(hitNode.id) || hitNode.type === 'start';
        const adjacentConn = connections.find(c => 
            (activeRailheadsForCities.has(c.from) && c.to === hitNode.id) || 
            (activeRailheadsForCities.has(c.to) && c.from === hitNode.id)
        );

        if (adjacentConn && !isAlreadyBuiltNode && window.game) {
            let builderData = [];
            const currentBuilder = window.game?.activeCompanyForBuild;

            if (currentBuilder && companies[currentBuilder]) {
                const comp = companies[currentBuilder];
                const conn = connections.find(c =>
                    (comp.activeLines.includes(c.from) && c.to === hitNode.id) ||
                    (comp.activeLines.includes(c.to) && c.from === hitNode.id)
                );
                if (conn) {
                    const sourceNodeId = comp.activeLines.includes(conn.from) ? conn.from : conn.to;
                    const units = window.game.calculateUnits(sourceNodeId, hitNode.id);
                    builderData.push({ comp, units, targetNodeId: hitNode.id });
                }
            } else {
                connections.forEach(conn => {
                    if (conn.to === hitNode.id || conn.from === hitNode.id) {
                        const sourceNodeId = conn.to === hitNode.id ? conn.from : conn.to;
                        Object.values(companies).forEach(comp => {
                            if (comp.activeLines.includes(sourceNodeId)) {
                                const units = window.game.calculateUnits(sourceNodeId, hitNode.id);
                                builderData.push({ comp, units, targetNodeId: hitNode.id });
                            }
                        });
                    }
                });
            }

            const maxUnits = builderData.length > 0 ? Math.max(...builderData.map(b => b.units)) : 0;
            setTargetedCardIndices(Array.from({length: maxUnits}, (_, i) => i));
            useGameStore.getState().setHoveredCardFinancials(generateTargetedCardData(builderData));

        } else {
            setTargetedCardIndices([]);
            useGameStore.getState().setHoveredCardFinancials([]); 
        }

        const fallbackDescriptions = {
            regional_hq: "+2 Max Shares for this company. Stock price drops 2 steps.",
            parlor: "Acquire or evolve 1 card here.",
            fed_exchange: "+1 Max Share and stock price drops 1 step for ALL companies.",
            signal: "Reveals adjacent hidden nodes.",
            supply: "+3 Track Segments for this company.",
            union_yard: "+1 Track Segment for ALL companies.",
            merger: "Costs +1 Track. Select a discarded card to proxy your next draw.",
            financial: "+$40 to Treasury for this company.",
            boomtown: "Stock price increases 1 step for ALL companies.",
            detroit: "+10 Track Segments for this company.",
            mountain: "Flat tax applied to build cost.",
            chicago: "Ends game if continuous transcontinental link is complete.",
            start: "Starting Network Hub (S.N.H.).",
            standard: "Generates base income."
        };

        const subType = hitNode.subType || hitNode.type;
        const config = window.NODE_TYPES ? window.NODE_TYPES[subType] : null;
        let desc = "Industrial Asset";
        if (config && config.getDescription) {
            desc = config.getDescription(window.game, hitNode);
        } else if (fallbackDescriptions[subType]) {
            desc = fallbackDescriptions[subType];
        }

        const typeLabel = subType.replace('_', ' ').toUpperCase();
        const typeColors = { regional_hq: '#e11d48', parlor: '#e066ff', fed_exchange: '#3b82f6', boomtown: '#ef4444', supply: '#facc15' };
        const accentColor = typeColors[subType] || '#94a3b8';

        let bypassedHtml = '';
        
        if (hitNode.revealed && !isAlreadyBuiltNode) {
            let furthestEast = 0;
            let activeCompName = "The Railroad";
            
            Object.values(companies).forEach(c => {
                if (c.activeLines && c.activeLines.length > 0) {
                    c.activeLines.forEach(nId => {
                        const n = nodes.find(x => x.id === nId);
                        if (n && n.x > furthestEast) {
                            furthestEast = n.x;
                            activeCompName = c.name;
                        }
                    });
                }
            });

            if (furthestEast > hitNode.x + 400) {
                if (!hitNode.bypassedLore) {
                    hitNode.bypassedLore = generateTownLore(hitNode.name, activeCompName, 'bypassed');
                }
                bypassedHtml = `
                    <div style="margin-top: 12px; padding: 12px; background-color: rgba(0,0,0,0.5); border-left: 3px solid #64748b; font-style: italic; color: #94a3b8; font-family: 'Georgia', serif; font-size: 13px; line-height: 1.4; border-radius: 0 4px 4px 0;">
                        "${hitNode.bypassedLore}"
                    </div>
                `;
            }
        }

        const html = `
          <div style="display: flex; flex-direction: column; gap: 8px; font-family: 'Courier New', Courier, monospace;">
            <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; text-shadow: 1px 1px 2px #000;">
              ${hitNode.name}
            </div>
            <div style="font-size: 13px; font-weight: 900; color: ${accentColor}; letter-spacing: 1.5px;">
              ${typeLabel}
            </div>
            <div style="font-size: 14px; color: #cbd5e1; line-height: 1.5; font-weight: 500;">
              ${desc}
            </div>
            ${bypassedHtml}
            <hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.2); margin: 6px 0;" />
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 16px;">
              <span style="color: #94a3b8; font-weight: bold;">Income:</span>
              <span style="color: #4ade80; font-weight: 900; text-shadow: 0 0 8px rgba(74, 222, 128, 0.4); white-space: nowrap;">
                $${hitNode.value || 0}
              </span>
            </div>
          </div>
        `;
        setTooltip({ x: e.clientX, y: e.clientY, html });
        return;
    }

    let hitConn = null;
    for (const conn of connections) {
        if (mutedNodes.has(conn.from) || mutedNodes.has(conn.to)) continue; // Ignore ghosted connections
        
        const n1 = nodes.find(n => n.id === conn.from);
        const n2 = nodes.find(n => n.id === conn.to);
        if (n1 && n2 && (n1.revealed || n2.revealed)) {
            if (distToSegment(p, n1, n2) < 15) {
                hitConn = conn; break;
            }
        }
    }

    if (hitConn && window.game) {
         const connStr1 = `${hitConn.from}-${hitConn.to}`;
         const connStr2 = `${hitConn.to}-${hitConn.from}`;
         const isAlreadyBuiltConn = builtConnSet.has(connStr1) || builtConnSet.has(connStr2);
         const touchesRailhead = activeRailheadsForCities.has(hitConn.from) || activeRailheadsForCities.has(hitConn.to);

         if (touchesRailhead && !isAlreadyBuiltConn) {
             let builderData = [];
             const currentBuilder = window.game?.activeCompanyForBuild;

             if (currentBuilder && companies[currentBuilder]) {
                 const comp = companies[currentBuilder];
                 if (comp.activeLines.includes(hitConn.from) || comp.activeLines.includes(hitConn.to)) {
                     const sourceNodeId = comp.activeLines.includes(hitConn.from) ? hitConn.from : hitConn.to;
                     const targetNodeId = sourceNodeId === hitConn.from ? hitConn.to : hitConn.from;
                     const units = window.game.calculateUnits(sourceNodeId, targetNodeId);
                     builderData.push({ comp, units, targetNodeId });
                 }
             } else {
                 Object.values(companies).forEach(comp => {
                     if (comp.activeLines.includes(hitConn.from) || comp.activeLines.includes(hitConn.to)) {
                         const sourceNodeId = comp.activeLines.includes(hitConn.from) ? hitConn.from : hitConn.to;
                         const targetNodeId = sourceNodeId === hitConn.from ? hitConn.to : hitConn.from;
                         const units = window.game.calculateUnits(sourceNodeId, targetNodeId);
                         builderData.push({ comp, units, targetNodeId });
                     }
                 });
             }

             const maxUnits = builderData.length > 0 ? Math.max(...builderData.map(b => b.units)) : 0;
             setTargetedCardIndices(Array.from({length: maxUnits}, (_, i) => i));
             useGameStore.getState().setHoveredCardFinancials(generateTargetedCardData(builderData));

         } else {
             setTargetedCardIndices([]);
             useGameStore.getState().setHoveredCardFinancials([]); 
         }
         
         const breakdown = window.game.getSegmentCostBreakdown(null, hitConn.from, hitConn.to);
         const frontCardType = gameState?.belt?.[0]?.type || 'green';
         const themeMap = {
             'green': { bg: '#4ade80', text: '#064e3b', label: 'GREEN' },
             'blue': { bg: '#60a5fa', text: '#1e3a8a', label: 'BLUE' },
             'red': { bg: '#f87171', text: '#450a0a', label: 'RED' }
         };
         const theme = themeMap[frontCardType] || themeMap['green'];

         const cardCount = breakdown.cardCount || breakdown.units || 1;
         const playerBonus = breakdown.playerBonus || 0;
         const totalCost = breakdown.total || 0;

         const html = `
          <div style="font-family: 'Courier New', Courier, monospace; min-width: 280px; padding: 4px;">
            <div style="font-size: 18px; font-weight: bold; color: #ffffff; letter-spacing: 1px; margin-bottom: 10px;">
              TRACK SEGMENT
            </div>
            <div style="margin-bottom: 20px;">
              <span style="background-color: ${theme.bg}; color: ${theme.text}; padding: 4px 8px; border-radius: 4px; font-size: 16px; font-weight: bold;">
                ${cardCount} ${theme.label}
              </span>
            </div>
            ${playerBonus > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 16px;">
              <span style="color: #dfb127; font-weight: bold;">PLAYER</span>
              <span style="color: #dfb127; font-weight: bold; white-space: nowrap;">+$${playerBonus}</span>
            </div>
            <div style="font-size: 16px; color: #94a3b8; margin-bottom: 16px;">$${playerBonus}</div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 16px;">
              <span style="color: #ffffff; font-weight: bold;">COMPANY</span>
              <span style="color: #ffffff; font-weight: bold; white-space: nowrap;">-$${totalCost}</span>
            </div>
            <div style="font-size: 16px; color: #94a3b8;">Labor + Track</div>
          </div>
         `;
         setTooltip({ x: e.clientX, y: e.clientY, html });
         return;
    }

    setTargetedCardIndices([]);
    setTooltip(null);
    useGameStore.getState().setHoveredCardFinancials([]); 
  };

  let cursorStyle = isDragging ? 'grabbing' : 'grab';
  const activeBuildComp = gameState?.activeCompanyForBuild;
  
  if (activeBuildComp && companies[activeBuildComp]) {
      const compColor = companies[activeBuildComp].colorStr || '#facc15';
      cursorStyle = getGlowingHandCursor(compColor);
  }

  // --- ABSTRACTED MAP CONTENTS ---
  const mapContents = (
      <>
        {/* THE FLUFF IS DEAD DURING TUTORIAL */}
        {!isTutorial && <PacificOceanOverlay height={dynamicBoardHeight} ripples={ripples} />}
        {!isTutorial && <CartographicMountainRange height={dynamicBoardHeight} />}
        {!isTutorial && <RustBeltLandscape height={dynamicBoardHeight} />}
        
        <Stage width={5200} height={dynamicBoardHeight} options={{ backgroundAlpha: 0 }} style={{ position: 'relative', zIndex: 2 }}>
          
          {!isTutorial && <GrantLine height={dynamicBoardHeight} />}
          {!isTutorial && <RustBeltLine height={dynamicBoardHeight} />}
          
          <ConnectionLines connections={connections} nodes={nodes} activeNetwork={activeNetwork} companies={companies} showOnlyRailheads={showOnlyRailheads} mutedCompanies={mutedCompanies} />
          <BuiltLines companies={companies} nodes={nodes} mutedCompanies={mutedCompanies} />
          {nodes.map(node => {
              if (mutedNodes.has(node.id)) return null;
              if (cleanMap && !relevantNodes.has(node.id) && node.type !== 'start') return null;
              return <NodeItem key={node.id} node={node} isFrontier={frontierNodes.has(node.id)} />
          })}
        </Stage>
        
        <CostBubblesHTMLOverlay connections={connections} nodes={nodes} activeNetwork={activeNetwork} companies={companies} showOnlyRailheads={showOnlyRailheads} showLinkCosts={showLinkCosts} zoomScale={currentZoom} mutedCompanies={mutedCompanies} />
        <HTMLOverlayLayer nodes={nodes} privateCompanies={privateCompanies} companies={companies} height={dynamicBoardHeight} cleanMap={cleanMap} relevantNodes={relevantNodes} mutedCompanies={mutedCompanies} mutedNodes={mutedNodes} />
        {showGrid && <DevGridOverlay width={5200} height={dynamicBoardHeight} />}
        
        {isTutorial && gameState.tutorial.stepData?.focusNodes && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
                {gameState.tutorial.stepData.focusNodes.map(nodeId => {
                    const node = nodes.find(n => n.id === nodeId);
                    if (!node) return null;
                    return (
                        <div key={`spotlight-${nodeId}`} className="tutorial-spotlight" style={{
                            position: 'absolute',
                            left: `${node.x - 40}px`,
                            top: `${node.y - 40}px`,
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            pointerEvents: 'none'
                        }} />
                    );
                })}
            </div>
        )}
      </>
  );

  return (
    <div id="game-board-root" className="tut-allow-clicks" style={{ gridArea: '2 / 2 / 3 / 3', position: 'relative', overflow: 'hidden', backgroundColor: '#0f172a' }}>
      
      {!isTutorial && (
          <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', display: 'flex', flexDirection: 'column', backgroundColor: '#1e293b', border: '2px solid #334155', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
             <button onClick={() => setZoomScale(prev => Math.min(prev + 0.2, 2.0))} style={{ padding: '8px 0', color: 'white', background: 'transparent', border: 'none', borderBottom: '1px solid #334155', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>+</button>
             <button onClick={() => setZoomScale(getMinZoom())} style={{ padding: '8px 0', color: '#94a3b8', background: 'transparent', border: 'none', borderBottom: '1px solid #334155', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>FIT</button>
             <button onClick={() => setZoomScale(prev => Math.max(prev - 0.2, getMinZoom()))} style={{ padding: '8px 0', color: 'white', background: 'transparent', border: 'none', borderBottom: '1px solid #334155', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>-</button>
             <button onClick={() => setShowGrid(prev => !prev)} style={{ padding: '8px 0', color: showGrid ? '#0ea5e9' : '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>GRID</button>
             <button onClick={() => setShowLinkCosts(prev => (prev + 1) % 3)} style={{ padding: '8px 0', color: showLinkCosts !== 0 ? '#0ea5e9' : '#94a3b8', background: 'transparent', border: 'none', borderTop: '1px solid #334155', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                 {showLinkCosts === 1 ? '$ COSTS' : showLinkCosts === 2 ? 'LINKS' : 'COSTS OFF'}
             </button>
             <button onClick={() => setCleanMap(prev => !prev)} style={{ padding: '8px 0', color: cleanMap ? '#0ea5e9' : '#94a3b8', background: 'transparent', border: 'none', borderTop: '1px solid #334155', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>CITIES</button>
             <button onClick={() => setShowOnlyRailheads(prev => !prev)} style={{ padding: '8px 0', color: showOnlyRailheads ? '#0ea5e9' : '#94a3b8', background: 'transparent', border: 'none', borderTop: '1px solid #334155', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>LINES</button>
             {Object.values(companies).map(comp => {
                const isMuted = mutedCompanies.includes(comp.id);
                return (
                  <button key={comp.id} onClick={() => setMutedCompanies(prev => isMuted ? prev.filter(id => id !== comp.id) : [...prev, comp.id])} style={{ padding: '8px 0', color: isMuted ? '#94a3b8' : comp.colorStr, background: 'transparent', border: 'none', borderTop: '1px solid #334155', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>{comp.short}</button>
                );
             })}
          </div>
      )}

      {/* THE VOID LOCK CONTAINER */}
      <div id="map-container" ref={containerRef} style={{ 
          width: '100%', height: '100%', 
          overflowX: isTutorial ? 'hidden' : 'auto', 
          overflowY: 'hidden', 
          cursor: isTutorial ? 'default' : cursorStyle, 
          scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'none',
          backgroundColor: isTutorial ? '#0f172a' : 'transparent',
          
          // CONDITIONAL LAYOUT: Flexbox for Tutorial, Block for Regular Game
          display: isTutorial ? 'flex' : 'block',
          alignItems: isTutorial ? 'center' : 'normal'
      }} onPointerDown={handlePointerDown} onPointerLeave={(e) => { handlePointerUpOrLeave(e); setTooltip(null); }} onPointerUp={handlePointerUpOrLeave} onPointerMove={handlePointerMove}>
        
        <div style={{ 
            minWidth: `${5200 * currentZoom}px`, 
            height: `${dynamicBoardHeight * currentZoom}px`, 
            
            // CONDITIONAL MARGIN: Only chop off the ocean in the tutorial
            marginLeft: isTutorial ? `${-180 * currentZoom}px` : '0px', 
            
            position: 'relative', 
            transition: isTutorial ? 'none' : 'width 0.3s ease-out, height 0.3s ease-out' 
        }}>
          <div className="map-layer" style={{ 
              width: '5200px', 
              height: `${dynamicBoardHeight}px`, 
              position: 'absolute', 
              
              // CONDITIONAL CENTERING: True vertical center for tutorial, top for regular
              top: isTutorial ? '50%' : '0', 
              marginTop: isTutorial ? `${-dynamicBoardHeight / 2}px` : '0px', 
              
              transform: `scale(${currentZoom})`, 
              
              // CONDITIONAL ORIGIN: Center scale for tutorial, top-left for regular
              transformOrigin: isTutorial ? 'left center' : 'top left', 
              
              transition: isTutorial ? 'none' : 'transform 0.3s ease-out' 
          }}>
            {mapContents}
            
            {/* NEW: IN-MAP BOUNCING ARROW FOR TUTORIAL */}
            {isTutorial && gameState.tutorial?.stepData?.arrowTarget && (
                <div style={{
                    position: 'absolute',
                    left: `${gameState.tutorial.stepData.arrowTarget.x}px`,
                    top: `${gameState.tutorial.stepData.arrowTarget.y - 30}px`,
                    zIndex: 1000,
                    pointerEvents: 'none',
                    animation: 'tutMapBounce 1s infinite'
                }}>
                    <svg width="40" height="50" viewBox="0 0 40 50" style={{ transform: 'translate(-50%, -100%)' }}>
                        <path d="M20 50 L0 20 L10 20 L10 0 L30 0 L30 20 L40 20 Z" fill="#facc15" stroke="#000" strokeWidth="2" filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.5))" />
                    </svg>
                    <style>
                        {`@keyframes tutMapBounce {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-15px); }
                        }`}
                    </style>
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GameBoard;