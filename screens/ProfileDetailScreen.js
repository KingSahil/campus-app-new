import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { auth0 } from '../lib/auth0';
import { supabase } from '../lib/supabase';

export default function ProfileDetailScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            
            // Get Auth0 user
            const userInfo = await auth0.getUser();
            const userData = userInfo?.data?.user || userInfo;
            setUser(userData);

            if (userData?.sub) {
                // Get profile from Supabase
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', userData.sub)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching profile:', error);
                } else if (data) {
                    setProfile(data);
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await auth0.signOut();
                            navigation.replace('SignIn');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to sign out');
                        }
                    }
                }
            ]
        );
    };

    const handleEditProfile = () => {
        navigation.navigate('ProfileEnter');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <View style={styles.backButton} />
                    </View>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleEditProfile}
                    >
                        <MaterialIcons name="edit" size={24} color="#3B82F6" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView}>
                    {/* Profile Picture Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            {user?.picture ? (
                                <Image
                                    source={{ uri: user.picture }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {getInitials(profile?.full_name || user?.name || user?.email)}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.profileName}>
                            {profile?.full_name || user?.name || 'User'}
                        </Text>
                        <Text style={styles.profileEmail}>{user?.email}</Text>
                        {profile?.role && (
                            <View style={styles.roleBadge}>
                                <MaterialIcons 
                                    name={profile.role === 'instructor' ? 'school' : 'person'} 
                                    size={16} 
                                    color="#3B82F6" 
                                />
                                <Text style={styles.roleText}>
                                    {profile.role === 'instructor' ? 'Instructor' : 'Student'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Profile Details */}
                    <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        
                        {profile?.department && (
                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <MaterialIcons name="business" size={20} color="#3B82F6" />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Department</Text>
                                    <Text style={styles.detailValue}>{profile.department}</Text>
                                </View>
                            </View>
                        )}

                        {profile?.course && (
                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <MaterialIcons name="book" size={20} color="#3B82F6" />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Course</Text>
                                    <Text style={styles.detailValue}>{profile.course}</Text>
                                </View>
                            </View>
                        )}

                        {profile?.semester && (
                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <MaterialIcons name="calendar-today" size={20} color="#3B82F6" />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Semester</Text>
                                    <Text style={styles.detailValue}>{profile.semester}</Text>
                                </View>
                            </View>
                        )}

                        {profile?.phone_number && (
                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <MaterialIcons name="phone" size={20} color="#3B82F6" />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Phone Number</Text>
                                    <Text style={styles.detailValue}>{profile.phone_number}</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>
                                <MaterialIcons name="email" size={20} color="#3B82F6" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Email</Text>
                                <Text style={styles.detailValue}>{user?.email}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Actions Section */}
                    <View style={styles.actionsSection}>
                        <Text style={styles.sectionTitle}>Account</Text>
                        
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleEditProfile}
                        >
                            <View style={styles.actionLeft}>
                                <MaterialIcons name="edit" size={24} color="#3B82F6" />
                                <Text style={styles.actionText}>Edit Profile</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.actionButton, styles.signOutButton]}
                            onPress={handleSignOut}
                        >
                            <View style={styles.actionLeft}>
                                <MaterialIcons name="logout" size={24} color="#EF4444" />
                                <Text style={[styles.actionText, styles.signOutText]}>Sign Out</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Footer spacing */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#1F2937',
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#1F2937',
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#3B82F6',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#2563EB',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 12,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    detailsSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '500',
    },
    actionsSection: {
        padding: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1F2937',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    signOutButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    signOutText: {
        color: '#EF4444',
    },
});
