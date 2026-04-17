import React, { useCallback } from 'react';
import { Graphics, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { getLineMath } from './GameBoardUtils';

export const GrantLine = ({ height }) => {
  const draw = useCallback((g) => {
    g.clear();
    const startX = 2380; 
    const dash = 30;
    const gap = 20;

    g.lineStyle(6, 0x111111, 0.5);
    for (let y = 0; y < height; y += dash + gap) { g.moveTo(startX, y + 6); g.lineTo(startX, Math.min(y + dash + 6, height)); }

    g.lineStyle(6, 0xeab308, 0.8);
    for (let y = 0; y < height; y += dash + gap) { g.moveTo(startX, y); g.lineTo(startX, Math.min(y + dash, height)); }

    g.lineStyle(2, 0xfef08a, 1);
    for (let y = 0; y < height; y += dash + gap) { g.moveTo(startX - 2, y - 2); g.lineTo(startX - 2, Math.min(y + dash - 2, height)); }
  }, [height]);

  const textStyle = new PIXI.TextStyle({ fontSize: 24, fill: '#fef08a', fontWeight: 'bold', letterSpacing: 8, dropShadow: true, dropShadowColor: '#000000', dropShadowDistance: 2, dropShadowAlpha: 0.8 });
  return (
    <React.Fragment>
      <Graphics draw={draw} />
      <Text text="$250 FEDERAL GRANT" x={2350} y={height / 2} anchor={0.5} angle={-90} style={textStyle} />
    </React.Fragment>
  );
};

export const RustBeltLine = ({ height }) => {
  const draw = useCallback((g) => {
    g.clear();
    const startX = 3730; 
    const dash = 30;
    const gap = 20;

    g.lineStyle(6, 0x111111, 0.5);
    for (let y = 0; y < height; y += dash + gap) { g.moveTo(startX, y + 6); g.lineTo(startX, Math.min(y + dash + 6, height)); }

    g.lineStyle(6, 0xea580c, 0.8);
    for (let y = 0; y < height; y += dash + gap) { g.moveTo(startX, y); g.lineTo(startX, Math.min(y + dash, height)); }

    g.lineStyle(2, 0xfdba74, 1);
    for (let y = 0; y < height; y += dash + gap) { g.moveTo(startX - 2, y - 2); g.lineTo(startX - 2, Math.min(y + dash - 2, height)); }
  }, [height]);

  const textStyle = new PIXI.TextStyle({ fontSize: 24, fill: '#fdba74', fontWeight: 'bold', letterSpacing: 16, dropShadow: true, dropShadowColor: '#000000', dropShadowDistance: 2, dropShadowAlpha: 0.8 });
  return (
    <React.Fragment>
      <Graphics draw={draw} />
      <Text text="RUST BELT" x={3700} y={height / 2} anchor={0.5} angle={-90} style={textStyle} />
    </React.Fragment>
  );
};

export const ConnectionLines = ({ connections, nodes, activeNetwork, companies, showOnlyRailheads }) => {
  const builtConnSet = new Set();
  const activeRailheads = new Set();

  if (companies) {
      Object.values(companies).forEach(c => {
          if (c.builtConnections) c.builtConnections.forEach(str => builtConnSet.add(str));
          if (c.activeLines) c.activeLines.forEach(nId => activeRailheads.add(nId));
      });
  }

  const visibleConns = (connections || []).filter(conn => {
      const fromNode = (nodes || []).find(n => n.id === conn.from);
      const toNode = (nodes || []).find(n => n.id === conn.to);
      if (!fromNode || !toNode) return false;

      const bothRevealed = fromNode.revealed && toNode.revealed;
      const bothVisited = activeNetwork.has(fromNode.id) && activeNetwork.has(toNode.id);
      const isConnectedToRailhead = (activeRailheads.has(fromNode.id) || activeRailheads.has(toNode.id)) && bothRevealed;
      const shouldDraw = showOnlyRailheads ? (isConnectedToRailhead && !bothVisited) : false;

      if (shouldDraw) {
          const connStr1 = `${fromNode.id}-${toNode.id}`;
          const connStr2 = `${toNode.id}-${fromNode.id}`;
          const isBuilt = builtConnSet.has(connStr1) || builtConnSet.has(connStr2);
          return !isBuilt;
      }
      return false;
  });

  const draw = useCallback((g) => {
    g.clear();
    visibleConns.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      const { nx, ny } = getLineMath(fromNode.x, fromNode.y, toNode.x, toNode.y);
      const renderNx = ny < 0 ? -nx : nx;
      const renderNy = ny < 0 ? -ny : ny;

      // Base shadow line
      g.lineStyle(6, 0x111111, 0.4);
      g.moveTo(fromNode.x, fromNode.y + 4);
      g.lineTo(toNode.x, toNode.y + 4);

      // Main unbuilt track rendering
      g.lineStyle(6, 0x475569, 1);
      g.moveTo(fromNode.x, fromNode.y);
      g.lineTo(toNode.x, toNode.y);

      // Track tie accents
      g.lineStyle(1.5, 0x000000, 0.4);
      g.moveTo(fromNode.x + renderNx * 1.5, fromNode.y + renderNy * 1.5);
      g.lineTo(toNode.x + renderNx * 1.5, toNode.y + renderNy * 1.5);

      g.lineStyle(1.5, 0xffffff, 0.3);
      g.moveTo(fromNode.x - renderNx * 1.5, fromNode.y - renderNy * 1.5);
      g.lineTo(toNode.x - renderNx * 1.5, toNode.y - renderNy * 1.5);
    });
  }, [visibleConns, nodes]);

  return <Graphics draw={draw} />;
};

export const BuiltLines = ({ companies, nodes, mutedCompanies }) => {
  const draw = useCallback((g) => {
    g.clear();
    if (!companies || !nodes) return;
    
    const builtMap = {};
    Object.entries(companies).forEach(([compId, compData]) => {
      if (mutedCompanies.includes(compId)) return;
      const hexColor = compData.colorStr ? parseInt(compData.colorStr.replace('#', '0x')) : 0xFFFFFF;
      if (compData.builtConnections) {
        compData.builtConnections.forEach(connString => {
          const [id1, id2] = connString.split('-');
          const normalizedStr = Math.min(id1, id2) + '-' + Math.max(id1, id2);
          if (!builtMap[normalizedStr]) builtMap[normalizedStr] = [];
          builtMap[normalizedStr].push(hexColor);
        });
      }
    });

    Object.entries(builtMap).forEach(([connString, colors]) => {
      const [fromId, toId] = connString.split('-');
      const fromNode = nodes.find(n => n.id == fromId);
      const toNode = nodes.find(n => n.id == toId);
      
      if (fromNode && toNode) {
        const { nx, ny } = getLineMath(fromNode.x, fromNode.y, toNode.x, toNode.y);
        const renderNx = ny < 0 ? -nx : nx;
        const renderNy = ny < 0 ? -ny : ny;
        const finalColor = colors.length > 1 ? 0xFFFFFF : colors[0];

        g.lineStyle(6, 0x111111, 0.6);
        g.moveTo(fromNode.x, fromNode.y + 4);
        g.lineTo(toNode.x, toNode.y + 4);
        g.lineStyle(6, finalColor, 1);
        g.moveTo(fromNode.x, fromNode.y);
        g.lineTo(toNode.x, toNode.y);
        g.lineStyle(1.5, 0x000000, 0.5);
        g.moveTo(fromNode.x + renderNx * 1.5, fromNode.y + renderNy * 1.5);
        g.lineTo(toNode.x + renderNx * 1.5, toNode.y + renderNy * 1.5);
        g.lineStyle(1.5, 0xffffff, 0.6);
        g.moveTo(fromNode.x - renderNx * 1.5, fromNode.y - renderNy * 1.5);
        g.lineTo(toNode.x - renderNx * 1.5, toNode.y - renderNy * 1.5);
      }
    });
  }, [companies, nodes, mutedCompanies]);
  return <Graphics draw={draw} />;
};

export const NodeItem = ({ node, isFrontier }) => {
  const draw = useCallback((g) => {
    g.clear();
    const isStartNode = node.type === 'start';
    if (!node.revealed && !isStartNode) {
        if (isFrontier) {
            g.beginFill(0x222222); g.lineStyle(1, 0x444444); g.drawCircle(node.x, node.y, 6); g.endFill();
        }
        return;
    }
    const customHTMLNodes = ['standard', 'fed_exchange', 'parlor', 'signal', 'supply', 'union_yard', 'merger', 'regional_hq', 'financial', 'boomtown', 'start', 'mountain'];
    const isCustom = customHTMLNodes.includes(node.subType) || (node.type === 'city' && !node.subType);
    if (isCustom) return; 

    const nodeColors = { 'start': 0xFFFFFF, 'chicago': 0xFFD700, 'supply': 0xEEEEEE, 'union_yard': 0x00FFFF, 'signal': 0x00FFFF, 'regional_hq': 0xBF40BF, 'fed_exchange': 0x4169E1, 'boomtown': 0xFF4444, 'merger': 0xFFD700, 'parlor': 0xE066FF, 'financial': 0x4DFF4D };
    const c = nodeColors[node.subType] || nodeColors[node.type] || 0x666666;
    g.beginFill(c);
    g.lineStyle(2, 0x000000); 
    g.drawCircle(node.x, node.y, 15);
    g.endFill();
  }, [node.x, node.y, node.type, node.subType, node.revealed, isFrontier]);
  
  return <Graphics draw={draw} />;
};