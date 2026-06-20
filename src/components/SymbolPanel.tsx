import { useState } from 'react';
import { BookOpen, Search, ChevronDown, Link, Check, Star } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { getCategoryColor, getCategoryLabel } from '../utils/verification';
import type { SymbolCategory } from '../types';

const categories: { value: SymbolCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: '全部', icon: '📚' },
  { value: 'astronomy', label: '天文学', icon: '🔭' },
  { value: 'ritual', label: '仪式', icon: '⛩️' },
  { value: 'technology', label: '科技', icon: '⚙️' },
  { value: 'biology', label: '生物', icon: '🧬' },
  { value: 'unknown', label: '未知', icon: '❓' },
];

export default function SymbolPanel() {
  const {
    getFilteredSymbols,
    symbolFilter,
    setSymbolFilter,
    selectSymbol,
    selectedSymbolId,
    indexSymbol,
    associateSymbol,
    getSelectedFragment,
    fragments,
  } = useGameStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const symbols = getFilteredSymbols();
  const selectedFragment = getSelectedFragment();

  const filteredSymbols = symbols.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexedCount = symbols.filter(s => s.isIndexed).length;

  const handleSymbolClick = (symbolId: string) => {
    if (selectedSymbolId === symbolId) {
      selectSymbol(null);
    } else {
      selectSymbol(symbolId);
    }
  };

  const handleIndexSymbol = (e: React.MouseEvent, symbolId: string) => {
    e.stopPropagation();
    indexSymbol(symbolId);
    
    if (selectedFragment) {
      associateSymbol(symbolId, selectedFragment.id);
    }
  };

  const handleAssociateWithSelected = (e: React.MouseEvent, symbolId: string) => {
    e.stopPropagation();
    if (selectedFragment) {
      associateSymbol(symbolId, selectedFragment.id);
      indexSymbol(symbolId);
    }
  };

  const getAssociatedFragmentName = (symbolId: string) => {
    const symbol = symbols.find(s => s.id === symbolId);
    if (!symbol?.associatedFragmentId) return null;
    return fragments.find(f => f.id === symbol.associatedFragmentId)?.name;
  };

  return (
    <div className="bg-cosmic-800/80 backdrop-blur-sm rounded-xl border border-cosmic-600/50 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-cosmic-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rune-500/20 rounded-lg">
            <BookOpen className="w-5 h-5 text-rune-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-rune-200">符号索引库</h3>
            <p className="text-xs text-gray-400">
              已索引 {indexedCount} / {symbols.length} 个符号
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索符号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-cosmic-900/50 border border-cosmic-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-rune-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={(e) => {
                  e.stopPropagation();
                  setSymbolFilter(cat.value);
                }}
                className={`
                  px-2 py-1 text-xs rounded-full flex items-center gap-1 transition-all
                  ${symbolFilter === cat.value
                    ? `${getCategoryColor(cat.value)} text-white`
                    : 'bg-cosmic-700/50 text-gray-400 hover:text-gray-300'
                  }
                `}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {filteredSymbols.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">未找到匹配的符号</p>
              </div>
            ) : (
              filteredSymbols.map(symbol => {
                const isSelected = selectedSymbolId === symbol.id;
                const associatedName = getAssociatedFragmentName(symbol.id);

                return (
                  <div
                    key={symbol.id}
                    onClick={() => handleSymbolClick(symbol.id)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all
                      ${isSelected ? 'bg-rune-900/40 border border-rune-500/50' : 'bg-cosmic-900/30 border border-transparent hover:border-cosmic-600'}
                      ${symbol.isIndexed ? 'opacity-70' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{symbol.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-medium text-white text-sm truncate">
                            {symbol.name}
                          </h4>
                          <span className={`px-1.5 py-0.5 text-xs rounded ${getCategoryColor(symbol.category)} text-white`}>
                            {getCategoryLabel(symbol.category)}
                          </span>
                          {symbol.isIndexed && (
                            <Check className="w-4 h-4 text-rune-400" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {symbol.meaning}
                        </p>
                        {associatedName && (
                          <p className="text-xs text-bronze-400 mt-1 flex items-center gap-1">
                            <Link className="w-3 h-3" />
                            关联: {associatedName}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-gray-500">重要度: {symbol.significance}%</span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-cosmic-700 flex gap-2">
                        <button
                          onClick={(e) => handleIndexSymbol(e, symbol.id)}
                          disabled={symbol.isIndexed}
                          className={`
                            flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors
                            ${symbol.isIndexed
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-rune-600 hover:bg-rune-500 text-white'
                            }
                          `}
                        >
                          {symbol.isIndexed ? '已索引' : '建立索引'}
                        </button>
                        {selectedFragment && (
                          <button
                            onClick={(e) => handleAssociateWithSelected(e, symbol.id)}
                            className="py-2 px-3 bg-bronze-600 hover:bg-bronze-500 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            <Link className="w-4 h-4 inline mr-1" />
                            关联选中碎片
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {selectedFragment && (
            <div className="p-2 bg-bronze-500/10 border border-bronze-500/30 rounded-lg">
              <p className="text-xs text-bronze-300 text-center">
                💡 已选中碎片「{selectedFragment.name}」，点击符号可建立关联
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
