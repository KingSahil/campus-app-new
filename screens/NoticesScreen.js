import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NoticesScreen = ({ navigation }) => {
  const urgentNotices = [
    {
      id: 1,
      title: 'Campus Closure Due to Weather',
      source: "Dean's Office",
      time: '2h ago',
      icon: 'warning',
      iconColor: '#ef4444',
    },
    {
      id: 2,
      title: 'Final Exam Schedule Update',
      source: "Registrar's Office",
      time: '1 day ago',
      icon: 'warning',
      iconColor: '#ef4444',
    },
  ];

  const generalAnnouncements = [
    {
      id: 3,
      title: 'Library Hours Extended for Finals',
      source: 'Library Services',
      time: '2 days ago',
      icon: 'megaphone',
      iconColor: '#f59e0b',
    },
    {
      id: 4,
      title: 'Spring Career Fair Registration',
      source: 'Career Development',
      time: '4 days ago',
      icon: 'megaphone',
      iconColor: '#f59e0b',
    },
  ];

  const courseSpecificNotes = [
    {
      id: 5,
      title: 'CS101: Assignment 3 Graded',
      source: 'Prof. Alan Turing',
      time: '5h ago',
      icon: 'school',
      iconColor: '#137fec',
    },
    {
      id: 6,
      title: 'PHY205: Lecture moved to Hall B',
      source: 'Physics Department',
      time: '1 day ago',
      icon: 'school',
      iconColor: '#137fec',
    },
  ];

  const NoticeItem = ({ notice }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between px-4 py-3 min-h-[72px] active:bg-white/5"
      onPress={() => {
        // Handle notice tap
        console.log('Notice tapped:', notice.title);
      }}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 rounded-lg bg-[#283039] items-center justify-center mr-4">
          <Ionicons name={notice.icon} size={24} color={notice.iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-white/90 text-base font-medium leading-normal" numberOfLines={1}>
            {notice.title}
          </Text>
          <Text className="text-[#9dabb9] text-sm font-normal leading-normal" numberOfLines={2}>
            {notice.source} - {notice.time}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
    </TouchableOpacity>
  );

  const NoticeSection = ({ title, notices }) => (
    <View className="mt-4">
      <Text className="px-4 pb-2 pt-4 text-lg font-bold leading-tight text-white/90">
        {title}
      </Text>
      <View>
        {notices.map((notice) => (
          <NoticeItem key={notice.id} notice={notice} />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#101922]">
      <StatusBar barStyle="light-content" backgroundColor="#101922" />
      
      {/* Header */}
      <View className="px-4 pb-2 pt-4">
        <View className="flex-row items-center justify-between h-12 mb-2">
          <TouchableOpacity 
            className="w-12 h-12 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 items-center justify-center">
            <Ionicons name="search" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
        <Text className="text-[28px] font-bold leading-tight text-white/90">
          Notices
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <NoticeSection title="Urgent Notices" notices={urgentNotices} />
        <NoticeSection title="General Announcements" notices={generalAnnouncements} />
        <NoticeSection title="Course Specific Notes" notices={courseSpecificNotes} />
        
        {/* Bottom padding for navigation */}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NoticesScreen;