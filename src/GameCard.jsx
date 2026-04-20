import React, { useState, useId } from 'react';
import { useGameStore } from './App';

const DefaultArt = ({ type }) => {
    const glowColor = type === 'green' ? '#4ade80' : type === 'blue' ? '#60a5fa' : '#f87171';
    
    return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(0 0 8px ${glowColor})`, opacity: 0.9 }}>
            {type === 'green' && (
                <g stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 80 L15 40 L45 55 L45 30 L75 45 L75 20 L85 20 L85 80 Z" />
                    <circle cx="30" cy="65" r="4" fill="#fff"/>
                    <circle cx="60" cy="65" r="4" fill="#fff"/>
                    <line x1="15" y1="80" x2="85" y2="80" />
                </g>
            )}
            {type === 'blue' && (
                <g stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="25" y="15" width="50" height="70" rx="4" />
                    <line x1="35" y1="35" x2="65" y2="35" />
                    <line x1="35" y1="55" x2="65" y2="55" />
                    <circle cx="40" cy="75" r="4" fill="#fff" />
                    <line x1="50" y1="75" x2="65" y2="75" />
                </g>
            )}
            {type === 'red' && (
                <g stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 75 L40 45 L60 60 L85 25" />
                    <polyline points="60 25 85 25 85 50" />
                </g>
            )}
        </svg>
    );
};

export default function GameCard({ 
  type, name, level = 1, price, desc, 
  desc1, desc2, desc3, invCounts, icon, 
  activeTab = 1, setActiveTab,
  showTabs = false,
  disableZoom = false, 
  isDenseView = false,
  hidePrice = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const setTooltip = useGameStore(state => state.setHoveredTooltip);
  
  const cardHeight = isExpanded ? 255 : 180;
  
  const rawId = useId();
  const uid = rawId.replace(/:/g, ""); 

  const _desc1 = desc1 || desc;
  const _desc2 = desc2 || "Level 2 Evolution";
  const _desc3 = desc3 || "Level 3 Evolution";
  const _invCounts = invCounts || { 1: 0, 2: 0, 3: 0 };
  
  const handleTabClick = setActiveTab || (() => {});

  const formatCardText = (text, isDarkBg) => {
    if (!text) return null;
    // Split by either <strong> tags OR our custom [short|long] syntax
    const parts = text.split(/(<strong>.*?<\/strong>|\[[^|]+\|[^\]]+\])/g);
    
    return parts.map((part, i) => {
        if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
            const innerText = part.replace(/<\/?strong>/g, '');
            return (
                <span key={i} style={{ 
                    fontWeight: 900, 
                    color: isDarkBg ? '#facc15' : '#000', 
                    fontSize: '1.05em' 
                }}>
                    {innerText}
                </span>
            );
        }
        // Parse the hoverable abbreviation syntax and trigger custom tooltip
        if (part.startsWith('[') && part.endsWith(']')) {
            const content = part.slice(1, -1); // Remove the brackets
            const [shortText, longText] = content.split('|');
            return (
                <span 
                    key={i} 
                    onMouseEnter={(e) => {
                        e.stopPropagation();
                        setTooltip({
                            x: e.clientX,
                            y: e.clientY,
                            html: `<div style="font-size: 14px; font-family: 'Courier New', Courier, monospace; font-weight: bold; color: #ffffff; letter-spacing: 0.5px;">${longText}</div>`
                        });
                    }}
                    onMouseLeave={(e) => {
                        e.stopPropagation();
                        setTooltip(null);
                    }}
                    style={{ 
                        borderBottom: isDarkBg ? '2px dotted rgba(255,255,255,0.6)' : '2px dotted rgba(0,0,0,0.6)', 
                        cursor: 'help',
                        fontWeight: 'bold'
                    }}>
                    {shortText}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
  };

  const THEMES = {
    blue: { stops: ['#0A50A1', '#09468D', '#073D7A', '#06356B', '#052F5F', '#042B56', '#042952', '#032850'], drawerTop: '#BFCAE2', drawerBottom: '#032850', solidMain: '#0A50A1', solidDark: '#032850', accent: '#60a5fa' },
    green: { stops: ['#33A02C', '#2D8C26', '#277921', '#226A1D', '#1E5E1A', '#1B5618', '#1A5116', '#195016'], drawerTop: '#CCEBB9', drawerBottom: '#195016', solidMain: '#33A02C', solidDark: '#195016', accent: '#4ade80' },
    red: { stops: ['#811788', '#711577', '#621267', '#55105A', '#4C0E50', '#450D49', '#420C45', '#400C44'], drawerTop: '#DDBEDD', drawerBottom: '#400C44', solidMain: '#811788', solidDark: '#400C44', accent: '#c084fc' }
  };
  const c = THEMES[type] || THEMES.blue;
  const gradientOffsets = [0, 0.0757, 0.1625, 0.2594, 0.3684, 0.4968, 0.6625, 1];

  const baseScale = 1.2; 
  const finalScale = isDenseView ? (baseScale * 0.5) : baseScale; 

  const scaledBaseWidth = (showTabs ? 220 : 183) * finalScale;
  const scaledExpandedWidth = (disableZoom || isDenseView) ? scaledBaseWidth : ((showTabs ? 260 : 230) * finalScale); 
  const scaledBaseHeight = 180 * finalScale;

  const nameUpper = name ? name.toUpperCase() : "CARD";
  const words = nameUpper.split(' ');
  let line1 = nameUpper; let line2 = '';
  if (words.length === 2) { line1 = words[0]; line2 = words[1]; } 
  else if (words.length > 2) { const mid = Math.ceil(words.length / 2); line1 = words.slice(0, mid).join(' '); line2 = words.slice(mid).join(' '); }
  const maxChars = Math.max(line1.length, line2.length);
  const dynamicFontSize = maxChars > 8 ? Math.max(14, 22 - (maxChars - 8) * 1.8) : 22;
  const dynamicLetterSpacing = maxChars > 8 ? 0 : 1;
  const titleStartY = line2 ? 32 : 44;

  const activeDesc = showTabs ? (activeTab === 1 ? _desc1 : activeTab === 2 ? _desc2 : _desc3) : desc;
  const currentStars = showTabs ? activeTab : level;

  const handleMouseEnter = (e) => {
      if (!isDenseView) return; 
      
      const stars = Array(currentStars).fill('★').join('');
      const typeLabel = type === 'red' ? 'PURPLE' : type.toUpperCase();

      const html = `
          <div style="display: flex; flex-direction: column; gap: 8px; font-family: 'Courier New', Courier, monospace; min-width: 250px;">
              <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; text-shadow: 1px 1px 2px #000;">
                  ${nameUpper}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; font-weight: 900; color: ${c.accent}; letter-spacing: 1.5px;">
                      ${typeLabel} ASSET
                  </span>
                  <span style="font-size: 18px; color: #FFD700; text-shadow: 0 0 5px rgba(255,215,0,0.5);">
                      ${stars}
                  </span>
              </div>
              <hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.2); margin: 6px 0;" />
              <div style="font-size: 14px; color: #cbd5e1; line-height: 1.5; font-weight: 500; font-family: Arial, sans-serif;">
                  ${activeDesc}
              </div>
          </div>
      `;
      setTooltip({ x: e.clientX, y: e.clientY, html });
  };

  const handleMouseLeave = () => {
      if (!isDenseView) return;
      setTooltip(null);
  };

  return (
    <div 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        style={{ 
            position: 'relative', 
            width: (isExpanded && !disableZoom && !isDenseView) ? `${scaledExpandedWidth}px` : `${scaledBaseWidth}px`, 
            height: `${scaledBaseHeight}px`, 
            flexShrink: 0, 
            zIndex: isExpanded ? 100 : 1, 
            transition: 'width 0.2s ease-in-out',
            transform: 'translateZ(0)', // THE FIX: Forces hardware rendering to stop I-Beam tearing
            willChange: 'transform'
        }}
    >
      <div style={{ position: 'absolute', bottom: 0, left: showTabs ? '42%' : '50%', width: '183px', height: '180px', transform: `translateX(-50%) scale(${finalScale})`, transformOrigin: 'bottom center', transition: 'left 0.2s ease-in-out' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '183px', height: `${cardHeight}px`, overflow: 'hidden', borderRadius: '19.5px 19.5px 16.5px 16.5px', transform: (isExpanded && !disableZoom && !isDenseView) ? 'scale(1.25)' : 'scale(1)', transformOrigin: 'bottom center', transition: 'all 0.2s ease-in-out', boxShadow: (isExpanded && !isDenseView) ? '0 -15px 40px rgba(0,0,0,0.8)' : 'none', zIndex: 2 }}>
          
          <svg xmlns="http://www.w3.org/2000/svg" width="183" height="255" viewBox="0 0 183 255" overflow="visible" xmlSpace="preserve" style={{ position: 'absolute', top: 0, left: 0, transform: 'translateZ(0)' }}>
            <defs>
              <linearGradient id={`XMLID_1_${uid}`} gradientUnits="userSpaceOnUse" x1="91.5" y1="186.6953" x2="91.5" y2="168.0726">{gradientOffsets.map((o, i) => <stop key={i} offset={o} stopColor={c.stops[i]} />)}</linearGradient>
              <linearGradient id={`XMLID_2_${uid}`} gradientUnits="userSpaceOnUse" x1="91.499" y1="186.6953" x2="91.499" y2="168.0726">{gradientOffsets.map((o, i) => <stop key={i} offset={o} stopColor={c.stops[i]} />)}</linearGradient>
              <linearGradient id={`XMLID_3_${uid}`} gradientUnits="userSpaceOnUse" x1="91.499" y1="247.6074" x2="91.499" y2="7.609"><stop offset="0" stopColor={c.drawerTop}/><stop offset="1" stopColor={c.drawerBottom}/></linearGradient>
              <linearGradient id={`XMLID_4_${uid}`} gradientUnits="userSpaceOnUse" x1="91.499" y1="7.4819" x2="91.499" y2="178.3145">{gradientOffsets.map((o, i) => <stop key={i} offset={o} stopColor={c.stops[i]} />)}</linearGradient>
            </defs>
            <g id={`Layer_1_${uid}`}>
              <path fill={`url(#XMLID_1_${uid})`} d="M180,173.844c-1.043,1.658-2.322,3.149-3.801,4.423V229.2c0,10.477-8.523,19-19,19h-131.4 c-10.477,0-19-8.523-19-19v-50.936c-1.478-1.273-2.756-2.764-3.799-4.421V235.5c0,9.099,7.402,16.5,16.5,16.5h144 c9.098,0,16.5-7.401,16.5-16.5V173.844z"/>
              <path fill={`url(#XMLID_2_${uid})`} d="M25.799,246.2h131.4c9.374,0,17-7.626,17-17v-49.416C171.124,181.812,167.45,183,163.5,183h-144 c-3.951,0-7.626-1.189-10.701-3.217V229.2C8.799,238.574,16.425,246.2,25.799,246.2z"/><path fill={`url(#XMLID_3_${uid})`} d="M25.799,246.2h131.4c9.374,0,17-7.626,17-17v-49.416C171.124,181.812,167.45,183,163.5,183h-144 c-3.951,0-7.626-1.189-10.701-3.217V229.2C8.799,238.574,16.425,246.2,25.799,246.2z"/>
              <path fill={c.solidDark} d="M25.799,248.2h131.4c10.477,0,19-8.523,19-19v-50.934c-0.634,0.546-1.299,1.056-2,1.518V229.2 c0,9.374-7.626,17-17,17h-131.4c-9.374,0-17-7.626-17-17v-49.417c-0.701-0.463-1.366-0.973-2-1.519V229.2 C6.799,239.677,15.322,248.2,25.799,248.2z"/><path fill={c.solidMain} d="M19.5,180h144c9.098,0,16.5-7.401,16.5-16.5v-144c0-9.098-7.402-16.5-16.5-16.5h-144 C10.402,3,3,10.402,3,19.5v144C3,172.599,10.402,180,19.5,180z M6.799,25.8c0-10.477,8.523-19,19-19h131.4 c10.477,0,19,8.523,19,19v131.4c0,10.477-8.523,19-19,19h-131.4c-10.477,0-19-8.523-19-19V25.8z"/>
              <path d="M163.5,0h-144C8.748,0,0,8.748,0,19.5v144v72C0,246.252,8.748,255,19.5,255h144c10.752,0,19.5-8.748,19.5-19.5v-72v-144 C183,8.748,174.252,0,163.5,0z M163.5,252h-144C10.402,252,3,244.599,3,235.5v-61.656c1.043,1.657,2.321,3.147,3.799,4.421 c0.634,0.546,1.299,1.056,2,1.519C11.874,181.811,15.549,183,19.5,183h144c3.95,0,7.624-1.188,10.699-3.216 c0.701-0.462,1.366-0.972,2-1.518c1.479-1.273,2.758-2.765,3.801-4.423V235.5C180,244.599,172.598,252,163.5,252z M3,19.5 C3,10.402,10.402,3,19.5,3h144c9.098,0,16.5,7.402,16.5,16.5v144c0,9.099-7.402,16.5-16.5,16.5h-144 C10.402,180,3,172.599,3,163.5V19.5z"/><path fill={c.solidMain} d="M8.799,154.907c1.526-7.338,8.04-12.869,15.824-12.869c8.913,0,16.165,7.252,16.165,16.165 c0,8.167-6.094,14.92-13.97,15.997h88.004l59.377-59.377V25.8c0-9.374-7.626-17-17-17h-131.4c-9.374,0-17,7.626-17,17V154.907z"/><path fill={`url(#XMLID_4_${uid})`} d="M8.799,154.907c1.526-7.338,8.04-12.869,15.824-12.869c8.913,0,16.165,7.252,16.165,16.165 c0,8.167-6.094,14.92-13.97,15.997h88.004l59.377-59.377V25.8c0-9.374-7.626-17-17-17h-131.4c-9.374,0-17,7.626-17,17V154.907z"/><path fill={c.solidDark} d="M25.799,176.2h131.4c10.477,0,19-8.523,19-19V25.8c0-10.477-8.523-19-19-19h-131.4 c-10.477,0-19,8.523-19,19v131.4C6.799,167.677,15.322,176.2,25.799,176.2z M25.799,8.8h131.4c9.374,0,17,7.626,17,17v89.023 L114.822,174.2H26.818c7.876-1.077,13.97-7.83,13.97-15.997c0-8.913-7.252-16.165-16.165-16.165 c-7.784,0-14.298,5.531-15.824,12.869V25.8C8.799,16.426,16.425,8.8,25.799,8.8z"/>
              
              <foreignObject x="15" y="182" width="153" height="62">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', padding: '1px 0', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '12.5px', color: '#000', lineHeight: '1.25', fontWeight: 'bold', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>{formatCardText(activeDesc, false)}</div>
                </div>
              </foreignObject>
              <text x="91.5" y={titleStartY} textAnchor="middle" fill="#e0e0e0" fontSize={dynamicFontSize} fontWeight="900" style={{ letterSpacing: `${dynamicLetterSpacing}px`, fontFamily: 'sans-serif' }}>
                <tspan x="91.5" dy="0">{line1}</tspan>{line2 && <tspan x="91.5" dy={dynamicFontSize}>{line2}</tspan>}
              </text>
              <text x="91.5" y="168" textAnchor="middle" fill="#FFD700" fontSize="28" stroke="#000" strokeWidth="1">{Array(currentStars).fill('★').join('')}</text>
              
              {/* Price Ribbon ONLY renders when NOT hidden */}
              {!hidePrice && price !== undefined && price !== null && (
                  <g>
                      <polygon points="125,180 183,122 183,180" fill="#facc15" stroke="#b45309" strokeWidth="2" />
                      <text x="164" y="164" textAnchor="middle" fill="#000" fontSize="16" fontWeight="900" fontFamily="Arial, sans-serif" transform="rotate(-45 164 164)">
                          {price === 0 ? 'FREE' : `$${price}`}
                      </text>
                  </g>
              )}

              {/* Question Mark and its background circle ONLY render in normal size */}
              {!isDenseView && (
                  <g>
                      <circle cx="24.6" cy="158.2" r="14.1" fill="#facc15" stroke="#b45309" strokeWidth="2" />
                      <text x="24.6" y="164" textAnchor="middle" fill="#000" fontSize="18" fontWeight="900" fontFamily="sans-serif">?</text>
                  </g>
              )}
            </g>
          </svg>

          <div style={{ position: 'absolute', top: '77px', left: '58px', width: '66px', height: '66px', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
            {icon ? icon : <DefaultArt type={type} />}
          </div>

          {/* Question mark click target (disabled in dense view) */}
          {!isDenseView && (
              <div 
                 onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsExpanded(!isExpanded); 
                 }}
                 style={{ position: 'absolute', top: '138px', left: '8px', width: '35px', height: '35px', zIndex: 30, borderRadius: '50%', cursor: 'pointer' }}
                 title="Expand Details"
              />
          )}
        </div>

        {showTabs && (
          <div style={{ position: 'absolute', right: (isExpanded && !disableZoom && !isDenseView) ? '-48px' : '-28px', bottom: '30px', opacity: 1, display: 'flex', flexDirection: 'column', gap: '4px', pointerEvents: 'auto', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', zIndex: 1 }}>
              {[1, 2, 3].map(lvl => {
                  const isActive = activeTab === lvl;
                  const count = _invCounts[lvl] || 0;
                  const hasCard = count > 0;
                  const borderColor = isActive ? '#fff' : '#334155';
                  return (
                      <div key={lvl} onClick={(e) => { e.stopPropagation(); handleTabClick(lvl); }} style={{ backgroundColor: isActive ? c.solidMain : '#1e293b', borderTop: `2px solid ${borderColor}`, borderRight: `2px solid ${borderColor}`, borderBottom: `2px solid ${borderColor}`, borderLeft: 'none', color: '#fff', padding: '6px 4px', borderRadius: '0 6px 6px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignSelf: 'center', justifyContent: 'center', boxShadow: isActive ? '4px 4px 10px rgba(0,0,0,0.6)' : '2px 2px 5px rgba(0,0,0,0.4)', transition: 'all 0.1s ease', transform: isActive ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'left center', minWidth: '28px' }}>
                          <div style={{ fontSize: '10px', color: '#FFD700', letterSpacing: '-1px', lineHeight: 1 }}>{Array(lvl).fill('★').join('')}</div>
                          <div style={{ fontSize: '13px', fontWeight: '900', color: hasCard ? '#4ade80' : '#cbd5e1', marginTop: '3px', lineHeight: 1 }}>x{count}</div>
                      </div>
                  )
              })}
          </div>
        )}

      </div>
    </div>
  );
}