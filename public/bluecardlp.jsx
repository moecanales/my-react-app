import React, { useId } from 'react';

const LegacyPlateCard = ({
  titleLine1 = "LEGACY",
  titleLine2 = "PLATE",
  cornerValue = "$0",
  ruleText = "You gain $25 if this company builds from Headquarters or Union Yard.",
}) => {
  const cardWidth = 183;
  const cardHeight = 255;
  
  // Generates a unique ID for this instance to prevent SVG gradient/filter clashes
  const rawId = useId();
  const uid = rawId.replace(/:/g, ""); 

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={cardWidth} 
        height={cardHeight} 
        viewBox={`0 0 ${cardWidth} ${cardHeight}`} 
        overflow="visible" 
        xmlSpace="preserve"
        role="img"
        aria-labelledby={`title-${uid}`}
      >
        <title id={`title-${uid}`}>{titleLine1} {titleLine2} Card</title>
        
        <defs>
          {/* Bevel effect for the main text */}
          <filter id={`textBevel-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
            <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
            <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="10" lightingColor="#ffffff" result="specOut">
              <fePointLight x="-5000" y="-10000" z="20000"/>
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
            <feMerge>
              <feMergeNode in="offsetBlur"/>
              <feMergeNode in="litPaint"/>
            </feMerge>
          </filter>

          {/* Illustrator Gradients with Unique IDs */}
          <linearGradient id={`XMLID_1_${uid}`} gradientUnits="userSpaceOnUse" x1="91.5" y1="186.6953" x2="91.5" y2="168.0726">
            <stop offset="0" stopColor="#0A50A1"/>
            <stop offset="0.0757" stopColor="#09468D"/>
            <stop offset="0.1625" stopColor="#073D7A"/>
            <stop offset="0.2594" stopColor="#06356B"/>
            <stop offset="0.3684" stopColor="#052F5F"/>
            <stop offset="0.4968" stopColor="#042B56"/>
            <stop offset="0.6625" stopColor="#042952"/>
            <stop offset="1" stopColor="#032850"/>
          </linearGradient>
          <linearGradient id={`XMLID_2_${uid}`} gradientUnits="userSpaceOnUse" x1="91.499" y1="186.6953" x2="91.499" y2="168.0726">
            <stop offset="0" stopColor="#0A50A1"/>
            <stop offset="0.0757" stopColor="#09468D"/>
            <stop offset="0.1625" stopColor="#073D7A"/>
            <stop offset="0.2594" stopColor="#06356B"/>
            <stop offset="0.3684" stopColor="#052F5F"/>
            <stop offset="0.4968" stopColor="#042B56"/>
            <stop offset="0.6625" stopColor="#042952"/>
            <stop offset="1" stopColor="#032850"/>
          </linearGradient>
          <linearGradient id={`XMLID_3_${uid}`} gradientUnits="userSpaceOnUse" x1="91.499" y1="247.6074" x2="91.499" y2="7.609">
            <stop offset="0" stopColor="#BFCAE2"/>
            <stop offset="1" stopColor="#032850"/>
          </linearGradient>
          <linearGradient id={`XMLID_4_${uid}`} gradientUnits="userSpaceOnUse" x1="91.499" y1="7.4819" x2="91.499" y2="178.3145">
            <stop offset="0" stopColor="#0A50A1"/>
            <stop offset="0.0757" stopColor="#09468D"/>
            <stop offset="0.1625" stopColor="#073D7A"/>
            <stop offset="0.2594" stopColor="#06356B"/>
            <stop offset="0.3684" stopColor="#052F5F"/>
            <stop offset="0.4968" stopColor="#042B56"/>
            <stop offset="0.6625" stopColor="#042952"/>
            <stop offset="1" stopColor="#032850"/>
          </linearGradient>
          <linearGradient id={`XMLID_5_${uid}`} gradientUnits="userSpaceOnUse" x1="60.6074" y1="108.834" x2="128.6083" y2="111.834">
            <stop offset="0.02" stopColor="#9C4118"/>
            <stop offset="0.14" stopColor="#D9B9A5"/>
            <stop offset="0.34" stopColor="#FFFFFF"/>
            <stop offset="0.63" stopColor="#954F35"/>
            <stop offset="0.75" stopColor="#762D18"/>
            <stop offset="0.7841" stopColor="#78301B"/>
            <stop offset="0.813" stopColor="#803821"/>
            <stop offset="0.8401" stopColor="#8E472E"/>
            <stop offset="0.85" stopColor="#954F35"/>
            <stop offset="1" stopColor="#EDDED3"/>
          </linearGradient>
          <linearGradient id={`XMLID_10_${uid}`} gradientUnits="userSpaceOnUse" x1="62.9707" y1="89.584" x2="73.0938" y2="89.584">
            <stop offset="0" stopColor="#FFFFFF"/>
            <stop offset="1" stopColor="#000000"/>
          </linearGradient>
          <linearGradient id={`XMLID_13_${uid}`} gradientUnits="userSpaceOnUse" x1="62.9473" y1="83.4863" x2="73.1162" y2="83.4863">
            <stop offset="0" stopColor="#FFFFFF"/>
            <stop offset="1" stopColor="#000000"/>
          </linearGradient>
          <linearGradient id={`XMLID_16_${uid}`} gradientUnits="userSpaceOnUse" x1="108.8037" y1="87.7808" x2="117.0166" y2="87.7808">
            <stop offset="0" stopColor="#FFFFFF"/>
            <stop offset="1" stopColor="#000000"/>
          </linearGradient>
          <linearGradient id={`XMLID_19_${uid}`} gradientUnits="userSpaceOnUse" x1="106.4648" y1="85.5078" x2="114.8125" y2="85.5078">
            <stop offset="0" stopColor="#FFFFFF"/>
            <stop offset="1" stopColor="#000000"/>
          </linearGradient>
          <linearGradient id={`XMLID_22_${uid}`} gradientUnits="userSpaceOnUse" x1="62.9473" y1="137.6982" x2="73.0137" y2="137.6982">
            <stop offset="0" stopColor="#FFFFFF"/>
            <stop offset="1" stopColor="#000000"/>
          </linearGradient>
          <linearGradient id={`XMLID_25_${uid}`} gradientUnits="userSpaceOnUse" x1="63.1162" y1="132.1621" x2="73.2314" y2="132.1621">
            <stop offset="0" stopColor="#FFFFFF"/>
            <stop offset="1" stopColor="#000000"/>
          </linearGradient>
          <linearGradient id={`XMLID_28_${uid}`} gradientUnits="userSpaceOnUse" x1="113.0293" y1="135.2949" x2="119.4502" y2="135.2949">
            <stop offset="0" stopColor="#FFFFFF"/>
            <stop offset="1" stopColor="#000000"/>
          </linearGradient>
          <linearGradient id={`XMLID_31_${uid}`} gradientUnits="userSpaceOnUse" x1="109.2031" y1="134.4717" x2="115.7598" y2="134.4717">
            <stop offset="0" stopColor="#FFFFFF"/>
            <stop offset="1" stopColor="#000000"/>
          </linearGradient>
        </defs>

        {/* --- Card Layer --- */}
        <g id={`Layer_1_${uid}`}>
          {/* Main Card Paths */}
          <path fill={`url(#XMLID_1_${uid})`} d="M180,173.844c-1.043,1.658-2.322,3.149-3.801,4.423V229.2c0,10.477-8.523,19-19,19h-131.4 c-10.477,0-19-8.523-19-19v-50.936c-1.478-1.273-2.756-2.764-3.799-4.421V235.5c0,9.099,7.402,16.5,16.5,16.5h144 c9.098,0,16.5-7.401,16.5-16.5V173.844z"/>
          <path fill={`url(#XMLID_2_${uid})`} d="M25.799,246.2h131.4c9.374,0,17-7.626,17-17v-49.416C171.124,181.812,167.45,183,163.5,183h-144 c-3.951,0-7.626-1.189-10.701-3.217V229.2C8.799,238.574,16.425,246.2,25.799,246.2z"/>
          <path fill={`url(#XMLID_3_${uid})`} d="M25.799,246.2h131.4c9.374,0,17-7.626,17-17v-49.416C171.124,181.812,167.45,183,163.5,183h-144 c-3.951,0-7.626-1.189-10.701-3.217V229.2C8.799,238.574,16.425,246.2,25.799,246.2z"/>
          <path fill="#032850" d="M25.799,248.2h131.4c10.477,0,19-8.523,19-19v-50.934c-0.634,0.546-1.299,1.056-2,1.518V229.2 c0,9.374-7.626,17-17,17h-131.4c-9.374,0-17-7.626-17-17v-49.417c-0.701-0.463-1.366-0.973-2-1.519V229.2 C6.799,239.677,15.322,248.2,25.799,248.2z"/>
          <path fill="#0A50A1" d="M19.5,180h144c9.098,0,16.5-7.401,16.5-16.5v-144c0-9.098-7.402-16.5-16.5-16.5h-144 C10.402,3,3,10.402,3,19.5v144C3,172.599,10.402,180,19.5,180z M6.799,25.8c0-10.477,8.523-19,19-19h131.4 c10.477,0,19,8.523,19,19v131.4c0,10.477-8.523,19-19,19h-131.4c-10.477,0-19-8.523-19-19V25.8z"/>
          <path d="M163.5,0h-144C8.748,0,0,8.748,0,19.5v144v72C0,246.252,8.748,255,19.5,255h144c10.752,0,19.5-8.748,19.5-19.5v-72v-144 C183,8.748,174.252,0,163.5,0z M163.5,252h-144C10.402,252,3,244.599,3,235.5v-61.656c1.043,1.657,2.321,3.147,3.799,4.421 c0.634,0.546,1.299,1.056,2,1.519C11.874,181.811,15.549,183,19.5,183h144c3.95,0,7.624-1.188,10.699-3.216 c0.701-0.462,1.366-0.972,2-1.518c1.479-1.273,2.758-2.765,3.801-4.423V235.5C180,244.599,172.598,252,163.5,252z M3,19.5 C3,10.402,10.402,3,19.5,3h144c9.098,0,16.5,7.402,16.5,16.5v144c0,9.099-7.402,16.5-16.5,16.5h-144 C10.402,180,3,172.599,3,163.5V19.5z"/>
          <path fill="#0A50A1" d="M8.799,154.907c1.526-7.338,8.04-12.869,15.824-12.869c8.913,0,16.165,7.252,16.165,16.165 c0,8.167-6.094,14.92-13.97,15.997h88.004l59.377-59.377V25.8c0-9.374-7.626-17-17-17h-131.4c-9.374,0-17,7.626-17,17V154.907z"/>
          <path fill={`url(#XMLID_4_${uid})`} d="M8.799,154.907c1.526-7.338,8.04-12.869,15.824-12.869c8.913,0,16.165,7.252,16.165,16.165 c0,8.167-6.094,14.92-13.97,15.997h88.004l59.377-59.377V25.8c0-9.374-7.626-17-17-17h-131.4c-9.374,0-17,7.626-17,17V154.907z M131.35,150.25H60.223v-4.5h-4.5V74.624h68.627h2.5v4.5h2h2.5V150.25z"/>
          <path fill="#032850" d="M25.799,176.2h131.4c10.477,0,19-8.523,19-19V25.8c0-10.477-8.523-19-19-19h-131.4 c-10.477,0-19,8.523-19,19v131.4C6.799,167.677,15.322,176.2,25.799,176.2z M25.799,8.8h131.4c9.374,0,17,7.626,17,17v89.023 L114.822,174.2H26.818c7.876-1.077,13.97-7.83,13.97-15.997c0-8.913-7.252-16.165-16.165-16.165 c-7.784,0-14.298,5.531-15.824,12.869V25.8C8.799,16.426,16.425,8.8,25.799,8.8z"/>
          
          {/* Copper Plate Base and Layers */}
          <path fill="#333333" d="M126.85,79.124v66.626H60.223v4.5h71.127V79.124h-2.5H126.85z"/>
          <path d="M126.85,145.75V79.124v-4.5h-2.5H55.723v71.126h4.5H126.85z M58.223,143.25V77.124h66.127v66.126H58.223z"/>
          <path fill="#333333" d="M121.85,140.75c0-4.447,0-56.679,0-61.126c-4.447,0-56.68,0-61.127,0c0,4.447,0,56.679,0,61.126 C65.17,140.75,117.402,140.75,121.85,140.75z"/>
          <path fill={`url(#XMLID_5_${uid})`} d="M121.85,140.75c0-4.447,0-56.679,0-61.126c-4.447,0-56.68,0-61.127,0c0,4.447,0,56.679,0,61.126 C65.17,140.75,117.402,140.75,121.85,140.75z M67.547,140.024c-2.488-0.261-4.378-2.251-4.6-4.651l10.066,1.051 C72.299,138.728,70.039,140.284,67.547,140.024z M63.116,133.512c0.662-2.387,2.962-4.021,5.505-3.755 c2.545,0.267,4.457,2.341,4.61,4.811L63.116,133.512z M62.971,87.51h10.123c-0.471,2.365-2.559,4.148-5.063,4.148 C65.529,91.658,63.441,89.875,62.971,87.51z M109.529,132.581c1.125-2.374,3.785-3.52,6.23-2.824l-4.474,9.431 C109.199,137.733,108.404,134.95,109.529,132.581z M119.104,137.12c-1.103,2.322-3.674,3.472-6.074,2.869l4.453-9.389 C119.467,132.079,120.205,134.798,119.104,137.12z M115.488,90.361c-1.816,1.815-4.626,2.035-6.685,0.658l7.347-7.346 C117.525,85.73,117.307,88.541,115.488,90.361z M114.813,82.301l-7.383,7.381c-1.475-2.069-1.289-4.959,0.566-6.815 C109.854,81.01,112.743,80.824,114.813,82.301z M73.116,85.639H62.947c0.408-2.441,2.527-4.305,5.084-4.305 C70.59,81.334,72.707,83.197,73.116,85.639z"/>
          <path d="M124.35,143.25V77.124H58.223v66.126H124.35z M60.723,79.624c4.447,0,56.68,0,61.127,0c0,4.447,0,56.679,0,61.126 c-4.447,0-56.68,0-61.127,0C60.723,136.303,60.723,84.071,60.723,79.624z"/>
          <path fill={`url(#XMLID_5_${uid})`} d="M124.35,143.25V77.124H58.223v66.126H124.35z M60.723,79.624c4.447,0,56.68,0,61.127,0 c0,4.447,0,56.679,0,61.126c-4.447,0-56.68,0-61.127,0C60.723,136.303,60.723,84.071,60.723,79.624z"/>
          <path fill="#333333" d="M68.031,91.658c2.504,0,4.592-1.783,5.063-4.148H62.971C63.441,89.875,65.529,91.658,68.031,91.658z"/>
          <path fill={`url(#XMLID_5_${uid})`} d="M68.031,91.658c2.504,0,4.592-1.783,5.063-4.148H62.971 C63.441,89.875,65.529,91.658,68.031,91.658z"/>
          <path fill={`url(#XMLID_10_${uid})`} d="M68.031,91.658c2.504,0,4.592-1.783,5.063-4.148H62.971 C63.441,89.875,65.529,91.658,68.031,91.658z"/>
          <path fill="#333333" d="M62.947,85.639h10.169c-0.409-2.441-2.526-4.305-5.085-4.305C65.475,81.334,63.355,83.197,62.947,85.639z"/>
          <path fill={`url(#XMLID_5_${uid})`} d="M62.947,85.639h10.169c-0.409-2.441-2.526-4.305-5.085-4.305 C65.475,81.334,63.355,83.197,62.947,85.639z"/>
          <path fill={`url(#XMLID_13_${uid})`} d="M62.947,85.639h10.169c-0.409-2.441-2.526-4.305-5.085-4.305 C65.475,81.334,63.355,83.197,62.947,85.639z"/>
          <path fill="#333333" d="M108.804,91.02c2.059,1.377,4.868,1.157,6.685-0.658c1.818-1.82,2.037-4.631,0.662-6.688L108.804,91.02z"/>
          <path fill={`url(#XMLID_5_${uid})`} d="M108.804,91.02c2.059,1.377,4.868,1.157,6.685-0.658c1.818-1.82,2.037-4.631,0.662-6.688 L108.804,91.02z"/>
          <path fill={`url(#XMLID_16_${uid})`} d="M108.804,91.02c2.059,1.377,4.868,1.157,6.685-0.658c1.818-1.82,2.037-4.631,0.662-6.688 L108.804,91.02z"/>
          <path fill="#333333" d="M107.996,82.866c-1.855,1.856-2.041,4.746-0.566,6.815l7.383-7.381 C112.743,80.824,109.854,81.01,107.996,82.866z"/>
          <path fill={`url(#XMLID_5_${uid})`} d="M107.996,82.866c-1.855,1.856-2.041,4.746-0.566,6.815l7.383-7.381 C112.743,80.824,109.854,81.01,107.996,82.866z"/>
          <path fill={`url(#XMLID_19_${uid})`} d="M107.996,82.866c-1.855,1.856-2.041,4.746-0.566,6.815l7.383-7.381 C112.743,80.824,109.854,81.01,107.996,82.866z"/>
          <path fill="#333333" d="M62.947,135.373c0.222,2.4,2.111,4.391,4.6,4.651c2.492,0.26,4.752-1.297,5.467-3.601L62.947,135.373z"/>
          <path fill={`url(#XMLID_5_${uid})`} d="M62.947,135.373c0.222,2.4,2.111,4.391,4.6,4.651c2.492,0.26,4.752-1.297,5.467-3.601 L62.947,135.373z"/>
          <path fill={`url(#XMLID_22_${uid})`} d="M62.947,135.373c0.222,2.4,2.111,4.391,4.6,4.651c2.492,0.26,4.752-1.297,5.467-3.601 L62.947,135.373z"/>
          <path fill="#333333" d="M68.621,129.757c-2.543-0.267-4.843,1.368-5.505,3.755l10.115,1.056 C73.078,132.098,71.166,130.023,68.621,129.757z"/>
          <path fill={`url(#XMLID_5_${uid})`} d="M68.621,129.757c-2.543-0.267-4.843,1.368-5.505,3.755l10.115,1.056 C73.078,132.098,71.166,130.023,68.621,129.757z"/>
          <path fill={`url(#XMLID_25_${uid})`} d="M68.621,129.757c-2.543-0.267-4.843,1.368-5.505,3.755l10.115,1.056 C73.078,132.098,71.166,130.023,68.621,129.757z"/>
          <path fill="#333333" d="M117.482,130.601l-4.453,9.389c2.4,0.603,4.972-0.547,6.074-2.869 C120.205,134.798,119.467,132.079,117.482,130.601z"/>
          <path fill={`url(#XMLID_5_${uid})`} d="M117.482,130.601l-4.453,9.389c2.4,0.603,4.972-0.547,6.074-2.869 C120.205,134.798,119.467,132.079,117.482,130.601z"/>
          <path fill={`url(#XMLID_28_${uid})`} d="M117.482,130.601l-4.453,9.389c2.4,0.603,4.972-0.547,6.074-2.869 C120.205,134.798,119.467,132.079,117.482,130.601z"/>
          <path fill="#333333" d="M109.529,132.581c-1.125,2.369-0.33,5.152,1.757,6.606l4.474-9.431 C113.314,129.062,110.654,130.207,109.529,132.581z"/>
          <path fill={`url(#XMLID_5_${uid})`} d="M109.529,132.581c-1.125,2.369-0.33,5.152,1.757,6.606l4.474-9.431 C113.314,129.062,110.654,130.207,109.529,132.581z"/>
          <path fill={`url(#XMLID_31_${uid})`} d="M109.529,132.581c-1.125,2.369-0.33,5.152,1.757,6.606l4.474-9.431 C113.314,129.062,110.654,130.207,109.529,132.581z"/>
          
          {/* Yellow Corner */}
          <path fill="#FFFF00" d="M174.391,155.515c0,0,0-37.196,0-39.469c-1.635,1.635-56.731,56.731-58.366,58.366 c2.273,0,39.47,0,39.47,0C165.914,174.412,174.391,165.935,174.391,155.515z"/>
          
          {/* Blue Question Mark Circle Indicator */}
          <path fill="#0A50A1" stroke="#032850" strokeWidth="2" d="M24.623,172.367c7.811,0,14.165-6.354,14.165-14.164s-6.354-14.165-14.165-14.165 s-14.164,6.354-14.164,14.165S16.813,172.367,24.623,172.367z"/>
          
          {/* --- Bottom Drawer Rule Text --- */}
          <foreignObject x="15" y="195" width="153" height="50">
            <div style={{ fontSize: '11px', color: '#000', lineHeight: '1.2', fontWeight: 'bold', textAlign: 'center' }}>
              {ruleText}
            </div>
          </foreignObject>

          {/* --- Top Card Overlay Elements --- */}
          {/* Lifted up by 5px (y was 45 and 68), stretched out (letterSpacing was 2px) */}
          <text x="91.5" y="40" textAnchor="middle" fill="#e0e0e0" fontSize="22" fontWeight="bold" filter={`url(#textBevel-${uid})`} style={{ letterSpacing: '4px', fontFamily: 'sans-serif' }}>
            {titleLine1}
          </text>
          <text x="91.5" y="63" textAnchor="middle" fill="#e0e0e0" fontSize="22" fontWeight="bold" filter={`url(#textBevel-${uid})`} style={{ letterSpacing: '4px', fontFamily: 'sans-serif' }}>
            {titleLine2}
          </text>
          
          <text x="24.6" y="164" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">?</text>
          
          {/* Centered dynamically inside the yellow triangle */}
          <text x="155" y="160" textAnchor="middle" fill="black" fontSize="16" fontWeight="bold" fontFamily="sans-serif" transform="rotate(-45 155 155)">
            {cornerValue}
          </text>
          
          {/* Stars shifted UP by exactly half their 16px length (y was 172, now 164) */}
          <text x="75" y="164" fill="#FFD700" fontSize="16" textAnchor="middle">★</text>
          <text x="91.5" y="164" fill="#FFD700" fontSize="16" textAnchor="middle">★</text>
          <text x="108" y="164" fill="#FFD700" fontSize="16" textAnchor="middle">★</text>
        </g>
      </svg>
    </div>
  );
};

export default LegacyPlateCard;