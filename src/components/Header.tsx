import { useState } from 'react';
import { ScrollText, RotateCcw, Play, Award, Menu, X, Star, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { reputationStorage } from '../utils/storage';
import { useEffect } from 'react';

export default function Header() {
  const location = useLocation();
  const { resetWorkspace, getCompletionPercentage, startTime } = useGameStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [reputation, setReputation] = useState(reputationStorage.get());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const updateReputation = () => setReputation(reputationStorage.get());
    window.addEventListener('storage', updateReputation);
    
    const interval = setInterval(updateReputation, 1000);
    
    return () => {
      window.removeEventListener('storage', updateReputation);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completion = getCompletionPercentage();

  const handleReset = () => {
    if (confirm('确定要重置当前工作区吗？所有进度将丢失。')) {
      resetWorkspace();
    }
  };

  const navItems = [
    { path: '/', label: '复原工作台', icon: Play },
    { path: '/archive', label: '研究档案', icon: ScrollText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cosmic-950/80 backdrop-blur-md border-b border-cosmic-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-bronze-400 to-bronze-600 rounded-lg flex items-center justify-center">
                <ScrollText className="w-6 h-6 text-cosmic-950" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-rune-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-bronze-200 leading-tight">
                星际考古拼谱
              </h1>
              <p className="text-[10px] text-gray-500 tracking-wider">
                XENOARCHAEOLOGICAL CHRONICLE
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${location.pathname === item.path
                    ? 'bg-bronze-500/20 text-bronze-300'
                    : 'text-gray-400 hover:text-white hover:bg-cosmic-800'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {location.pathname === '/' && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-cosmic-800/50 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300 font-mono">{formatTime(elapsedTime)}</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-cosmic-800/50 rounded-lg">
                  <div className="w-24 h-2 bg-cosmic-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-bronze-500 to-rune-500 transition-all duration-300"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-300 font-medium">{completion}%</span>
                </div>

                <button
                  onClick={handleReset}
                  className="p-2 text-gray-400 hover:text-white hover:bg-cosmic-800 rounded-lg transition-colors"
                  title="重置工作区"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="flex items-center gap-2 pl-3 border-l border-cosmic-700">
              <Award className="w-5 h-5 text-bronze-400" />
              <div className="text-right">
                <div className="text-sm font-medium text-white flex items-center gap-1">
                  <Star className="w-3 h-3 text-bronze-400" />
                  {reputation.totalPoints}
                </div>
                <div className="text-[10px] text-gray-400">{reputation.levelName}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-cosmic-800">
            <nav className="flex flex-col gap-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${location.pathname === item.path
                      ? 'bg-bronze-500/20 text-bronze-300'
                      : 'text-gray-400 hover:text-white hover:bg-cosmic-800'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
