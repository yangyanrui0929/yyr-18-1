import { useState, useEffect } from 'react';
import { ScrollText, Trophy, Star, Clock, Target, Trash2, Calendar, Award, Sparkles } from 'lucide-react';
import { restorationStorage, reputationStorage, getAchievementInfo, calculateLevel } from '../utils/storage';
import type { RestorationRecord, Reputation } from '../types';

export default function Archive() {
  const [records, setRecords] = useState<RestorationRecord[]>([]);
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'stats' | 'achievements'>('records');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setRecords(restorationStorage.getAll());
    setReputation(reputationStorage.get());
  };

  const handleClearRecords = () => {
    if (confirm('确定要清除所有复原记录吗？此操作不可撤销。')) {
      restorationStorage.clear();
      loadData();
    }
  };

  const handleResetReputation = () => {
    if (confirm('确定要重置声望吗？所有成就将被清除。')) {
      reputationStorage.reset();
      loadData();
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/50';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/50';
    if (score >= 50) return 'bg-orange-500/20 border-orange-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const nextLevelThreshold = () => {
    if (!reputation) return 0;
    const thresholds = [0, 500, 1500, 3000, 5000, 8000, 12000, 17000, 23000, 30000];
    return thresholds[reputation.level] || 30000;
  };

  if (!reputation) return null;

  const progressToNext = ((reputation.totalPoints - (nextLevelThreshold() - 500)) / 500) * 100;

  return (
    <div className="min-h-screen bg-cosmic-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-bronze-200 flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-bronze-400" />
            研究档案
          </h1>
          <p className="text-gray-400 mt-2">记录你的考古历程与学术成就</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-cosmic-800/80 backdrop-blur-sm rounded-xl p-4 border border-cosmic-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-bronze-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-bronze-400" />
              </div>
              <span className="text-gray-400 text-sm">总声望</span>
            </div>
            <div className="text-3xl font-display font-bold text-bronze-200">
              {reputation.totalPoints.toLocaleString()}
            </div>
          </div>

          <div className="bg-cosmic-800/80 backdrop-blur-sm rounded-xl p-4 border border-cosmic-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rune-500/20 rounded-lg">
                <Award className="w-5 h-5 text-rune-400" />
              </div>
              <span className="text-gray-400 text-sm">当前等级</span>
            </div>
            <div className="text-2xl font-display font-bold text-rune-200">
              Lv.{reputation.level}
            </div>
            <div className="text-xs text-gray-400">{reputation.levelName}</div>
            <div className="mt-2 w-full h-1.5 bg-cosmic-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rune-500 to-bronze-500 transition-all"
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              距离下一等级: {Math.max(0, nextLevelThreshold() - reputation.totalPoints)} 声望
            </div>
          </div>

          <div className="bg-cosmic-800/80 backdrop-blur-sm rounded-xl p-4 border border-cosmic-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">复原次数</span>
            </div>
            <div className="text-3xl font-display font-bold text-blue-300">
              {reputation.totalRestorations}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              完美复原: {reputation.perfectRestorations} 次
            </div>
          </div>

          <div className="bg-cosmic-800/80 backdrop-blur-sm rounded-xl p-4 border border-cosmic-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-mystic-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-mystic-400" />
              </div>
              <span className="text-gray-400 text-sm">成就解锁</span>
            </div>
            <div className="text-3xl font-display font-bold text-mystic-300">
              {reputation.achievements.length}
              <span className="text-sm text-gray-500">/5</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-cosmic-700">
          {[
            { id: 'records', label: '复原记录', icon: ScrollText },
            { id: 'stats', label: '统计数据', icon: Target },
            { id: 'achievements', label: '成就系统', icon: Trophy },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                flex items-center gap-2 px-4 py-3 -mb-px border-b-2 transition-all
                ${activeTab === tab.id
                  ? 'border-bronze-400 text-bronze-300'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'records' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-300">复原历史</h2>
              {records.length > 0 && (
                <button
                  onClick={handleClearRecords}
                  className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  清除记录
                </button>
              )}
            </div>

            {records.length === 0 ? (
              <div className="text-center py-16 bg-cosmic-800/50 rounded-xl">
                <ScrollText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">还没有复原记录</p>
                <p className="text-sm text-gray-500 mt-1">完成一次石板复原后，记录将显示在这里</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record, index) => (
                  <div
                    key={record.id}
                    className={`
                      p-4 rounded-xl border transition-all
                      ${getScoreBg(record.accuracyScore)}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-display font-bold text-bronze-200">
                            #{records.length - index}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xl font-bold ${getScoreColor(record.accuracyScore)}`}>
                                {record.accuracyScore}%
                              </span>
                              <span className="text-sm text-gray-400">
                                完成度 {record.completionScore}%
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(record.timestamp)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(record.timeSpent)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-bronze-400" />
                                +{record.reputationEarned}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {record.accuracyScore >= 95 && (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                          🌟 完美复原
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-cosmic-800/50 rounded-xl p-6 border border-cosmic-700/50">
              <h3 className="text-lg font-medium text-gray-300 mb-4">复原表现</h3>
              {records.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">平均准确率</span>
                    <span className="text-xl font-bold text-bronze-300">
                      {Math.round(records.reduce((sum, r) => sum + r.accuracyScore, 0) / records.length)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">平均用时</span>
                    <span className="text-xl font-bold text-blue-300">
                      {formatTime(Math.round(records.reduce((sum, r) => sum + r.timeSpent, 0) / records.length))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">最高准确率</span>
                    <span className="text-xl font-bold text-green-400">
                      {Math.max(...records.map(r => r.accuracyScore))}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">最快用时</span>
                    <span className="text-xl font-bold text-rune-400">
                      {formatTime(Math.min(...records.map(r => r.timeSpent)))}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">暂无统计数据</p>
              )}
            </div>

            <div className="bg-cosmic-800/50 rounded-xl p-6 border border-cosmic-700/50">
              <h3 className="text-lg font-medium text-gray-300 mb-4">声望分布</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">复原获得</span>
                    <span className="text-bronze-300">
                      {records.reduce((sum, r) => sum + r.reputationEarned, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-cosmic-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-bronze-500"
                      style={{ width: `${Math.min(100, (reputation.totalPoints / 10000) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-cosmic-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">等级进度</h4>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => {
                    const levelData = calculateLevel(reputation.totalPoints);
                    const isUnlocked = reputation.level >= level;
                    return (
                      <div
                        key={level}
                        className={`
                          flex items-center gap-3 py-2 px-3 rounded-lg mb-1
                          ${isUnlocked ? 'bg-bronze-500/10' : 'bg-cosmic-900/50 opacity-50'}
                        `}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isUnlocked ? 'bg-bronze-500 text-white' : 'bg-cosmic-700 text-gray-500'}`}>
                          {level}
                        </div>
                        <span className={`text-sm ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                          {['学徒考古学家', '初级考古学家', '中级考古学家', '高级考古学家', '首席考古学家', '星际考古大师', '文明破译师', '历史守望者', '时空学者', '万古传承者'][level - 1]}
                        </span>
                        {isUnlocked && <Star className="w-4 h-4 text-bronze-400 ml-auto" />}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleResetReputation}
                  className="w-full mt-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  重置声望数据
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <h2 className="text-lg font-medium text-gray-300 mb-4">成就系统</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'first_restoration',
                'perfect_score',
                'speed_demon',
                'restorer_10',
                'perfectionist',
              ].map(achievementId => {
                const info = getAchievementInfo(achievementId);
                const isUnlocked = reputation.achievements.includes(achievementId);

                return (
                  <div
                    key={achievementId}
                    className={`
                      p-4 rounded-xl border transition-all
                      ${isUnlocked
                        ? 'bg-bronze-500/10 border-bronze-500/50'
                        : 'bg-cosmic-800/30 border-cosmic-700/50 opacity-60'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-4xl ${!isUnlocked && 'grayscale'}`}>
                        {info.icon}
                      </span>
                      <div className="flex-1">
                        <h4 className={`font-display font-semibold ${isUnlocked ? 'text-bronze-200' : 'text-gray-400'}`}>
                          {info.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {info.description}
                        </p>
                        {isUnlocked && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-rune-500/20 text-rune-400 text-xs rounded-full">
                            ✓ 已解锁
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
