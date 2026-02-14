import { useMemo, useCallback } from 'react';
import type { GameObject, Screen } from '@shared/schema';

export interface UserGuide {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number;
}

export interface SnapCandidate {
  position: number;
  type: 'edge' | 'center' | 'guide';
  source: 'canvas' | 'object' | 'guide';
  objectId?: string;
  guideId?: string;
  edge?: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY';
}

export interface ActiveGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  source: 'canvas' | 'object' | 'guide';
  guideId?: string;
}

export interface SnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  activeGuides: ActiveGuide[];
}

interface ObjectBounds {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

const SNAP_TOLERANCE = 8;

export function useSnapping(
  screen: Screen | null,
  objects: GameObject[],
  draggedObjectId: string | null,
  selectedObjectIds: string[],
  getEffectiveProps: (obj: GameObject) => {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    visible: boolean;
  },
  userGuides: UserGuide[] = []
) {
  const canvasSnapCandidates = useMemo(() => {
    if (!screen) return { horizontal: [], vertical: [] };
    
    const horizontal: SnapCandidate[] = [
      { position: 0, type: 'edge', source: 'canvas', edge: 'top' },
      { position: screen.height / 2, type: 'center', source: 'canvas', edge: 'centerY' },
      { position: screen.height, type: 'edge', source: 'canvas', edge: 'bottom' },
    ];
    
    const vertical: SnapCandidate[] = [
      { position: 0, type: 'edge', source: 'canvas', edge: 'left' },
      { position: screen.width / 2, type: 'center', source: 'canvas', edge: 'centerX' },
      { position: screen.width, type: 'edge', source: 'canvas', edge: 'right' },
    ];
    
    return { horizontal, vertical };
  }, [screen]);

  const objectBounds = useMemo(() => {
    const bounds: ObjectBounds[] = [];
    const draggedIds = new Set(selectedObjectIds.length > 0 ? selectedObjectIds : [draggedObjectId].filter(Boolean));
    
    for (const obj of objects) {
      if (draggedIds.has(obj.id)) continue;
      if (obj.locked) continue;
      
      const props = getEffectiveProps(obj);
      if (!props.visible) continue;
      
      const effectiveWidth = obj.width * Math.abs(props.scaleX);
      const effectiveHeight = obj.height * Math.abs(props.scaleY);
      
      const left = props.scaleX < 0 ? props.x - effectiveWidth : props.x;
      const top = props.scaleY < 0 ? props.y - effectiveHeight : props.y;
      const right = left + effectiveWidth;
      const bottom = top + effectiveHeight;
      
      bounds.push({
        id: obj.id,
        left,
        right,
        top,
        bottom,
        centerX: left + effectiveWidth / 2,
        centerY: top + effectiveHeight / 2,
        width: effectiveWidth,
        height: effectiveHeight,
      });
    }
    
    return bounds;
  }, [objects, draggedObjectId, selectedObjectIds, getEffectiveProps]);

  const objectSnapCandidates = useMemo(() => {
    const horizontal: SnapCandidate[] = [];
    const vertical: SnapCandidate[] = [];
    
    for (const bounds of objectBounds) {
      horizontal.push(
        { position: bounds.top, type: 'edge', source: 'object', objectId: bounds.id, edge: 'top' },
        { position: bounds.centerY, type: 'center', source: 'object', objectId: bounds.id, edge: 'centerY' },
        { position: bounds.bottom, type: 'edge', source: 'object', objectId: bounds.id, edge: 'bottom' }
      );
      
      vertical.push(
        { position: bounds.left, type: 'edge', source: 'object', objectId: bounds.id, edge: 'left' },
        { position: bounds.centerX, type: 'center', source: 'object', objectId: bounds.id, edge: 'centerX' },
        { position: bounds.right, type: 'edge', source: 'object', objectId: bounds.id, edge: 'right' }
      );
    }
    
    return { horizontal, vertical };
  }, [objectBounds]);

  const guideSnapCandidates = useMemo(() => {
    const horizontal: SnapCandidate[] = [];
    const vertical: SnapCandidate[] = [];
    
    for (const guide of userGuides) {
      if (guide.orientation === 'horizontal') {
        horizontal.push({
          position: guide.position,
          type: 'guide',
          source: 'guide',
          guideId: guide.id,
        });
      } else {
        vertical.push({
          position: guide.position,
          type: 'guide',
          source: 'guide',
          guideId: guide.id,
        });
      }
    }
    
    return { horizontal, vertical };
  }, [userGuides]);

  const applySnapping = useCallback((
    targetX: number,
    targetY: number,
    objectWidth: number,
    objectHeight: number
  ): SnapResult => {
    const activeGuides: ActiveGuide[] = [];
    let snappedX = false;
    let snappedY = false;
    let finalX = targetX;
    let finalY = targetY;
    
    const objLeft = targetX;
    const objRight = targetX + objectWidth;
    const objCenterX = targetX + objectWidth / 2;
    const objTop = targetY;
    const objBottom = targetY + objectHeight;
    const objCenterY = targetY + objectHeight / 2;
    
    const allVertical = [...canvasSnapCandidates.vertical, ...objectSnapCandidates.vertical, ...guideSnapCandidates.vertical];
    const allHorizontal = [...canvasSnapCandidates.horizontal, ...objectSnapCandidates.horizontal, ...guideSnapCandidates.horizontal];
    
    let bestSnapX: { delta: number; position: number; source: 'canvas' | 'object' | 'guide'; guideId?: string } | null = null;
    for (const candidate of allVertical) {
      const edgePositions = [
        { pos: objLeft, offset: 0 },
        { pos: objCenterX, offset: objectWidth / 2 },
        { pos: objRight, offset: objectWidth },
      ];
      
      for (const { pos, offset } of edgePositions) {
        const delta = Math.abs(pos - candidate.position);
        if (delta <= SNAP_TOLERANCE) {
          if (!bestSnapX || delta < Math.abs(bestSnapX.delta)) {
            bestSnapX = { 
              delta: candidate.position - pos, 
              position: candidate.position,
              source: candidate.source,
              guideId: candidate.guideId
            };
          }
        }
      }
    }
    
    if (bestSnapX) {
      finalX = targetX + bestSnapX.delta;
      snappedX = true;
      activeGuides.push({
        type: 'vertical',
        position: bestSnapX.position,
        source: bestSnapX.source,
        guideId: bestSnapX.guideId,
      });
    }
    
    let bestSnapY: { delta: number; position: number; source: 'canvas' | 'object' | 'guide'; guideId?: string } | null = null;
    for (const candidate of allHorizontal) {
      const edgePositions = [
        { pos: objTop, offset: 0 },
        { pos: objCenterY, offset: objectHeight / 2 },
        { pos: objBottom, offset: objectHeight },
      ];
      
      for (const { pos, offset } of edgePositions) {
        const delta = Math.abs(pos - candidate.position);
        if (delta <= SNAP_TOLERANCE) {
          if (!bestSnapY || delta < Math.abs(bestSnapY.delta)) {
            bestSnapY = { 
              delta: candidate.position - pos, 
              position: candidate.position,
              source: candidate.source,
              guideId: candidate.guideId
            };
          }
        }
      }
    }
    
    if (bestSnapY) {
      finalY = targetY + bestSnapY.delta;
      snappedY = true;
      activeGuides.push({
        type: 'horizontal',
        position: bestSnapY.position,
        source: bestSnapY.source,
        guideId: bestSnapY.guideId,
      });
    }
    
    return {
      x: finalX,
      y: finalY,
      snappedX,
      snappedY,
      activeGuides,
    };
  }, [canvasSnapCandidates, objectSnapCandidates, guideSnapCandidates]);

  return {
    applySnapping,
    canvasSnapCandidates,
    objectSnapCandidates,
    guideSnapCandidates,
  };
}
