import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, User, Post, Notification, Message, Report } from '../types';
import { mockPosts, mockUsers } from '../data/mockData';

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_ACTIVE_THREAD'; payload: string | null }
  | { type: 'SET_USER_LIST'; payload: User[] }
  | { type: 'SET_REPORTS'; payload: Report[] };

const initialState: AppState = {
  auth: {
    user: null,
    token: null,
    isLoading: false,
  },
  posts: {
    posts: mockPosts,
    isLoading: false,
    error: null,
  },
  notifications: {
    notifications: [],
    unreadCount: 0,
  },
  messages: {
    chats: [],
    activeThread: null,
  },
  admin: {
    userList: mockUsers,
    reports: [],
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        auth: { ...state.auth, isLoading: action.payload },
      };
    case 'SET_USER':
      return {
        ...state,
        auth: { ...state.auth, user: action.payload },
      };
    case 'SET_TOKEN':
      return {
        ...state,
        auth: { ...state.auth, token: action.payload },
      };
    case 'ADD_POST':
      return {
        ...state,
        posts: {
          ...state.posts,
          posts: [action.payload, ...state.posts.posts],
        },
      };
    case 'UPDATE_POST':
      return {
        ...state,
        posts: {
          ...state.posts,
          posts: state.posts.posts.map(post =>
            post.id === action.payload.id ? action.payload : post
          ),
        },
      };
    case 'DELETE_POST':
      return {
        ...state,
        posts: {
          ...state.posts,
          posts: state.posts.posts.filter(post => post.id !== action.payload),
        },
      };
    case 'SET_POSTS':
      return {
        ...state,
        posts: {
          ...state.posts,
          posts: action.payload,
        },
      };
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications.notifications];
      return {
        ...state,
        notifications: {
          notifications: newNotifications,
          unreadCount: newNotifications.filter(n => !n.isRead).length,
        },
      };
    case 'MARK_NOTIFICATION_READ':
      const updatedNotifications = state.notifications.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, isRead: true }
          : notification
      );
      return {
        ...state,
        notifications: {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.isRead).length,
        },
      };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: {
          notifications: action.payload,
          unreadCount: action.payload.filter(n => !n.isRead).length,
        },
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          chats: [...state.messages.chats, action.payload],
        },
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          chats: action.payload,
        },
      };
    case 'SET_ACTIVE_THREAD':
      return {
        ...state,
        messages: {
          ...state.messages,
          activeThread: action.payload,
        },
      };
    case 'SET_USER_LIST':
      return {
        ...state,
        admin: {
          ...state.admin,
          userList: action.payload,
        },
      };
    case 'SET_REPORTS':
      return {
        ...state,
        admin: {
          ...state.admin,
          reports: action.payload,
        },
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}