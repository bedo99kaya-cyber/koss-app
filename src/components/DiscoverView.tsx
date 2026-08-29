import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Clock, 
  PlusCircle, 
  ChevronRight,
  Flame
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { CategoryIcon } from './CategoryIcon';

export const DiscoverView: React.FC = () => {
  const { 
    events, 
    currentUser, 
    selectedCity, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery, 
    setViewingEventId,
    setViewingUserId,
    setActiveTab
  } = useApp();

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'all' | 'Herkes' | 'Sadece Kadınlar' | 'Sadece Erkekler'>('all');
  const [ageFilter, setAgeFilter] = useState<'all' | 'unspecified' | 'custom'>('all');
  const [targetAge, setTargetAge] = useState<number>(25);
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [costFilter, setCostFilter] = useState<'all' | 'Ücretsiz' | 'Hesap Bölüşmeli'>('all');

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Status filter
      if (event.status !== 'active') return false;

      // City filter
      if (selectedCity !== 'Tüm Şehirler' && event.city !== selectedCity) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && event.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(q);
        const matchDesc = event.description.toLowerCase().includes(q);
        const matchDistrict = event.district.toLowerCase().includes(q);
        const matchTags = event.tags.some(t => t.toLowerCase().includes(q));
        const matchCategory = event.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchDistrict && !matchTags && !matchCategory) {
          return false;
        }
      }

      // Urgent filter
      if (onlyUrgent && !event.urgentNeed) {
        return false;
      }

      // Gender filter
      if (genderFilter !== 'all') {
        if (event.criteria.genderPreference !== 'Herkes' && event.criteria.genderPreference !== 'Fark Etmez' && event.criteria.genderPreference !== genderFilter) {
          return false;
        }
      }

      // Cost filter
      if (costFilter !== 'all' && event.criteria.costType !== costFilter) {
        return false;
      }

      // Age filter
      if (ageFilter === 'custom') {
        if (event.criteria.ageRangeSpecified) {
          const min = event.criteria.minAge || 0;
          const max = event.criteria.maxAge || 100;
          if (targetAge < min || targetAge > max) return false;
        }
      } else if (ageFilter === 'unspecified') {
        if (event.criteria.ageRangeSpecified) return false;
      }

      return true;
    });
  }, [events, selectedCity, selectedCategory, searchQuery, onlyUrgent, genderFilter, costFilter, ageFilter, targetAge]);

  const activeFiltersCount = (genderFilter !== 'all' ? 1 : 0) +
    (ageFilter !== 'all' ? 1 : 0) +
    (onlyUrgent ? 1 : 0) +
    (costFilter !== 'all' ? 1 : 0);

  return (
    <div className="max-w-2xl mx-auto pb-24 px-3 sm:px-4 space-y-4 pt-1">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Etkinlik, mekan veya hobi ara (Örn: Halı saha, satranç, kahve)..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-850 border border-slate-750 focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none shadow-sm transition-all"
            id="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`p-2.5 rounded-2xl border flex items-center gap-1.5 transition-all text-xs font-bold ${
            activeFiltersCount > 0
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
              : 'bg-slate-850 text-slate-300 border-slate-750 hover:bg-slate-800'
          }`}
          id="filter-drawer-button"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-black">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Expandable Panel */}
      {showFilterDrawer && (
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-3.5 animate-fadeIn shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-orange-400" />
              Detaylı Filtreler
            </span>
            <button
              onClick={() => {
                setGenderFilter('all');
                setAgeFilter('all');
                setOnlyUrgent(false);
                setCostFilter('all');
              }}
              className="text-[11px] text-orange-400 hover:underline font-semibold"
            >
              Filtreleri Sıfırla
            </button>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Cinsiyet Kriteri</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'Herkes', label: 'Herkes / Karma' },
                { id: 'Sadece Kadınlar', label: 'Sadece Kadınlar' },
                { id: 'Sadece Erkekler', label: 'Sadece Erkekler' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setGenderFilter(opt.id as any)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    genderFilter === opt.id
                      ? 'bg-orange-500 text-white border-orange-500 font-bold'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Yaş Aralığı</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <button
                onClick={() => setAgeFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  ageFilter === 'all'
                    ? 'bg-orange-500 text-white border-orange-500 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Tüm İlanlar
              </button>
              <button
                onClick={() => setAgeFilter('unspecified')}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  ageFilter === 'unspecified'
                    ? 'bg-orange-500 text-white border-orange-500 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Yaş Sınırı Olmayanlar
              </button>
              <button
                onClick={() => setAgeFilter('custom')}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  ageFilter === 'custom'
                    ? 'bg-orange-500 text-white border-orange-500 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Yaşıma Uygun ({targetAge} Yaş)
              </button>
            </div>

            {ageFilter === 'custom' && (
              <div className="flex items-center gap-3 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-300 font-medium">Yaşınız: {targetAge}</span>
                <input
                  type="range"
                  min={18}
                  max={60}
                  value={targetAge}
                  onChange={e => setTargetAge(Number(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
              </div>
            )}
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <label className="text-xs text-slate-300 font-semibold flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyUrgent}
                onChange={e => setOnlyUrgent(e.target.checked)}
                className="rounded accent-orange-500 w-4 h-4"
              />
              <span>⚡ Sadece Acil / Son Kişiler Olanlar</span>
            </label>
          </div>
        </div>
      )}

      {/* Category Horizontal Scrolling Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border ${
                isSelected
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-md shadow-orange-500/20 scale-[1.02]'
                  : 'bg-slate-850 text-slate-300 border-slate-750 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Banner: Create Event Prompt */}
      <div 
        onClick={() => setActiveTab('create')}
        className="p-3 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-yellow-500/10 border border-orange-500/30 hover:border-orange-500/60 cursor-pointer transition-all flex items-center justify-between group shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white group-hover:text-orange-400 transition-colors">
              Hemen bir etkinlik ilanı aç!
            </h3>
            <p className="text-[10px] text-slate-400">
              Kahve, halı saha, satranç, parti... Ne yapmak istersen.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Event Cards Stream */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {selectedCategory === 'all' ? 'Öne Çıkan İlanlar' : selectedCategory} ({filteredEvents.length})
          </h2>
          <span className="text-[11px] text-slate-500">
            {selectedCity}
          </span>
        </div>

        {events.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto shadow-inner">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                Henüz planlanan bir etkinlik yok. İlk etkinliği sen oluştur!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Halı saha, kahve sohbeti, kutu oyunu veya spor... Şehrindeki insanlarla bir araya gelmek için hemen ilk ilanı oluşturabilirsin.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('create')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>İlk Etkinliği Oluştur</span>
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <Sparkles className="w-10 h-10 text-orange-400 mx-auto opacity-40" />
            <h3 className="text-sm font-bold text-white">Bu kriterlere uygun ilan bulunamadı</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Farklı bir kategori veya filtre deneyebilir veya kendin hemen yeni bir ilan açabilirsin!
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setGenderFilter('all');
                  setAgeFilter('all');
                  setOnlyUrgent(false);
                  setCostFilter('all');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-orange-400 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
              >
                Filtreleri Temizle
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-colors"
              >
                + İlan Aç
              </button>
            </div>
          </div>
        ) : (
          filteredEvents.map(event => {
            const isFull = event.participants.length >= event.criteria.capacity + 1;
            const isOrganizer = event.organizerId === currentUser.id;
            const isJoined = event.participantIds.includes(currentUser.id);

            return (
              <div
                key={event.id}
                onClick={() => setViewingEventId(event.id)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-lg transition-all hover:shadow-orange-500/5 cursor-pointer group flex flex-col"
              >
                {/* Card Top: Cover or Category Banner */}
                {event.coverImage && (
                  <div className="h-32 w-full overflow-hidden relative">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />
                    
                    {/* Top tags on image */}
                    <div className="absolute top-2.5 inset-x-3 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                        <CategoryIcon name={event.category} className="w-3 h-3 text-orange-400" />
                        {event.category}
                      </span>
                      {event.urgentNeed && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-500 text-white shadow-md animate-pulse">
                          ⚡ {event.urgentNeed}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Card Main Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {!event.coverImage && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-orange-400 border border-slate-700 flex items-center gap-1">
                          <CategoryIcon name={event.category} className="w-3 h-3 text-orange-400" />
                          {event.category}
                        </span>
                        {event.urgentNeed && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                            ⚡ {event.urgentNeed}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Location & Time */}
                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-2.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-orange-400" />
                        {event.dateTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        {event.district}
                      </span>
                    </div>

                    {/* Criteria Chips Bar (Yaş, Cinsiyet, Kontenjan, Ücret) */}
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-800">
                      {/* Age */}
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-750 font-medium">
                        Yaş: {event.criteria.ageRangeSpecified ? `${event.criteria.minAge}-${event.criteria.maxAge}` : 'Fark Etmez'}
                      </span>

                      {/* Gender */}
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-750 font-medium">
                        Cinsiyet: {event.criteria.genderPreference}
                      </span>

                      {/* Cost */}
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                        {event.criteria.costType}
                      </span>

                      {/* Capacity */}
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-750 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {event.participants.length}/{event.criteria.capacity + 1} Kişi
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom: Organizer & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                    <div 
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingUserId(event.organizer.id);
                      }}
                    >
                      <div className="relative">
                        <img
                          src={event.organizer.avatar}
                          alt={event.organizer.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        {event.organizer.verified && (
                          <ShieldCheck className="w-3 h-3 text-sky-400 absolute -bottom-0.5 -right-0.5 bg-slate-900 rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">
                          {event.organizer.name}
                        </p>
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          {event.organizer.rating}
                          <span className="text-[9px] text-slate-500">({event.organizer.reviewCount})</span>
                        </span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center gap-1.5">
                      {isJoined ? (
                        <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          Katıldın
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingEventId(event.id);
                          }}
                          className="text-xs px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20 transition-transform active:scale-95 flex items-center gap-1"
                        >
                          <span>İncele</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
