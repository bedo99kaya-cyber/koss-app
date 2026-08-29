import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Send, 
  Flame, 
  CheckCircle2, 
  Coffee, 
  Trophy, 
  Gamepad2, 
  PartyPopper,
  Zap
} from 'lucide-react';
import { QUICK_TEMPLATES, CATEGORIES } from '../data/mockData';

const getDefaultDateTime = () => {
  const now = new Date();
  now.setHours(now.getHours() + 2);
  now.setMinutes(0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export const formatTurkishEventDate = (dtString: string): string => {
  if (!dtString) return '';
  const d = new Date(dtString);
  if (isNaN(d.getTime())) return dtString;
  const day = d.getDate();
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

export const CreateEventView: React.FC = () => {
  const { createEvent, selectedCity, setActiveTab, setViewingEventId } = useApp();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Spor & Halı Saha');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Kadıköy');
  const [locationName, setLocationName] = useState('');
  const [rawDateTime, setRawDateTime] = useState(getDefaultDateTime());
  const [capacity, setCapacity] = useState<number>(3);
  
  // Criteria State
  const [ageRangeSpecified, setAgeRangeSpecified] = useState(false);
  const [minAge, setMinAge] = useState<number>(20);
  const [maxAge, setMaxAge] = useState<number>(35);
  const [genderPreference, setGenderPreference] = useState<'Herkes' | 'Sadece Kadınlar' | 'Sadece Erkekler' | 'Fark Etmez'>('Herkes');
  const [costType, setCostType] = useState<'Ücretsiz' | 'Hesap Bölüşmeli' | 'Ücretli' | 'Belirtilmemiş'>('Hesap Bölüşmeli');
  const [costNote, setCostNote] = useState('');
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [urgentNeed, setUrgentNeed] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Inline Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleApplyTemplate = (tpl: typeof QUICK_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setDescription(tpl.description);
    setCapacity(tpl.capacity);
    setGenderPreference(tpl.genderPreference);
    setAgeRangeSpecified(tpl.ageRangeSpecified);
    if (tpl.minAge) setMinAge(tpl.minAge);
    if (tpl.maxAge) setMaxAge(tpl.maxAge);
    setCostType(tpl.costType);
    if (tpl.costNote) setCostNote(tpl.costNote);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let firstErrorFieldId = '';

    if (!title.trim()) {
      newErrors.title = 'Etkinlik başlığı zorunludur';
      if (!firstErrorFieldId) firstErrorFieldId = 'create-event-title-input';
    }

    if (!rawDateTime) {
      newErrors.rawDateTime = 'Tarih ve saat seçimi zorunludur';
      if (!firstErrorFieldId) firstErrorFieldId = 'create-event-datetime-input';
    }

    if (!district.trim()) {
      newErrors.district = 'İlçe / semt alanı zorunludur';
      if (!firstErrorFieldId) firstErrorFieldId = 'create-event-district-input';
    }

    if (!locationName.trim()) {
      newErrors.locationName = 'Buluşma mekanı / noktası zorunludur';
      if (!firstErrorFieldId) firstErrorFieldId = 'create-event-location-input';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (firstErrorFieldId) {
        const el = document.getElementById(firstErrorFieldId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus({ preventScroll: true });
        }
      }
      return;
    }

    setErrors({});

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (tags.length === 0) {
      tags.push(category.split('&')[0].trim(), district);
    }

    // Assign default aesthetic cover image if none given
    let finalCover = coverImage;
    if (!finalCover) {
      if (category.includes('Halı Saha') || category.includes('Spor')) {
        finalCover = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80';
      } else if (category.includes('Kahve')) {
        finalCover = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80';
      } else if (category.includes('Oyun')) {
        finalCover = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80';
      } else if (category.includes('Satranç')) {
        finalCover = 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80';
      } else if (category.includes('Parti')) {
        finalCover = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80';
      } else if (category.includes('Koşu')) {
        finalCover = 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80';
      } else {
        finalCover = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80';
      }
    }

    const formattedDate = formatTurkishEventDate(rawDateTime) || 'Belirtilmedi';

    const createdId = createEvent({
      title: title.trim(),
      description: description.trim() || 'Katılmak isteyen herkesi bekliyoruz!',
      category,
      categoryIcon: 'Sparkles',
      dateTime: formattedDate,
      locationName: locationName.trim(),
      district: district.trim(),
      city: selectedCity === 'Tüm Şehirler' ? 'İstanbul' : selectedCity,
      criteria: {
        minAge: ageRangeSpecified ? minAge : undefined,
        maxAge: ageRangeSpecified ? maxAge : undefined,
        ageRangeSpecified,
        genderPreference,
        capacity: Number(capacity),
        costType,
        costNote: costNote.trim() || undefined,
        approvalRequired,
      },
      status: 'active',
      tags,
      coverImage: finalCover,
      urgentNeed: urgentNeed.trim() || undefined,
    });

    // View created event
    setViewingEventId(createdId);
    setActiveTab('discover');
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 px-3 sm:px-4 pt-1">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white">Yeni Etkinlik İlanı Aç</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
                Sınırsız Kategori
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kahve, halı saha, parti, satranç veya aklına gelen herhangi bir buluşma!
            </p>
          </div>
        </div>

        {/* Quick Templates Selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-2">
            Hızlı Şablonlardan Seç (İsteğe Bağlı):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK_TEMPLATES.map((tpl, i) => (
              <button
                type="button"
                key={i}
                onClick={() => handleApplyTemplate(tpl)}
                className="p-2.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-orange-500/50 text-left transition-all group"
              >
                <p className="text-xs font-bold text-slate-200 group-hover:text-orange-400 truncate">
                  {tpl.title.split(' ')[0]} {tpl.title.split(' ')[1]}
                </p>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                  {tpl.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Title & Category */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-850/60 border border-slate-800">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              1. Etkinlik Başlığı & Kategori
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Etkinlik Başlığı <span className="text-red-400">*</span>
              </label>
              <input
                id="create-event-title-input"
                type="text"
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  if (errors.title) clearError('title');
                }}
                placeholder="Örn: Kadıköy'de Kahve & Kitap Sohbeti, Halı Sahaya Acil Kaleci..."
                className={`w-full px-3.5 py-2.5 bg-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                  errors.title
                    ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                    : 'border border-slate-700 focus:border-orange-500'
                }`}
              />
              {errors.title && (
                <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                  <span>* {errors.title}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Kategori Seçimi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                      category === c.id
                        ? 'bg-orange-500 text-white border-orange-500 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Açıklama ve Detaylar
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Nasıl bir etkinlik olacak? Ne zaman buluşulacak? Katılımcıların bilmesi gerekenler..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>

          {/* Section 2: Date, Time, Location */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-850/60 border border-slate-800">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              2. Zaman & Konum
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Tarih ve Saat <span className="text-red-400">*</span>
                </label>
                {rawDateTime && (
                  <span className="text-[11px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                    {formatTurkishEventDate(rawDateTime)}
                  </span>
                )}
              </div>
              <input
                id="create-event-datetime-input"
                type="datetime-local"
                value={rawDateTime}
                onChange={e => {
                  setRawDateTime(e.target.value);
                  if (errors.rawDateTime) clearError('rawDateTime');
                }}
                min={getDefaultDateTime().split('T')[0] + 'T00:00'}
                className={`w-full px-3.5 py-2.5 bg-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none [color-scheme:dark] transition-all ${
                  errors.rawDateTime
                    ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                    : 'border border-slate-700 focus:border-orange-500'
                }`}
              />
              {errors.rawDateTime && (
                <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                  <span>* {errors.rawDateTime}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  İlçe / Semt <span className="text-red-400">*</span>
                </label>
                <input
                  id="create-event-district-input"
                  type="text"
                  value={district}
                  onChange={e => {
                    setDistrict(e.target.value);
                    if (errors.district) clearError('district');
                  }}
                  placeholder="Örn: Kadıköy, Beşiktaş, Çankaya"
                  className={`w-full px-3.5 py-2 bg-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                    errors.district
                      ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                      : 'border border-slate-700 focus:border-orange-500'
                  }`}
                />
                {errors.district && (
                  <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                    <span>* {errors.district}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mekan / Buluşma Noktası <span className="text-red-400">*</span>
                </label>
                <input
                  id="create-event-location-input"
                  type="text"
                  value={locationName}
                  onChange={e => {
                    setLocationName(e.target.value);
                    if (errors.locationName) clearError('locationName');
                  }}
                  placeholder="Örn: Moda Sahil Parkı, Story Coffee, Halı Saha Tesisleri"
                  className={`w-full px-3.5 py-2 bg-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                    errors.locationName
                      ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                      : 'border border-slate-700 focus:border-orange-500'
                  }`}
                />
                {errors.locationName && (
                  <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                    <span>* {errors.locationName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Criteria, Age, Gender, Capacity */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-slate-850/60 border border-slate-800">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              3. Kriterler, Yaş, Cinsiyet & Kontenjan
            </h3>

            {/* Capacity */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Aranan Katılımcı Sayısı (Kontenjan): <span className="text-orange-400">{capacity} Kişi</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={capacity}
                  onChange={e => setCapacity(Number(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-800 text-white border border-slate-700">
                  {capacity} Kişi
                </span>
              </div>
            </div>

            {/* Age Range Criteria Toggle */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Yaş Aralığı Kriteri</h4>
                  <p className="text-[11px] text-slate-400">
                    {ageRangeSpecified ? 'Belirli bir yaş aralığı seçildi' : 'Fark etmez / Belirtilmemiş'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAgeRangeSpecified(!ageRangeSpecified)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                    ageRangeSpecified
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-slate-700 text-slate-300 border-slate-600'
                  }`}
                >
                  {ageRangeSpecified ? 'Özel Yaş Aralığı' : 'Fark Etmez'}
                </button>
              </div>

              {ageRangeSpecified && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Minimum Yaş</label>
                    <input
                      type="number"
                      min={16}
                      max={80}
                      value={minAge}
                      onChange={e => setMinAge(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Maksimum Yaş</label>
                    <input
                      type="number"
                      min={minAge}
                      max={80}
                      value={maxAge}
                      onChange={e => setMaxAge(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Gender Preference */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Cinsiyet Tercihi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Herkes', label: 'Herkes (Karma)' },
                  { id: 'Sadece Kadınlar', label: 'Sadece Kadınlar' },
                  { id: 'Sadece Erkekler', label: 'Sadece Erkekler' },
                  { id: 'Fark Etmez', label: 'Fark Etmez' },
                ].map(opt => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setGenderPreference(opt.id as any)}
                    className={`py-2 px-2 text-xs rounded-xl border transition-all text-center ${
                      genderPreference === opt.id
                        ? 'bg-orange-500 text-white border-orange-500 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost & Account Splitting */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Ücret Durumu
                </label>
                <select
                  value={costType}
                  onChange={e => setCostType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Ücretsiz">Ücretsiz</option>
                  <option value="Hesap Bölüşmeli">Hesap Bölüşmeli (Alman Usulü)</option>
                  <option value="Ücretli">Ücretli / Biletli</option>
                  <option value="Belirtilmemiş">Belirtilmemiş</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Ücret Notu (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  value={costNote}
                  onChange={e => setCostNote(e.target.value)}
                  placeholder="Örn: Kişi başı 120 TL saha ücreti"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Participation Type (Direct Join vs Approval) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-750">
              <div>
                <h4 className="text-xs font-bold text-white">Organizatör Onayı İstensin mi?</h4>
                <p className="text-[11px] text-slate-400">
                  {approvalRequired
                    ? 'Katılmak isteyenler senden onay bekleyecek'
                    : 'Katıl butonuna basan anında etkinliğe ve sohbete katılır'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={approvalRequired}
                onChange={e => setApprovalRequired(e.target.checked)}
                className="w-5 h-5 rounded accent-orange-500"
              />
            </div>

            {/* Urgent Need Tag */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Acil Durum / Özel İhtiyaç Notu (İsteğe bağlı)
              </label>
              <input
                type="text"
                value={urgentNeed}
                onChange={e => setUrgentNeed(e.target.value)}
                placeholder="Örn: Acil 1 Kaleci Aranıyor, Son 2 Kişi..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
              id="submit-event-button"
            >
              <Sparkles className="w-4 h-4" />
              İlanı Yayınla & İnsanları Çağır ⚡
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
