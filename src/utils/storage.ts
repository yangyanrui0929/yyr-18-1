import { STORAGE_KEYS, type RestorationRecord, type Reputation } from '../types';
import { defaultReputation } from '../data/mockData';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage save failed:', error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove failed:', error);
    }
  },
};

export const restorationStorage = {
  getAll(): RestorationRecord[] {
    return storage.get<RestorationRecord[]>(STORAGE_KEYS.RESTORATIONS, []);
  },

  save(record: RestorationRecord): void {
    const records = this.getAll();
    records.unshift(record);
    storage.set(STORAGE_KEYS.RESTORATIONS, records);
  },

  clear(): void {
    storage.remove(STORAGE_KEYS.RESTORATIONS);
  },
};

export const reputationStorage = {
  get(): Reputation {
    return storage.get<Reputation>(STORAGE_KEYS.REPUTATION, defaultReputation);
  },

  save(reputation: Reputation): void {
    storage.set(STORAGE_KEYS.REPUTATION, reputation);
  },

  reset(): void {
    storage.set(STORAGE_KEYS.REPUTATION, defaultReputation);
  },
};

export const calculateLevel = (points: number): { level: number; levelName: string } => {
  const levelThresholds = [0, 500, 1500, 3000, 5000, 8000, 12000, 17000, 23000, 30000];
  const levelNames = [
    '学徒考古学家',
    '初级考古学家',
    '中级考古学家',
    '高级考古学家',
    '首席考古学家',
    '星际考古大师',
    '文明破译师',
    '历史守望者',
    '时空学者',
    '万古传承者',
  ];

  let level = 1;
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (points >= levelThresholds[i]) {
      level = i + 1;
      break;
    }
  }

  return {
    level,
    levelName: levelNames[level - 1] || levelNames[0],
  };
};

export const checkAchievements = (
  record: RestorationRecord,
  reputation: Reputation
): string[] => {
  const newAchievements: string[] = [];
  const existing = new Set(reputation.achievements);

  if (reputation.totalRestorations + 1 >= 1 && !existing.has('first_restoration')) {
    newAchievements.push('first_restoration');
  }

  if (record.accuracyScore >= 95 && !existing.has('perfect_score')) {
    newAchievements.push('perfect_score');
  }

  if (record.timeSpent < 120 && !existing.has('speed_demon')) {
    newAchievements.push('speed_demon');
  }

  if (reputation.totalRestorations + 1 >= 10 && !existing.has('restorer_10')) {
    newAchievements.push('restorer_10');
  }

  if (reputation.perfectRestorations + (record.accuracyScore >= 95 ? 1 : 0) >= 5 && !existing.has('perfectionist')) {
    newAchievements.push('perfectionist');
  }

  return newAchievements;
};

export const getAchievementInfo = (id: string): { name: string; description: string; icon: string } => {
  const achievements: Record<string, { name: string; description: string; icon: string }> = {
    first_restoration: {
      name: '初出茅庐',
      description: '完成第一次石板复原',
      icon: '🌟',
    },
    perfect_score: {
      name: '完美无瑕',
      description: '单次复原准确率达到95%以上',
      icon: '💯',
    },
    speed_demon: {
      name: '神速破译',
      description: '在2分钟内完成一次复原',
      icon: '⚡',
    },
    restorer_10: {
      name: '拼谱达人',
      description: '累计完成10次复原',
      icon: '🏆',
    },
    perfectionist: {
      name: '完美主义者',
      description: '累计完成5次完美复原',
      icon: '👑',
    },
  };

  return achievements[id] || { name: '未知成就', description: '神秘的成就', icon: '❓' };
};
