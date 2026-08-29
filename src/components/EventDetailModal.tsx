import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  ShieldCheck, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Clock, 
  Share2, 
  Trash2, 
  UserCheck, 
  UserX, 
  DollarSign, 
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface EventDetailModalProps {
  eventId: string;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ eventId, onClose }) => {
  const { 
    events, 
    currentUser, 
    joinEvent, 
    leaveEvent, 
    approveJoinRequest, 
    rejectJoinRequest, 
    completeEvent, 
    deleteEvent, 
    chatMessages, 
    sendChatMessage, 
    setViewingUserId, 
    setRatingModalEvent,
    setActiveDirectChatUser,
    setActiveTab: setGlobalActiveTab 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const [chatInput, setChatInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const event = events.find(e => e.id === eventId);
  if (!event) return null;

  const isOrganizer = event.organizerId === currentUser.id;
  const isParticipant = event.participantIds.includes(currentUser.id);
  const isPending = event.pendingRequests.some(u => u.id === currentUser.id);
  const isFull = event.participants.length >= event.criteria.capacity + 1; // +1 for organizer

  const eventMessages = chatMessages.filter(m => m.chatId === event.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(event.id, chatInput, 'event_group');
    setChatInput('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Koşş: ${event.title}`,
        text: `${event.title} - ${event.dateTime} tarihinde ${event.locationName} mekanında!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Etkinlik bağlantısı panoya kopyalandı!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Hero Header with Cover Image / Gradient */}
        <div className="relative h-44 sm:h-52 bg-slate-800 overflow-hidden shrink-0">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover brightness-75"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-orange-600 via-amber-600 to-yellow-500" />
          )}

          {/* Top Bar on Hero */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5">
                <CategoryIcon name={event.category} className="w-3.5 h-3.5 text-orange-400" />
                <span>{event.category}</span>
              </span>

              {event.urgentNeed && (
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-red-500/90 text-white shadow-lg animate-pulse">
                  ⚡ {event.urgentNeed}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                title="Paylaş"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Hero Bottom Meta */}
          <div className="absolute bottom-3 inset-x-3 text-white z-10">
            <h1 className="text-lg sm:text-xl font-black leading-tight drop-shadow-md">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-200 mt-1 flex-wrap drop-shadow">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                {event.dateTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                {event.district}, {event.city}
              </span>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />
        </div>

        {/* Tab Selector: Detaylar vs Grup Sohbeti */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-4 pt-1">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Etkinlik Detayları</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 relative ${
              activeTab === 'chat'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Grup Sohbeti ({eventMessages.length})</span>
            {eventMessages.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'details' ? (
            <>
              {/* Event Criteria Grid (Yaş, Cinsiyet, Kontenjan, Ücret) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Age Criteria */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-750">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Yaş Kriteri
                  </span>
                  <p className="text-xs font-extrabold text-white">
                    {event.criteria.ageRangeSpecified
                      ? `${event.criteria.minAge} - ${event.criteria.maxAge} Yaş`
                      : 'Fark Etmez / Serbest'}
                  </p>
                </div>

                {/* Gender Criteria */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-750">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Cinsiyet
                  </span>
                  <p className="text-xs font-extrabold text-orange-400">
                    {event.criteria.genderPreference}
                  </p>
                </div>

                {/* Capacity */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-750">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Kontenjan
                  </span>
                  <p className="text-xs font-extrabold text-white">
                    {event.participants.length} / {event.criteria.capacity + 1} Kişi
                  </p>
                </div>

                {/* Cost */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-750">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Ücret / Hesap
                  </span>
                  <p className="text-xs font-extrabold text-emerald-400 truncate">
                    {event.criteria.costType}
                  </p>
                </div>
              </div>

              {event.criteria.costNote && (
                <div className="text-xs px-3.5 py-2 rounded-xl bg-slate-800/50 border border-slate-750 text-slate-300 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{event.criteria.costNote}</span>
                </div>
              )}

              {/* Organizer Card (Transparent non-anonymous profile) */}
              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 flex items-center justify-between gap-3">
                <div 
                  className="flex items-center gap-3 cursor-pointer group flex-1"
                  onClick={() => setViewingUserId(event.organizer.id)}
                >
                  <div className="relative">
                    <img
                      src={event.organizer.avatar}
                      alt={event.organizer.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-orange-500/50 group-hover:ring-orange-400 transition-all"
                    />
                    {event.organizer.verified && (
                      <ShieldCheck className="w-4 h-4 text-sky-400 absolute -bottom-1 -right-1 bg-slate-900 rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-black text-white group-hover:text-orange-400 transition-colors">
                        {event.organizer.name}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold">
                        Organizatör
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {event.organizer.occupation} • {event.organizer.age} yaş
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {event.organizer.rating}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ({event.organizer.reviewCount} Değerlendirme)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isOrganizer && (
                    <button
                      onClick={() => setActiveDirectChatUser(event.organizer)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium"
                      title="Organizatöre Özel Mesaj"
                    >
                      <MessageCircle className="w-4 h-4 text-orange-400" />
                    </button>
                  )}
                  <button
                    onClick={() => setViewingUserId(event.organizer.id)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30"
                  >
                    Profili Gör
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-300">Etkinlik Açıklaması</h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-850/60 p-3.5 rounded-2xl border border-slate-800 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Venue & Location Details */}
              <div className="p-3.5 rounded-2xl bg-slate-850/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{event.locationName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {event.district}, {event.city}
                  </p>
                </div>
              </div>

              {/* Pending Join Requests (Visible to Organizer) */}
              {isOrganizer && event.pendingRequests && event.pendingRequests.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Katılım Onayı Bekleyenler ({event.pendingRequests.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {event.pendingRequests.map(userReq => (
                      <div
                        key={userReq.id}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div
                          className="flex items-center gap-2.5 cursor-pointer flex-1"
                          onClick={() => setViewingUserId(userReq.id)}
                        >
                          <img
                            src={userReq.avatar}
                            alt={userReq.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="text-xs font-bold text-white">{userReq.name}</h4>
                              <span className="text-[10px] text-amber-400 font-semibold">
                                ★ {userReq.rating}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {userReq.occupation} • {userReq.age} yaş ({userReq.gender})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approveJoinRequest(event.id, userReq.id)}
                            className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                            title="Onayla"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => rejectJoinRequest(event.id, userReq.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 text-xs"
                            title="Reddet"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmed Attendees List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-orange-400" />
                    Katılımcılar ({event.participants.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Kalan Kontenjan: {Math.max(0, event.criteria.capacity + 1 - event.participants.length)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {event.participants.map(participant => (
                    <div
                      key={participant.id}
                      onClick={() => setViewingUserId(participant.id)}
                      className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {participant.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            ★ {participant.rating} • {participant.occupation || `${participant.age} yaş`}
                          </span>
                        </div>
                      </div>

                      {participant.id === event.organizerId ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold shrink-0">
                          Organizatör
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold shrink-0">
                          Katılımcı
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {event.tags.map(t => (
                    <span
                      key={t}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-750"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Group Chat View */
            <div className="flex flex-col h-[340px]">
              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {eventMessages.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-orange-400" />
                    <p className="text-xs font-medium">Grup sohbeti başladı!</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Buluşma noktası, saat ve hazırlıklar hakkında ilk mesajı gönderin.
                    </p>
                  </div>
                ) : (
                  eventMessages.map(msg => {
                    const isMyMsg = msg.senderId === currentUser.id;
                    if (msg.isSystem) {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="text-[10px] px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isMyMsg ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMyMsg && (
                          <img
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            onClick={() => setViewingUserId(msg.senderId)}
                            className="w-6 h-6 rounded-full object-cover cursor-pointer mb-1"
                          />
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                            isMyMsg
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none shadow-md'
                              : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/80'
                          }`}
                        >
                          {!isMyMsg && (
                            <p className="text-[10px] font-bold text-orange-300 mb-0.5">
                              {msg.senderName}
                            </p>
                          )}
                          <p>{msg.text}</p>
                          <span
                            className={`text-[9px] block text-right mt-1 ${
                              isMyMsg ? 'text-orange-100' : 'text-slate-400'
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={
                    isParticipant
                      ? 'Grup için bir mesaj yazın...'
                      : 'Mesajlaşmak için önce etkinliğe katılın'
                  }
                  disabled={!isParticipant}
                  className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isParticipant || !chatInput.trim()}
                  className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white shadow-md shadow-orange-500/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          {event.status === 'completed' ? (
            <div className="w-full flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Bu etkinlik tamamlandı.
              </span>
              <button
                onClick={() => setRatingModalEvent(event)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Star className="w-4 h-4 fill-white" />
                Katılımcıları Puanla
              </button>
            </div>
          ) : isOrganizer ? (
            <div className="w-full flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                title="İlanı Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => completeEvent(event.id)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <HeartHandshake className="w-4 h-4" />
                Etkinliği Tamamla & Puan Ver
              </button>
            </div>
          ) : isParticipant ? (
            <div className="w-full flex items-center justify-between gap-2">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Katılımcısın
              </span>
              <button
                onClick={() => leaveEvent(event.id)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-semibold border border-slate-700"
              >
                Etkinlikten Ayrıl
              </button>
            </div>
          ) : isPending ? (
            <div className="w-full text-center py-1">
              <span className="text-xs px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Katılım İsteğin Organizatör Onayı Bekliyor
              </span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between gap-2">
              <div className="text-xs text-slate-400">
                Kontenjan: <b className="text-white">{event.participants.length}/{event.criteria.capacity + 1}</b>
              </div>
              <button
                onClick={() => joinEvent(event.id)}
                disabled={isFull}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/30 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                {event.criteria.approvalRequired
                  ? 'Katılma İsteği Gönder'
                  : 'Hemen Etkinliğe Katıl'}
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center space-y-3 animate-scaleUp">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Etkinliği Silmek İstiyor musun?</h4>
                <p className="text-xs text-slate-400 mt-1">Bu ilan ve grup sohbeti tamamen silinecektir.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    try {
                      setIsDeleting(true);
                      await deleteEvent(event.id);
                      setShowDeleteConfirm(false);
                      onClose();
                    } catch (err) {
                      console.error("Etkinlik silinirken hata:", err);
                      setShowDeleteConfirm(false);
                      onClose();
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? 'Siliniyor...' : 'Evet, İlanı Sil'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
