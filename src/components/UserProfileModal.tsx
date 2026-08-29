import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Award, 
  Users, 
  CheckCircle2, 
  Instagram, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { User } from '../types';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose }) => {
  const { users, reviews, events, currentUser, setActiveDirectChatUser } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'reviews' | 'badges' | 'events'>('reviews');

  const user = users.find(u => u.id === userId);
  if (!user) return null;

  const userReviews = reviews.filter(r => r.toUserId === user.id);
  const userEvents = events.filter(e => e.organizerId === user.id);
  const attendedEvents = events.filter(e => e.participantIds.includes(user.id) && e.organizerId !== user.id);

  const isSelf = user.id === currentUser.id;

  const handleStartChat = () => {
    setActiveDirectChatUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Cover / Header Banner */}
        <div className="relative h-28 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-4 flex items-start justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-300" />
            Doğrulanmış Profil
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="px-5 pb-3 pt-0 relative -mt-12">
          <div className="flex items-end justify-between">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-900 shadow-xl"
              />
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-sky-500 text-white ring-2 ring-slate-900" title="Kimliği Doğrulanmış Profil">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mb-1">
              {!isSelf ? (
                <button
                  onClick={handleStartChat}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-transform active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Mesaj Gönder
                </button>
              ) : (
                <span className="text-xs px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/30">
                  Senin Profilin
                </span>
              )}
            </div>
          </div>

          {/* Name & Basic Info */}
          <div className="mt-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">{user.name}</h2>
              <span className="text-xs text-slate-400 font-medium">{user.username}</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {user.occupation}
              </span>
              <span>•</span>
              <span>{user.age} yaş ({user.gender})</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                {user.city}
              </span>
            </div>

            {user.bio && (
              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed bg-slate-850 p-3 rounded-xl border border-slate-800">
                "{user.bio}"
              </p>
            )}

            {/* Interest Tags */}
            {user.interests && user.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {user.interests.map(interest => (
                  <span
                    key={interest}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Trust Score & Stats Banner */}
          <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-750">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-base">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{user.rating}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{user.reviewCount} Değerlendirme</p>
            </div>
            <div className="text-center border-x border-slate-700">
              <span className="font-extrabold text-base text-white">{user.eventsOrganizedCount || userEvents.length}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Açılan İlan</p>
            </div>
            <div className="text-center">
              <span className="font-extrabold text-base text-white">{user.eventsAttendedCount || attendedEvents.length}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Katılınan</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-4 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('reviews')}
            className={`pb-2.5 transition-colors relative ${
              activeSubTab === 'reviews'
                ? 'text-orange-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Değerlendirmeler ({userReviews.length})
            {activeSubTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('badges')}
            className={`pb-2.5 transition-colors relative ${
              activeSubTab === 'badges'
                ? 'text-orange-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Topluluk Rozetleri ({user.badgeTags?.length || 0})
            {activeSubTab === 'badges' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('events')}
            className={`pb-2.5 transition-colors relative ${
              activeSubTab === 'events'
                ? 'text-orange-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Etkinlikleri ({userEvents.length})
            {activeSubTab === 'events' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeSubTab === 'reviews' && (
            <div className="space-y-2.5">
              {userReviews.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
                  <p className="text-xs font-medium">Henüz değerlendirme yapılmamış.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Etkinlikler bittikten sonra diğer katılımcıların puanları burada sergilenir.
                  </p>
                </div>
              ) : (
                userReviews.map(rev => (
                  <div key={rev.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.fromUserAvatar}
                          alt={rev.fromUserName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{rev.fromUserName}</h4>
                          <p className="text-[10px] text-slate-400">{rev.eventTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
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
                            className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {rev.comment && (
                      <p className="text-xs text-slate-300 leading-relaxed italic">
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
          )}

          {activeSubTab === 'badges' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Katıldığı ve düzenlediği etkinliklerin ardından diğer katılımcılardan topladığı övgü rozetleri:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {user.badgeTags?.map(badge => (
                  <div
                    key={badge.tag}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-semibold text-slate-200">{badge.tag}</span>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      x{badge.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'events' && (
            <div className="space-y-2">
              {userEvents.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Henüz aktif veya geçmiş ilan açılmamış.
                </p>
              ) : (
                userEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{ev.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {ev.dateTime} • {ev.district}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      ev.status === 'completed'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {ev.status === 'completed' ? 'Tamamlandı' : 'Aktif'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
