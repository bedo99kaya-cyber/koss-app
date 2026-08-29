export interface User {
  id: string;
  name: string;
  email?: string;
  username: string;
  avatar: string;
  bio: string;
  age: number;
  gender: 'Erkek' | 'Kadın' | 'Belirtilmemiş';
  city: string;
  occupation: string;
  interests: string[];
  rating: number; // e.g. 4.9
  reviewCount: number;
  badgeTags: { tag: string; count: number }[];
  verified: boolean;
  eventsOrganizedCount: number;
  eventsAttendedCount: number;
  joinedAt: string;
  phoneNumber?: string;
  instagram?: string;
}

export interface Review {
  id: string;
  eventId: string;
  eventTitle: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface EventCriteria {
  minAge?: number;
  maxAge?: number;
  ageRangeSpecified: boolean; // if false, "Fark Etmez / Belirtilmemiş"
  genderPreference: 'Herkes' | 'Sadece Kadınlar' | 'Sadece Erkekler' | 'Fark Etmez';
  capacity: number; // Max participants (excluding organizer)
  costType: 'Ücretsiz' | 'Hesap Bölüşmeli' | 'Ücretli' | 'Belirtilmemiş';
  costNote?: string;
  approvalRequired: boolean; // if true, organizer must approve join requests
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  organizerId: string;
  organizer: User;
  dateTime: string;
  locationName: string;
  district: string;
  city: string;
  criteria: EventCriteria;
  participantIds: string[];
  participants: User[];
  pendingRequests: User[];
  status: 'active' | 'completed' | 'cancelled';
  tags: string[];
  coverImage?: string;
  urgentNeed?: string; // e.g. "Acil 1 Kaleci Aranıyor" or "Son 2 Kişi"
  createdAt: string;
  ratedByUsers?: string[]; // user IDs who have already rated this event
}

export interface ChatMessage {
  id: string;
  chatId: string; // eventId or directChatKey (e.g. user1_user2)
  chatType: 'event_group' | 'direct';
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface DirectChatPreview {
  partner: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'join_request' | 'request_accepted' | 'new_message' | 'event_rate_invite' | 'new_review';
  title: string;
  message: string;
  eventId?: string;
  fromUserId?: string;
  createdAt: string;
  read: boolean;
}
