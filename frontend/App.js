import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import { auth0 } from './lib/auth0';
import { supabase } from './lib/supabase';

import Background from './components/Background';
import SignInScreen from './screens/1.SignInScreen';
import SignUpScreen from './screens/2.ProfileScreen';
import ProfileEnterScreen from './screens/3.ProfileEnterScreen';
import ProfileDetailScreen from './screens/4.ProfileDetailScreen';
import GetStartedScreen from './screens/5.GetStartedScreen';
import DashboardScreen from './screens/6.DashboardScreen';
import AdminDashboardScreen from './screens/7.AdminDashboardScreen';
import AttendanceAdminScreen from './screens/19.AttendanceAdminScreen';
import ManageAttendanceScreen from './screens/20.ManageAttendanceScreen';
import AttendanceListScreen from './screens/21.AttendanceListScreen';
import StudentAttendanceScreen from './screens/8.StudentAttendanceScreen';
import NoticesScreen from './screens/9.NoticesScreen';
import LearningHubScreen from './screens/10.LearningHubScreen';
import SubjectTopicsScreen from './screens/11.SubjectTopicsScreen';
import MaterialSelectScreen from './screens/12.MaterialSelectScreen';
import VideosListScreen from './screens/13.VideosListScreen';
import LectureVideoScreen from './screens/14.LectureVideoScreen';
import NotesListScreen from './screens/15.NotesListScreen';
import NoteDetailScreen from './screens/16.NoteDetailScreen';
import QuestionsListScreen from './screens/17.QuestionsListScreen';
import QuestionDetailScreen from './screens/18.QuestionDetailScreen';

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
      MaterialSelect: 'material-select',
      VideosList: 'videos-list',
      LectureVideo: 'lecture-video',
      NotesList: 'notes-list',
      NoteDetail: 'note-detail',
      QuestionsList: 'questions-list',
      QuestionDetail: 'question-detail',
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
            <Stack.Screen name="MaterialSelect" component={MaterialSelectScreen} />
            <Stack.Screen name="VideosList" component={VideosListScreen} />
            <Stack.Screen name="LectureVideo" component={LectureVideoScreen} />
            <Stack.Screen name="NotesList" component={NotesListScreen} />
            <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
            <Stack.Screen name="QuestionsList" component={QuestionsListScreen} />
            <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
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
