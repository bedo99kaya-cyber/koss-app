import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DiscoverView } from './components/DiscoverView';
import { CreateEventView } from './components/CreateEventView';
import { MyEventsView } from './components/MyEventsView';
import { MessagesView } from './components/MessagesView';
import { ProfileView } from './components/ProfileView';
import { EventDetailModal } from './components/EventDetailModal';
import { UserProfileModal } from './components/UserProfileModal';
import { RatingModal } from './components/RatingModal';
import { DirectChatModal } from './components/DirectChatModal';
import { AuthScreen } from './components/AuthScreen';
import { AppLogo } from './components/AppLogo';

const MainAppContent: React.FC = () => {
  const { 
    isAuthenticated,
    authLoading,
    activeTab, 
    viewingEventId, 
    setViewingEventId,
    viewingUserId,
    setViewingUserId,
    ratingModalEvent,
    setRatingModalEvent,
    activeDirectChatUser,
    setActiveDirectChatUser,
    isMobileFrame,
  } = useApp();

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <AppLogo
          size="lg"
          layout="vertical"
          subtitle="Yükleniyor..."
          className="mb-3 animate-pulse"
        />
        <p className="text-xs text-slate-400 mt-1">Oturum bilgileri kontrol ediliyor</p>
        <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden mt-4">
          <div className="w-full h-full bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse" />
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login/Register Screen
  if (!isAuthenticated) {
    if (isMobileFrame) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-2 sm:p-6">
          <div className="w-full max-w-[420px] h-[860px] max-h-[95vh] bg-slate-900 rounded-[48px] p-3 ring-8 ring-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-slate-700 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80 ring-1 ring-slate-800" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>
            <div className="flex-1 rounded-[38px] overflow-hidden flex flex-col bg-slate-950 relative overflow-y-auto">
              <AuthScreen />
            </div>
          </div>
        </div>
      );
    }
    return <AuthScreen />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'discover':
        return <DiscoverView />;
      case 'my-events':
        return <MyEventsView />;
      case 'create':
        return <CreateEventView />;
      case 'messages':
        return <MessagesView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DiscoverView />;
    }
  };

  const appLayout = (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <Header />
      <main className="flex-1 w-full pt-2">
        {renderActiveTab()}
      </main>
      <BottomNav />

      {/* Global Modals */}
      {viewingEventId && (
        <EventDetailModal
          eventId={viewingEventId}
          onClose={() => setViewingEventId(null)}
        />
      )}

      {viewingUserId && (
        <UserProfileModal
          userId={viewingUserId}
          onClose={() => setViewingUserId(null)}
        />
      )}

      {ratingModalEvent && (
        <RatingModal
          event={ratingModalEvent}
          onClose={() => setRatingModalEvent(null)}
        />
      )}

      {activeDirectChatUser && (
        <DirectChatModal
          partner={activeDirectChatUser}
          onClose={() => setActiveDirectChatUser(null)}
        />
      )}
    </div>
  );

  if (isMobileFrame) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-2 sm:p-6">
        {/* Smartphone Bezel Wrapper */}
        <div className="w-full max-w-[420px] h-[860px] max-h-[95vh] bg-slate-900 rounded-[48px] p-3 ring-8 ring-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-slate-700 flex flex-col relative overflow-hidden">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80 ring-1 ring-slate-800" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>

          {/* Screen Content */}
          <div className="flex-1 rounded-[38px] overflow-hidden flex flex-col bg-slate-950 relative overflow-y-auto">
            {appLayout}
          </div>
        </div>
      </div>
    );
  }

  return appLayout;
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
