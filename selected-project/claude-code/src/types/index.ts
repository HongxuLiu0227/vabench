export type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  location?: string;
  privacySettings: {
    profileVisibility: 'public' | 'friends' | 'private';
    friendRequests: 'everyone' | 'friends_of_friends' | 'none';
    commentVisibility: 'everyone' | 'friends' | 'private';
    messageVisibility: 'everyone' | 'friends' | 'private';
  };
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
};

export type Post = {
  id: string;
  authorId: string;
  content: string;
  media?: string[];
  hashtags?: string[];
  mentions?: string[];
  tags?: string[];
  likes: string[];
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
  likes: string[];
  createdAt: string;
};

export type FriendRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: 'friend_request' | 'post_like' | 'comment' | 'mention' | 'message' | 'moderation';
  referenceId: string;
  isRead: boolean;
  createdAt: string;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  media?: string;
  isRead: boolean;
  createdAt: string;
};

export type Report = {
  id: string;
  reporterId: string;
  contentId: string;
  contentType: 'post' | 'comment' | 'user';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
};

export type PostState = {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
};

export type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
};

export type MessageState = {
  chats: Message[];
  activeThread: string | null;
};

export type AdminState = {
  userList: User[];
  reports: Report[];
};

export type AppState = {
  auth: AuthState;
  posts: PostState;
  notifications: NotificationState;
  messages: MessageState;
  admin: AdminState;
};