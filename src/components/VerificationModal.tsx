import { useEffect, useState } from 'react';
import { X, Trophy, Star, Clock, Target, BookOpen, Award, Sparkles, RotateCcw, Send } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { verifyRestoration } from '../utils/verification';
import type { VerificationResult, RestorationRecord } from '../types';
import { getAchievementInfo, checkAchievements } from '../utils/storage';
import { reputationStorage } from '../utils/storage';

export default function VerificationModal() {
  const {
    fragments,
    symbols,
    eras,
    currentEraOrder,
    startTime,
    showVerification,
    closeVerification,
    submitRestoration,
  } = useGameStore();

  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  useEffect(() => {
    if (showVerification) {
      const verificationResult = verifyRestoration(
        fragments,
        symbols,
        eras,
        currentEraOrder,
        startTime
      );
      setResult(verificationResult);

      const currentRep = reputationStorage.get();
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const mockRecord: RestorationRecord = {
        id: 'temp',
        timestamp: Date.now(),
        completionScore: verificationResult.completionScore,
        accuracyScore: verificationResult.accuracyScore,
        placedFragments: fragments.filter(f => f.isPlaced).map(f => f.id),
        symbolAssociations: {},
        eraOrdering: currentEraOrder,
        reputationEarned: verificationResult.reputationEarned,
        timeSpent,
      };

      const achievements = checkAchievements(mockRecord, currentRep);
      setNewAchievements(achievements);

      if (verificationResult.accuracyScore >= 80) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  }, [showVerification, fragments, symbols, eras, currentEraOrder, startTime]);

  if (!showVerification || !result) return null;

  const timeSpent = Math.round((Date.now() - startTime) / 1000);
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    const symbolAssociations: Record<string, string> = {};
    symbols.forEach(s => {
      if (s.associatedFragmentId) {
        symbolAssociations[s.id] = s.associatedFragmentId;
      }
    });

    const record: RestorationRecord = {
      id: `rest-${Date.now()}`,
      timestamp: Date.now(),
      completionScore: result.completionScore,
      accuracyScore: result.accuracyScore,
      placedFragments: fragments.filter(f => f.isPlaced).map(f => f.id),
      symbolAssociations,
      eraOrdering: currentEraOrder,
      reputationEarned: result.reputationEarned,
      timeSpent,
    };

    setTimeout(() => {
      submitRestoration(record);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleReset = () => {
    closeVerification();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    if (score >= 50) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${Math.random() * 20 + 16}px`,
              }}
            >
              {['✨', '🌟', '⭐', '💫', '🏆'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="relative w-full max-w-2xl bg-cosmic-900 border border-cosmic-600 rounded-2xl shadow-2xl overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${getScoreBg(result.accuracyScore)}`} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-bronze-200 flex items-center gap-2">
                <Trophy className="w-7 h-7 text-bronze-400" />
                复原验证报告
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                考古委员会已审阅你的复原方案
              </p>
            </div>
            <button
              onClick={closeVerification}
              className="p-2 hover:bg-cosmic-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-xl bg-gradient-to-br ${getScoreBg(result.accuracyScore)} bg-opacity-20 text-center`}>
              <div className={`text-5xl font-display font-bold ${getScoreColor(result.accuracyScore)}`}>
                {result.accuracyScore}
                <span className="text-2xl">%</span>
              </div>
              <div className="text-sm text-gray-300 mt-1">准确率</div>
            </div>

            <div className="p-4 rounded-xl bg-cosmic-800/50 text-center">
              <div className="text-5xl font-display font-bold text-bronze-400">
                +{result.reputationEarned}
              </div>
              <div className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-bronze-400" />
                研究声望
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-cosmic-800/50 rounded-lg text-center">
              <Target className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-semibold text-white">{result.fragmentAccuracy}%</div>
              <div className="text-xs text-gray-400">碎片放置</div>
            </div>
            <div className="p-3 bg-cosmic-800/50 rounded-lg text-center">
              <BookOpen className="w-5 h-5 text-rune-400 mx-auto mb-1" />
              <div className="text-lg font-semibold text-white">{result.symbolAccuracy}%</div>
              <div className="text-xs text-gray-400">符号关联</div>
            </div>
            <div className="p-3 bg-cosmic-800/50 rounded-lg text-center">
              <Clock className="w-5 h-5 text-mystic-400 mx-auto mb-1" />
              <div className="text-lg font-semibold text-white">{result.eraAccuracy}%</div>
              <div className="text-xs text-gray-400">年代排序</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>用时: {formatTime(timeSpent)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">边缘匹配:</span>
              <span className={result.matchedEdges === result.totalEdges ? 'text-green-400' : 'text-yellow-400'}>
                {result.matchedEdges}/{result.totalEdges}
              </span>
            </div>
          </div>

          {newAchievements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-bronze-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                新成就解锁！
              </h4>
              <div className="flex flex-wrap gap-2">
                {newAchievements.map(id => {
                  const info = getAchievementInfo(id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 px-3 py-2 bg-bronze-500/20 border border-bronze-500/30 rounded-lg"
                    >
                      <span className="text-xl">{info.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-bronze-200">{info.name}</div>
                        <div className="text-xs text-gray-400">{info.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-red-400 mb-2">需要修正的问题:</h4>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {result.errors.map((error, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 px-4 bg-cosmic-700 hover:bg-cosmic-600 text-gray-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              继续调整
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-bronze-500 to-bronze-600 hover:from-bronze-400 hover:to-bronze-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="animate-pulse">提交中...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  提交复原
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
