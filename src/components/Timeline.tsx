import { useState } from 'react';
import { Clock, GripVertical, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export default function Timeline() {
  const { eras, currentEraOrder, setEraOrder, isVerificationMode } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [draggedEraId, setDraggedEraId] = useState<string | null>(null);

  const allErasPlaced = currentEraOrder.length === eras.length;

  const sortedEras = [...eras].sort((a, b) => a.order - b.order);
  const correctOrder = sortedEras.map(e => e.id);

  const unplacedEras = eras.filter(e => !currentEraOrder.includes(e.id));

  const handleDragStart = (e: React.DragEvent, eraId: string) => {
    if (isVerificationMode) return;
    setDraggedEraId(eraId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    if (!draggedEraId || isVerificationMode) return;

    const fromPlaced = currentEraOrder.includes(draggedEraId);
    let newOrder = [...currentEraOrder];

    if (fromPlaced) {
      const fromIndex = newOrder.indexOf(draggedEraId);
      newOrder.splice(fromIndex, 1);
      
      if (targetIndex !== undefined) {
        const adjustedIndex = targetIndex > fromIndex ? targetIndex - 1 : targetIndex;
        newOrder.splice(adjustedIndex, 0, draggedEraId);
      } else {
        newOrder.push(draggedEraId);
      }
    } else {
      if (targetIndex !== undefined) {
        newOrder.splice(targetIndex, 0, draggedEraId);
      } else {
        newOrder.push(draggedEraId);
      }
    }

    setEraOrder(newOrder);
    setDraggedEraId(null);
  };

  const handleRemoveEra = (eraId: string) => {
    if (isVerificationMode) return;
    setEraOrder(currentEraOrder.filter(id => id !== eraId));
  };

  const isCorrectPosition = (eraId: string, index: number): boolean => {
    return correctOrder[index] === eraId;
  };

  const formatYear = (year: number): string => {
    if (year < 0) {
      return `${Math.abs(year).toLocaleString()} 年前`;
    }
    return `${year.toLocaleString()} 年后`;
  };

  return (
    <div className="bg-cosmic-800/80 backdrop-blur-sm rounded-xl border border-cosmic-600/50 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-cosmic-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mystic-500/20 rounded-lg">
            <Clock className="w-5 h-5 text-mystic-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-mystic-200">文明年代线</h3>
            <p className="text-xs text-gray-400">
              {currentEraOrder.length} / {eras.length} 个年代已排列
              {allErasPlaced && <span className="text-rune-400 ml-2">✓ 排列完成</span>}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          <div className="text-xs text-gray-400">
            拖拽年代卡片到下方时间轴，按时间顺序从左到右排列
          </div>

          {unplacedEras.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-400">待排列年代</h4>
              <div className="flex flex-wrap gap-2">
                {unplacedEras.map(era => (
                  <div
                    key={era.id}
                    draggable={!isVerificationMode}
                    onDragStart={(e) => handleDragStart(e, era.id)}
                    className={`
                      px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all
                      border border-dashed hover:border-solid
                    `}
                    style={{ 
                      borderColor: era.color,
                      backgroundColor: `${era.color}10`,
                      opacity: draggedEraId === era.id ? 0.5 : 1,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium" style={{ color: era.color }}>
                        {era.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-400">时间轴</h4>
            <div
              className={`
                relative min-h-20 p-4 bg-cosmic-950/50 rounded-lg border-2 border-dashed
                ${allErasPlaced ? 'border-rune-500/50' : 'border-cosmic-700'}
                transition-colors
              `}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e)}
            >
              <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-cosmic-700">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-mystic-400" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-mystic-400" />
              </div>

              <div className="relative flex items-center gap-4 min-h-12">
                {currentEraOrder.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                    将年代卡片拖拽到这里
                  </div>
                ) : (
                  currentEraOrder.map((eraId, index) => {
                    const era = eras.find(e => e.id === eraId)!;
                    const correct = isVerificationMode ? isCorrectPosition(eraId, index) : null;

                    return (
                      <div
                        key={eraId}
                        className="relative group"
                        draggable={!isVerificationMode}
                        onDragStart={(e) => handleDragStart(e, eraId)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleDrop(e, index);
                        }}
                      >
                        <div
                          className={`
                            px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all
                            border-2 relative z-10
                            ${correct === true ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-cosmic-900' : ''}
                            ${correct === false ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-cosmic-900' : ''}
                          `}
                          style={{ 
                            borderColor: era.color,
                            backgroundColor: `${era.color}20`,
                            opacity: draggedEraId === eraId ? 0.5 : 1,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {!isVerificationMode && (
                              <GripVertical className="w-4 h-4 text-gray-500" />
                            )}
                            <div>
                              <div className="text-sm font-medium" style={{ color: era.color }}>
                                {era.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatYear(era.yearStart)} - {formatYear(era.yearEnd)}
                              </div>
                            </div>
                            {correct !== null && (
                              <div className="ml-2">
                                {correct ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-red-400" />
                                )}
                              </div>
                            )}
                          </div>

                          {!isVerificationMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveEra(eraId);
                              }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <span className="text-white text-xs">×</span>
                            </button>
                          )}
                        </div>

                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-0.5 h-4 bg-cosmic-600" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {allErasPlaced && !isVerificationMode && (
            <div className="p-2 bg-rune-500/10 border border-rune-500/30 rounded-lg">
              <p className="text-xs text-rune-300 text-center">
                ✓ 所有年代已排列完成，可以提交复原
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
