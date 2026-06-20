import { useState } from 'react';
import { Package, Filter, ChevronDown } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import TabletFragment from './TabletFragment';
import { getRarityBg, getRarityColor } from '../utils/verification';
import type { Rarity } from '../types';

export default function FragmentLibrary() {
  const { getUnplacedFragments, selectFragment } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all');

  const unplacedFragments = getUnplacedFragments();
  
  const filteredFragments = rarityFilter === 'all'
    ? unplacedFragments
    : unplacedFragments.filter(f => f.rarity === rarityFilter);

  const handleDragStart = (e: React.DragEvent, fragmentId: string) => {
    e.dataTransfer.setData('fragmentId', fragmentId);
    e.dataTransfer.effectAllowed = 'move';
    selectFragment(fragmentId);
  };

  const handleDragEnd = () => {
    selectFragment(null);
  };

  const rarityOptions: { value: Rarity | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'common', label: '普通' },
    { value: 'rare', label: '稀有' },
    { value: 'legendary', label: '传说' },
  ];

  return (
    <div className="bg-cosmic-800/80 backdrop-blur-sm rounded-xl border border-cosmic-600/50 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-cosmic-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bronze-500/20 rounded-lg">
            <Package className="w-5 h-5 text-bronze-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-bronze-200">石板碎片库</h3>
            <p className="text-xs text-gray-400">
              剩余 {unplacedFragments.length} 块碎片
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {isExpanded && (
        <div className="p-4 pt-0">
          <div className="flex gap-2 mb-4">
            {rarityOptions.map(option => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  setRarityFilter(option.value);
                }}
                className={`
                  px-3 py-1 text-xs rounded-full transition-all
                  ${rarityFilter === option.value
                    ? `${getRarityBg(option.value)} ${getRarityColor(option.value)} border border-current`
                    : 'bg-cosmic-700/50 text-gray-400 hover:text-gray-300'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
            {filteredFragments.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">所有碎片已放置</p>
              </div>
            ) : (
              filteredFragments.map(fragment => (
                <div
                  key={fragment.id}
                  className={`
                    h-24 rounded-lg overflow-hidden transition-all
                    ${getRarityBg(fragment.rarity)}
                    hover:scale-105 hover:shadow-lg
                  `}
                >
                  <TabletFragment
                    fragment={fragment}
                    isInLibrary
                    onDragStart={(e) => handleDragStart(e, fragment.id)}
                    onDragEnd={handleDragEnd}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
