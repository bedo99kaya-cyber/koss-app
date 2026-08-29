import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Star, 
  Award, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ThumbsUp, 
  HeartHandshake 
} from 'lucide-react';
import { EventItem, User } from '../types';
import { POPULAR_RATING_TAGS } from '../data/mockData';

interface RatingModalProps {
  event: EventItem;
  onClose: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ event, onClose }) => {
  const { currentUser, submitReview, triggerConfetti } = useApp();

  // Determine people the current user can rate (excluding themselves)
  const rateableUsers: User[] = [
    event.organizer,
    ...event.participants.filter(p => p.id !== event.organizerId),
  ].filter(u => u && u.id !== currentUser.id);

  // De-duplicate rateable users by ID
  const uniqueRateableUsers = rateableUsers.filter(
    (u, index, self) => index === self.findIndex(t => t.id === u.id)
  );

  const [selectedUserIndex, setSelectedUserIndex] = useState<number>(0);
  const [ratingsState, setRatingsState] = useState<
    Record<string, { rating: number; tags: string[]; comment: string; submitted: boolean }>
  >(() => {
    const init: Record<string, { rating: number; tags: string[]; comment: string; submitted: boolean }> = {};
    uniqueRateableUsers.forEach(u => {
      init[u.id] = { rating: 5, tags: ['Dakik', 'Güleryüzlü & Pozitif'], comment: '', submitted: false };
    });
    return init;
  });

  const currentUserToRate = uniqueRateableUsers[selectedUserIndex];

  if (!currentUserToRate) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Değerlendirilecek Başka Katılımcı Yok</h3>
          <p className="text-xs text-slate-400 mb-4">Bu etkinlikte puanlayabileceğin başka katılımcı bulunmuyor.</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-white text-xs font-bold"
          >
            Kapat
          </button>
        </div>
      </div>
    );
  }

  const currentFormState = ratingsState[currentUserToRate.id] || {
    rating: 5,
    tags: [],
    comment: '',
    submitted: false,
  };

  const handleStarClick = (stars: number) => {
    setRatingsState(prev => ({
      ...prev,
      [currentUserToRate.id]: {
        ...prev[currentUserToRate.id],
        rating: stars,
      },
    }));
  };

  const handleTagToggle = (tag: string) => {
    setRatingsState(prev => {
      const currentTags = prev[currentUserToRate.id]?.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      return {
        ...prev,
        [currentUserToRate.id]: {
          ...prev[currentUserToRate.id],
          tags: newTags,
        },
      };
    });
  };

  const handleCommentChange = (comment: string) => {
    setRatingsState(prev => ({
      ...prev,
      [currentUserToRate.id]: {
        ...prev[currentUserToRate.id],
        comment,
      },
    }));
  };

  const handleSubmitCurrent = (e: React.FormEvent) => {
    e.preventDefault();

    submitReview({
      eventId: event.id,
      eventTitle: event.title,
      toUserId: currentUserToRate.id,
      rating: currentFormState.rating,
      tags: currentFormState.tags,
      comment: currentFormState.comment,
    });

    setRatingsState(prev => ({
      ...prev,
      [currentUserToRate.id]: {
        ...prev[currentUserToRate.id],
        submitted: true,
      },
    }));

    // If there are more unrated users, move to next
    const nextIndex = uniqueRateableUsers.findIndex((u, i) => i > selectedUserIndex && !ratingsState[u.id]?.submitted);
    if (nextIndex !== -1) {
      setSelectedUserIndex(nextIndex);
    } else {
      triggerConfetti();
    }
  };

  const allSubmitted = uniqueRateableUsers.every(u => ratingsState[u.id]?.submitted);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-yellow-200" />
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Etkinlik Değerlendirmesi</h2>
              <p className="text-[11px] text-orange-100 truncate max-w-xs">{event.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User selector carousel if multiple participants */}
        {uniqueRateableUsers.length > 1 && (
          <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Kimi puanlıyorsun:</span>
            {uniqueRateableUsers.map((u, idx) => {
              const isSubmitted = ratingsState[u.id]?.submitted;
              const isSelected = selectedUserIndex === idx;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserIndex(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-md'
                      : isSubmitted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
                  <span>{u.name.split(' ')[0]}</span>
                  {isSubmitted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {currentFormState.submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-white">
                {currentUserToRate.name} için değerlendirmen kaydedildi!
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Verdiğin puan ve rozetler {currentUserToRate.name}'in profil güvenilirlik puanına eklendi.
              </p>

              {!allSubmitted ? (
                <div className="pt-3">
                  <button
                    onClick={() => {
                      const next = uniqueRateableUsers.findIndex(u => !ratingsState[u.id]?.submitted);
                      if (next !== -1) setSelectedUserIndex(next);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/30"
                  >
                    Sıradaki Katılımcıyı Puanla →
                  </button>
                </div>
              ) : (
                <div className="pt-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-500/30"
                  >
                    Harika, Tamamla ve Kapat ✨
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitCurrent} className="space-y-4">
              {/* Target User Banner */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <img
                  src={currentUserToRate.avatar}
                  alt={currentUserToRate.name}
                  className="w-13 h-13 rounded-2xl object-cover ring-2 ring-orange-500/60 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white truncate">{currentUserToRate.name}</h3>
                    {currentUserToRate.id === event.organizerId && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                        Organizatör
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentUserToRate.occupation} • Mevcut Puan: ★ {currentUserToRate.rating}
                  </p>
                </div>
              </div>

              {/* Star Rating selector */}
              <div className="text-center py-2 bg-slate-850/80 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-2">Puanınız (1 - 5 Yıldız)</span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => handleStarClick(star)}
                      className="p-1 hover:scale-125 transition-transform active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= currentFormState.rating
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-700 hover:text-slate-500'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-extrabold text-amber-400 mt-1 block">
                  {currentFormState.rating === 5
                    ? '🌟 Mükemmel & Kusursuz'
                    : currentFormState.rating === 4
                    ? '👍 Çok İyi'
                    : currentFormState.rating === 3
                    ? '👌 İyi'
                    : currentFormState.rating === 2
                    ? '😐 İdare Eder'
                    : '👎 Olumsuz'}
                </span>
              </div>

              {/* Compliment / Badge Tags */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-orange-400" />
                  Övgü Rozetleri Seçin (Birden fazla seçilebilir)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_RATING_TAGS.map(tag => {
                    const isSelected = currentFormState.tags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-sm'
                            : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:text-slate-200'
                        }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Written Review Comment */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Yorum & Değerlendirme Notu (İsteğe bağlı)
                </label>
                <textarea
                  value={currentFormState.comment}
                  onChange={e => handleCommentChange(e.target.value)}
                  placeholder={`${currentUserToRate.name} ile buluşma nasıldı? Vaktinde geldi mi, ortam keyifli miydi?...`}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
                >
                  Daha Sonra Puanla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  Değerlendirmeyi Gönder
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
