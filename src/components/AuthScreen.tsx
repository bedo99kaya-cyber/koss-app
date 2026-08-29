import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AppLogo } from './AppLogo';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Users,
  ShieldCheck,
  Camera,
  Upload,
  X,
  ImageIcon
} from 'lucide-react';
import { CITIES } from '../data/mockData';

// Helper to generate stylish initials avatar placeholder
export const getInitialsAvatar = (fullName: string): string => {
  const cleanName = fullName.trim() || 'K';
  const parts = cleanName.split(' ').filter(Boolean);
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : cleanName.slice(0, 2).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=f97316&color=ffffff&size=256&bold=true&font-size=0.45`;
};

// Helper to compress/downscale user photo to a lightweight data URL
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
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
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Görsel okunamadı'));
    };
    reader.onerror = (error) => reject(error);
  });
};

export const AuthScreen: React.FC = () => {
  const { loginWithEmail, registerWithEmail, authLoading, authError, setAuthError } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [age, setAge] = useState<number | ''>(24);
  const [gender, setGender] = useState<'Erkek' | 'Kadın' | 'Belirtilmemiş'>('Kadın');
  const [city, setCity] = useState('İstanbul');
  const [occupation, setOccupation] = useState('');
  
  // Custom photo upload state (optional)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
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

  // Handle mode switch
  const handleModeChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrors({});
    if (setAuthError) setAuthError(null);
    setPhotoError(null);
  };

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, WEBP vb.).');
      return;
    }

    setPhotoError(null);
    setIsProcessingPhoto(true);
    try {
      const base64 = await compressImageFile(file);
      setUploadedPhoto(base64);
    } catch {
      setPhotoError('Fotoğraf işlenirken bir hata oluştu. Lütfen başka bir görsel deneyin.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Remove uploaded photo
  const handleRemovePhoto = () => {
    setUploadedPhoto(null);
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!loginEmail.trim()) {
      newErrors.loginEmail = 'Bu alan zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      newErrors.loginEmail = 'Lütfen geçerli bir e-posta adresi girin';
    }

    if (!loginPassword) {
      newErrors.loginPassword = 'Bu alan zorunludur';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await loginWithEmail(loginEmail.trim(), loginPassword);
  };

  // Submit Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Bu alan zorunludur';
    }

    if (!regEmail.trim()) {
      newErrors.regEmail = 'Bu alan zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      newErrors.regEmail = 'Geçerli bir e-posta adresi girin';
    }

    if (!regPassword) {
      newErrors.regPassword = 'Bu alan zorunludur';
    } else if (regPassword.length < 6) {
      newErrors.regPassword = 'Şifre en az 6 karakter olmalıdır';
    }

    if (age === '' || isNaN(Number(age)) || Number(age) < 16 || Number(age) > 99) {
      newErrors.age = 'Geçerli bir yaş girin (16-99)';
    }

    if (!city.trim()) {
      newErrors.city = 'Şehir seçimi zorunludur';
    }

    if (!occupation.trim()) {
      newErrors.occupation = 'Bu alan zorunludur';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // If photo is uploaded, use it; otherwise generate neutral initials avatar
    const finalAvatar = uploadedPhoto || getInitialsAvatar(name.trim());

    await registerWithEmail({
      name: name.trim(),
      email: regEmail.trim(),
      password: regPassword,
      age: Number(age),
      gender,
      city,
      occupation: occupation.trim(),
      avatar: finalAvatar,
    });
  };

  // Compute live preview avatar
  const previewAvatarUrl = uploadedPhoto || getInitialsAvatar(name || 'Kullanıcı');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 py-8 relative overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <AppLogo
            size="lg"
            layout="vertical"
            showSubtitle={false}
            className="mb-1"
          />
          <p className="text-xs text-slate-400 mt-2 max-w-xs">
            İstediğin aktiviteye arkadaş bul, katıl, puanla ve sosyalleş!
          </p>
        </div>

        {/* Tab Switcher: Giriş Yap / Kayıt Ol */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
            id="tab-login-btn"
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('register')}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
            id="tab-register-btn"
          >
            Hesap Oluştur
          </button>
        </div>

        {/* Error Alert Message */}
        {authError && (
          <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{authError}</div>
          </div>
        )}

        {/* --- 1. LOGIN FORM --- */}
        {mode === 'login' ? (
          <form noValidate onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                E-posta Adresi
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => {
                  setLoginEmail(e.target.value);
                  if (errors.loginEmail) clearError('loginEmail');
                }}
                placeholder="ornek@mail.com"
                className={`w-full px-3.5 py-2.5 bg-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                  errors.loginEmail
                    ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                    : 'border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                }`}
                id="login-email-input"
              />
              {errors.loginEmail && (
                <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                  <span>* {errors.loginEmail}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-400" />
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => {
                    setLoginPassword(e.target.value);
                    if (errors.loginPassword) clearError('loginPassword');
                  }}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 bg-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all pr-10 ${
                    errors.loginPassword
                      ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                      : 'border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  }`}
                  id="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.loginPassword && (
                <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                  <span>* {errors.loginPassword}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 mt-2"
              id="login-submit-btn"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* --- 2. REGISTER FORM --- */
          <form noValidate onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* Ad Soyad */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-orange-400" />
                Ad Soyad
              </label>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) clearError('name');
                }}
                placeholder="Örn: Ayşe Yılmaz"
                className={`w-full px-3 py-2 bg-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                  errors.name
                    ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                    : 'border border-slate-700 focus:border-orange-500'
                }`}
                id="reg-name-input"
              />
              {errors.name && (
                <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                  <span>* {errors.name}</span>
                </p>
              )}
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange-400" />
                  E-posta
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => {
                    setRegEmail(e.target.value);
                    if (errors.regEmail) clearError('regEmail');
                  }}
                  placeholder="ornek@mail.com"
                  className={`w-full px-3 py-2 bg-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                    errors.regEmail
                      ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                      : 'border border-slate-700 focus:border-orange-500'
                  }`}
                  id="reg-email-input"
                />
                {errors.regEmail && (
                  <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                    <span>* {errors.regEmail}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-orange-400" />
                  Şifre
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => {
                    setRegPassword(e.target.value);
                    if (errors.regPassword) clearError('regPassword');
                  }}
                  placeholder="Min 6 karakter"
                  className={`w-full px-3 py-2 bg-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                    errors.regPassword
                      ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                      : 'border border-slate-700 focus:border-orange-500'
                  }`}
                  id="reg-password-input"
                />
                {errors.regPassword && (
                  <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                    <span>* {errors.regPassword}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Yaş & Cinsiyet */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  Yaş
                </label>
                <input
                  type="number"
                  min={16}
                  max={99}
                  value={age}
                  onChange={e => {
                    setAge(e.target.value === '' ? '' : Number(e.target.value));
                    if (errors.age) clearError('age');
                  }}
                  className={`w-full px-3 py-2 bg-slate-800 rounded-xl text-xs text-white focus:outline-none transition-all ${
                    errors.age
                      ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                      : 'border border-slate-700 focus:border-orange-500'
                  }`}
                  id="reg-age-input"
                />
                {errors.age && (
                  <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                    <span>* {errors.age}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-orange-400" />
                  Cinsiyet
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  id="reg-gender-select"
                >
                  <option value="Kadın">Kadın</option>
                  <option value="Erkek">Erkek</option>
                  <option value="Belirtilmemiş">Belirtilmemiş</option>
                </select>
              </div>
            </div>

            {/* Şehir & Meslek */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  Şehir
                </label>
                <select
                  value={city}
                  onChange={e => {
                    setCity(e.target.value);
                    if (errors.city) clearError('city');
                  }}
                  className={`w-full px-3 py-2 bg-slate-800 rounded-xl text-xs text-white focus:outline-none transition-all ${
                    errors.city
                      ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                      : 'border border-slate-700 focus:border-orange-500'
                  }`}
                  id="reg-city-select"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                    <span>* {errors.city}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-orange-400" />
                  Meslek
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={e => {
                    setOccupation(e.target.value);
                    if (errors.occupation) clearError('occupation');
                  }}
                  placeholder="Örn: Mimar, Öğrenci"
                  className={`w-full px-3 py-2 bg-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                    errors.occupation
                      ? 'border border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                      : 'border border-slate-700 focus:border-orange-500'
                  }`}
                  id="reg-occupation-input"
                />
                {errors.occupation && (
                  <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                    <span>* {errors.occupation}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Fotoğraf Yükleme (Opsiyonel & Kişisel Görsel Seçimi) */}
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/90">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-orange-400" />
                  <span>Profil Fotoğrafı</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  İsteğe Bağlı
                </span>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-file-input"
              />

              <div className="flex items-center gap-3">
                {/* Avatar / Photo Preview */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-orange-500/40 bg-slate-800 flex items-center justify-center shadow-md">
                    {isProcessingPhoto ? (
                      <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    ) : (
                      <img
                        src={previewAvatarUrl}
                        alt="Avatar Önizleme"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {uploadedPhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors"
                      title="Fotoğrafı Kaldır"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Upload action info and button */}
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingPhoto}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                    id="choose-photo-btn"
                  >
                    <Upload className="w-3.5 h-3.5 text-orange-400" />
                    <span>{uploadedPhoto ? 'Fotoğrafı Değiştir' : 'Fotoğraf Seç / Yükle'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight flex items-center gap-1">
                    <ImageIcon className="w-2.5 h-2.5 text-slate-500" />
                    {uploadedPhoto 
                      ? 'Özel fotoğrafınız seçildi.' 
                      : 'Yüklemezseniz adınızın baş harfleri kullanılır.'}
                  </p>
                </div>
              </div>

              {photoError && (
                <p className="text-[11px] text-red-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {photoError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={authLoading || isProcessingPhoto}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 mt-3"
              id="reg-submit-btn"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Kaydı Tamamla & Başla</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <p className="text-[11px] text-slate-500 text-center mt-6">
          Koşş ile güvenli, puanlı ve doğrulanmış profillerle sosyalleşin.
        </p>
      </div>
    </div>
  );
};
