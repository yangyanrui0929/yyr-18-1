import { useEffect, useMemo, useState } from 'react';
import { Send, Sparkles, Star, Zap, Info } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import FragmentLibrary from '../components/FragmentLibrary';
import PuzzleBoard from '../components/PuzzleBoard';
import SymbolPanel from '../components/SymbolPanel';
import Timeline from '../components/Timeline';
import SchoolPanel from '../components/SchoolPanel';
import VerificationModal from '../components/VerificationModal';

export default function Home() {
  const {
    fragments,
    symbols,
    eras,
    currentEraOrder,
    startTime,
    startVerification,
    getCompletionPercentage,
    showVerification,
  } = useGameStore();

  const [showHint, setShowHint] = useState(true);

  const completion = getCompletionPercentage();

  const canSubmit = useMemo(() => {
    const placedCount = fragments.filter(f => f.isPlaced).length;
    const indexedCount = symbols.filter(s => s.isIndexed).length;
    const eraComplete = currentEraOrder.length === eras.length;
    return placedCount === fragments.length && indexedCount >= symbols.length * 0.5 && eraComplete;
  }, [fragments, symbols, currentEraOrder, eras]);

  const handleSubmit = () => {
    if (canSubmit) {
      startVerification();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-cosmic-950 text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-star-field" />
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showHint && (
          <div className="mb-6 p-4 bg-bronze-500/10 border border-bronze-500/30 rounded-xl flex items-start gap-3 animate-float">
            <Info className="w-5 h-5 text-bronze-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-bronze-200">
                👋 欢迎来到星际考古拼谱！你需要：
              </p>
              <ol className="text-xs text-gray-400 mt-2 space-y-1">
                <li>1. 从左侧碎片库拖拽石板到中央工作台，旋转匹配边缘纹路</li>
                <li>2. 在右侧符号面板中，为符号建立索引并关联到对应的碎片</li>
                <li>3. 在底部年代线中，按时间顺序排列各个历史年代</li>
                <li>4. 完成后点击右下角"提交复原"按钮，验证你的研究成果</li>
              </ol>
            </div>
            <button
              onClick={() => setShowHint(false)}
              className="text-gray-500 hover:text-gray-300 text-sm"
            >
              知道了
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <FragmentLibrary />
            <SymbolPanel />
          </div>

          <div className="lg:col-span-6 flex flex-col items-center">
            <PuzzleBoard />

            <div className="w-full mt-6">
              <Timeline />
            </div>

            <div className="w-full mt-6">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`
                  w-full py-4 px-6 rounded-xl font-display font-semibold text-lg
                  flex items-center justify-center gap-3 transition-all
                  ${canSubmit
                    ? 'bg-gradient-to-r from-bronze-500 via-bronze-400 to-bronze-500 text-cosmic-950 hover:shadow-lg hover:shadow-bronze-500/30 animate-glow'
                    : 'bg-cosmic-800 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <Send className="w-5 h-5" />
                提交复原方案
                {canSubmit && <Sparkles className="w-5 h-5 animate-pulse" />}
              </button>

              {!canSubmit && (
                <div className="mt-3 p-3 bg-cosmic-800/50 rounded-lg">
                  <p className="text-xs text-gray-400 text-center">
                    完成以下条件才能提交：
                  </p>
                  <div className="flex justify-center gap-4 mt-2 text-xs">
                    <span className={fragments.filter(f => f.isPlaced).length === fragments.length ? 'text-rune-400' : 'text-gray-500'}>
                      {fragments.filter(f => f.isPlaced).length === fragments.length ? '✓' : '○'} 放置所有碎片
                    </span>
                    <span className={symbols.filter(s => s.isIndexed).length >= symbols.length * 0.5 ? 'text-rune-400' : 'text-gray-500'}>
                      {symbols.filter(s => s.isIndexed).length >= symbols.length * 0.5 ? '✓' : '○'} 索引至少一半符号
                    </span>
                    <span className={currentEraOrder.length === eras.length ? 'text-rune-400' : 'text-gray-500'}>
                      {currentEraOrder.length === eras.length ? '✓' : '○'} 排列所有年代
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-cosmic-800/80 backdrop-blur-sm rounded-xl border border-cosmic-600/50 p-4">
              <h3 className="font-display font-semibold text-bronze-200 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-bronze-400" />
                复原进度
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">碎片放置</span>
                    <span className="text-white">
                      {fragments.filter(f => f.isPlaced).length} / {fragments.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-cosmic-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                      style={{ width: `${(fragments.filter(f => f.isPlaced).length / fragments.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">符号索引</span>
                    <span className="text-white">
                      {symbols.filter(s => s.isIndexed).length} / {symbols.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-cosmic-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rune-500 to-rune-400 transition-all duration-500"
                      style={{ width: `${(symbols.filter(s => s.isIndexed).length / symbols.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">年代排序</span>
                    <span className="text-white">
                      {currentEraOrder.length} / {eras.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-cosmic-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-mystic-500 to-mystic-400 transition-all duration-500"
                      style={{ width: `${(currentEraOrder.length / eras.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-cosmic-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">总完成度</span>
                  <span className="text-2xl font-display font-bold text-bronze-300">
                    {completion}%
                  </span>
                </div>
                <div className="w-full h-3 bg-cosmic-700 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-bronze-500 via-bronze-400 to-rune-500 transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-cosmic-800/80 backdrop-blur-sm rounded-xl border border-cosmic-600/50 p-4">
              <h3 className="font-display font-semibold text-bronze-200 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-bronze-400" />
                操作提示
              </h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-bronze-400">•</span>
                  点击碎片库中的碎片选中，再点击工作台放置
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-bronze-400">•</span>
                  点击已放置的碎片显示旋转和移除按钮
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-bronze-400">•</span>
                  不同颜色的边框代表不同的边缘纹路类型
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-bronze-400">•</span>
                  匹配的边缘颜色应该相同才能正确拼接
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-bronze-400">•</span>
                  选中碎片后点击符号可以建立关联
                </li>
              </ul>
            </div>

            <SchoolPanel />
          </div>
        </div>
      </div>

      {showVerification && <VerificationModal />}
    </div>
  );
}
