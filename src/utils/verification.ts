import type {
  TabletFragment,
  Symbol,
  Era,
  VerificationResult,
  EdgePatterns,
} from '../types';

export const rotateEdges = (edges: EdgePatterns, rotation: number): EdgePatterns => {
  const rotations = Math.floor(rotation / 90) % 4;
  const edgeArray = [edges.top, edges.right, edges.bottom, edges.left];
  
  for (let i = 0; i < rotations; i++) {
    const last = edgeArray.pop()!;
    edgeArray.unshift(last);
  }
  
  return {
    top: edgeArray[0],
    right: edgeArray[1],
    bottom: edgeArray[2],
    left: edgeArray[3],
  };
};

export const checkEdgeMatching = (
  fragments: TabletFragment[]
): { matched: number; total: number; errors: string[] } => {
  const placedFragments = fragments.filter(f => f.isPlaced && f.currentPosition);
  const positionMap = new Map<string, TabletFragment>();
  
  placedFragments.forEach(f => {
    const key = `${f.currentPosition!.x},${f.currentPosition!.y}`;
    positionMap.set(key, f);
  });

  let matched = 0;
  let total = 0;
  const errors: string[] = [];

  placedFragments.forEach(fragment => {
    const { x, y } = fragment.currentPosition!;
    const currentEdges = rotateEdges(fragment.edgePatterns, fragment.currentRotation || 0);

    const rightNeighbor = positionMap.get(`${x + 1},${y}`);
    if (rightNeighbor) {
      total++;
      const rightEdges = rotateEdges(rightNeighbor.edgePatterns, rightNeighbor.currentRotation || 0);
      if (currentEdges.right === rightEdges.left) {
        matched++;
      } else {
        errors.push(`碎片「${fragment.name}」右边缘与「${rightNeighbor.name}」左边缘纹路不匹配`);
      }
    }

    const bottomNeighbor = positionMap.get(`${x},${y + 1}`);
    if (bottomNeighbor) {
      total++;
      const bottomEdges = rotateEdges(bottomNeighbor.edgePatterns, bottomNeighbor.currentRotation || 0);
      if (currentEdges.bottom === bottomEdges.top) {
        matched++;
      } else {
        errors.push(`碎片「${fragment.name}」下边缘与「${bottomNeighbor.name}」上边缘纹路不匹配`);
      }
    }
  });

  return { matched, total, errors };
};

export const checkFragmentPlacement = (
  fragments: TabletFragment[]
): { correct: number; total: number; errors: string[] } => {
  let correct = 0;
  const errors: string[] = [];

  fragments.forEach(f => {
    if (!f.isPlaced || !f.currentPosition) {
      errors.push(`碎片「${f.name}」尚未放置`);
      return;
    }
    
    const posCorrect = 
      f.currentPosition!.x === f.correctPosition.x &&
      f.currentPosition!.y === f.correctPosition.y;
    const rotCorrect = (f.currentRotation || 0) === f.correctRotation;
    
    if (posCorrect && rotCorrect) {
      correct++;
    } else {
      if (!posCorrect) {
        errors.push(`碎片「${f.name}」位置不正确`);
      }
      if (!rotCorrect) {
        errors.push(`碎片「${f.name}」旋转角度不正确`);
      }
    }
  });

  return { correct, total: fragments.length, errors };
};

export const checkSymbolAssociations = (
  symbols: Symbol[],
  fragments: TabletFragment[]
): { correct: number; total: number; errors: string[] } => {
  let correct = 0;
  const errors: string[] = [];

  symbols.forEach(symbol => {
    if (!symbol.isIndexed) {
      errors.push(`符号「${symbol.name}」尚未建立索引`);
      return;
    }
    
    const associatedFragment = fragments.find(f => f.id === symbol.associatedFragmentId);
    if (associatedFragment) {
      if (associatedFragment.symbolIds.includes(symbol.id)) {
        correct++;
      } else {
        errors.push(`符号「${symbol.name}」与碎片「${associatedFragment.name}」的关联不正确`);
      }
    } else {
      errors.push(`符号「${symbol.name}」已索引但未关联到任何碎片`);
    }
  });

  return { correct, total: symbols.length, errors };
};

export const checkEraOrdering = (
  currentOrder: string[],
  eras: Era[]
): { correct: number; total: number; errors: string[] } => {
  if (currentOrder.length === 0) {
    return { correct: 0, total: eras.length, errors: ['尚未排列年代顺序'] };
  }

  const sortedEras = [...eras].sort((a, b) => a.order - b.order);
  const correctOrder = sortedEras.map(e => e.id);
  
  let correct = 0;
  const errors: string[] = [];

  for (let i = 0; i < correctOrder.length; i++) {
    if (currentOrder[i] === correctOrder[i]) {
      correct++;
    } else {
      const era = eras.find(e => e.id === currentOrder[i]);
      errors.push(`年代「${era?.name || '未知'}」位置不正确`);
    }
  }

  return { correct, total: eras.length, errors };
};

export const calculateReputation = (
  completionScore: number,
  accuracyScore: number,
  timeSpent: number
): number => {
  const baseReputation = Math.round(completionScore * 100);
  const perfectBonus = accuracyScore >= 95 ? 50 : 0;
  const speedBonus = Math.max(0, Math.round((300 - timeSpent) / 3));
  
  return baseReputation + perfectBonus + speedBonus;
};

export const verifyRestoration = (
  fragments: TabletFragment[],
  symbols: Symbol[],
  eras: Era[],
  currentEraOrder: string[],
  startTime: number
): VerificationResult => {
  const fragmentCheck = checkFragmentPlacement(fragments);
  const edgeCheck = checkEdgeMatching(fragments);
  const symbolCheck = checkSymbolAssociations(symbols, fragments);
  const eraCheck = checkEraOrdering(currentEraOrder, eras);

  const timeSpent = Math.round((Date.now() - startTime) / 1000);

  const fragmentAccuracy = fragmentCheck.total > 0 
    ? Math.round((fragmentCheck.correct / fragmentCheck.total) * 100) 
    : 0;
  const symbolAccuracy = symbolCheck.total > 0 
    ? Math.round((symbolCheck.correct / symbolCheck.total) * 100) 
    : 0;
  const eraAccuracy = eraCheck.total > 0 
    ? Math.round((eraCheck.correct / eraCheck.total) * 100) 
    : 0;

  const placedCount = fragments.filter(f => f.isPlaced).length;
  const indexedCount = symbols.filter(s => s.isIndexed).length;

  const completionScore = Math.round(
    (placedCount / fragments.length) * 40 +
    (indexedCount / symbols.length) * 30 +
    (currentEraOrder.length === eras.length ? 30 : 0)
  );

  const accuracyScore = Math.round(
    fragmentAccuracy * 0.4 +
    symbolAccuracy * 0.3 +
    eraAccuracy * 0.3
  );

  const allErrors = [
    ...fragmentCheck.errors,
    ...edgeCheck.errors,
    ...symbolCheck.errors,
    ...eraCheck.errors,
  ];

  const reputationEarned = calculateReputation(completionScore, accuracyScore, timeSpent);

  return {
    completionScore,
    accuracyScore,
    fragmentAccuracy,
    symbolAccuracy,
    eraAccuracy,
    matchedEdges: edgeCheck.matched,
    totalEdges: edgeCheck.total,
    errors: allErrors.slice(0, 10),
    reputationEarned,
  };
};

export const getRarityColor = (rarity: string): string => {
  const colors: Record<string, string> = {
    common: 'text-gray-400 border-gray-500',
    rare: 'text-blue-400 border-blue-500',
    legendary: 'text-yellow-400 border-yellow-500',
  };
  return colors[rarity] || colors.common;
};

export const getRarityBg = (rarity: string): string => {
  const colors: Record<string, string> = {
    common: 'bg-gray-700/30',
    rare: 'bg-blue-900/30',
    legendary: 'bg-yellow-900/30',
  };
  return colors[rarity] || colors.common;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    astronomy: 'bg-indigo-500',
    ritual: 'bg-purple-500',
    technology: 'bg-amber-500',
    biology: 'bg-green-500',
    unknown: 'bg-rose-500',
  };
  return colors[category] || colors.unknown;
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    astronomy: '天文学',
    ritual: '仪式',
    technology: '科技',
    biology: '生物',
    unknown: '未知',
    all: '全部',
  };
  return labels[category] || category;
};
