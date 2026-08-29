import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  ChevronDown,
  Search,
  Check
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { NotificationDrawer } from './NotificationDrawer';
import { CITIES } from '../data/mockData';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    notifications, 
    selectedCity, 
    setSelectedCity,
    isMobileFrame,
    setIsMobileFrame,
    setActiveTab
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const cityPickerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.read).length;

  const ALL_CITIES = ['Tüm Şehirler', ...CITIES];

  const filteredCities = ALL_CITIES.filter(city => 
    city.toLocaleLowerCase('tr-TR').includes(citySearchQuery.trim().toLocaleLowerCase('tr-TR'))
  );

  // Close city picker on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityPickerRef.current && !cityPickerRef.current.contains(event.target as Node)) {
        setShowCityPicker(false);
      }
    };
    if (showCityPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCityPicker]);

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-3">
            <AppLogo
              id="app-header-logo"
              size="md"
              onClick={() => setActiveTab('discover')}
            />

            {/* City Dropdown */}
            <div className="relative" ref={cityPickerRef}>
              <button
                onClick={() => {
                  setShowCityPicker(!showCityPicker);
                  setCitySearchQuery('');
                }}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                  showCityPicker
                    ? 'bg-slate-800 text-orange-400 border-orange-500/50 shadow-sm shadow-orange-500/20'
                    : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border-slate-700/60'
                }`}
                id="city-picker-button"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-[140px]">{selectedCity}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showCityPicker ? 'rotate-180 text-orange-400' : ''}`} />
              </button>

              {showCityPicker && (
                <div 
                  className="absolute left-0 mt-2 w-60 rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl shadow-black/90 ring-1 ring-white/10 p-2 z-50 animate-fadeIn"
                  id="city-picker-panel"
                >
                  {/* Search input within city list */}
                  <div className="relative mb-2 px-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      placeholder="Şehir ara..."
                      autoFocus
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Scrollable Cities List */}
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                    {filteredCities.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        Şehir bulunamadı
                      </div>
                    ) : (
                      filteredCities.map(city => {
                        const isSelected = selectedCity === city;
                        return (
                          <button
                            key={city}
                            onClick={() => {
                              setSelectedCity(city);
                              setShowCityPicker(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-all flex items-center justify-between group ${
                              isSelected
                                ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/25'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <MapPin className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-slate-500 group-hover:text-orange-400'}`} />
                              <span>{city}</span>
                            </span>
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 text-white" />
                            ) : null}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Mode Toggle (Mobile Simulator vs Wide) */}
            <button
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              title={isMobileFrame ? 'Geniş Görünüme Geç' : 'Mobil Çerçeve Görünümüne Geç'}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-xs hidden sm:flex items-center gap-1 transition-colors"
              id="view-toggle-button"
            >
              {isMobileFrame ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-medium">Geniş</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[11px] font-medium">Mobil</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
                id="notifications-button"
                aria-label="Bildirimler"
              >
                <Bell className="w-4 h-4 text-slate-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active Profile Avatar */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-gradient-to-r from-slate-800 to-slate-800/80 hover:bg-slate-750 border border-slate-700/80 transition-all hover:border-orange-500/50 group"
              id="user-profile-button"
              title="Profilime Git"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-orange-500"
              />
              <div className="text-left hidden xs:block">
                <p className="text-[11px] font-semibold text-white leading-tight truncate max-w-[80px] group-hover:text-orange-400 transition-colors">
                  {currentUser.name.split(' ')[0]}
                </p>
                <span className="text-[9px] text-amber-400 flex items-center gap-0.5">
                  ★ {currentUser.rating}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Drawers */}
      {showNotifications && (
        <NotificationDrawer onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
};
