import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Star, 
  MapPin, 
  MessageCircle 
} from 'lucide-react';
import { User } from '../types';

interface DirectChatModalProps {
  partner: User;
  onClose: () => void;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({ partner, onClose }) => {
  const { currentUser, chatMessages, sendChatMessage, setViewingUserId } = useApp();
  const [inputText, setInputText] = useState('');

  // Consistent chat key for the two users
  const chatKey = [currentUser.id, partner.id].sort().join('_');
  const directMessages = chatMessages.filter(
    m => m.chatType === 'direct' && m.chatId === chatKey
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(chatKey, inputText, 'direct');
    setInputText('');
  };

  const QUICK_REPLIES = [
    'Selam! Etkinlik için konuşabilir miyiz?',
    'Mekana yaklaştım, 5 dakikaya oradayım.',
    'Buluşma çok keyifliydi, teşekkürler!',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg h-[540px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setViewingUserId(partner.id)}
          >
            <div className="relative">
              <img
                src={partner.avatar}
                alt={partner.name}
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-orange-500/40"
              />
              {partner.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 absolute -bottom-1 -right-1 bg-slate-900 rounded-full" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white hover:text-orange-400 transition-colors">
                  {partner.name}
                </h3>
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  {partner.rating}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {partner.occupation} • {partner.city}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/60">
          {directMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30 text-orange-400" />
              <p className="text-xs font-medium">{partner.name} ile özel sohbet</p>
              <p className="text-[11px] text-slate-600 mt-1 max-w-xs mx-auto">
                Etkinlik buluşması, detaylar veya tanışmak için doğrudan mesaj atabilirsiniz.
              </p>
            </div>
          ) : (
            directMessages.map(msg => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="w-6 h-6 rounded-full object-cover mb-1"
                    />
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                      isMine
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 ${
                        isMine ? 'text-orange-100' : 'text-slate-400'
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

        {/* Quick prompt suggestions */}
        {directMessages.length === 0 && (
          <div className="px-3 py-1.5 bg-slate-850/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto">
            {QUICK_REPLIES.map(text => (
              <button
                key={text}
                onClick={() => setInputText(text)}
                className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 shrink-0"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSend} className="p-3 bg-slate-850 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white shadow-md shadow-orange-500/30 transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
