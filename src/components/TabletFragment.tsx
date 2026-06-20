import { useCallback, useEffect, useRef } from 'react';
import { RotateCcw, X, CheckCircle2, XCircle } from 'lucide-react';
import type { TabletFragment as TabletFragmentType } from '../types';
import { getRarityColor, getRarityBg } from '../utils/verification';
import { useGameStore } from '../store/useGameStore';

interface Props {
  fragment: TabletFragmentType;
  isInLibrary?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

const textureGradients: Record<string, string> = {
  basalt: 'from-gray-700 via-gray-800 to-gray-900',
  marble: 'from-gray-300 via-gray-100 to-gray-400',
  quartz: 'from-purple-300 via-pink-200 to-purple-400',
  jade: 'from-emerald-400 via-green-300 to-emerald-500',
  obsidian: 'from-gray-900 via-slate-800 to-gray-900',
  granite: 'from-gray-500 via-gray-600 to-gray-700',
};

const edgePatternStyles: Record<string, { borderColor: string; borderStyle: string }> = {
  'wave-a': { borderColor: '#6366f1', borderStyle: 'double' },
  'wave-b': { borderColor: '#8b5cf6', borderStyle: 'double' },
  'wave-c': { borderColor: '#a855f7', borderStyle: 'double' },
  'zigzag-a': { borderColor: '#10b981', borderStyle: 'dashed' },
  'zigzag-b': { borderColor: '#34d399', borderStyle: 'dashed' },
  'zigzag-c': { borderColor: '#6ee7b7', borderStyle: 'dashed' },
  'dot-a': { borderColor: '#f59e0b', borderStyle: 'dotted' },
  'dot-b': { borderColor: '#fbbf24', borderStyle: 'dotted' },
  'dot-c': { borderColor: '#fcd34d', borderStyle: 'dotted' },
  'line-a': { borderColor: '#ef4444', borderStyle: 'solid' },
  'line-b': { borderColor: '#f87171', borderStyle: 'solid' },
  'line-c': { borderColor: '#fca5a5', borderStyle: 'solid' },
  'spiral-a': { borderColor: '#06b6d4', borderStyle: 'groove' },
  'spiral-b': { borderColor: '#22d3ee', borderStyle: 'groove' },
  'star-a': { borderColor: '#ec4899', borderStyle: 'ridge' },
  'star-b': { borderColor: '#f472b6', borderStyle: 'ridge' },
};

export default function TabletFragment({ fragment, isInLibrary, onDragStart, onDragEnd }: Props) {
  const {
    selectedFragmentId,
    selectFragment,
    rotateFragment,
    removeFragment,
    isVerificationMode,
    symbols,
  } = useGameStore();

  const isSelected = selectedFragmentId === fragment.id;
  const rotation = fragment.currentRotation || 0;
  const gradient = textureGradients[fragment.texture] || 'from-gray-600 to-gray-800';

  const handleRotate = useCallback(() => {
    const newRotation = ((rotation + 90) % 360);
    rotateFragment(fragment.id, newRotation);
  }, [fragment.id, rotation, rotateFragment]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInLibrary) {
      selectFragment(fragment.id);
    } else {
      selectFragment(isSelected ? null : fragment.id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFragment(fragment.id);
  };

  const fragmentSymbols = symbols.filter(s => fragment.symbolIds.includes(s.id));

  const getBorderColors = () => {
    const { top, right, bottom, left } = fragment.edgePatterns;
    return {
      top: edgePatternStyles[top]?.borderColor || '#666',
      right: edgePatternStyles[right]?.borderColor || '#666',
      bottom: edgePatternStyles[bottom]?.borderColor || '#666',
      left: edgePatternStyles[left]?.borderColor || '#666',
    };
  };

  const borderColors = getBorderColors();

  return (
    <div
      className={`
        relative cursor-pointer transition-all duration-300 select-none
        ${isInLibrary ? 'w-full' : 'absolute w-24 h-24'}
        ${isSelected ? 'z-20 scale-105' : 'z-10'}
        ${!isInLibrary && fragment.isCorrectlyPlaced === true ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-cosmic-900' : ''}
        ${!isInLibrary && fragment.isCorrectlyPlaced === false ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-cosmic-900' : ''}
      `}
      style={{
        transform: !isInLibrary ? `translate(${fragment.currentPosition!.x * 100}px, ${fragment.currentPosition!.y * 100}px) rotate(${rotation}deg)` : `rotate(${rotation}deg)`,
      }}
      draggable={isInLibrary || isSelected}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
    >
      <div
        className={`
          w-full h-full rounded-lg bg-gradient-to-br ${gradient}
          ${getRarityBg(fragment.rarity)}
          ${getRarityColor(fragment.rarity)}
          border-2 ${isSelected ? 'animate-glow border-bronze-400' : 'border-gray-600'}
          shadow-lg hover:shadow-xl transition-shadow
          flex flex-col items-center justify-center p-2
        `}
        style={{
          borderTopColor: borderColors.top,
          borderRightColor: borderColors.right,
          borderBottomColor: borderColors.bottom,
          borderLeftColor: borderColors.left,
          borderTopWidth: '3px',
          borderRightWidth: '3px',
          borderBottomWidth: '3px',
          borderLeftWidth: '3px',
        }}
      >
        <div className="text-xs font-display font-semibold text-center text-white/90 leading-tight mb-1"
          style={{ transform: `rotate(${-rotation}deg)` }}
        >
          {fragment.name}
        </div>

        <div className="flex gap-1" style={{ transform: `rotate(${-rotation}deg)` }}>
          {fragmentSymbols.slice(0, 2).map(symbol => (
            <span key={symbol.id} className="text-lg" title={symbol.name}>
              {symbol.icon}
            </span>
          ))}
        </div>

        {fragment.rarity === 'legendary' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        )}

        {isVerificationMode && fragment.isPlaced && (
          <div className="absolute -top-2 -left-2" style={{ transform: `rotate(${-rotation}deg)` }}>
            {fragment.isCorrectlyPlaced ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
        )}
      </div>

      {isSelected && !isInLibrary && (
        <div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-30"
          style={{ transform: `translateX(-50%) rotate(${-rotation}deg)` }}
        >
          <button
            onClick={handleRotate}
            className="p-2 bg-cosmic-700 hover:bg-cosmic-600 rounded-full text-bronze-300 hover:text-bronze-100 transition-colors shadow-lg"
            title="旋转90°"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRemove}
            className="p-2 bg-cosmic-700 hover:bg-red-600 rounded-full text-gray-300 hover:text-white transition-colors shadow-lg"
            title="移除碎片"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
