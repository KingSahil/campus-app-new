


# Campus Super App 🎓

A comprehensive React Native mobile application designed to streamline campus life for students and administrators. Built with Expo, Auth0, and Supabase, this app provides a unified platform for managing academic activities, location-verified attendance tracking, learning hub with video content, and real-time discussions.

<img width="847" height="424" alt="image" src="https://github.com/user-attachments/assets/a2761a54-0540-4c01-8f66-5c84a4cd78d7" />
<img width="914" height="380" alt="image" src="https://github.com/user-attachments/assets/564afa60-76b6-45d1-8068-6020f56bdd82" />
<img width="578" height="396" alt="image" src="https://github.com/user-attachments/assets/4f9e3438-e2c5-4578-9dd2-7ef1066b2a33" />
<img width="887" height="518" alt="image" src="https://github.com/user-attachments/assets/3e46bd31-ecc4-4c04-bcc2-b6d658555b96" />
<img width="695" height="471" alt="image" src="https://github.com/user-attachments/assets/0e6f10ce-8c64-4b5e-bde4-c84bb271e223" />







## ✨ Features

### 🎯 Core Features

#### Authentication & Profile
- **Auth0 Integration**: Secure authentication with social login support
- **Profile Management**: View and edit user profiles with real-time Supabase sync
- **Sign Out**: Secure session management

#### 📍 Smart Attendance System
- **Location Verification**: High-precision GPS verification using Vincenty formula
  - 3D distance calculation (latitude, longitude, elevation)
  - Multi-sample averaging for accuracy (±10-30m precision)
  - Configurable campus radius (default: 200m)
  - Stores GPS accuracy and distance metadata
- **Active Sessions**: Real-time attendance sessions for ongoing classes
- **Attendance History**: Complete attendance records with filtering
- **Admin Controls**: 
  - Create and manage attendance sessions
  - View live attendance lists
  - Track student participation

#### 📚 Learning Hub
- **Subject Management**: Browse and manage academic subjects
- **Topic Organization**: Hierarchical topic structure per subject
- **Video Library**: YouTube video integration with:
  - Upvote system for helpful videos
  - AI-powered transcript summarization
  - Interactive quizzes
  - **Discord-style Discussion Threads**:
    - Post questions and comments
    - Threaded replies with expand/collapse
    - Real-time discussion updates
    - User avatars and timestamps
    - Relative time formatting ("2 minutes ago")

#### 🔔 Notices & Announcements
- Campus-wide announcements
- Important notifications
- Real-time updates

### 🎨 Design System

- **Consistent UI**: Unified design language across all screens
- **Background Component**: Shared radial gradient background
- **BottomNav Component**: Reusable navigation with active tab highlighting
- **Color Scheme**:
  - Primary: `#0A84FF` (iOS blue)
  - Secondary: `#8E8E93` (gray)
  - Cards: `rgba(28, 28, 46, 0.7)` with `rgba(255, 255, 255, 0.1)` borders
  - Background: `#020412` with radial gradients
- **Typography**: Consistent sizing (32px titles, 18px sections, 14-16px body)
- **Platform Support**: Web, iOS, and Android compatible

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- For iOS development: macOS with Xcode
- For Android development: Android Studio
- **Supabase Account**: Create at [supabase.com](https://supabase.com)
- **Auth0 Account**: Create at [auth0.com](https://auth0.com)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/campus-app-new.git
cd campus-app-new
```

2. Install dependencies:
```bash
npm install
```

3. Set up Auth0:
   - Follow [AUTH0_SETUP.md](AUTH0_SETUP.md) for detailed configuration
   - Create `lib/auth0.js` with your credentials

4. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run migrations from `supabase/migrations/` in SQL Editor
   - Create `lib/supabase.js` with your project URL and anon key

5. Configure campus location (in `screens/DashboardScreen.js`):
```javascript
const CAMPUS_LOCATION = {
    latitude: YOUR_CAMPUS_LAT,
    longitude: YOUR_CAMPUS_LONG,
    elevation: YOUR_CAMPUS_ELEVATION_IN_METERS,
};
```

6. Start the development server:
```bash
npx expo start
```

### Running the App

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Web Browser**: Press `w` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

### Database Setup

Run the following migrations in Supabase SQL Editor (in order):

1. `20251227042455_create_initial_schema.sql` - Base tables
2. `20251227120000_create_learning_hub_schema.sql` - Learning hub tables
3. `20251227120001_seed_learning_hub_data.sql` - Sample data
4. `20251227130000_fix_rls_policies.sql` - Security policies
5. `20251228000000_create_video_discussions.sql` - Discussion system

See [LEARNING_HUB_SETUP.md](LEARNING_HUB_SETUP.md) for detailed database setup.

## 📱 Screens

### Authentication
- **GetStartedScreen**: Welcome screen with app overview
- **SignInScreen**: Auth0 authentication with social login
- **ProfileEnterScreen**: Initial profile setup

### Student Screens
- **DashboardScreen**: 
  - Active attendance sessions with location verification
  - Quick access to all features
  - Profile picture and user info
- **StudentAttendanceScreen**: 
  - Attendance history with filtering
  - Statistics and records
- **ProfileDetailScreen**: 
  - User profile with Auth0 integration
  - Edit profile and sign out
- **LearningHubScreen**: 
  - Subject listing
  - Add/manage subjects (admin)
- **SubjectTopicsScreen**: 
  - Topic listing per subject
  - Topic management
- **VideosListScreen**: 
  - Video library with thumbnails
  - Duration and play indicators
- **LectureVideoScreen**: 
  - YouTube video player
  - Upvote system
  - **Discussion tab with threaded comments**
  - AI summarizer
  - Quiz section
- **NoticesScreen**: Campus announcements

### Admin Screens
- **AdminDashboardScreen**: Administrative control panel
- **AttendanceAdminScreen**: Class configuration and setup
- **ManageAttendanceScreen**: Active session management
- **AttendanceListScreen**: Real-time attendance tracking
- **PrincipalPortalScreen**: Principal/admin oversight

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with Expo (SDK 54)
- **Navigation**: React Navigation v7
- **Authentication**: Auth0 for secure user authentication
- **Database**: Supabase (PostgreSQL with real-time capabilities)

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

### Backend Services
- **Authentication**: Auth0 (OAuth 2.0, social login)
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage (for user avatars, content)
- **Security**: Row Level Security (RLS) policies

## 📂 Project Structure

```
campus-app-new/
├── App.js                          # Main navigation and app setup
├── index.js                        # Root entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies and scripts
├── AUTH0_SETUP.md                  # Auth0 configuration guide
├── LEARNING_HUB_SETUP.md           # Learning Hub setup guide
├── REQUESTLY_SETUP.md              # API mocking setup guide
├── README.md                       # This file
├── assets/                         # Images, fonts, static resources
├── components/
│   ├── Background.js               # Shared radial gradient background
│   └── BottomNav.js                # Reusable bottom navigation
├── lib/
│   ├── auth0.js                    # Auth0 configuration
│   ├── supabase.js                 # Supabase client setup
│   ├── insforge.js                 # Additional integrations
│   └── learningHub.js              # Learning Hub utilities
├── screens/
│   ├── GetStartedScreen.js         # Welcome/onboarding
│   ├── SignInScreen.js             # Auth0 sign in
│   ├── ProfileEnterScreen.js       # Profile setup
│   ├── DashboardScreen.js          # Student dashboard with location attendance
│   ├── ProfileDetailScreen.js      # User profile management
│   ├── StudentAttendanceScreen.js  # Attendance history
│   ├── LearningHubScreen.js        # Subject listing
│   ├── SubjectTopicsScreen.js      # Topic listing
│   ├── VideosListScreen.js         # Video library
│   ├── LectureVideoScreen.js       # Video player with discussions
│   ├── NoticesScreen.js            # Announcements
│   ├── AdminDashboardScreen.js     # Admin control panel
│   ├── AttendanceAdminScreen.js    # Attendance configuration
│   ├── ManageAttendanceScreen.js   # Session management
│   ├── AttendanceListScreen.js     # Live attendance list
│   └── PrincipalPortalScreen.js    # Principal dashboard
├── supabase/
│   └── migrations/
│       ├── 20251227042455_create_initial_schema.sql
│       ├── 20251227120000_create_learning_hub_schema.sql
│       ├── 20251227120001_seed_learning_hub_data.sql
│       ├── 20251227130000_fix_rls_policies.sql
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

### Technical Improvements
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] A/B testing framework
- [ ] Automated database backups
- [ ] Redis caching for performance
- [ ] GraphQL API layer
- [ ] Mobile app publishing (App Store, Play Store)

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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Your Name** - Initial work and core features
- **Contributors** - See GitHub contributors page

## 🙏 Acknowledgments

- **Expo Team** - Amazing React Native framework
- **Supabase** - Backend-as-a-Service platform
- **Auth0** - Secure authentication service
- **React Navigation** - Seamless navigation
- **Material Design** - Beautiful icon set
- **Campus Community** - Feature ideas and feedback
- **OpenStreetMap** - Location data
- **YouTube** - Video hosting platform

## 📚 Documentation

- [AUTH0_SETUP.md](AUTH0_SETUP.md) - Authentication configuration
- [LEARNING_HUB_SETUP.md](LEARNING_HUB_SETUP.md) - Learning Hub and database setup
- [REQUESTLY_SETUP.md](REQUESTLY_SETUP.md) - API mocking and testing guide

## 📞 Support

For issues, questions, or suggestions:
- **GitHub Issues**: [Open an issue](https://github.com/yourusername/campus-app-new/issues)
- **Documentation**: Check setup guides in repository
- **Community**: Join discussions in GitHub Discussions
- **Email**: your.email@example.com

## 🔗 Links

- **Repository**: https://github.com/yourusername/campus-app-new
- **Expo**: https://expo.dev
- **Supabase**: https://supabase.com
- **Auth0**: https://auth0.com
- **React Navigation**: https://reactnavigation.org

## 📊 Project Stats

- **Lines of Code**: ~5,000+
- **Screens**: 15+
- **Components**: 2+ reusable
- **Database Tables**: 10+
- **Supported Platforms**: iOS, Android, Web

---

Made with ❤️ for the campus community

**Tech Stack**: React Native • Expo • Auth0 • Supabase • PostgreSQL • React Navigation

**Features**: 📍 Location Verification • 💬 Discussion Threads • 📚 Learning Hub • ✅ Smart Attendance
