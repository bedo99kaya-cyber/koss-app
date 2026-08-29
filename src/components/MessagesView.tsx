import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageCircle, 
  Users, 
  ShieldCheck, 
  Star, 
  ChevronRight, 
  MessageSquare
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

export const MessagesView: React.FC = () => {
  const { 
    currentUser, 
    users, 
    events, 
    chatMessages, 
    setViewingEventId, 
    setActiveDirectChatUser 
  } = useApp();

  const [messageTab, setMessageTab] = useState<'groups' | 'direct'>('groups');

  // Events that current user is a part of
  const myEventsWithChats = events.filter(
    e => e.participantIds.includes(currentUser.id) || e.organizerId === currentUser.id
  );

  // Direct chat partners: only users with at least 1 message sent/received with currentUser
  const directConversations = users
    .filter(u => u.id !== currentUser.id)
    .map(user => {
      const chatKey = [currentUser.id, user.id].sort().join('_');
      const dMsgs = chatMessages.filter(
        m => m.chatType === 'direct' && m.chatId === chatKey
      );
      const lastMsg = dMsgs[dMsgs.length - 1];
      return {
        user,
        lastMsg,
        hasMessages: dMsgs.length > 0,
      };
    })
    .filter(item => item.hasMessages);

  return (
    <div className="max-w-2xl mx-auto pb-24 px-3 sm:px-4 space-y-4 pt-1">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/90 rounded-2xl p-1 gap-1">
        <button
          onClick={() => setMessageTab('groups')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            messageTab === 'groups'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Etkinlik Grupları ({myEventsWithChats.length})</span>
        </button>

        <button
          onClick={() => setMessageTab('direct')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            messageTab === 'direct'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Özel Mesajlar ({directConversations.length})</span>
        </button>
      </div>

      {/* Group Chats List */}
      {messageTab === 'groups' && (
        <div className="space-y-2.5">
          {myEventsWithChats.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <MessageCircle className="w-10 h-10 text-orange-400 mx-auto opacity-30" />
              <h3 className="text-sm font-bold text-white">Henüz bir grup sohbetin yok</h3>
              <p className="text-xs text-slate-400">
                Bir etkinliğe katıldığında veya ilan açtığında katılımcılarla otomatik grup sohbetin açılır.
              </p>
            </div>
          ) : (
            myEventsWithChats.map(event => {
              const msgs = chatMessages.filter(m => m.chatId === event.id);
              const lastMsg = msgs[msgs.length - 1];

              return (
                <div
                  key={event.id}
                  onClick={() => setViewingEventId(event.id)}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-orange-400 shrink-0">
                      <CategoryIcon name={event.category} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                          {event.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {event.participants.length} üye
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {lastMsg ? `${lastMsg.senderName.split(' ')[0]}: ${lastMsg.text}` : 'Grup sohbetine mesaj gönderin...'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {lastMsg && (
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {lastMsg.timestamp}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Direct 1-on-1 Messages List */}
      {messageTab === 'direct' && (
        <div className="space-y-2.5">
          {directConversations.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <MessageSquare className="w-10 h-10 text-orange-400 mx-auto opacity-30" />
              <h3 className="text-sm font-bold text-white">Henüz özel bir mesajın yok</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Etkinlik ilanlarındaki organizatörlerin veya katılımcıların profilini açarak "Mesaj Gönder" butonuyla doğrudan sohbet başlatabilirsin.
              </p>
            </div>
          ) : (
            directConversations.map(({ user, lastMsg }) => (
              <div
                key={user.id}
                onClick={() => setActiveDirectChatUser(user)}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-all group shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-700"
                    />
                    {user.verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400 absolute -bottom-1 -right-1 bg-slate-900 rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                        {user.name}
                      </h4>
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {user.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {lastMsg ? lastMsg.text : `${user.occupation} • ${user.city}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {lastMsg && (
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {lastMsg.timestamp}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
