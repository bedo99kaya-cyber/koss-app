import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, EventItem, Review, ChatMessage, NotificationItem } from '../types';
import { db, auth } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  limit,
  arrayUnion,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import confetti from 'canvas-confetti';

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: 'Erkek' | 'Kadın' | 'Belirtilmemiş';
  city: string;
  occupation: string;
  avatar?: string;
}

interface AppContextType {
  // Auth State
  authUser: FirebaseUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  registerWithEmail: (data: RegisterUserData) => Promise<boolean>;
  logout: () => Promise<void>;

  currentUser: User;
  users: User[];
  events: EventItem[];
  reviews: Review[];
  chatMessages: ChatMessage[];
  notifications: NotificationItem[];
  activeTab: 'discover' | 'my-events' | 'create' | 'messages' | 'profile';
  setActiveTab: (tab: 'discover' | 'my-events' | 'create' | 'messages' | 'profile') => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  
  // Modals & Navigation
  viewingEventId: string | null;
  setViewingEventId: (id: string | null) => void;
  viewingUserId: string | null;
  setViewingUserId: (id: string | null) => void;
  ratingModalEvent: EventItem | null;
  setRatingModalEvent: (event: EventItem | null) => void;
  activeDirectChatUser: User | null;
  setActiveDirectChatUser: (user: User | null) => void;

  // Actions
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
  createEvent: (newEvent: Omit<EventItem, 'id' | 'organizerId' | 'organizer' | 'participantIds' | 'participants' | 'pendingRequests' | 'createdAt'>) => string;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  approveJoinRequest: (eventId: string, userId: string) => Promise<void>;
  rejectJoinRequest: (eventId: string, userId: string) => Promise<void>;
  completeEvent: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  sendChatMessage: (chatId: string, text: string, chatType: 'event_group' | 'direct') => Promise<void>;
  submitReview: (reviewData: {
    eventId: string;
    eventTitle: string;
    toUserId: string;
    rating: number;
    tags: string[];
    comment: string;
  }) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  resetAllData: () => Promise<void>;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Firestore collection names
const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  REVIEWS: 'reviews',
  CHAT_MESSAGES: 'chat_messages',
  NOTIFICATIONS: 'notifications',
};

// Translate Firebase Auth error messages into friendly Turkish
const getTurkishAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Geçerli bir e-posta adresi giriniz.';
    case 'auth/user-disabled':
      return 'Bu kullanıcı hesabı askıya alınmıştır.';
    case 'auth/user-not-found':
      return 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-posta adresi veya şifre hatalı. Lütfen tekrar deneyin.';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kullanımda. Giriş yapmayı deneyin.';
    case 'auth/weak-password':
      return 'Şifreniz çok zayıf. En az 6 karakter olmalıdır.';
    case 'auth/network-request-failed':
      return 'İnternet bağlantınızı kontrol ediniz.';
    case 'auth/too-many-requests':
      return 'Çok fazla başarısız deneme yaptınız. Lütfen bir süre sonra tekrar deneyin.';
    default:
      return 'Bir kimlik doğrulama hatası oluştu. Lütfen tekrar deneyin.';
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Firestore application data states
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [activeTab, setActiveTab] = useState<'discover' | 'my-events' | 'create' | 'messages' | 'profile'>('discover');
  const [selectedCity, setSelectedCity] = useState<string>('İstanbul');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  const [viewingEventId, setViewingEventId] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [ratingModalEvent, setRatingModalEvent] = useState<EventItem | null>(null);
  const [activeDirectChatUser, setActiveDirectChatUser] = useState<User | null>(null);

  // Confetti helper
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b00', '#f97316', '#3b82f6', '#10b981', '#ec4899'],
      });
    } catch {
      // ignore
    }
  };

  // 1. Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(false); // Kilitlenmeyi önlemek icin hemen false yapıyoruz
      setAuthUser(user);
      if (user) {
        // Check if user exists in Firestore, if not create basic doc
        try {
          const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
          const userSnap = await getDoc(userDocRef);
          if (!userSnap.exists()) {
            const fallbackUser: User = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
              email: user.email || '',
              username: '@' + (user.email?.split('@')[0] || 'user'),
              avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
              bio: 'Koşş topluluğu üyesi.',
              age: 25,
              gender: 'Belirtilmemiş',
              city: 'İstanbul',
              occupation: 'Üye',
              interests: ['Sosyal', 'Etkinlik'],
              rating: 5.0,
              reviewCount: 0,
              badgeTags: [{ tag: 'Yeni Üye', count: 1 }],
              verified: true,
              eventsOrganizedCount: 0,
              eventsAttendedCount: 0,
              joinedAt: 'Yeni katıldı',
            };
            await setDoc(userDocRef, fallbackUser);
          }
        } catch {
          // ignore offline
        }
      }
      setAuthLoading(false);
    });

    const timeout = setTimeout(() => { setAuthLoading(false); }, 1500);
    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);

  // Compute active user
  const currentUser: User = 
    users.find(u => u.id === authUser?.uid) ||
    (authUser
      ? {
          id: authUser.uid,
          name: authUser.displayName || authUser.email?.split('@')[0] || 'Kullanıcı',
          email: authUser.email || '',
          username: '@' + (authUser.email?.split('@')[0] || 'user'),
          avatar: authUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.displayName || 'K')}&background=f97316&color=ffffff&size=256&bold=true&font-size=0.45`,
          bio: 'Koşş topluluğuna yeni katıldım!',
          age: 24,
          gender: 'Belirtilmemiş',
          city: 'İstanbul',
          occupation: 'Üye',
          interests: ['Sosyal', 'Etkinlik'],
          rating: 5.0,
          reviewCount: 0,
          badgeTags: [{ tag: 'Yeni Üye', count: 1 }],
          verified: true,
          eventsOrganizedCount: 0,
          eventsAttendedCount: 0,
          joinedAt: 'Yeni katıldı',
        }
      : users[0] || {
          id: 'guest',
          name: 'Misafir',
          username: '@misafir',
          avatar: 'https://ui-avatars.com/api/?name=M&background=f97316&color=ffffff&size=256&bold=true&font-size=0.45',
          bio: 'Hoş geldiniz!',
          age: 20,
          gender: 'Belirtilmemiş',
          city: 'İstanbul',
          occupation: 'Misafir',
          interests: [],
          rating: 5.0,
          reviewCount: 0,
          badgeTags: [],
          verified: false,
          eventsOrganizedCount: 0,
          eventsAttendedCount: 0,
          joinedAt: 'Misafir',
        });

  // Active chat ID for targeted message listening
  const activeChatId = viewingEventId 
    ? viewingEventId 
    : activeDirectChatUser 
      ? [currentUser.id, activeDirectChatUser.id].sort().join('_') 
      : null;

  // 2. Real-time Firestore Listeners (Optimized & Scoped)
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, COLLECTIONS.USERS),
        snapshot => {
          const data = snapshot.docs.map(d => d.data() as User);
          setUsers(data);
        },
        () => {}
      );
      return () => unsub();
    } catch {
      return () => {};
    }
  }, []);

  // Events: filtered by city and active status, limited to 50
  useEffect(() => {
    try {
      let q = query(
        collection(db, COLLECTIONS.EVENTS),
        where('status', '==', 'active'),
        limit(50)
      );

      if (selectedCity && selectedCity !== 'Tüm Şehirler') {
        q = query(
          collection(db, COLLECTIONS.EVENTS),
          where('city', '==', selectedCity),
          where('status', '==', 'active'),
          limit(50)
        );
      }

      const unsub = onSnapshot(
        q,
        snapshot => {
          const data = snapshot.docs.map(d => d.data() as EventItem);
          setEvents(data);
        },
        (error) => {
          console.error("Events listener query fallback:", error);
          const fallbackQuery = query(
            collection(db, COLLECTIONS.EVENTS),
            where('status', '==', 'active'),
            limit(50)
          );
          const unsubFallback = onSnapshot(fallbackQuery, snap => {
            let data = snap.docs.map(d => d.data() as EventItem);
            if (selectedCity && selectedCity !== 'Tüm Şehirler') {
              data = data.filter(e => e.city === selectedCity);
            }
            setEvents(data);
          });
          return () => unsubFallback();
        }
      );
      return () => unsub();
    } catch {
      setEvents([]);
      return () => {};
    }
  }, [selectedCity]);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, COLLECTIONS.REVIEWS),
        snapshot => {
          const data = snapshot.docs.map(d => d.data() as Review);
          setReviews(data);
        },
        () => {}
      );
      return () => unsub();
    } catch {
      return () => {};
    }
  }, []);

  // Chat messages: listen to targeted chat or active conversations
  useEffect(() => {
    try {
      let q = query(
        collection(db, COLLECTIONS.CHAT_MESSAGES),
        limit(50)
      );

      if (activeChatId) {
        q = query(
          collection(db, COLLECTIONS.CHAT_MESSAGES),
          where('chatId', '==', activeChatId),
          limit(100)
        );
      }

      const unsub = onSnapshot(
        q,
        snapshot => {
          const data = snapshot.docs.map(d => d.data() as ChatMessage);
          setChatMessages(prev => {
            if (!activeChatId) return data;
            const others = prev.filter(m => m.chatId !== activeChatId);
            return [...others, ...data];
          });
        },
        (err) => {
          console.error("Chat messages listener error:", err);
        }
      );
      return () => unsub();
    } catch {
      return () => {};
    }
  }, [activeChatId]);

  // Notifications: only for currentUser.id
  useEffect(() => {
    if (!currentUser.id || currentUser.id === 'guest') {
      setNotifications([]);
      return;
    }

    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', currentUser.id),
        limit(50)
      );
      const unsub = onSnapshot(
        q,
        snapshot => {
          const data = snapshot.docs.map(d => d.data() as NotificationItem);
          setNotifications(data);
        },
        (err) => {
          console.error("Notifications listener error:", err);
        }
      );
      return () => unsub();
    } catch {
      return () => {};
    }
  }, [currentUser.id]);
  // Auth Functions: Login with Email & Password
  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setTimeout(() => setAuthLoading(false), 100);
      try { triggerConfetti(); } catch(e) {}
      return true;
    } catch (err: any) {
      setTimeout(() => setAuthLoading(false), 100);
      const msg = getTurkishAuthErrorMessage(err?.code || '');
      setAuthError(msg);
      return false;
    }
  };

  // Auth Functions: Register new user with full Profile info into Firestore
  const registerWithEmail = async (data: RegisterUserData): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = cred.user.uid;

      const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'K')}&background=f97316&color=ffffff&size=256&bold=true&font-size=0.45`;
      const newUserDoc: User = {
        id: uid,
        name: data.name,
        email: data.email,
        username: '@' + data.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900),
        avatar: data.avatar || fallbackAvatar,
        bio: `${data.occupation} olarak çalışıyorum. Yeni insanlarla tanışıp etkinliklere katılmayı seviyorum!`,
        age: Number(data.age),
        gender: data.gender,
        city: data.city,
        occupation: data.occupation,
        interests: ['Sosyal', 'Buluşma', 'Etkinlik'],
        rating: 5.0,
        reviewCount: 0,
        badgeTags: [
          { tag: 'Güvenilir Katılımcı', count: 1 },
          { tag: 'Yeni Üye', count: 1 },
        ],
        verified: true,
        eventsOrganizedCount: 0,
        eventsAttendedCount: 0,
        joinedAt: 'Yeni katıldı',
      };

      // Save to Firestore
      await setDoc(doc(db, COLLECTIONS.USERS, uid), newUserDoc);
      setUsers(prev => [newUserDoc, ...prev]);
      setAuthLoading(false);
      triggerConfetti();
      return true;
    } catch (err: any) {
      setAuthLoading(false);
      const msg = getTurkishAuthErrorMessage(err?.code || '');
      setAuthError(msg);
      return false;
    }
  };

  // Auth Functions: Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setAuthUser(null);
      setActiveTab('discover');
    } catch {
      // ignore
    }
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    const updatedUser = { ...currentUser, ...updatedData };
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, currentUser.id), updatedData);
    } catch {
      // fallback handled
    }
  };

  const createEvent = (newEventData: Omit<EventItem, 'id' | 'organizerId' | 'organizer' | 'participantIds' | 'participants' | 'pendingRequests' | 'createdAt'>): string => {
    const newId = 'evt_' + Date.now();
    const newEvent: EventItem = {
      ...newEventData,
      id: newId,
      organizerId: currentUser.id,
      organizer: currentUser,
      participantIds: [currentUser.id],
      participants: [currentUser],
      pendingRequests: [],
      status: 'active',
      createdAt: 'Az önce',
    };

    setEvents(prev => [newEvent, ...prev]);

    const initialMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      chatId: newId,
      chatType: 'event_group',
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: `🎉 "${newEvent.title}" etkinliği oluşturuldu. Hoş geldiniz!`,
      timestamp: 'Az önce',
      isSystem: true,
    };
    setChatMessages(prev => [...prev, initialMsg]);

    (async () => {
      try {
        await setDoc(doc(db, COLLECTIONS.EVENTS, newId), newEvent);
        await setDoc(doc(db, COLLECTIONS.CHAT_MESSAGES, initialMsg.id), initialMsg);
        await updateDoc(doc(db, COLLECTIONS.USERS, currentUser.id), {
          eventsOrganizedCount: (currentUser.eventsOrganizedCount || 0) + 1,
        });
      } catch {
        // Handled
      }
    })();

    triggerConfetti();
    return newId;
  };

  const joinEvent = async (eventId: string) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;

    if (targetEvent.criteria.approvalRequired) {
      if (!targetEvent.pendingRequests.some(u => u.id === currentUser.id)) {
        const updatedRequests = [...targetEvent.pendingRequests, currentUser];
        setEvents(prev =>
          prev.map(ev => (ev.id === eventId ? { ...ev, pendingRequests: updatedRequests } : ev))
        );

        const newNotif: NotificationItem = {
          id: 'notif_' + Date.now(),
          userId: targetEvent.organizerId,
          type: 'join_request',
          title: 'Yeni Katılım İsteği! 🙋',
          message: `${currentUser.name}, "${targetEvent.title}" etkinliğinize katılmak istiyor.`,
          eventId: eventId,
          fromUserId: currentUser.id,
          createdAt: 'Az önce',
          read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);

        try {
          await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
            pendingRequests: arrayUnion(currentUser),
          });
          await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, newNotif.id), newNotif);
        } catch {
          // fallback
        }
      }
    } else {
      if (!targetEvent.participantIds.includes(currentUser.id)) {
        const updatedIds = [...targetEvent.participantIds, currentUser.id];
        const updatedParticipants = [...targetEvent.participants, currentUser];
        setEvents(prev =>
          prev.map(ev =>
            ev.id === eventId
              ? { ...ev, participantIds: updatedIds, participants: updatedParticipants }
              : ev
          )
        );

        const sysMsg: ChatMessage = {
          id: 'msg_' + Date.now(),
          chatId: eventId,
          chatType: 'event_group',
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          text: `${currentUser.name} etkinliğe katıldı 👋`,
          timestamp: 'Az önce',
          isSystem: true,
        };
        setChatMessages(prev => [...prev, sysMsg]);

        let newNotif: NotificationItem | null = null;
        if (targetEvent.organizerId !== currentUser.id) {
          newNotif = {
            id: 'notif_' + Date.now(),
            userId: targetEvent.organizerId,
            type: 'join_request',
            title: 'Yeni Katılımcı Katıldı! 🚀',
            message: `${currentUser.name} "${targetEvent.title}" etkinliğinize katıldı.`,
            eventId: eventId,
            fromUserId: currentUser.id,
            createdAt: 'Az önce',
            read: false,
          };
          setNotifications(prev => [newNotif!, ...prev]);
        }

        try {
          await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
            participantIds: arrayUnion(currentUser.id),
            participants: arrayUnion(currentUser),
          });
          await setDoc(doc(db, COLLECTIONS.CHAT_MESSAGES, sysMsg.id), sysMsg);
          await updateDoc(doc(db, COLLECTIONS.USERS, currentUser.id), {
            eventsAttendedCount: (currentUser.eventsAttendedCount || 0) + 1,
          });
          if (newNotif) {
            await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, newNotif.id), newNotif);
          }
        } catch {
          // fallback
        }

        triggerConfetti();
      }
    }
  };

  const leaveEvent = async (eventId: string) => {
    const updatedEvents = events.map(ev => {
      if (ev.id === eventId) {
        return {
          ...ev,
          participantIds: ev.participantIds.filter(id => id !== currentUser.id),
          participants: ev.participants.filter(u => u.id !== currentUser.id),
          pendingRequests: ev.pendingRequests.filter(u => u.id !== currentUser.id),
        };
      }
      return ev;
    });
    setEvents(updatedEvents);

    try {
      const target = updatedEvents.find(e => e.id === eventId);
      if (target) {
        await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
          participantIds: target.participantIds,
          participants: target.participants,
          pendingRequests: target.pendingRequests,
        });
      }
    } catch {
      // fallback
    }
  };

  const approveJoinRequest = async (eventId: string, userId: string) => {
    const userToApprove = users.find(u => u.id === userId);
    if (!userToApprove) return;

    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === eventId) {
          return {
            ...ev,
            participantIds: [...ev.participantIds, userId],
            participants: [...ev.participants, userToApprove],
            pendingRequests: ev.pendingRequests.filter(u => u.id !== userId),
          };
        }
        return ev;
      })
    );

    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      userId: userId,
      type: 'request_accepted',
      title: 'Katılım İsteğin Onaylandı! 🎉',
      message: `Etkinliğe katılım isteğin onaylandı. Artık grup sohbetine katılıp detayları konuşabilirsin.`,
      eventId: eventId,
      createdAt: 'Az önce',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    try {
      const targetEv = events.find(e => e.id === eventId);
      if (targetEv) {
        const nextParticipants = [...targetEv.participants, userToApprove];
        const nextPending = targetEv.pendingRequests.filter(u => u.id !== userId);
        await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
          participantIds: arrayUnion(userId),
          participants: nextParticipants,
          pendingRequests: nextPending,
        });
        await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, newNotif.id), newNotif);
      }
    } catch {
      // fallback
    }
  };

  const rejectJoinRequest = async (eventId: string, userId: string) => {
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === eventId) {
          return {
            ...ev,
            pendingRequests: ev.pendingRequests.filter(u => u.id !== userId),
          };
        }
        return ev;
      })
    );

    try {
      const targetEv = events.find(e => e.id === eventId);
      if (targetEv) {
        const nextPending = targetEv.pendingRequests.filter(u => u.id !== userId);
        await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
          pendingRequests: nextPending,
        });
      }
    } catch {
      // fallback
    }
  };

  const completeEvent = async (eventId: string) => {
    setEvents(prev =>
      prev.map(ev => (ev.id === eventId ? { ...ev, status: 'completed' } : ev))
    );

    const targetEv = events.find(e => e.id === eventId);
    if (targetEv) {
      const notifs: NotificationItem[] = targetEv.participants.map(p => ({
        id: 'notif_' + Date.now() + '_' + p.id,
        userId: p.id,
        type: 'event_rate_invite',
        title: 'Etkinlik Tamamlandı! Puan Verin ⭐',
        message: `"${targetEv.title}" tamamlandı. Katılımcıları ve organizatörü değerlendirmek için tıklayın!`,
        eventId: eventId,
        createdAt: 'Az önce',
        read: false,
      }));
      setNotifications(prev => [...notifs, ...prev]);
      setRatingModalEvent(targetEv);

      try {
        await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), { status: 'completed' });
        const batch = writeBatch(db);
        notifs.forEach(n => {
          batch.set(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), n);
        });
        await batch.commit();
      } catch {
        // fallback
      }
    }
  };

  const deleteEvent = async (eventId: string) => {
    // 1. Instantly filter local state
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setChatMessages(prev => prev.filter(m => m.chatId !== eventId));
    setNotifications(prev => prev.filter(n => n.eventId !== eventId));
    if (viewingEventId === eventId) setViewingEventId(null);

    // 2. Decrement user's eventsOrganizedCount
    const newOrganizedCount = Math.max(0, (currentUser.eventsOrganizedCount || 1) - 1);
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, eventsOrganizedCount: newOrganizedCount } : u))
    );

    // 3. Perform comprehensive cleanup in Firestore
    try {
      const batch = writeBatch(db);

      // Delete main event doc
      batch.delete(doc(db, COLLECTIONS.EVENTS, eventId));

      // Decrement organizer user profile count
      batch.update(doc(db, COLLECTIONS.USERS, currentUser.id), {
        eventsOrganizedCount: newOrganizedCount,
      });

      // Find and delete all chat messages associated with this event
      try {
        const chatSnap = await getDocs(
          query(collection(db, COLLECTIONS.CHAT_MESSAGES), where('chatId', '==', eventId))
        );
        chatSnap.forEach(d => {
          batch.delete(d.ref);
        });
      } catch (err) {
        console.warn('Could not query chat messages for deleted event:', err);
      }

      // Find and delete all notifications referencing this event
      try {
        const notifSnap = await getDocs(
          query(collection(db, COLLECTIONS.NOTIFICATIONS), where('eventId', '==', eventId))
        );
        notifSnap.forEach(d => {
          batch.delete(d.ref);
        });
      } catch (err) {
        console.warn('Could not query notifications for deleted event:', err);
      }

      await batch.commit();
    } catch (err) {
      console.error('Error during batch delete for event:', err);
    }
  };

  const sendChatMessage = async (chatId: string, text: string, chatType: 'event_group' | 'direct') => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      chatId,
      chatType,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, newMsg]);

    try {
      await setDoc(doc(db, COLLECTIONS.CHAT_MESSAGES, newMsg.id), newMsg);
    } catch {
      // fallback
    }
  };

  const submitReview = async (reviewData: {
    eventId: string;
    eventTitle: string;
    toUserId: string;
    rating: number;
    tags: string[];
    comment: string;
  }) => {
    const newReview: Review = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      eventId: reviewData.eventId,
      eventTitle: reviewData.eventTitle,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatar,
      toUserId: reviewData.toUserId,
      rating: reviewData.rating,
      tags: reviewData.tags,
      comment: reviewData.comment,
      createdAt: 'Az önce',
    };

    setReviews(prev => [newReview, ...prev]);

    let updatedTargetUser: User | null = null;
    setUsers(prev =>
      prev.map(u => {
        if (u.id === reviewData.toUserId) {
          const userReviews = [...reviews.filter(r => r.toUserId === u.id), newReview];
          const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
          const newAvgRating = Number((totalRating / userReviews.length).toFixed(1));

          const currentBadges = [...(u.badgeTags || [])];
          reviewData.tags.forEach(tag => {
            const existing = currentBadges.find(b => b.tag === tag);
            if (existing) {
              existing.count += 1;
            } else {
              currentBadges.push({ tag, count: 1 });
            }
          });

          updatedTargetUser = {
            ...u,
            rating: newAvgRating,
            reviewCount: userReviews.length,
            badgeTags: currentBadges,
          };
          return updatedTargetUser;
        }
        return u;
      })
    );

    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === reviewData.eventId) {
          const alreadyRated = ev.ratedByUsers || [];
          return {
            ...ev,
            ratedByUsers: [...new Set([...alreadyRated, currentUser.id])],
          };
        }
        return ev;
      })
    );

    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      userId: reviewData.toUserId,
      type: 'new_review',
      title: 'Yeni Bir Değerlendirme Aldın! ⭐',
      message: `${currentUser.name} sana ${reviewData.rating} yıldız ve değerlendirme bıraktı.`,
      fromUserId: currentUser.id,
      createdAt: 'Az önce',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    try {
      await setDoc(doc(db, COLLECTIONS.REVIEWS, newReview.id), newReview);
      await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, newNotif.id), newNotif);
      if (updatedTargetUser) {
        await updateDoc(doc(db, COLLECTIONS.USERS, reviewData.toUserId), {
          rating: (updatedTargetUser as User).rating,
          reviewCount: (updatedTargetUser as User).reviewCount,
          badgeTags: (updatedTargetUser as User).badgeTags,
        });
      }
      await updateDoc(doc(db, COLLECTIONS.EVENTS, reviewData.eventId), {
        ratedByUsers: arrayUnion(currentUser.id),
      });
    } catch {
      // fallback
    }

    triggerConfetti();
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    try {
      await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true });
    } catch {
      // fallback
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
    try {
      const batch = writeBatch(db);
      notifications
        .filter(n => n.userId === currentUser.id && !n.read)
        .forEach(n => {
          batch.update(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), { read: true });
        });
      await batch.commit();
    } catch {
      // fallback
    }
  };

  const resetAllData = async () => {
    setEvents([]);
    setReviews([]);
    setChatMessages([]);
    setNotifications([]);
    setActiveTab('discover');
    setViewingEventId(null);
    setViewingUserId(null);
    setRatingModalEvent(null);
    setActiveDirectChatUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        authUser,
        isAuthenticated: !!authUser,
        authLoading,
        authError,
        setAuthError,
        loginWithEmail,
        registerWithEmail,
        logout,
        currentUser,
        users,
        events,
        reviews,
        chatMessages,
        notifications,
        activeTab,
        setActiveTab,
        selectedCity,
        setSelectedCity,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isMobileFrame,
        setIsMobileFrame,
        viewingEventId,
        setViewingEventId,
        viewingUserId,
        setViewingUserId,
        ratingModalEvent,
        setRatingModalEvent,
        activeDirectChatUser,
        setActiveDirectChatUser,
        updateProfile,
        createEvent,
        joinEvent,
        leaveEvent,
        approveJoinRequest,
        rejectJoinRequest,
        completeEvent,
        deleteEvent,
        sendChatMessage,
        submitReview,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetAllData,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
