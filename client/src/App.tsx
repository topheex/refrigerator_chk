import React, { useState, useEffect } from 'react';
import { 
  format, 
  differenceInDays, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  Trash2, 
  Plus, 
  Refrigerator, 
  Calendar as CalendarIcon, 
  Home, 
  X, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface FoodItem {
  id: number;
  name: string;
  expiry_date: string;
}

function App() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'calendar'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 입력 폼 상태
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const fetchFoods = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/foods');
      const data = await response.json();
      setFoods(data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const addFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expiryDate) return;

    try {
      await fetch(import.meta.env.VITE_API_URL + '/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, expiry_date: expiryDate }),
      });
      setName('');
      setExpiryDate('');
      setIsModalOpen(false);
      fetchFoods();
    } catch (error) {
      console.error('추가 실패:', error);
    }
  };

  const deleteFood = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetch(import.meta.env.VITE_API_URL + `/api/foods/${id}`, { method: 'DELETE' });
      fetchFoods();
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const getDDay = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = parseISO(dateStr);
    const diff = differenceInDays(target, today);
    if (diff === 0) return { text: 'D-Day', color: '#EF4444' };
    if (diff < 0) return { text: `+${Math.abs(diff)}`, color: '#6B7280' };
    if (diff <= 3) return { text: `D-${diff}`, color: '#F97316' };
    return { text: `D-${diff}`, color: '#10B981' };
  };

  // 달력 렌더링용 데이터
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div style={{ background: '#FFF', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><ChevronLeft /></button>
          <h3 style={{ margin: 0 }}>{format(currentMonth, 'yyyy년 MM월')}</h3>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><ChevronRight /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center' }}>
          {['일', '월', '화', '수', '목', '금', '토'].map(d => (
            <div key={d} style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>{d}</div>
          ))}
          {calendarDays.map((day, idx) => {
            const dayFoods = foods.filter(f => isSameDay(parseISO(f.expiry_date), day));
            const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
            return (
              <div key={idx} style={{ height: '60px', borderTop: '1px solid #F3F4F6', paddingTop: '5px', color: isCurrentMonth ? '#000' : '#CCC' }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '2px' }}>{format(day, 'd')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dayFoods.slice(0, 2).map(f => (
                    <div key={f.id} style={{ fontSize: '0.65rem', background: '#DBEAFE', color: '#1E40AF', padding: '1px 3px', borderRadius: '3px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </div>
                  ))}
                  {dayFoods.length > 2 && <div style={{ fontSize: '0.6rem', color: '#999' }}>+{dayFoods.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', minHeight: '100vh', background: '#F9FAFB', position: 'relative', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
      {/* 헤더 */}
      <header style={{ padding: '20px', background: '#FFF', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Refrigerator color="#2563EB" />
        <h1 style={{ fontSize: '1.25rem', margin: 0, color: '#111827' }}>우리집 냉장고</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <main style={{ padding: '20px' }}>
        {activeTab === 'home' ? (
          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#4B5563' }}>📋 소비기한 리스트</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {foods.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0' }}>냉장고가 비어있어요.</p>
              ) : (
                foods.map(food => {
                  const dDay = getDDay(food.expiry_date);
                  return (
                    <div key={food.id} style={{ background: '#FFF', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '2px' }}>{food.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>{food.expiry_date}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '700', color: dDay.color }}>{dDay.text}</span>
                        <button onClick={() => deleteFood(food.id)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#4B5563' }}>📅 만료 달력</h2>
            {renderCalendar()}
          </div>
        )}
      </main>

      {/* 하단 탭 바 */}
      <nav style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: '500px', height: '65px', background: '#FFF', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 }}>
        <button onClick={() => setActiveTab('home')} style={{ border: 'none', background: 'none', color: activeTab === 'home' ? '#2563EB' : '#9CA3AF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <Home size={24} /> <span style={{ fontSize: '0.75rem' }}>홈</span>
        </button>
        
        {/* 중앙 추가 버튼 (FAB) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ width: '56px', height: '56px', background: '#2563EB', color: '#FFF', borderRadius: '28px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', boxShadow: '0 4px 10px rgba(37,99,235,0.4)', cursor: 'pointer' }}
        >
          <Plus size={32} />
        </button>

        <button onClick={() => setActiveTab('calendar')} style={{ border: 'none', background: 'none', color: activeTab === 'calendar' ? '#2563EB' : '#9CA3AF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <CalendarIcon size={24} /> <span style={{ fontSize: '0.75rem' }}>달력</span>
        </button>
      </nav>

      {/* 등록 모달 (팝업) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ width: '100%', maxWidth: '500px', background: '#FFF', borderRadius: '20px 20px 0 0', padding: '25px', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>새 음식 등록</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={addFood}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>음식 이름</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="예: 두부, 우유"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>소비기한</label>
                <input 
                  type="date" 
                  value={expiryDate} 
                  onChange={e => setExpiryDate(e.target.value)} 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', boxSizing: 'border-box' }} 
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '15px', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                냉장고에 넣기
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 단순 애니메이션용 스타일 */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;
