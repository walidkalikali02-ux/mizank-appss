import React, { useState, useEffect, useMemo } from 'react';
import { MealLog, DailyGoal, MacroNutrients, Language } from './types';
import { analyzeFoodEntry } from './services/geminiService';
import { StatsCharts } from './components/StatsCharts';
import { FoodInput } from './components/FoodInput';
import { LogList } from './components/LogList';
import { Onboarding } from './components/Onboarding';
import { translations } from './utils/translations';
import { Activity, Utensils, Globe } from 'lucide-react';

// Default Goals (Fallback)
const DEFAULT_GOAL: DailyGoal = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 70,
};

const App: React.FC = () => {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [goal, setGoal] = useState<DailyGoal>(DEFAULT_GOAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('ar');
  
  // Onboarding State
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);

  const t = translations[lang];

  // Update document direction and language
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Calculate daily totals
  const dailyTotal = useMemo<MacroNutrients>(() => {
    return logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.totalMacros.calories,
        protein: acc.protein + log.totalMacros.protein,
        carbs: acc.carbs + log.totalMacros.carbs,
        fat: acc.fat + log.totalMacros.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [logs]);

  // Load data from local storage on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('calapp_logs');
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error("Failed to load logs", e);
      }
    }

    const savedGoal = localStorage.getItem('calapp_goal');
    if (savedGoal) {
      try {
        setGoal(JSON.parse(savedGoal));
      } catch (e) {
        console.error("Failed to load goal", e);
      }
    }

    const savedLang = localStorage.getItem('calapp_lang') as Language;
    if (savedLang) {
        setLang(savedLang);
    }

    // Check onboarding status
    const onboardingStatus = localStorage.getItem('calapp_onboarding');
    if (onboardingStatus === 'true') {
        setIsOnboardingComplete(true);
    }
  }, []);

  // Save logs when changed
  useEffect(() => {
    localStorage.setItem('calapp_logs', JSON.stringify(logs));
  }, [logs]);

  const toggleLanguage = () => {
      const newLang = lang === 'ar' ? 'en' : 'ar';
      setLang(newLang);
      localStorage.setItem('calapp_lang', newLang);
  }

  const handleUpdateGoal = (newGoal: DailyGoal) => {
    setGoal(newGoal);
    localStorage.setItem('calapp_goal', JSON.stringify(newGoal));
  };

  const handleOnboardingComplete = (newGoal: DailyGoal) => {
      setGoal(newGoal);
      localStorage.setItem('calapp_goal', JSON.stringify(newGoal));
      setIsOnboardingComplete(true);
      localStorage.setItem('calapp_onboarding', 'true');
  };

  const handleAnalyze = async (description: string, imageBase64?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await analyzeFoodEntry(description, imageBase64, lang);

      const newLog: MealLog = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        description,
        imageUrl: imageBase64,
        items: analysis.foodItems.map(item => ({
            name: item.name,
            portion: item.portion,
            macros: {
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat
            }
        })),
        totalMacros: analysis.foodItems.reduce((acc, item) => ({
             calories: acc.calories + item.calories,
             protein: acc.protein + item.protein,
             carbs: acc.carbs + item.carbs,
             fat: acc.fat + item.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 }),
        summary: analysis.summary
      };

      setLogs(prev => [newLog, ...prev]);
    } catch (err: any) {
      setError(err.message || t.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleReset = () => {
      if(confirm(t.resetConfirm)) {
          setLogs([]);
      }
  }

  // Render Onboarding if not complete
  if (!isOnboardingComplete) {
      return (
          <Onboarding 
            onComplete={handleOnboardingComplete} 
            lang={lang} 
            setLang={(l) => {
                setLang(l);
                localStorage.setItem('calapp_lang', l);
            }}
            t={t} 
          />
      );
  }

  // Main App Render
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 relative overflow-x-hidden font-sans">
      {/* Background Vector Blobs */}
      <div className="fixed top-0 start-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-24 -start-24 w-96 h-96 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/3 -end-24 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-32 start-1/3 w-80 h-80 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-brand-400 to-brand-600 p-2 rounded-xl shadow-lg shadow-brand-200">
               <Activity className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-brand-900">
              {t.appName}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
                onClick={toggleLanguage}
                className="text-sm font-medium text-gray-500 hover:text-brand-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
             >
                 <Globe size={16} />
                 {t.switchLang}
             </button>
             <div className="w-px h-4 bg-gray-300 mx-1"></div>
             <button 
                onClick={handleReset}
                className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
                {t.resetDay}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Error Banner */}
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 flex justify-between items-center shadow-sm">
                <span className="flex items-center gap-2">
                    <Utensils size={18} />
                    {error}
                </span>
                <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-full"><Utensils size={16} className="rotate-45"/></button>
            </div>
        )}

        {/* Charts & Goals */}
        <StatsCharts 
          totalMacros={dailyTotal} 
          goal={goal} 
          onUpdateGoal={handleUpdateGoal}
          logs={logs}
          t={t}
        />

        {/* Input Area */}
        <FoodInput onAnalyze={handleAnalyze} isLoading={isLoading} t={t} />

        {/* List */}
        <LogList logs={logs} onDelete={handleDeleteLog} t={t} />

      </main>
    </div>
  );
};

export default App;