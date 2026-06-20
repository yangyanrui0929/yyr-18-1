import { useState } from 'react';
import { Users, ChevronDown, ThumbsUp, MessageSquare, Award } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export default function SchoolPanel() {
  const { schools, controversies, fragments, selectedFragmentId } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const selectedFragment = fragments.find(f => f.id === selectedFragmentId);
  
  const relevantControversies = selectedFragment
    ? controversies.filter(c => c.tabletId === selectedFragmentId)
    : controversies;

  const getSchoolName = (schoolId: string) => {
    return schools.find(s => s.id === schoolId)?.name || '未知学派';
  };

  const getSchoolColor = (schoolId: string) => {
    return schools.find(s => s.id === schoolId)?.color || '#666';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="bg-cosmic-800/80 backdrop-blur-sm rounded-xl border border-cosmic-600/50 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-cosmic-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bronze-500/20 rounded-lg">
            <Users className="w-5 h-5 text-bronze-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-bronze-200">学派观点</h3>
            <p className="text-xs text-gray-400">
              {selectedFragment 
                ? `「${selectedFragment.name}」相关争议 ${relevantControversies.length} 条`
                : `共 ${controversies.length} 条学术争议`
              }
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-400">主要学派</h4>
            <div className="space-y-2">
              {schools.map(school => (
                <div
                  key={school.id}
                  onClick={() => setSelectedSchoolId(selectedSchoolId === school.id ? null : school.id)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all
                    ${selectedSchoolId === school.id
                      ? 'bg-cosmic-700/50 border border-opacity-50'
                      : 'bg-cosmic-900/30 border border-transparent hover:border-cosmic-600'
                    }
                  `}
                  style={{ borderColor: selectedSchoolId === school.id ? school.color : undefined }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: school.color }}
                    />
                    <div className="flex-1">
                      <h5 className="font-display font-medium text-white text-sm">
                        {school.name}
                      </h5>
                      <p className="text-xs text-gray-400">创始人: {school.founder}</p>
                    </div>
                    <Award className="w-4 h-4 text-bronze-400" />
                  </div>

                  {selectedSchoolId === school.id && (
                    <p className="mt-3 pt-3 border-t border-cosmic-700 text-sm text-gray-300 italic">
                      "{school.philosophy}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-400 flex items-center gap-2">
              <MessageSquare className="w-3 h-3" />
              学术争议
              {selectedFragment && (
                <span className="text-bronze-400">关于「{selectedFragment.name}」</span>
              )}
            </h4>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {relevantControversies.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无相关争议记录</p>
                </div>
              ) : (
                relevantControversies.map(controversy => {
                  const tablet = fragments.find(f => f.id === controversy.tabletId);
                  
                  return (
                    <div
                      key={controversy.id}
                      className="p-3 bg-cosmic-900/30 rounded-lg border-l-4"
                      style={{ borderLeftColor: getSchoolColor(controversy.schoolId) }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded"
                            style={{ 
                              backgroundColor: `${getSchoolColor(controversy.schoolId)}20`,
                              color: getSchoolColor(controversy.schoolId),
                            }}
                          >
                            {getSchoolName(controversy.schoolId)}
                          </span>
                          {tablet && (
                            <span className="text-xs text-gray-500">
                              关于「{tablet.name}」
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <ThumbsUp className="w-3 h-3" />
                          <span className="text-xs">{formatNumber(controversy.supportCount)}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-200 mb-2">
                        {controversy.viewpoint}
                      </p>

                      <p className="text-xs text-gray-500 italic">
                        📜 证据: {controversy.evidence}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {!selectedFragment && (
            <div className="p-2 bg-cosmic-700/30 border border-cosmic-600/50 rounded-lg">
              <p className="text-xs text-gray-400 text-center">
                💡 选择一块碎片查看相关学术争议
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
