import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCheck, 
  Bell, 
  Calendar, 
  Star, 
  MessageSquare, 
  UserCheck, 
  Sparkles 
} from 'lucide-react';

interface NotificationDrawerProps {
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onClose }) => {
  const { 
    currentUser, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    setViewingEventId,
    setRatingModalEvent,
    events
  } = useApp();

  const userNotifications = notifications.filter(n => n.userId === currentUser.id);

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.type === 'event_rate_invite' && notif.eventId) {
      const targetEv = events.find(e => e.id === notif.eventId);
      if (targetEv) setRatingModalEvent(targetEv);
      onClose();
    } else if (notif.eventId) {
      setViewingEventId(notif.eventId);
      onClose();
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'event_rate_invite':
      case 'new_review':
        return <Star className="w-4 h-4 text-amber-400" />;
      case 'join_request':
        return <UserCheck className="w-4 h-4 text-orange-400" />;
      case 'request_accepted':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 h-full border-l border-slate-800 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-bold text-white">Bildirimler</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {userNotifications.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {userNotifications.some(n => !n.read) && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tümünü Oku
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Henüz bir bildirim yok</p>
              <p className="text-xs text-slate-600 mt-1">
                Etkinliklerine katılım olduğunda veya puanlama geldiğinde burada görünecek.
              </p>
            </div>
          ) : (
            userNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !notif.read
                    ? 'bg-slate-800/90 border-orange-500/40 shadow-sm'
                    : 'bg-slate-850/50 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 shrink-0">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{notif.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
