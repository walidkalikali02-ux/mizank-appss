import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MacroNutrients, DailyGoal, MealLog } from '../types';
import { Settings2, X, Save, Droplet, Wheat, Beef } from 'lucide-react';

interface StatsChartsProps {
  totalMacros: MacroNutrients;
  goal: DailyGoal;
  onUpdateGoal: (goal: DailyGoal) => void;
  logs: MealLog[];
  t: any;
}

const COLORS = ['#22c55e', '#3b82f6', '#eab308']; // Green (Protein), Blue (Carbs), Yellow (Fat)

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl border border-gray-100 outline-none min-w-[140px] text-start">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-brand-600 leading-none flex items-baseline gap-1">
          {payload[0].value}
          <span className="text-xs font-medium text-gray-400 text-lg">{t.kcal}</span>
        </p>
        <p className="text-[10px] text-gray-400 font-medium mt-1">{t.kcalConsumed}</p>
      </div>
    );
  }
  return null;
};

export const StatsCharts: React.FC<StatsChartsProps> = ({ totalMacros, goal, onUpdateGoal, logs, t }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState<DailyGoal>(goal);

  useEffect(() => {
    setTempGoal(goal);
  }, [goal]);

  const handleSave = () => {
    onUpdateGoal(tempGoal);
    setIsEditing(false);
  };

  const macroData = [
    { name: t.protein, value: totalMacros.protein },
    { name: t.carbs, value: totalMacros.carbs },
    { name: t.fat, value: totalMacros.fat },
  ];

  // Prepare data for timeline chart
  const timelineData = useMemo(() => {
    if (logs.length === 0) return [];

    // Sort logs by time
    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

    let accumulatedCalories = 0;
    const data = sortedLogs.map(log => {
      accumulatedCalories += log.totalMacros.calories;
      return {
        time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calories: accumulatedCalories,
        rawTime: log.timestamp
      };
    });

    if (data.length > 0) {
      return [{ time: t.start, calories: 0, rawTime: 0 }, ...data];
    }
    return data;

  }, [logs, t.start]);

  const hasData = totalMacros.calories > 0;
  const caloriesPercentage = Math.min(100, Math.round((totalMacros.calories / goal.calories) * 100));

  return (
    <div className="mb-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-600 rtl:rotate-180">
            <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 17V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 17V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 17V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.dailyAnalytics}
        </h2>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Settings2 size={16} />
          {t.editGoals}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calorie Goal Card */}
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Background decorative blob */}
          <div className="absolute top-0 end-0 w-32 h-32 bg-brand-50 rounded-full blur-2xl -me-10 -mt-10"></div>

          <h3 className="text-lg font-semibold text-gray-700 mb-4 self-start z-10 flex items-center gap-2">
            {t.energyBalance}
          </h3>

          <div className="relative w-56 h-56 flex items-center justify-center z-10 my-2">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-50 to-transparent blur-xl"></div>

            <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
              {/* Track */}
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="#f1f5f9"
                strokeWidth="16"
                fill="transparent"
                className="opacity-50"
              />
              {/* Progress */}
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={603}
                strokeDashoffset={603 - (603 * caloriesPercentage) / 100}
                className={`transition-all duration-1000 ease-out ${totalMacros.calories > goal.calories ? 'text-red-500' : 'text-brand-500'
                  }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black tracking-tighter text-gray-800">{totalMacros.calories}</span>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wide mt-1">{t.kcalConsumed}</span>
              <div className="w-12 h-1 bg-gray-200 rounded-full mt-3 mb-1"></div>
              <span className="text-xs font-semibold text-gray-500">{t.goal}: {goal.calories}</span>
            </div>
          </div>

          <div className="mt-4 text-sm font-medium z-10 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            {goal.calories - totalMacros.calories >= 0
              ? <span className="text-brand-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                {goal.calories - totalMacros.calories} {t.remaining}
              </span>
              : <span className="text-red-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {Math.abs(goal.calories - totalMacros.calories)} {t.over}
              </span>
            }
          </div>
        </div>

        {/* Macros Breakdown Card */}
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 start-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -ms-10 -mb-10"></div>

          <div className="flex justify-between items-center mb-6 z-10">
            <h3 className="text-lg font-semibold text-gray-700">{t.macronutrients}</h3>
            {hasData && (
              <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full">
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={12}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        {macroData.map((_, index) => (
                          <Cell key={`cell-mini-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6 z-10">
            <MacroBar
              label={t.protein}
              current={totalMacros.protein}
              goal={goal.protein}
              color="bg-green-500"
              textColor="text-green-700"
              bgColor="bg-green-50"
              icon={<Beef size={18} className="text-green-600" />}
              t={t}
            />
            <MacroBar
              label={t.carbs}
              current={totalMacros.carbs}
              goal={goal.carbs}
              color="bg-blue-500"
              textColor="text-blue-700"
              bgColor="bg-blue-50"
              icon={<Wheat size={18} className="text-blue-600" />}
              t={t}
            />
            <MacroBar
              label={t.fat}
              current={totalMacros.fat}
              goal={goal.fat}
              color="bg-yellow-500"
              textColor="text-yellow-700"
              bgColor="bg-yellow-50"
              icon={<Droplet size={18} className="text-yellow-600" />}
              t={t}
            />
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      {timelineData.length > 1 && (
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">{t.intakeTimeline}</h3>
          <div className="h-48 w-full ltr:ml-0 rtl:mr-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  interval="preserveStartEnd"
                  padding={{ left: 20, right: 20 }}
                  scale="point"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  width={40}
                  orientation={document.dir === 'rtl' ? 'right' : 'left'}
                />
                <RechartsTooltip
                  content={<CustomTooltip t={t} />}
                  cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCalories)"
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#22c55e' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Edit Goals Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="font-bold text-xl text-gray-800">{t.editDailyGoals}</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">{t.dailyCalories} ({t.kcal})</label>
                <div className="relative">
                  <input
                    type="number"
                    value={tempGoal.calories}
                    onChange={(e) => setTempGoal({ ...tempGoal, calories: Number(e.target.value) })}
                    className="w-full p-4 ps-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all text-lg font-medium"
                    dir="ltr"
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{t.kcal}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-green-700 uppercase tracking-wider">{t.protein}</label>
                  <input
                    type="number"
                    value={tempGoal.protein}
                    onChange={(e) => setTempGoal({ ...tempGoal, protein: Number(e.target.value) })}
                    className="w-full p-3 bg-green-50/50 border border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-center font-semibold text-gray-700"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider">{t.carbs}</label>
                  <input
                    type="number"
                    value={tempGoal.carbs}
                    onChange={(e) => setTempGoal({ ...tempGoal, carbs: Number(e.target.value) })}
                    className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center font-semibold text-gray-700"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-yellow-700 uppercase tracking-wider">{t.fat}</label>
                  <input
                    type="number"
                    value={tempGoal.fat}
                    onChange={(e) => setTempGoal({ ...tempGoal, fat: Number(e.target.value) })}
                    className="w-full p-3 bg-yellow-50/50 border border-yellow-100 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-center font-semibold text-gray-700"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 shadow-lg hover:shadow-brand-500/30 flex items-center gap-2 transition-all"
              >
                <Save size={18} />
                {t.saveGoals}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MacroBar = ({ label, current, goal, color, textColor, bgColor, icon, t }: {
  label: string,
  current: number,
  goal: number,
  color: string,
  textColor: string,
  bgColor: string,
  icon: React.ReactNode,
  t: any
}) => {
  const maxValue = Math.max(current, goal * 1.15);
  const goalPercent = goal > 0 ? (goal / maxValue) * 100 : 0;
  const currentPercent = (current / maxValue) * 100;
  const isOver = current > goal;

  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${bgColor}`}>
            {icon}
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${isOver ? 'text-red-600' : textColor}`}>
                {Math.round(current)}{t.g}
              </span>
            </div>
          </div>
        </div>
        <span className="text-xs font-medium text-gray-400 mb-1">{t.goal}: {goal}{t.g}</span>
      </div>

      <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden">
        {/* Target Line Marker */}
        {goal > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-300 z-20"
            style={{ insetInlineStart: `${goalPercent}%` }}
          />
        )}

        {/* The Bar */}
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out relative z-10 ${color} ${isOver ? 'opacity-80' : ''}`}
          style={{ width: `${currentPercent}%` }}
        />
      </div>
    </div>
  );
}