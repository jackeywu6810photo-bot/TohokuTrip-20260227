'use client';
import { useState, useEffect } from 'react';
import { addDays, format, parseISO, differenceInDays } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// --- 資料模型 ---
interface Stop { 
    time: string; name: string; description?: string; transport?: string; 
    cost: number; currency?: string; lat?: number; lng?: number; tags?: string[];
}
interface Day { 
    dayNumber: number; theme: string; date: string; alternatives?: string; checklist?: string[]; stops: Stop[]; 
    accommodation?: string; accommodation_cost?: number; accommodation_currency?: string;
}
interface TripMeta { 
    title: string; days_count: number; travelers: number; budget: number; location?: string; start_date?: string;
    home_currency?: string; destination_currency?: string; exchange_rate?: number;
}
interface Itinerary { trip_meta: TripMeta; days: Day[]; }

// 標籤元件
const TagBadge = ({ tag }: { tag: string }) => {
  const colors: Record<string, string> = {
    '📷 攝影點': 'bg-purple-100 text-purple-700',
    '🚁 可空拍': 'bg-sky-100 text-sky-700',
    '🚫 禁空拍': 'bg-red-100 text-red-700',
    '🌸 必訪': 'bg-pink-100 text-pink-700',
    '🌸 櫻花': 'bg-pink-100 text-pink-700',
    '⛩️ 必訪': 'bg-orange-100 text-orange-700',
    '⛩️ 神社': 'bg-orange-100 text-orange-700',
    '🍖 美食': 'bg-green-100 text-green-700',
    '🍱 午餐': 'bg-emerald-100 text-emerald-700',
    '🍱 晚餐': 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[tag] || 'bg-gray-100 text-gray-700'}`}>
      {tag}
    </span>
  );
};

export default function Home() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [activeBudgetCategory, setActiveBudgetCategory] = useState<string | null>(null);

  // 📱 Android 版：直接讀取本地 JSON
  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then((data: Itinerary) => {
        // 排序每天的行程
        data.days.forEach(day => {
          if (day.stops) day.stops.sort((a, b) => a.time.localeCompare(b.time));
        });
        setItinerary(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('載入失敗:', err);
        setLoading(false);
      });
  }, []);

  const formatMoney = (cost: number, currencyCode?: string) => {
    if (!itinerary) return `¥${cost.toLocaleString()}`;
    const homeCurr = itinerary.trip_meta.home_currency || 'TWD';
    const destCurr = itinerary.trip_meta.destination_currency || 'JPY';
    const rate = itinerary.trip_meta.exchange_rate || 0.215;
    const curr = currencyCode || destCurr;
    const converted = Math.round(cost * rate);
    
    return (
      <span className="flex flex-col leading-tight">
        <span className="font-mono">{curr} {cost.toLocaleString()}</span>
        <span className="text-xs opacity-70">≈ {homeCurr} {converted.toLocaleString()}</span>
      </span>
    );
  };

  const getBudgetDetails = (category: string) => {
    if (!itinerary) return { items: [], total: 0, title: '', color: '' };
    
    const items: { name: string; cost: number; currency: string }[] = [];
    let total = 0;
    const rate = itinerary.trip_meta.exchange_rate || 0.215;
    const homeCurr = itinerary.trip_meta.home_currency || 'TWD';
    const destCurr = itinerary.trip_meta.destination_currency || 'JPY';
    
    itinerary.days.forEach(day => {
      if (category === 'accommodation' && day.accommodation_cost) {
        items.push({ name: day.accommodation || '住宿', cost: day.accommodation_cost, currency: day.accommodation_currency || destCurr });
        total += day.accommodation_cost * rate;
      }
      day.stops?.forEach(stop => {
        if (stop.cost > 0) {
          const curr = stop.currency || destCurr;
          if (category === 'transport' && stop.transport) {
            items.push({ name: stop.name, cost: stop.cost, currency: curr });
            total += stop.cost * rate;
          } else if (category === 'food' && /[餐食麵飯]|牛舌|早餐/.test(stop.name)) {
            items.push({ name: stop.name, cost: stop.cost, currency: curr });
            total += stop.cost * rate;
          } else if (category === 'attraction' && !stop.transport) {
            items.push({ name: stop.name, cost: stop.cost, currency: curr });
            total += stop.cost * rate;
          }
        }
      });
    });
    
    const titles: Record<string, string> = {
      all: '總覽', accommodation: '住宿', transport: '交通', food: '餐飲', attraction: '門票'
    };
    const colors: Record<string, string> = {
      all: 'bg-purple-600', accommodation: 'bg-sky-600', transport: 'bg-rose-600', food: 'bg-emerald-600', attraction: 'bg-orange-500'
    };
    
    return { items, total: Math.round(total), title: titles[category] || '', color: colors[category] || '' };
  };

  if (loading) return <div className="p-10 text-center">載入中...⏳</div>;
  if (!itinerary) return <div className="p-10 text-center text-red-500">載入失敗😢</div>;

  const currentDayData = itinerary.days.find(d => d.dayNumber === activeDay);
  const budgetData = activeBudgetCategory ? getBudgetDetails(activeBudgetCategory) : null;
  const homeCurr = itinerary.trip_meta.home_currency || 'TWD';

  return (
    <main className="min-h-screen pb-20 bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-pink-600 truncate">{itinerary.trip_meta.title}</h1>
          <p className="text-xs text-gray-500">{itinerary.trip_meta.location} · {itinerary.trip_meta.days_count}天</p>
        </div>
      </header>

      {/* 預算卡片 */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {['accommodation', 'transport', 'food', 'attraction'].map(cat => {
            const data = getBudgetDetails(cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveBudgetCategory(cat)}
                className="bg-white p-3 rounded-xl shadow text-left active:scale-95 transition"
              >
                <div className="text-xs text-gray-500 mb-1">{cat === 'accommodation' ? '住宿' : cat === 'transport' ? '交通' : cat === 'food' ? '餐飲' : '門票'}</div>
                <div className="text-lg font-bold text-gray-800">{homeCurr} {data.total.toLocaleString()}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day 選擇器 */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {itinerary.days.map(day => (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDay(day.dayNumber)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
                activeDay === day.dayNumber ? 'bg-pink-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* 當日行程 */}
      {currentDayData && (
        <div className="px-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* 標題 */}
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Day {currentDayData.dayNumber}: {currentDayData.theme}</h2>
              <p className="text-sm text-gray-500 mt-1">{currentDayData.date}</p>
              
              {/* 住宿 */}
              {currentDayData.accommodation && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-blue-500">🏨</span>
                  <span>{currentDayData.accommodation}</span>
                </div>
              )}
              
              {/* 雨天備案 */}
              {currentDayData.alternatives && (
                <div className="mt-3 p-3 bg-sky-50 rounded-lg text-sm text-sky-700">
                  <span className="font-bold">🌧️ 雨天備案：</span> {currentDayData.alternatives}
                </div>
              )}
              
              {/* 檢查清單 */}
              {currentDayData.checklist && currentDayData.checklist.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                  <div className="text-sm font-bold text-amber-800 mb-2">📋 今日檢查清單</div>
                  <div className="space-y-1">
                    {currentDayData.checklist.map((item, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="w-4 h-4 rounded border-amber-300" />
                        <span className="text-amber-900">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 行程列表 */}
            <div className="p-4 space-y-4">
              {currentDayData.stops.map((stop, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-pink-200">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-white"></div>
                  
                  <div className="text-xs text-gray-500 font-mono mb-1">{stop.time}</div>
                  
                  <h3 className="font-bold text-gray-800">{stop.name}</h3>
                  
                  {/* 標籤 */}
                  {stop.tags && stop.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {stop.tags.map((tag, tidx) => <TagBadge key={tidx} tag={tag} />)}
                    </div>
                  )}
                  
                  {/* 交通 */}
                  {stop.transport && (
                    <div className="mt-2 text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
                      🚃 {stop.transport}
                    </div>
                  )}
                  
                  {/* 描述 */}
                  {stop.description && (
                    <p className="mt-2 text-sm text-gray-600">{stop.description}</p>
                  )}
                  
                  {/* 費用 */}
                  {stop.cost > 0 && (
                    <div className="mt-2">{formatMoney(stop.cost, stop.currency)}</div>
                  )}
                  
                  {/* 地圖連結 */}
                  {stop.lat && stop.lng && (
                    <a
                      href={`https://maps.google.com/?q=${stop.lat},${stop.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full"
                    >
                      📍 開啟地圖
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 預算明細 Modal */}
      {activeBudgetCategory && budgetData && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setActiveBudgetCategory(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-4 ${budgetData.color} text-white`}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">{budgetData.title}明細</h3>
                <button onClick={() => setActiveBudgetCategory(null)} className="text-2xl">×</button>
              </div>
              <p className="text-2xl font-bold mt-2">{homeCurr} {budgetData.total.toLocaleString()}</p>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {budgetData.items.length === 0 ? (
                <div className="p-8 text-center text-gray-500">尚無資料</div>
              ) : (
                <div className="divide-y">
                  {budgetData.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-mono text-gray-600">{item.currency} {item.cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
