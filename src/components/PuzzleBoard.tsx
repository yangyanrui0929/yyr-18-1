import { useCallback } from 'react';
import { Grid3X3, Move } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import TabletFragment from './TabletFragment';
import type { Position } from '../types';

const GRID_SIZE = 3;
const CELL_SIZE = 100;

export default function PuzzleBoard() {
  const {
    fragments,
    selectedFragmentId,
    placeFragment,
    getSelectedFragment,
    selectFragment,
    isVerificationMode,
  } = useGameStore();

  const placedFragments = fragments.filter(f => f.isPlaced && f.currentPosition);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const getGridPosition = (e: React.DragEvent | React.MouseEvent): Position | null => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);

    if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
      return { x: gridX, y: gridY };
    }
    return null;
  };

  const isPositionOccupied = (pos: Position, excludeId?: string): boolean => {
    return placedFragments.some(
      f => f.currentPosition!.x === pos.x && f.currentPosition!.y === pos.y && f.id !== excludeId
    );
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const fragmentId = e.dataTransfer.getData('fragmentId');
    const position = getGridPosition(e);

    if (fragmentId && position && !isPositionOccupied(position, fragmentId)) {
      const fragment = fragments.find(f => f.id === fragmentId);
      placeFragment(fragmentId, position, fragment?.currentRotation || 0);
    }
    selectFragment(null);
  }, [fragments, placeFragment, selectFragment]);

  const handleBoardClick = useCallback((e: React.MouseEvent) => {
    if (isVerificationMode) return;
    
    const target = e.target as HTMLElement;
    if (target.closest('[data-fragment]')) return;

    const position = getGridPosition(e);
    const selectedFragment = getSelectedFragment();

    if (selectedFragment && position && !selectedFragment.isPlaced && !isPositionOccupied(position)) {
      placeFragment(selectedFragment.id, position, selectedFragment.currentRotation || 0);
      selectFragment(null);
    } else if (selectedFragment && position && !isPositionOccupied(position, selectedFragment.id)) {
      placeFragment(selectedFragment.id, position, selectedFragment.currentRotation || 0);
    } else {
      selectFragment(null);
    }
  }, [getSelectedFragment, placeFragment, selectFragment, isVerificationMode]);

  const handleDragStart = (e: React.DragEvent, fragmentId: string) => {
    if (isVerificationMode) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('fragmentId', fragmentId);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4">
        <Grid3X3 className="w-5 h-5 text-bronze-400" />
        <h2 className="font-display text-xl font-semibold text-bronze-200">复原工作台</h2>
        <span className="text-xs text-gray-400 ml-auto">
          {placedFragments.length} / {fragments.length} 块已放置
        </span>
      </div>

      <div className="relative p-4 bg-cosmic-900/50 rounded-xl border border-cosmic-700/50 backdrop-blur-sm">
        <div
          className="relative bg-cosmic-950 rounded-lg overflow-hidden"
          style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBoardClick}
        >
          <div className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const occupied = isPositionOccupied({ x, y });
              
              return (
                <div
                  key={i}
                  className={`
                    border border-cosmic-800/50
                    ${occupied ? '' : 'hover:bg-cosmic-800/30'}
                    transition-colors
                  `}
                />
              );
            })}
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {placedFragments.map(fragment => (
              <div key={fragment.id} data-fragment="true" className="pointer-events-auto">
                <TabletFragment
                  fragment={fragment}
                  onDragStart={(e) => handleDragStart(e, fragment.id)}
                />
              </div>
            ))}
          </div>

          {selectedFragmentId && !getSelectedFragment()?.isPlaced && (
            <div className="absolute inset-0 flex items-center justify-center bg-bronze-500/10 pointer-events-none">
              <div className="flex items-center gap-2 text-bronze-300 text-sm">
                <Move className="w-4 h-4 animate-bounce" />
                <span>点击网格放置选中的碎片</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span>💡 从左侧碎片库拖拽或点击选择后放置</span>
          <span>🔄 点击已放置碎片可旋转</span>
        </div>
      </div>
    </div>
  );
}
