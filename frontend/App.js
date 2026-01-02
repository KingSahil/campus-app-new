import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import { auth0 } from './lib/auth0';
import { supabase } from './lib/supabase';

import Background from './components/Background';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/Profile';
import ProfileEnterScreen from './screens/ProfileEnterScreen';
import ProfileDetailScreen from './screens/ProfileDetailScreen';
import GetStartedScreen from './screens/GetStartedScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AttendanceAdminScreen from './screens/AttendanceAdminScreen';
import ManageAttendanceScreen from './screens/ManageAttendanceScreen';
import AttendanceListScreen from './screens/AttendanceListScreen';
import StudentAttendanceScreen from './screens/StudentAttendanceScreen';
import NoticesScreen from './screens/NoticesScreen';
import LearningHubScreen from './screens/LearningHubScreen';
import SubjectTopicsScreen from './screens/SubjectTopicsScreen';
import VideosListScreen from './screens/VideosListScreen';
import LectureVideoScreen from './screens/LectureVideoScreen';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [],
  config: {
    screens: {
      SignIn: 'signin',
      Profile: 'profile',
      ProfileEnter: 'profile-enter',
      ProfileDetail: 'profile-detail',
      GetStarted: 'get-started',
      Dashboard: 'dashboard',
      AdminDashboard: 'admin-dashboard',
      AttendanceAdmin: 'attendance-admin',
      ManageAttendance: 'manage-attendance',
      AttendanceList: 'attendance-list',
      StudentAttendance: 'student-attendance',
      Notices: 'notices',
      LearningHub: 'learning-hub',
      SubjectTopics: 'subject-topics',
      VideosList: 'videos-list',
      LectureVideo: 'lecture-video',
    },
  },
};

export default function App() {
  const [initialRoute, setInitialRoute] = useState('SignIn');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userInfo = await auth0.getUser();
      const userData = userInfo?.data?.user || userInfo;
      const userId = userData?.sub || userData?.email;

      if (userId) {
        // User is signed in, check their profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!profile || !profile.profile_completed) {
          setInitialRoute('Profile');
        } else if (!profile.onboarding_completed) {
          setInitialRoute('GetStarted');
        } else {
          setInitialRoute(profile.role === 'instructor' ? 'AdminDashboard' : 'Dashboard');
        }
      }
    } catch (error) {
      console.log('No active session');
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>      
      <View style={styles.container}>
        <StatusBar style="light" />
        <Background /> 
        

        <NavigationContainer linking={linking}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Platform.OS === 'android' ? 'transparent' : 'black' },
              animation: 'fade', // Optional: nice transition
            }}
            initialRouteName={initialRoute}
          >
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="Profile" component={SignUpScreen} />
            <Stack.Screen name="ProfileEnter" component={ProfileEnterScreen} />
            <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
            <Stack.Screen name="GetStarted" component={GetStartedScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AttendanceAdmin" component={AttendanceAdminScreen} />
            <Stack.Screen name="ManageAttendance" component={ManageAttendanceScreen} />
            <Stack.Screen name="AttendanceList" component={AttendanceListScreen} />
            <Stack.Screen name="StudentAttendance" component={StudentAttendanceScreen} />
            <Stack.Screen name="Notices" component={NoticesScreen} />
            <Stack.Screen name="LearningHub" component={LearningHubScreen} />
            <Stack.Screen name="SubjectTopics" component={SubjectTopicsScreen} />
            <Stack.Screen name="VideosList" component={VideosListScreen} />
            <Stack.Screen name="LectureVideo" component={LectureVideoScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Fallback
    ...Platform.select({
      web: {
        minHeight: '100vh',
      },
    })
  },
});
