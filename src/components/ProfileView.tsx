import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Star, 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  Edit3, 
  Save, 
  Plus, 
  X, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Calendar,
  Instagram,
  LogOut,
  Mail,
  Camera,
  Upload
} from 'lucide-react';
import { POPULAR_RATING_TAGS } from '../data/mockData';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile, reviews, events, logout } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [age, setAge] = useState(currentUser.age);
  const [gender, setGender] = useState(currentUser.gender);
  const [city, setCity] = useState(currentUser.city);
  const [occupation, setOccupation] = useState(currentUser.occupation || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [interests, setInterests] = useState<string[]>(currentUser.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [activeTab, setActiveTab] = useState<'reviews' | 'badges'>('reviews');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form error state for inline validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setAvatar(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          setAvatar(event.target?.result as string);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const userReviews = reviews.filter(r => r.toUserId === currentUser.id);
  const organizedEvents = events.filter(e => e.organizerId === currentUser.id);
  const attendedEvents = events.filter(e => e.participantIds.includes(currentUser.id) && e.organizerId !== currentUser.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Ad Soyad alanı zorunludur';
    }

    if (!age || isNaN(Number(age)) || Number(age) < 16 || Number(age) > 99) {
      newErrors.age = 'Geçerli bir yaş girin (16-99)';
    }

    if (!city.trim()) {
      newErrors.city = 'Şehir alanı zorunludur';
    }

    if (!occupation.trim()) {
      newErrors.occupation = 'Meslek alanı zorunludur';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    updateProfile({
      name: name.trim(),
      bio,
      age: Number(age),
      gender: gender as any,
      city: city.trim(),
      occupation: occupation.trim(),
      avatar,
      interests,
    });
    setIsEditing(false);
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter(i => i !== item));
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4 pt-2">
      {/* Top Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Cover gradient */}
        <div className="h-32 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 relative p-4 flex justify-between items-start">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Doğrulanmış Profil</span>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all"
            id="edit-profile-button"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'İptal' : 'Profili Düzenle'}
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-5 pb-6 pt-0 relative -mt-12">
          {/* Avatar and Badges */}
          <div className="flex items-end justify-between">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-slate-900 shadow-2xl"
              />
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-orange-500 text-white ring-2 ring-slate-900">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 px-3 py-1 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-sm shadow-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{currentUser.rating} Puan</span>
                <span className="text-xs text-slate-400 font-normal">({currentUser.reviewCount})</span>
              </div>
            </div>
          </div>

          {/* Edit Mode vs View Mode */}
          {isEditing ? (
            <form noValidate onSubmit={handleSave} className="mt-4 space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Ad Soyad <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (errors.name) clearError('name');
                  }}
                  className={`w-full px-3 py-2 bg-slate-800 rounded-xl text-sm text-white focus:outline-none transition-all ${
                    errors.name
                      ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                      : 'border border-slate-700 focus:border-orange-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                    <span>* {errors.name}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Yaş <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={16}
                    max={99}
                    value={age}
                    onChange={e => {
                      setAge(e.target.value === '' ? ('' as any) : Number(e.target.value));
                      if (errors.age) clearError('age');
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 rounded-xl text-sm text-white focus:outline-none transition-all ${
                      errors.age
                        ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                        : 'border border-slate-700 focus:border-orange-500'
                    }`}
                  />
                  {errors.age && (
                    <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                      <span>* {errors.age}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Cinsiyet</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Kadın">Kadın</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Belirtilmemiş">Belirtilmemiş</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Meslek <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={e => {
                      setOccupation(e.target.value);
                      if (errors.occupation) clearError('occupation');
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 rounded-xl text-sm text-white focus:outline-none transition-all ${
                      errors.occupation
                        ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                        : 'border border-slate-700 focus:border-orange-500'
                    }`}
                  />
                  {errors.occupation && (
                    <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                      <span>* {errors.occupation}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Şehir <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => {
                      setCity(e.target.value);
                      if (errors.city) clearError('city');
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 rounded-xl text-sm text-white focus:outline-none transition-all ${
                      errors.city
                        ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                        : 'border border-slate-700 focus:border-orange-500'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                      <span>* {errors.city}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Profil Fotoğrafı</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <img
                    src={avatar}
                    alt="Önizleme"
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-orange-500/40 shrink-0"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-orange-400" />
                    <span>Fotoğraf Değiştir / Yükle</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Hakkında & Biyografi</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
                  placeholder="Kendinden, ilgi alanlarından ve yapmayı sevdiğin etkinliklerden bahset..."
                />
              </div>

              {/* Interests Editor */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">İlgi Alanları & Hobiler</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={e => setNewInterest(e.target.value)}
                    placeholder="Örn: Halı Saha, Satranç, Kahve"
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs text-white font-bold"
                  >
                    Ekle
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map(item => (
                    <span
                      key={item}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                    >
                      #{item}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(item)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-3 space-y-4">
              <div>
                <h1 className="text-xl font-black text-white">{currentUser.name}</h1>
                <p className="text-xs text-slate-400 font-medium">{currentUser.username}</p>
                <div className="flex items-center gap-2.5 text-xs text-slate-300 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.occupation}
                  </span>
                  <span>•</span>
                  <span>{currentUser.age} yaş ({currentUser.gender})</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    {currentUser.city}
                  </span>
                </div>
              </div>

              {currentUser.bio && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-850 p-3.5 rounded-2xl border border-slate-800">
                  "{currentUser.bio}"
                </p>
              )}

              {/* Interests */}
              {currentUser.interests && currentUser.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.interests.map(item => (
                    <span
                      key={item}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-800/90 text-slate-300 border border-slate-700/60 font-medium"
                    >
                      #{item}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-750">
                <div className="text-center">
                  <div className="text-base font-extrabold text-amber-400 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {currentUser.rating}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Ortalama Puan</span>
                </div>
                <div className="text-center border-x border-slate-700/80">
                  <div className="text-base font-extrabold text-white">
                    {currentUser.eventsOrganizedCount || organizedEvents.length}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Açtığı İlanlar</span>
                </div>
                <div className="text-center">
                  <div className="text-base font-extrabold text-white">
                    {currentUser.eventsAttendedCount || attendedEvents.length}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Katıldığı Etkinlik</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab switcher */}
        <div className="border-t border-slate-800 px-5 pt-3 flex gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'reviews' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aldığın Değerlendirmeler ({userReviews.length})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'badges' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kazanılan Rozetler ({currentUser.badgeTags?.length || 0})
            {activeTab === 'badges' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-5 pt-3 border-t border-slate-800/60 bg-slate-900/40">
          {activeTab === 'reviews' ? (
            <div className="space-y-3">
              {userReviews.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
                  <p className="text-xs font-semibold">Henüz kimse sana puan vermedi.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Etkinliklere katılıp tamamlandıkça burada diğer katılımcıların yorumları yer alacak.
                  </p>
                </div>
              ) : (
                userReviews.map(rev => (
                  <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.fromUserAvatar}
                          alt={rev.fromUserName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{rev.fromUserName}</h4>
                          <span className="text-[10px] text-slate-400">{rev.eventTitle}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {rev.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {rev.comment && (
                      <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        "{rev.comment}"
                      </p>
                    )}

                    <div className="text-[10px] text-slate-500 text-right">
                      {rev.createdAt}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {currentUser.badgeTags?.map(badge => (
                <div
                  key={badge.tag}
                  className="p-3 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{badge.tag}</span>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    x{badge.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account Settings & Sign Out Card */}
      <div className="mt-4 p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <Mail className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Hesap Bilgisi</p>
            <p className="text-[11px] text-slate-400">{currentUser.email || currentUser.username}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-2 transition-colors"
          id="profile-signout-btn"
        >
          <LogOut className="w-4 h-4" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};
