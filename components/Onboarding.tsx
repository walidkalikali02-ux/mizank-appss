import React, { useState } from 'react';
import { DailyGoal, Language } from '../types';
import { ArrowRight, ArrowLeft, Check, Activity, Scale, Ruler, Calendar, User, Target } from 'lucide-react';

interface OnboardingProps {
  onComplete: (goal: DailyGoal) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: any;
}

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
type GoalType = 'lose' | 'maintain' | 'gain';

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, lang, setLang, t }) => {
  const [step, setStep] = useState(0);
  
  // Form State
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(175);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goalType, setGoalType] = useState<GoalType>('maintain');

  // Calculated Result
  const [calculatedGoal, setCalculatedGoal] = useState<DailyGoal | null>(null);

  const calculateGoals = () => {
    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725
    };

    let tdee = bmr * multipliers[activity];

    // Adjust for goal
    if (goalType === 'lose') tdee -= 500;
    else if (goalType === 'gain') tdee += 500;

    // Ensure safe minimums
    tdee = Math.max(tdee, 1200);

    // Macro split (30% P, 35% C, 35% F approx, simplified)
    // Protein: 2g per kg of body weight (for active/dieting) roughly, or % based
    // Let's use a standard balanced split: 30% Protein, 40% Carbs, 30% Fat
    
    const calories = Math.round(tdee);
    const protein = Math.round((calories * 0.30) / 4);
    const carbs = Math.round((calories * 0.40) / 4);
    const fat = Math.round((calories * 0.30) / 9);

    setCalculatedGoal({ calories, protein, carbs, fat });
    setStep(2);
  };

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] start-[-10%] w-[50vw] h-[50vw] bg-brand-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] end-[-10%] w-[50vw] h-[50vw] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      {/* Language Toggle (Fixed top corner) */}
      <button 
        onClick={toggleLang}
        className="absolute top-6 end-6 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-600 transition-colors"
      >
        {lang === 'ar' ? 'English' : 'العربية'}
      </button>

      <div className="w-full max-w-lg z-10">
        
        {/* STEP 0: WELCOME */}
        {step === 0 && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-brand-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-200 rotate-3">
                 <Activity className="text-white w-12 h-12" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t.welcomeTitle}</h1>
              <p className="text-xl text-gray-500 max-w-sm mx-auto leading-relaxed">{t.welcomeSubtitle}</p>
            </div>

            <button 
              onClick={() => setStep(1)}
              className="w-full py-4 bg-gray-900 text-white text-lg font-bold rounded-2xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-3"
            >
              {t.getStarted}
              <ArrowRight size={20} className="rtl:rotate-180"/>
            </button>
          </div>
        )}

        {/* STEP 1: INPUTS */}
        {step === 1 && (
          <div className="animate-in slide-in-from-bottom-8 duration-500">
             <div className="mb-8 flex items-center gap-4">
                <button onClick={() => setStep(0)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                    <ArrowLeft size={24} className="rtl:rotate-180"/>
                </button>
                <h2 className="text-2xl font-bold">{t.stepProfile}</h2>
             </div>

             <div className="space-y-6 bg-white/50 backdrop-blur-sm rounded-3xl">
                
                {/* Gender */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <User size={16} /> {t.gender}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {(['male', 'female'] as const).map((g) => (
                            <button
                                key={g}
                                onClick={() => setGender(g)}
                                className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                                    gender === g 
                                    ? 'border-brand-500 bg-brand-50 text-brand-700' 
                                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                }`}
                            >
                                {g === 'male' ? t.male : t.female}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Calendar size={12}/> {t.age}</label>
                         <input 
                            type="number" 
                            value={age} 
                            onChange={(e) => setAge(Number(e.target.value))}
                            className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all font-bold text-center"
                        />
                    </div>
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Scale size={12}/> {t.weight} ({t.kg})</label>
                         <input 
                            type="number" 
                            value={weight} 
                            onChange={(e) => setWeight(Number(e.target.value))}
                            className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all font-bold text-center"
                        />
                    </div>
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Ruler size={12}/> {t.height} ({t.cm})</label>
                         <input 
                            type="number" 
                            value={height} 
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all font-bold text-center"
                        />
                    </div>
                </div>

                {/* Activity */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16} /> {t.activityLevel}
                    </label>
                    <select 
                        value={activity}
                        onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                        className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:border-brand-500 outline-none appearance-none font-medium text-gray-700"
                    >
                        <option value="sedentary">{t.sedentary}</option>
                        <option value="light">{t.light}</option>
                        <option value="moderate">{t.moderate}</option>
                        <option value="active">{t.active}</option>
                    </select>
                </div>

                {/* Goal */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Target size={16} /> {t.goalType}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                         {(['lose', 'maintain', 'gain'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setGoalType(type)}
                                className={`p-3 text-start px-4 rounded-xl border transition-all font-medium ${
                                    goalType === type 
                                    ? 'border-brand-500 bg-brand-50 text-brand-900' 
                                    : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {type === 'lose' && t.loseWeight}
                                {type === 'maintain' && t.maintainWeight}
                                {type === 'gain' && t.gainMuscle}
                            </button>
                         ))}
                    </div>
                </div>

                <button 
                    onClick={calculateGoals}
                    className="w-full py-4 bg-brand-600 text-white text-lg font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/30 mt-4"
                >
                    {t.calculatePlan}
                </button>
             </div>
          </div>
        )}

        {/* STEP 2: RESULTS */}
        {step === 2 && calculatedGoal && (
            <div className="animate-in slide-in-from-bottom-8 duration-500 text-center">
                 <div className="mb-8 flex items-center gap-4">
                    <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft size={24} className="rtl:rotate-180"/>
                    </button>
                    <h2 className="text-2xl font-bold">{t.stepPlan}</h2>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 mb-8 relative overflow-hidden">
                     <div className="absolute top-0 start-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>
                     
                     <div className="mb-8">
                         <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t.dailyCalories}</span>
                         <div className="text-6xl font-black text-brand-600 mt-2 flex items-baseline justify-center gap-2">
                             {calculatedGoal.calories}
                             <span className="text-xl font-bold text-gray-400">{t.kcal}</span>
                         </div>
                     </div>

                     <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                        <div>
                            <span className="block text-xs font-bold text-gray-400 mb-1">{t.protein}</span>
                            <span className="text-xl font-bold text-gray-800">{calculatedGoal.protein}{t.g}</span>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-green-500 w-full"></div>
                            </div>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-gray-400 mb-1">{t.carbs}</span>
                            <span className="text-xl font-bold text-gray-800">{calculatedGoal.carbs}{t.g}</span>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-blue-500 w-full"></div>
                            </div>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-gray-400 mb-1">{t.fat}</span>
                            <span className="text-xl font-bold text-gray-800">{calculatedGoal.fat}{t.g}</span>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-yellow-500 w-full"></div>
                            </div>
                        </div>
                     </div>
                </div>
                
                <p className="text-xs text-gray-400 mb-8 max-w-xs mx-auto">{t.planDisclaimer}</p>

                <button 
                    onClick={() => onComplete(calculatedGoal)}
                    className="w-full py-4 bg-gray-900 text-white text-lg font-bold rounded-2xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-2"
                >
                    <Check size={20} />
                    {t.startJourney}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};