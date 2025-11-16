# Kitara Cinema - Supabase Backend Integration Contracts

## Database Schema

### Tables

#### 1. shows
- id (uuid, primary key)
- title (text)
- thumbnail (text, URL)
- category (text)
- rating (decimal)
- views (text)
- total_episodes (integer)
- is_exclusive (boolean)
- description (text)
- duration (text)
- is_featured (boolean)
- created_at (timestamp)

#### 2. episodes
- id (uuid, primary key)
- show_id (uuid, foreign key -> shows.id)
- episode_number (integer)
- title (text)
- duration (integer, seconds)
- is_locked (boolean)
- thumbnail (text, URL)
- coins_required (integer)
- created_at (timestamp)

#### 3. users (handled by Supabase Auth, but we'll extend with profiles)
- id (uuid, primary key, references auth.users)
- email (text)
- name (text)
- avatar (text, URL)
- coins (integer, default 150)
- created_at (timestamp)
- updated_at (timestamp)

#### 4. watchlist
- id (uuid, primary key)
- user_id (uuid, foreign key -> users.id)
- show_id (uuid, foreign key -> shows.id)
- created_at (timestamp)
- unique constraint on (user_id, show_id)

#### 5. watch_history
- id (uuid, primary key)
- user_id (uuid, foreign key -> users.id)
- show_id (uuid, foreign key -> shows.id)
- episode_number (integer)
- watched_at (timestamp)

## API Endpoints

### Authentication
- POST /api/auth/signup - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user
- GET /api/auth/me - Get current user profile

### Shows
- GET /api/shows - Get all shows (with filters: category, featured, search)
- GET /api/shows/:id - Get show details
- GET /api/shows/:id/episodes - Get episodes for a show

### Watchlist
- GET /api/watchlist - Get user's watchlist
- POST /api/watchlist/:showId - Add show to watchlist
- DELETE /api/watchlist/:showId - Remove show from watchlist

### Watch History
- GET /api/history - Get user's watch history
- POST /api/history - Add to watch history
- DELETE /api/history - Clear watch history

### User Profile
- GET /api/profile - Get user profile
- PUT /api/profile - Update user profile
- POST /api/profile/coins - Purchase coins (mock for now)

## Frontend Integration

### Mock Data to Replace
- mockData.js -> API calls to backend
- Local storage user -> Supabase Auth session
- Hardcoded shows/episodes -> Fetch from Supabase

### Auth Context
- Create AuthContext for managing user session
- Store Supabase session in React context
- Protect routes that require authentication
- Handle token refresh automatically

### API Integration Points
1. Home page: Fetch featured shows and categories
2. Categories page: Fetch shows by category
3. Show details: Fetch show and episodes
4. Video player: Track watch history
5. Watchlist: Add/remove from watchlist
6. Profile: Display user data and manage coins
7. Search: Search shows by title/category

## Environment Variables

### Backend (.env)
- SUPABASE_URL
- SUPABASE_KEY
- SUPABASE_JWT_SECRET (for verifying tokens)

### Frontend (.env)
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

## Implementation Steps

1. ✅ Set up environment variables
2. ✅ Install Supabase client libraries
3. ✅ Create database schema in Supabase
4. ✅ Seed database with mock show data
5. ✅ Create FastAPI backend endpoints
6. ✅ Create AuthContext in frontend
7. ✅ Replace mock data with API calls
8. ✅ Implement authentication flow
9. ✅ Test all features
10. ✅ Handle error states and loading states
