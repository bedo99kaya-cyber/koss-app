import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarDays, 
  Users, 
  Star, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Sparkles, 
  PlusCircle, 
  HeartHandshake,
  UserCheck
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

export const MyEventsView: React.FC = () => {
  const { 
    events, 
    currentUser, 
    setViewingEventId, 
    setRatingModalEvent, 
    completeEvent,
    approveJoinRequest,
    rejectJoinRequest,
    setActiveTab,
    setViewingUserId
  } = useApp();

  const [subTab, setSubTab] = useState<'organized' | 'joined' | 'completed'>('organized');

  const organizedEvents = events.filter(e => e.organizerId === currentUser.id && e.status === 'active');
  const joinedEvents = events.filter(
    e => e.participantIds.includes(currentUser.id) && e.organizerId !== currentUser.id && e.status === 'active'
  );
  const completedEvents = events.filter(
    e => (e.organizerId === currentUser.id || e.participantIds.includes(currentUser.id)) && e.status === 'completed'
  );

  return (
    <div className="max-w-2xl mx-auto pb-24 px-3 sm:px-4 space-y-4 pt-1">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/90 rounded-2xl p-1 gap-1">
        <button
          onClick={() => setSubTab('organized')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'organized'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Açtığım İlanlar</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            subTab === 'organized' ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            {organizedEvents.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('joined')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'joined'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Katıldıklarım</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            subTab === 'joined' ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            {joinedEvents.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('completed')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'completed'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Geçmiş & Puanlama</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            subTab === 'completed' ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            {completedEvents.length}
          </span>
        </button>
      </div>

      {/* Content for SubTab */}
      {subTab === 'organized' && (
        <div className="space-y-3">
          {organizedEvents.length === 0 ? (
            <div className="p-8 sm:p-10 text-center bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto shadow-inner">
                <CalendarDays className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  Henüz planlanan bir etkinlik yok. İlk etkinliği sen oluştur!
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Halı saha, kahve, parti veya satranç için hemen bir ilan oluşturabilirsin.
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
          ) : (
            organizedEvents.map(event => (
              <div
                key={event.id}
                className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-orange-400 border border-slate-750">
                        {event.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        İlan Sahibi Sensin
                      </span>
                    </div>
                    <h3
                      onClick={() => setViewingEventId(event.id)}
                      className="text-sm font-bold text-white hover:text-orange-400 cursor-pointer transition-colors"
                    >
                      {event.title}
                    </h3>
                  </div>

                  <span className="text-xs text-slate-400 shrink-0 font-medium">
                    {event.dateTime}
                  </span>
                </div>

                {/* Location & Participants count */}
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    {event.locationName} ({event.district})
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {event.participants.length}/{event.criteria.capacity + 1} Katılımcı
                  </span>
                </div>

                {/* Pending approvals if any */}
                {event.pendingRequests && event.pendingRequests.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <span className="text-[11px] font-bold text-amber-300 block">
                      ⏳ Katılım Onayı Bekleyenler ({event.pendingRequests.length}):
                    </span>
                    <div className="space-y-1.5">
                      {event.pendingRequests.map(req => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between bg-slate-900/90 p-2 rounded-xl border border-slate-800"
                        >
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setViewingUserId(req.id)}
                          >
                            <img
                              src={req.avatar}
                              alt={req.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs font-bold text-white">{req.name}</span>
                            <span className="text-[10px] text-amber-400">★ {req.rating}</span>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => approveJoinRequest(event.id, req.id)}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-[10px] text-white font-bold"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => rejectJoinRequest(event.id, req.id)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] text-slate-400 hover:text-red-400"
                            >
                              Reddet
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
                  <button
                    onClick={() => setViewingEventId(event.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-orange-400" />
                    Detaylar & Sohbet
                  </button>

                  <button
                    onClick={() => completeEvent(event.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Etkinliği Tamamla & Puanla
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'joined' && (
        <div className="space-y-3">
          {joinedEvents.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <Users className="w-10 h-10 text-orange-400 mx-auto opacity-30" />
              <h3 className="text-sm font-bold text-white">Henüz bir etkinliğe katılmadın</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Keşfet sekmesindeki etkinlikleri inceleyerek sana uygun olanlara hemen katılabilirsin.
              </p>
              <button
                onClick={() => setActiveTab('discover')}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
              >
                Etkinlikleri Keşfet
              </button>
            </div>
          ) : (
            joinedEvents.map(event => (
              <div
                key={event.id}
                onClick={() => setViewingEventId(event.id)}
                className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg hover:border-slate-700 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-orange-400 border border-slate-750 inline-block mb-1">
                      {event.category}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {event.title}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium shrink-0">
                    {event.dateTime}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    {event.locationName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <img
                      src={event.organizer.avatar}
                      alt={event.organizer.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-slate-400 font-medium">
                      Org: {event.organizer.name.split(' ')[0]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Katılımın Onaylı
                  </span>
                  <button className="text-xs text-orange-400 font-bold flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Sohbete Git
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'completed' && (
        <div className="space-y-3">
          {completedEvents.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <Star className="w-10 h-10 text-amber-400 mx-auto opacity-30" />
              <h3 className="text-sm font-bold text-white">Henüz tamamlanan etkinlik yok</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Katıldığın etkinlikler bittiğinde buradan arkadaşlarına yıldız ve rozetler verebilirsin.
              </p>
            </div>
          ) : (
            completedEvents.map(event => {
              const alreadyRated = event.ratedByUsers?.includes(currentUser.id);

              return (
                <div
                  key={event.id}
                  className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-750 inline-block mb-1">
                        Tamamlandı
                      </span>
                      <h3 className="text-sm font-bold text-white">{event.title}</h3>
                    </div>
                    <span className="text-xs text-slate-500">{event.dateTime}</span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Mekan: {event.locationName} • {event.participants.length} Katılımcı
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    {alreadyRated ? (
                      <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Puanlama Yapıldı (Profil Güncellendi)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Henüz puanlamadın
                      </span>
                    )}

                    <button
                      onClick={() => setRatingModalEvent(event)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      {alreadyRated ? 'Puanları Düzenle' : 'Katılımcıları Puanla'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
