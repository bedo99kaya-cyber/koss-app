import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Compass, 
  CalendarDays, 
  Plus, 
  MessageCircle, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, events } = useApp();

  const myEventsCount = events.filter(
    e => (e.organizerId === currentUser.id || e.participantIds.includes(currentUser.id)) && e.status === 'active'
  ).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-around">
        {/* Keşfet */}
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-xl ${
            activeTab === 'discover'
              ? 'text-orange-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="nav-discover-button"
        >
          <Compass className={`w-5 h-5 ${activeTab === 'discover' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] tracking-tight">Keşfet</span>
          {activeTab === 'discover' && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
          )}
        </button>

        {/* Etkinliklerim */}
        <button
          onClick={() => setActiveTab('my-events')}
          className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-xl ${
            activeTab === 'my-events'
              ? 'text-orange-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="nav-my-events-button"
        >
          <div className="relative">
            <CalendarDays className={`w-5 h-5 ${activeTab === 'my-events' ? 'stroke-[2.5]' : ''}`} />
            {myEventsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 rounded-full bg-orange-500 text-[9px] font-extrabold text-white flex items-center justify-center">
                {myEventsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Etkinliklerim</span>
          {activeTab === 'my-events' && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
          )}
        </button>

        {/* İlan Aç (Hero Action Button) */}
        <div className="-mt-5">
          <button
            onClick={() => setActiveTab('create')}
            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all ring-4 ring-slate-900 ${
              activeTab === 'create' ? 'ring-orange-500/50 rotate-90 duration-300' : ''
            }`}
            id="nav-create-button"
            aria-label="Yeni İlan Aç"
            title="Yeni Etkinlik İlanı Aç"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Mesajlar */}
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-xl ${
            activeTab === 'messages'
              ? 'text-orange-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="nav-messages-button"
        >
          <MessageCircle className={`w-5 h-5 ${activeTab === 'messages' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] tracking-tight">Mesajlar</span>
          {activeTab === 'messages' && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
          )}
        </button>

        {/* Profilim */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-xl ${
            activeTab === 'profile'
              ? 'text-orange-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="nav-profile-button"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className={`w-5 h-5 rounded-full object-cover ring-1 ${
                activeTab === 'profile' ? 'ring-orange-500 ring-2' : 'ring-slate-600'
              }`}
            />
          </div>
          <span className="text-[10px] tracking-tight">Profilim</span>
          {activeTab === 'profile' && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
          )}
        </button>
      </div>
    </nav>
  );
};
