


# Campus Super App 🎓

A comprehensive React Native mobile application designed to streamline campus life for students and administrators. Built with Expo, this app provides a unified platform for managing academic activities, attendance tracking, food ordering, library services, and more.

<img width="847" height="424" alt="image" src="https://github.com/user-attachments/assets/a2761a54-0540-4c01-8f66-5c84a4cd78d7" />
<img width="914" height="380" alt="image" src="https://github.com/user-attachments/assets/564afa60-76b6-45d1-8068-6020f56bdd82" />
<img width="578" height="396" alt="image" src="https://github.com/user-attachments/assets/4f9e3438-e2c5-4578-9dd2-7ef1066b2a33" />
<img width="887" height="518" alt="image" src="https://github.com/user-attachments/assets/3e46bd31-ecc4-4c04-bcc2-b6d658555b96" />
<img width="695" height="471" alt="image" src="https://github.com/user-attachments/assets/0e6f10ce-8c64-4b5e-bde4-c84bb271e223" />







## ✨ Features

### Student Features
- **Dashboard**: Personalized student dashboard with quick access to all services
- **Profile Management**: User profile with customization options
- **Learning Hub**: Access course materials, videos, and quizzes
- **Library Services**: Browse and manage library resources
- **Food Ordering**: Order from campus cafeterias and restaurants
- **Student Voice**: Forum for student discussions and feedback
- **Campus Marketplace**: Buy and sell items within the campus community

### Admin Features
- **Admin Portal**: Comprehensive admin dashboard for managing campus operations
- **Attendance Management**:
  - Configure class schedules with custom timings and repeat patterns
  - Start and manage attendance sessions in real-time
  - View detailed attendance lists with present/absent status
  - Live session timer and session tracking
  - Search and filter student attendance records
- **Student Management**: Oversee student activities and profiles
- **Analytics**: Track attendance patterns and generate reports

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS development: macOS with Xcode
- For Android development: Android Studio

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/campus-app.git
cd campus-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running the App

- **iOS Simulator**: Press `i` in the terminal or run `npm run ios`
- **Android Emulator**: Press `a` in the terminal or run `npm run android`
- **Web Browser**: Press `w` in the terminal or run `npm run web`
- **Physical Device**: Scan the QR code with the Expo Go app

## 📱 Screens

### Authentication
- **Sign In**: User authentication with email/password
- **Get Started**: Onboarding screen for new users
- **Profile Setup**: Initial profile configuration

### Main Screens
- **Student Dashboard**: Central hub for student features
- **Admin Dashboard**: Administrative control panel
- **Attendance Admin**: Class configuration and setup
- **Manage Attendance**: Active session management
- **Attendance List**: Real-time attendance tracking with student status

## 🛠️ Tech Stack

- **Framework**: React Native (0.81.5)
- **Development Platform**: Expo (SDK 54)
- **Navigation**: React Navigation v7
- **UI Components**:
  - React Native Safe Area Context
  - Expo Linear Gradient
  - Material Icons (@expo/vector-icons)
- **Additional Features**:
  - React Native SVG
  - Expo Image Picker
  - Community DateTime Picker

## 📂 Project Structure

```
campus-app/
├── App.js                 # Main application entry point
├── index.js              # Root index file
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── assets/               # Images, fonts, and static resources
├── components/           # Reusable components
│   └── Background.js     # Animated gradient background
└── screens/              # Application screens
    ├── SignInScreen.js
    ├── GetStartedScreen.js
    ├── Profile.js
    ├── DashboardScreen.js
    ├── AdminDashboardScreen.js
    ├── AttendanceAdminScreen.js
    ├── ManageAttendanceScreen.js
    └── AttendanceListScreen.js
```

## 🎨 Design Features

- **Dark Theme**: Modern dark purple-blue gradient background
- **Glassmorphism**: Frosted glass effect on cards and overlays
- **iOS-Style UI**: Clean, minimalist interface inspired by iOS design
- **Responsive**: Adapts to different screen sizes and orientations
- **Smooth Animations**: Fade transitions and interactive elements

## 🔧 Configuration

The app uses various configurations in `app.json`. Customize the following:
- App name and slug
- Platform-specific settings
- Splash screen and icon
- Orientation and status bar

## 📋 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser

## 🚧 Roadmap

- [ ] Push notifications for attendance reminders
- [ ] Real-time chat integration
- [ ] Payment gateway for food ordering
- [ ] AI-powered study recommendations
- [ ] Campus map with navigation
- [ ] Event calendar and RSVP system
- [ ] Grade tracking and GPA calculator
- [ ] Assignment submission portal

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Expo team for the amazing framework
- React Navigation for seamless navigation
- Material Design Icons for beautiful icons
- Campus community for feature ideas and feedback

## 📞 Support

For issues, questions, or suggestions:
- Open an issue in the GitHub repository
- Contact: your.email@example.com

---

Made with ❤️ for the campus community
