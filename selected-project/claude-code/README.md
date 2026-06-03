# Social Network Web Application

A full-featured social networking web application built with React, TypeScript, and Ant Design (AntD).

## Features

### ✅ Implemented Features

- **User Authentication**: Login and registration with demo accounts
- **User Profiles**: Complete profile management with bio, photos, and settings
- **Timeline Posts**: Create, view, like, and delete posts with text and media
- **Comments**: Add comments to posts with nested replies
- **Responsive Design**: Mobile-first responsive layout
- **Modern UI**: Clean, professional interface using Ant Design

### 🔄 Coming Soon Features

- Friend requests and social networking
- Real-time notifications
- Advanced search functionality
- Direct messaging system
- Privacy settings and controls
- Admin dashboard and moderation tools

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Ant Design (AntD) v5
- **Routing**: React Router v6
- **State Management**: React Context API with useReducer
- **Build Tool**: Vite
- **Styling**: CSS with Ant Design theme customization

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd social-network-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Demo Accounts

Use these demo accounts to test the application:

- **Regular User**:
  - Email: `john@example.com`
  - Password: `password`

- **Admin User**:
  - Email: `admin@example.com`
  - Password: `password`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # App layout components
│   ├── Post/           # Post-related components
│   ├── Profile/        # Profile management components
│   └── Sidebar/        # Sidebar widgets
├── context/            # React Context providers
├── pages/              # Page components
├── types/              # TypeScript type definitions
├── data/               # Mock data and API integration
└── App.tsx             # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## Key Features Overview

### User Profile Management
- Create and update user profiles
- Upload profile pictures and cover photos
- Manage personal information and bio
- View other users' public profiles

### Timeline and Posts
- Create posts with text content and media
- Support for images and videos
- Hashtag and mention support
- Like and comment functionality
- Post editing and deletion

### Responsive Design
- Mobile-first responsive layout
- Adaptive sidebar navigation
- Optimized for desktop, tablet, and mobile
- Consistent Ant Design theming

### Authentication & Security
- JWT-based authentication
- Protected routes
- Role-based access control
- Secure form validation

## Development

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Consistent component architecture

### State Management
- React Context API for global state
- Custom hooks for reusable logic
- Immutable state updates with useReducer

## Future Enhancements

Planned features for future development:

1. **Real-time Features**: WebSocket integration for live notifications and messaging
2. **Advanced Search**: Full-text search with filters and sorting
3. **Social Features**: Friend requests, following system, and groups
4. **Admin Panel**: User management, content moderation, and analytics
5. **Media Optimization**: Image compression and lazy loading
6. **Performance**: Code splitting and bundle optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## License

This project is licensed under the MIT License.