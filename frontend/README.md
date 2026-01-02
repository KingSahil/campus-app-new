


# Campus Super App 🎓

A comprehensive React Native mobile application designed to streamline campus life for students and administrators. Built with Expo, Auth0, and Supabase, this app provides a unified platform for managing academic activities, location-verified attendance tracking, an AI-powered learning hub with video content, quizzes, discussions, and real-time notices.

## 📸 Screenshots

<img width="847" height="424" alt="image" src="https://github.com/user-attachments/assets/a2761a54-0540-4c01-8f66-5c84a4cd78d7" />
<img width="914" height="380" alt="image" src="https://github.com/user-attachments/assets/564afa60-76b6-45d1-8068-6020f56bdd82" />
<img width="578" height="396" alt="image" src="https://github.com/user-attachments/assets/4f9e3438-e2c5-4578-9dd2-7ef1066b2a33" />
<img width="887" height="518" alt="image" src="https://github.com/user-attachments/assets/3e46bd31-ecc4-4c04-bcc2-b6d658555b96" />
<img width="695" height="471" alt="image" src="https://github.com/user-attachments/assets/0e6f10ce-8c64-4b5e-bde4-c84bb271e223" />

## ✨ Features

### 🎯 Core Features

#### 🔐 Authentication & Profile
- **Auth0 Integration**: Secure authentication with social login support (Google, GitHub, etc.)
- **Profile Management**: View and edit user profiles with real-time Supabase sync
- **Role-Based Access**: Student and Admin roles with distinct capabilities
- **Secure Session Management**: Token-based authentication with auto-refresh

#### 📍 Smart Attendance System
- **High-Precision Location Verification**: GPS verification using Vincenty formula
  - 3D distance calculation (latitude, longitude, elevation)
  - Multi-sample averaging for accuracy (±10-30m precision)
  - Configurable campus radius (default: 200m)
  - Stores GPS accuracy and distance metadata for audit trails
- **Active Sessions**: Real-time attendance sessions for ongoing classes
- **Attendance History**: Complete attendance records with date-based filtering
- **Admin Controls**: 
  - Create and manage attendance sessions with subject association
  - View live attendance lists with location verification details
  - Track student participation and attendance patterns
  - Export capabilities for record keeping

#### 📚 AI-Powered Learning Hub
- **Subject Management**: Browse and organize academic subjects
- **Topic Organization**: Hierarchical topic structure per subject
- **YouTube Video Integration** with:
  - **AI-Generated Chapters**: Automatic timestamp-based chapter generation
  - **Video Summaries**: AI-powered transcript summarization
  - **Upvote System**: Community-driven video quality ratings
  - **Interactive Quizzes**: Auto-generated MCQ quizzes from video content
  - **AI Question Answering**: Ask questions and get answers based on video transcripts
- **Discord-Style Discussion Threads**:
  - Post questions and comments on videos
  - Threaded replies with expand/collapse functionality
  - Real-time discussion updates
  - User avatars and timestamps
  - Relative time formatting ("2 minutes ago")
- **AI Cache System**: Intelligent caching of AI-generated content
  - Stores chapters, summaries, quizzes, and Q&A
  - Reduces API costs and improves response times
  - Auto-fallback between Gemini and OpenRouter APIs

#### 🔔 Notices & Announcements
- Campus-wide announcements and important notifications
- Real-time updates via Supabase subscriptions
- Priority-based notice display

### 🎨 Design System

- **Consistent UI**: Unified design language across all screens
- **Shared Components**:
  - `Background.js`: Radial gradient background
  - `BottomNav.js`: Reusable navigation with active tab highlighting
- **Modern Color Scheme**:
  - Primary: `#0A84FF` (iOS blue)
  - Secondary: `#8E8E93` (gray)
  - Cards: `rgba(28, 28, 46, 0.7)` with `rgba(255, 255, 255, 0.1)` borders
  - Background: `#020412` with radial gradients (#1a1a2e, #4a148c)
- **Typography**: Consistent sizing (32px titles, 18px sections, 14-16px body)
- **Platform Support**: Web, iOS, and Android compatible via Expo

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with Expo SDK 52
- **Navigation**: React Navigation (Native Stack)
- **Authentication**: Auth0 with expo-auth-session
- **Database**: Supabase (PostgreSQL)
- **Video Playback**: expo-video (with fallback to expo-av)
- **Location**: expo-location
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Styling**: React Native StyleSheet

### Backend Services
- **FastAPI Backend**: Python API for YouTube transcripts and AI processing
- **AI Providers**:
  - Google Gemini (gemini-2.0-flash-exp) - Primary
  - OpenRouter (Claude 3 Haiku) - Fallback
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Auth0
- **Media**: YouTube API integration

### Key Dependencies
```json
{
  "@supabase/supabase-js": "^2.89.0",
  "expo": "latest",
  "expo-auth-session": "~7.0.10",
  "expo-video": "^3.0.15",
  "expo-location": "~19.0.8",
  "@react-navigation/native": "latest",
  "@react-navigation/native-stack": "latest",
  "expo-linear-gradient": "latest"
}
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- **Expo CLI** (install globally: `npm install -g expo-cli` or use `npx expo`)
- **Platform Development**:
  - iOS: macOS with Xcode
  - Android: Android Studio
- **Required Accounts**:
  - [Supabase Account](https://supabase.com) - Database & backend
  - [Auth0 Account](https://auth0.com) - Authentication
  - [Google AI Studio](https://ai.google.dev/) - Gemini API key
  - [OpenRouter](https://openrouter.ai/) - Optional fallback API

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/campus-app-new.git
cd campus-app-new/frontend
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
```

3. **Set up Auth0**:
   - Follow [AUTH0_SETUP.md](../AI-GUIDES/AUTH0_SETUP.md) for detailed configuration
   - Create `lib/auth0.js` with your credentials:
   ```javascript
   export const auth0Config = {
     domain: 'your-domain.auth0.com',
     clientId: 'your-client-id',
   };
   ```

4. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run migrations from `supabase/migrations/` in SQL Editor (in order)
   - Create `lib/supabase.js` with your credentials:
   ```javascript
   import { createClient } from '@supabase/supabase-js';
   
   const supabaseUrl = 'https://your-project.supabase.co';
   const supabaseAnonKey = 'your-anon-key';
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

5. **Configure Backend API**:
   - Set up the FastAPI backend (see [../backend/README.md](../backend/README.md))
   - Update API endpoints in `lib/learningHub.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:8000'; // or your deployed URL
   ```

6. **Configure Campus Location** (in [screens/DashboardScreen.js](screens/DashboardScreen.js)):
```javascript
const CAMPUS_LOCATION = {
    latitude: YOUR_CAMPUS_LAT,      // e.g., 28.6139
    longitude: YOUR_CAMPUS_LONG,    // e.g., 77.2090
    elevation: YOUR_CAMPUS_ELEVATION // in meters, e.g., 216
};
const CAMPUS_RADIUS = 200; // meters
```

7. **Start the development server**:
```bash
npx expo start
```

### Running the App

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Web Browser**: Press `w` in the terminal
- **Physical Device**: 
  - Install [Expo Go](https://expo.dev/client) app
  - Scan the QR code displayed in terminal

### Database Setup

Run the following migrations in Supabase SQL Editor **in order**:

1. `20251227042455_create_initial_schema.sql` - Base tables (notices, user_profiles)
2. `20251227120000_create_learning_hub_schema.sql` - Learning hub core tables
3. `20251227120001_seed_learning_hub_data.sql` - Sample data for testing
4. `20251227130000_fix_rls_policies.sql` - Row Level Security policies
5. `20251227150000_create_attendance_tables.sql` - Attendance system
6. `20251228000000_create_video_discussions.sql` - Discussion threads
7. `20251228000001_create_user_profiles.sql` - Enhanced user profiles
8. `20251228000002_create_video_upvotes.sql` - Video voting system
9. `20251228000003_add_user_role.sql` - User role management
10. `20251228120000_create_video_chapters.sql` - AI chapter storage
11. `20251228120100_create_ai_cache_tables.sql` - AI cache system

📖 See [INTEGRATION_GUIDE.md](../AI-GUIDES/INTEGRATION_GUIDE.md) for detailed setup instructions.

## 📱 App Screens

### Authentication Flow
- **GetStartedScreen**: Welcome screen with app overview and feature highlights
- **SignInScreen**: Auth0 authentication with social login (Google, GitHub)
- **ProfileEnterScreen**: Initial profile setup with name and student/admin role

### Student Screens
- **DashboardScreen**: 
  - Active attendance sessions with real-time updates
  - Location verification with precision indicators
  - GPS accuracy visualization
  - Join session with automatic location check
- **StudentAttendanceScreen**: 
  - View personal attendance history
  - Date-based filtering
  - Attendance statistics and insights
- **LearningHubScreen**: 
  - Browse subjects and topics
  - Search functionality
  - Navigate to video content
- **SubjectTopicsScreen**: 
  - View all topics for a selected subject
  - Topic descriptions and video counts
- **VideosListScreen**: 
  - YouTube videos for a topic
  - Upvote system with real-time counts
  - Sort by popularity or newest
- **LectureVideoScreen**: 
  - Video playback with expo-video
  - AI-generated chapters with timestamps
  - Video summary from AI
  - Interactive quizzes
  - AI question answering
  - Discussion threads (Discord-style)
  - Upvote/downvote functionality
- **NoticesScreen**: 
  - Campus announcements
  - Priority-based display
  - Real-time updates
- **Profile**: 
  - View/edit profile information
  - Role display
  - Sign out functionality

### Admin Screens
- **AdminDashboardScreen**: 
  - Admin-specific dashboard
  - Quick access to management features
- **ManageAttendanceScreen**: 
  - Create new attendance sessions
  - Select subject and schedule
  - Set session parameters
- **AttendanceAdminScreen**: 
  - View all active and past sessions
  - Session management
- **AttendanceListScreen**: 
  - Live attendance list for a session
  - Student details with location metadata
  - GPS accuracy and distance information
  - Export capabilities

## 🎨 UI Components

### Shared Components
- **Background.js**: 
  - Radial gradient background (`#020412` → `#1a1a2e` → `#4a148c`)
  - Consistent across all screens
- **BottomNav.js**: 
  - Reusable navigation bar
  - Active tab highlighting
  - Icons and labels

### Design Patterns
- **Card-based UI**: Glassmorphism effect with translucent backgrounds
- **Consistent Spacing**: 16px padding, 12px gaps between elements
- **Button Styles**: Primary (`#0A84FF`), Disabled (`#444`), Danger (`#FF3B30`)
- **Typography Hierarchy**: 
  - Titles: 32px, bold
  - Section headers: 18px, semibold
  - Body: 14-16px, regular
  - Captions: 12-13px

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with Expo SDK 52
- **Navigation**: React Navigation 6.x (Native Stack)
- **Authentication**: Auth0 (OAuth 2.0, social login)
- **Database**: Supabase (PostgreSQL with Row Level Security)

### UI Components & Styling
- **Design System**: Custom components with consistent styling
- **Safe Area**: React Native Safe Area Context
- **Icons**: Material Icons (@expo/vector-icons)
- **Graphics**: React Native SVG with RadialGradient
- **Video**: expo-video, react-native-youtube-iframe

### Location & Sensors
- **GPS**: expo-location with high-precision positioning
- **Algorithms**: 
  - Vincenty formula for distance calculation (±0.5mm precision)
  - 3D Pythagorean theorem for elevation-aware distance
  - Multi-sample GPS averaging with weighted accuracy

### Additional Libraries
- **Image Handling**: expo-image-picker
- **Date/Time**: @react-native-community/datetimepicker
- **UUID Generation**: react-native-uuid
- **Development Tools**: 
  - Requestly for API mocking (see [REQUESTLY_SETUP.md](REQUESTLY_SETUP.md))
  - Expo DevTools

- **Real-time Updates**: Supabase Realtime subscriptions
- **Video**: expo-video with expo-av fallback
- **Location**: expo-location (high-precision GPS)
- **State Management**: React hooks (useState, useEffect, useCallback)

### Backend
- **API**: FastAPI (Python) for YouTube transcripts and AI processing
- **AI Providers**:
  - Google Gemini (gemini-2.0-flash-exp) - Primary
  - OpenRouter (Claude 3 Haiku) - Fallback
- **Database**: Supabase PostgreSQL with Row Level Security
- **Storage**: Supabase Storage (avatars, content)
- **Real-time**: Supabase Realtime subscriptions

### Location & Algorithms
- **GPS**: expo-location with high-precision positioning
- **Distance Calculations**:
  - Vincenty formula for geodesic distance (±0.5mm precision)
  - 3D Pythagorean theorem for elevation-aware distance
  - Multi-sample GPS averaging with weighted accuracy

## 📂 Project Structure

```
campus-app-new/
├── frontend/
│   ├── App.js                          # Main navigation and app setup
│   ├── index.js                        # Root entry point
│   ├── app.json                        # Expo configuration
│   ├── package.json                    # Dependencies and scripts
│   ├── README.md                       # This file
│   ├── assets/                         # Images, fonts, static resources
│   ├── components/
│   │   ├── Background.js               # Shared radial gradient background
│   │   └── BottomNav.js                # Reusable bottom navigation
│   ├── lib/
│   │   ├── auth0.js                    # Auth0 configuration
│   │   ├── supabase.js                 # Supabase client setup
│   │   ├── insforge.js                 # Additional integrations
│   │   └── learningHub.js              # Learning Hub API client
│   ├── screens/
│   │   ├── GetStartedScreen.js         # Welcome/onboarding
│   │   ├── SignInScreen.js             # Auth0 sign in
│   │   ├── ProfileEnterScreen.js       # Profile setup
│   │   ├── DashboardScreen.js          # Student dashboard with location
│   │   ├── Profile.js                  # User profile management
│   │   ├── StudentAttendanceScreen.js  # Attendance history
│   │   ├── LearningHubScreen.js        # Subject listing
│   │   ├── SubjectTopicsScreen.js      # Topic listing
│   │   ├── VideosListScreen.js         # Video library
│   │   ├── LectureVideoScreen.js       # Video player with AI features
│   │   ├── NoticesScreen.js            # Announcements
│   │   ├── AdminDashboardScreen.js     # Admin control panel
│   │   ├── AttendanceAdminScreen.js    # Attendance sessions
│   │   ├── ManageAttendanceScreen.js   # Create/manage sessions
│   │   └── AttendanceListScreen.js     # Live attendance list
│   └── supabase/
│       └── migrations/
│           ├── 20251227042455_create_initial_schema.sql
│           ├── 20251227120000_create_learning_hub_schema.sql
│           ├── 20251227120001_seed_learning_hub_data.sql
│           ├── 20251227130000_fix_rls_policies.sql
│           ├── 20251227150000_create_attendance_tables.sql
│           ├── 20251228000000_create_video_discussions.sql
│           ├── 20251228000001_create_user_profiles.sql
│           ├── 20251228000002_create_video_upvotes.sql
│           ├── 20251228000003_add_user_role.sql
│           ├── 20251228120000_create_video_chapters.sql
│           └── 20251228120100_create_ai_cache_tables.sql
├── backend/
│   ├── main.py                         # FastAPI application
│   ├── requirements.txt                # Python dependencies
│   ├── .env                            # Environment variables (create this)
│   └── README.md                       # Backend documentation
└── AI-GUIDES/
    ├── README_INTEGRATION.md           # Integration guide
    ├── AUTH0_SETUP.md                  # Auth0 setup
    ├── ARCHITECTURE.md                 # System architecture
    ├── CHAPTER_CACHING_GUIDE.md        # AI caching guide
    ├── TROUBLESHOOTING.md              # Common issues
    └── ...                             # Additional guides
│       └── 20251228000000_create_video_discussions.sql
└── stitch_digital_cr_hub/          # UI prototypes and HTML mockups
    ├── attendance_admin/
    ├── learning_hub/
    ├── discussion_forum/
    └── [other feature mockups]
```

## 🎨 Design Features

- **Dark Theme**: Modern dark blue gradient background with radial gradients
- **Glassmorphism**: Semi-transparent cards with frosted glass effect
  - Cards: `rgba(28, 28, 46, 0.7)`
  - Borders: `rgba(255, 255, 255, 0.1)`
- **Consistent Design Language**: 
  - Unified color scheme across all screens
  - Shared Background component
  - Reusable BottomNav component
- **iOS-Style UI**: Clean, minimalist interface with SF Pro-inspired typography
- **Responsive**: Adapts to different screen sizes and platforms (web, iOS, Android)
- **Platform-Specific**: Custom implementations for web compatibility (custom Modal vs Alert)
- **Smooth Animations**: Fade transitions and interactive elements
- **Accessibility**: Safe area support, proper contrast ratios

## 🔐 Security Features

- **Auth0 Authentication**: Industry-standard OAuth 2.0
- **Row Level Security**: Supabase RLS policies for data protection
- **Location Verification**: GPS-based attendance verification prevents fraud
- **Secure Sessions**: JWT tokens with automatic refresh
- **User Isolation**: Students can only view/edit their own data

## 📍 Location Verification Details

### Accuracy Features
- **Vincenty Formula**: ±0.5mm precision for distance calculation
- **3D Distance**: Accounts for latitude, longitude, AND elevation
- **Multi-Sample Averaging**: Takes 2 GPS samples with 300ms delay
- **Weighted Accuracy**: Better GPS readings weighted higher in average
- **Quality Filtering**: Accepts readings with <200m accuracy
- **Fallback Logic**: Uses best available reading if threshold not met

### Configuration
```javascript
ALLOWED_DISTANCE = 200m        // Maximum distance from campus center
MAX_GPS_ACCURACY = 200m        // Required GPS precision
LOCATION_SAMPLES = 2           // Number of samples to average
SAMPLE_DELAY = 300ms           // Time between samples
GPS_MODE = Balanced            // Balance of speed and accuracy
```

### Performance
- **Verification Time**: ~1-2 seconds
- **Accuracy**: ±10-30m in optimal conditions
- **Metadata Stored**: Distance, GPS accuracy, verification timestamp

## 🔧 Configuration

### App Configuration (`app.json`)
- App name, slug, and version
- Platform-specific settings (iOS, Android, Web)
- Splash screen and app icon
- Orientation and status bar settings

### Environment Variables
Create the following configuration files (not tracked in Git):

**`lib/auth0.js`:**
```javascript
export const auth0Config = {
  domain: 'your-domain.auth0.com',
  clientId: 'your-client-id',
};
```

**`lib/supabase.js`:**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Campus Location
Update in `screens/DashboardScreen.js`:
```javascript
const CAMPUS_LOCATION = {
    latitude: 13.054855548207236,  // Your campus latitude
    longitude: 80.07600107253903,   // Your campus longitude
    elevation: 21,                   // Elevation in meters
};
```

## 📋 Available Scripts

- `npm start` or `npx expo start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device (macOS only)
- `npm run web` - Run in web browser

## 🧪 Testing & Development

### API Mocking with Requestly
See [REQUESTLY_SETUP.md](REQUESTLY_SETUP.md) for:
- Mock Supabase responses
- Test location verification
- Simulate network delays
- Test error states

### Debugging Tips
1. **Enable Remote Debugging**: Shake device → Enable Remote JS Debugging
2. **View Logs**: `npx expo start` shows all console.log output
3. **Network Inspector**: Use Requestly or React Native Debugger
4. **Database Queries**: Check Supabase logs for query performance
5. **Location Testing**: Use simulator location override or Requestly script injection

### Common Issues

**GPS Not Working:**
- Check location permissions
- Ensure device has GPS enabled
- Test outdoors for better signal
- Increase `MAX_GPS_ACCURACY` threshold for testing

**Auth0 Login Fails:**
- Verify Auth0 configuration in `lib/auth0.js`
- Check callback URLs in Auth0 dashboard
- Ensure expo scheme is registered

**Supabase Connection Error:**
- Verify project URL and anon key
- Check RLS policies allow access
- Run all migrations in order

**Video Discussions Not Loading:**
- Ensure `video_discussions` table exists
- Run migration `20251228000000_create_video_discussions.sql`
- Check Supabase RLS policies

## 🚧 Roadmap

### In Progress
- [x] Location-based attendance with Vincenty formula
- [x] Discord-style discussion threads
- [x] Learning Hub with video content
- [x] Auth0 authentication
- [x] Supabase integration
- [x] Consistent UI design system

### Planned Features
- [ ] Push notifications for attendance reminders
- [ ] Real-time chat integration with other students
- [ ] AI-powered video transcript summarization (API integration)
- [ ] Interactive quiz system with grading
- [ ] Campus map with indoor navigation
- [ ] Event calendar and RSVP system
- [ ] Grade tracking and GPA calculator
- [ ] Assignment submission portal
- [ ] Food ordering with payment gateway
- [ ] Library book reservation system
- [ ] Student Voice forum enhancements
- [ ] Campus marketplace with escrow
- [ ] Analytics dashboard for admins
- [ ] Attendance reports and exports
- [ ] Multi-campus support
- [ ] Offline mode with sync

## 🚀 Deployment

### Build for Production

**iOS:**
```bash
# Create production build
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

**Android:**
```bash
# Create production build (APK or AAB)
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

**Web:**
```bash
# Build for web
npx expo export:web

# Deploy to hosting (Vercel, Netlify, etc.)
```

### Environment Setup for Production

1. Update `app.json` with production values
2. Set up EAS Build credentials
3. Configure environment variables in EAS
4. Set up code signing for iOS/Android

## 🐛 Troubleshooting

### Common Issues

#### Auth0 Login Fails
- Verify Auth0 domain and client ID in `lib/auth0.js`
- Check callback URLs in Auth0 dashboard
- Ensure `expo-auth-session` is properly configured

#### Location Permission Denied
- Check device location settings
- Verify location permissions in `app.json`
- On iOS, ensure NSLocationWhenInUseUsageDescription is set

#### Supabase Connection Failed
- Verify Supabase URL and anon key in `lib/supabase.js`
- Check RLS policies are set correctly
- Ensure migrations were run in order

#### Video Player Not Working
- Check `expo-video` is installed
- Verify YouTube URL is valid
- Try fallback to `expo-av`

#### Backend API Connection Issues
- Ensure backend is running on correct port
- Check CORS configuration in FastAPI
- Verify API URL in `lib/learningHub.js`

### Debug Mode

Enable debug logs:
```javascript
// In App.js
console.log('Debug mode enabled');
```

Check Expo logs:
```bash
npx expo start --dev-client --clear
```

## 🔄 Recent Updates

### Version 1.0.0 (Latest)
- ✨ AI-powered chapter generation with Gemini/OpenRouter
- 💬 Discord-style discussion threads
- 🎯 Interactive quizzes from video content
- 🤖 AI question answering based on transcripts
- 📊 AI cache system for improved performance
- 🎨 Refined UI with glassmorphism effects
- 🔒 Enhanced security with RLS policies
- 📍 Improved location accuracy with elevation

## 🔮 Future Roadmap

### Planned Features
- [ ] Push notifications for attendance reminders
- [ ] Offline mode for attendance records
- [ ] Analytics dashboard for administrators
- [ ] Bulk attendance import/export
- [ ] Calendar integration for class schedules
- [ ] Parent portal for attendance monitoring
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Advanced video search and filtering
- [ ] Bookmarks for favorite videos
- [ ] Video download for offline viewing
- [ ] Peer-to-peer study groups
- [ ] Assignment submission system
- [ ] Grade tracking and GPA calculator

### Technical Improvements
- [ ] Unit and integration tests with Jest
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Performance monitoring with Sentry
- [ ] Error tracking and reporting
- [ ] A/B testing framework
- [ ] Automated database backups
- [ ] Redis caching for API responses
- [ ] GraphQL API layer
- [ ] Mobile app publishing (App Store, Play Store)
- [ ] Progressive Web App (PWA) support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code style and conventions
- Use consistent naming (camelCase for functions, PascalCase for components)
- Add comments for complex logic
- Test on web, iOS, and Android before submitting
- Update documentation for new features
- Keep PRs focused on a single feature/fix
- Write meaningful commit messages
- Include screenshots for UI changes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Expo Team** - Amazing React Native framework and developer experience
- **Supabase** - Powerful backend-as-a-service platform
- **Auth0** - Secure and reliable authentication service
- **Google Gemini** - Advanced AI capabilities for education
- **OpenRouter** - AI API aggregation and fallback
- **React Navigation** - Seamless navigation library
- **Material Design** - Beautiful and comprehensive icon set
- **FastAPI** - High-performance Python web framework
- **Campus Community** - Feature ideas, testing, and feedback
- **YouTube** - Video hosting and educational content platform

## 📚 Additional Documentation

For detailed guides, check out the [AI-GUIDES](../AI-GUIDES/) directory:

- [README_INTEGRATION.md](../AI-GUIDES/README_INTEGRATION.md) - Complete integration guide
- [AUTH0_SETUP.md](../AI-GUIDES/AUTH0_SETUP.md) - Authentication configuration
- [ARCHITECTURE.md](../AI-GUIDES/ARCHITECTURE.md) - System architecture overview
- [CHAPTER_CACHING_GUIDE.md](../AI-GUIDES/CHAPTER_CACHING_GUIDE.md) - AI caching implementation
- [TROUBLESHOOTING.md](../AI-GUIDES/TROUBLESHOOTING.md) - Common issues and solutions
- [API_EXAMPLES.md](../AI-GUIDES/API_EXAMPLES.md) - Backend API usage examples
- [QUICK_REFERENCE.md](../AI-GUIDES/QUICK_REFERENCE.md) - Quick reference guide

## 📞 Support

For issues, questions, or suggestions:
- **GitHub Issues**: [Open an issue](https://github.com/yourusername/campus-app-new/issues)
- **GitHub Discussions**: Join the community discussions
- **Documentation**: Check setup guides in repository
- **Backend Issues**: See [backend/README.md](../backend/README.md)

## 🔗 Links

- **Repository**: https://github.com/yourusername/campus-app-new
- **Expo**: https://expo.dev
- **Supabase**: https://supabase.com
- **Auth0**: https://auth0.com
- **React Navigation**: https://reactnavigation.org
- **FastAPI**: https://fastapi.tiangolo.com
- **Google Gemini**: https://ai.google.dev

## 📊 Project Stats

- **Lines of Code**: ~8,000+
- **Screens**: 16+
- **Shared Components**: 2+
- **Database Tables**: 12+
- **API Endpoints**: 5
- **Supported Platforms**: iOS, Android, Web
- **AI Features**: Chapter generation, Q&A, quizzes, summaries
- **Authentication Methods**: Email, Google, GitHub (via Auth0)

---

**Made with ❤️ for the campus community**

**Tech Stack**: React Native • Expo • Auth0 • Supabase • PostgreSQL • React Navigation • FastAPI • Google Gemini • OpenRouter

**Features**: 📍 Location Verification • 💬 Discussion Threads • 📚 AI Learning Hub • ✅ Smart Attendance • 🤖 AI Question Answering • 📝 Auto Quizzes
