import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Background from './components/Background';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/Profile';
import ProfileEnterScreen from './screens/ProfileEnterScreen';
import GetStartedScreen from './screens/GetStartedScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AttendanceAdminScreen from './screens/AttendanceAdminScreen';
import ManageAttendanceScreen from './screens/ManageAttendanceScreen';
import AttendanceListScreen from './screens/AttendanceListScreen';
import NoticesScreen from './screens/NoticesScreen';
import LearningHubScreen from './screens/LearningHubScreen';
import SubjectTopicsScreen from './screens/SubjectTopicsScreen';
import VideosListScreen from './screens/VideosListScreen';
import LectureVideoScreen from './screens/LectureVideoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>      
      <View style={styles.container}>
        <StatusBar style="light" />
        <Background /> 
        

        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Platform.OS === 'android' ? 'transparent' : 'black' },
              animation: 'fade', // Optional: nice transition
            }}
            initialRouteName="Profiled"
          >
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="Profile" component={SignUpScreen} />
            <Stack.Screen name="ProfileEnter" component={ProfileEnterScreen} />
            <Stack.Screen name="GetStarted" component={GetStartedScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AttendanceAdmin" component={AttendanceAdminScreen} />
            <Stack.Screen name="ManageAttendance" component={ManageAttendanceScreen} />
            <Stack.Screen name="AttendanceList" component={AttendanceListScreen} />
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
