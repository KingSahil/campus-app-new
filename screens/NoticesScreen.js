import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

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
      style={styles.noticeItem}
      onPress={() => {
        // Handle notice tap
        console.log('Notice tapped:', notice.title);
      }}
    >
      <View style={styles.noticeContent}>
        <View style={styles.iconBox}>
          <Ionicons name={notice.icon} size={24} color={notice.iconColor} />
        </View>
        <View style={styles.noticeTextContainer}>
          <Text style={styles.noticeTitle} numberOfLines={1}>
            {notice.title}
          </Text>
          <Text style={styles.noticeSubtitle} numberOfLines={2}>
            {notice.source} - {notice.time}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
    </TouchableOpacity>
  );

  const NoticeSection = ({ title, notices }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#101922" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>
          Notices
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <NoticeSection title="Urgent Notices" notices={urgentNotices} />
        <NoticeSection title="General Announcements" notices={generalAnnouncements} />
        <NoticeSection title="Course Specific Notes" notices={courseSpecificNotes} />
        
        {/* Bottom padding for navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="Notices" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    marginBottom: 8,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
  },
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 72,
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#283039',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  noticeSubtitle: {
    color: '#9dabb9',
    fontSize: 14,
    marginTop: 2,
  },
  bottomPadding: {
    height: 96,
  },
});

export default NoticesScreen;
