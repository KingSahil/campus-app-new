import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Image, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { auth0 } from '../lib/auth0';
import { supabase } from '../lib/supabase';

// Helper function to generate a consistent UUID from a string
const generateUUIDFromString = (str) => {
    // Simple hash function to generate consistent UUID
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    
    // Convert to UUID format
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.substr(0, 8)}-${hex.substr(0, 4)}-4${hex.substr(0, 3)}-${hex.substr(0, 4)}-${hex.substr(0, 12)}`.padEnd(36, '0');
};

// Campus location coordinates with high precision
const CAMPUS_LOCATION = {
    latitude: 31.649174,
    longitude: 74.818695,
    elevation: 228, // meters above sea level
};

const ALLOWED_DISTANCE = 200 // meters - tightened for better accuracy
const MAX_GPS_ACCURACY = 200; // Only accept GPS readings with accuracy better than 200 meters
const LOCATION_SAMPLES = 1; // Number of location samples to average (set to 1 for fast verification)
const SAMPLE_DELAY = 0; // Delay between samples in milliseconds (no delay for single sample)

// Vincenty formula for more accurate distance calculation (up to 0.5mm precision)
// This is more accurate than Haversine for short distances
const calculateDistanceVincenty = (lat1, lon1, lat2, lon2) => {
    const a = 6378137.0; // WGS-84 semi-major axis in meters
    const b = 6356752.314245; // WGS-84 semi-minor axis in meters
    const f = 1 / 298.257223563; // WGS-84 flattening

    const L = (lon2 - lon1) * Math.PI / 180;
    const U1 = Math.atan((1 - f) * Math.tan(lat1 * Math.PI / 180));
    const U2 = Math.atan((1 - f) * Math.tan(lat2 * Math.PI / 180));
    const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
    const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

    let lambda = L, lambdaP, iterLimit = 100;
    let cosSqAlpha, sinSigma, cos2SigmaM, cosSigma, sigma;

    do {
        const sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
        sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) +
            (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
        
        if (sinSigma === 0) return 0; // Co-incident points
        
        cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
        sigma = Math.atan2(sinSigma, cosSigma);
        const sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
        cosSqAlpha = 1 - sinAlpha * sinAlpha;
        cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
        
        if (isNaN(cos2SigmaM)) cos2SigmaM = 0; // Equatorial line
        
        const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
        lambdaP = lambda;
        lambda = L + (1 - C) * f * sinAlpha *
            (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);

    if (iterLimit === 0) return NaN; // Formula failed to converge

    const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    const deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
        B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));

    return b * A * (sigma - deltaSigma); // Distance in meters
};

// Calculate 3D distance with Vincenty formula for horizontal distance
const calculate3DDistance = (lat1, lon1, alt1, lat2, lon2, alt2) => {
    const horizontalDistance = calculateDistanceVincenty(lat1, lon1, lat2, lon2);
    const verticalDistance = Math.abs(alt2 - alt1);
    
    // Pythagorean theorem for 3D distance
    return Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
};

// Get multiple location samples and return the most accurate average
const getAccurateLocation = async () => {
    const samples = [];
    let bestSample = null;
    
    for (let i = 0; i < LOCATION_SAMPLES; i++) {
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced, // Good balance between speed and accuracy
                timeInterval: 500,
                distanceInterval: 0,
            });
            
            // Track the best sample
            if (!bestSample || (location.coords.accuracy < bestSample.coords.accuracy)) {
                bestSample = location;
            }
            
            // Collect all samples with reasonable accuracy
            if (location.coords.accuracy && location.coords.accuracy <= MAX_GPS_ACCURACY) {
                samples.push(location);
            }
            
            // Wait before next sample (except on last iteration)
            if (i < LOCATION_SAMPLES - 1) {
                await new Promise(resolve => setTimeout(resolve, SAMPLE_DELAY));
            }
        } catch (error) {
            console.error(`Sample ${i + 1} failed:`, error);
        }
    }
    
    // If we have at least one good sample, use weighted average
    if (samples.length > 0) {
        // Sort by accuracy and take the best ones
        samples.sort((a, b) => (a.coords.accuracy || Infinity) - (b.coords.accuracy || Infinity));
        const bestSamples = samples.slice(0, Math.min(3, samples.length));
        
        // Calculate weighted average based on accuracy (more weight to more accurate readings)
        let totalWeight = 0;
        let weightedLat = 0, weightedLon = 0, weightedAlt = 0;
        
        bestSamples.forEach(sample => {
            const weight = 1 / (sample.coords.accuracy || 1); // Better accuracy = higher weight
            totalWeight += weight;
            weightedLat += sample.coords.latitude * weight;
            weightedLon += sample.coords.longitude * weight;
            weightedAlt += (sample.coords.altitude || 0) * weight;
        });
        
        return {
            latitude: weightedLat / totalWeight,
            longitude: weightedLon / totalWeight,
            altitude: weightedAlt / totalWeight,
            accuracy: Math.min(...bestSamples.map(s => s.coords.accuracy || Infinity)),
            timestamp: Date.now(),
            samplesUsed: bestSamples.length,
        };
    }
    
    // Fallback: If no samples met the threshold but we have at least one reading, use the best one
    if (bestSample) {
        console.warn(`Using fallback GPS reading with accuracy: ${bestSample.coords.accuracy}m`);
        return {
            latitude: bestSample.coords.latitude,
            longitude: bestSample.coords.longitude,
            altitude: bestSample.coords.altitude || 0,
            accuracy: bestSample.coords.accuracy || 999,
            timestamp: Date.now(),
            samplesUsed: 1,
        };
    }
    
    // No GPS readings at all
    throw new Error('Could not get GPS readings. Please check that location services are enabled and you have moved away from buildings or indoor areas for better signal.');
};

export default function DashboardScreen({ navigation }) {
    const [user, setUser] = React.useState(null);
    const [activeSessions, setActiveSessions] = React.useState([]);
    const [loadingSessions, setLoadingSessions] = React.useState(true);
    const [confirmModal, setConfirmModal] = React.useState({ visible: false, session: null, distance: 0, accuracy: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        getUserInfo();
        fetchActiveSessions();
        
        // Refresh sessions every 30 seconds
        const interval = setInterval(fetchActiveSessions, 30000);
        return () => clearInterval(interval);
    }, []);

    const getUserInfo = async () => {
        try {
            const userInfo = await auth0.getUser();
            console.log('Auth0 user info:', userInfo);
            // Extract the actual user data from the nested structure
            const userData = userInfo?.data?.user || userInfo;
            console.log('Extracted user data:', userData);
            setUser(userData);
        } catch (error) {
            console.log('Error getting user:', error);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        
        if (!query.trim()) {
            setShowSearchResults(false);
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        setShowSearchResults(true);

        try {
            const searchTerm = query.toLowerCase().trim();
            const results = [];

            // Search for subjects
            const { data: subjects, error: subjectsError } = await supabase
                .from('subjects')
                .select('*')
                .ilike('name', `%${searchTerm}%`);

            if (subjects) {
                subjects.forEach(subject => {
                    results.push({
                        type: 'subject',
                        title: subject.name,
                        subtitle: 'Subject',
                        icon: 'book',
                        action: () => {
                            navigation.navigate('SubjectTopics', { subject });
                            setShowSearchResults(false);
                            setSearchQuery('');
                        }
                    });
                });
            }

            // Search for videos (with topic and subject info)
            const { data: videos, error: videosError } = await supabase
                .from('videos')
                .select('*, topics(name, subjects(name))')
                .ilike('title', `%${searchTerm}%`);

            if (videos) {
                videos.forEach(video => {
                    const subjectName = video.topics?.subjects?.name || 'Unknown Subject';
                    const topicName = video.topics?.name || 'Unknown Topic';
                    
                    results.push({
                        type: 'video',
                        title: video.title,
                        subtitle: `Video • ${subjectName} • ${topicName}`,
                        icon: 'play-circle-outline',
                        action: () => {
                            navigation.navigate('LectureVideo', { video });
                            setShowSearchResults(false);
                            setSearchQuery('');
                        }
                    });
                });
            }

            // Search for screens/tabs (static list)
            const screens = [
                { name: 'Learning Hub', screen: 'LearningHub', icon: 'school' },
                { name: 'Notices', screen: 'Notices', icon: 'notifications' },
                { name: 'Attendance', screen: 'StudentAttendance', icon: 'fact-check' },
                { name: 'Profile', screen: 'ProfileDetail', icon: 'person' },
            ];

            screens.forEach(screen => {
                if (screen.name.toLowerCase().includes(searchTerm)) {
                    results.push({
                        type: 'screen',
                        title: screen.name,
                        subtitle: 'Navigate to',
                        icon: screen.icon,
                        action: () => {
                            navigation.navigate(screen.screen);
                            setShowSearchResults(false);
                            setSearchQuery('');
                        }
                    });
                }
            });

            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const fetchActiveSessions = async () => {
        try {
            setLoadingSessions(true);
            const { data, error } = await supabase
                .from('attendance_sessions')
                .select(`
                    *,
                    classes (
                        id,
                        name,
                        subject,
                        start_time,
                        end_time
                    )
                `)
                .eq('is_active', true)
                .order('started_at', { ascending: false });

            if (error) {
                console.error('Error fetching active sessions:', error);
                return;
            }

            setActiveSessions(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingSessions(false);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const handleSignOut = async () => {
        try {
            await auth0.signOut();
            navigation.replace('SignIn');
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    const handleMarkAttendance = async (session) => {
        if (!user) {
            Alert.alert('Error', 'Please sign in to mark attendance');
            return;
        }

        const userEmail = user.email;
        const userName = user.name || user.given_name || user.nickname || 'Student';

        if (!userEmail) {
            Alert.alert('Error', 'Unable to get your email. Please sign in again.');
            return;
        }

        try {
            // Request location permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission Required',
                    'Please enable location access to mark attendance. You must be on campus to mark attendance.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Show loading indicator
            Alert.alert('Verifying Location', 'Getting your GPS location...');

            // Get highly accurate location with multiple samples
            const userLocation = await getAccurateLocation();

            // Calculate 3D distance using Vincenty formula (more accurate than Haversine)
            const distance = calculate3DDistance(
                userLocation.latitude,
                userLocation.longitude,
                userLocation.altitude,
                CAMPUS_LOCATION.latitude,
                CAMPUS_LOCATION.longitude,
                CAMPUS_LOCATION.elevation
            );

            console.log('High-Precision Location Verification:', {
                userLat: userLocation.latitude,
                userLon: userLocation.longitude,
                userAlt: userLocation.altitude,
                gpsAccuracy: userLocation.accuracy,
                samples: LOCATION_SAMPLES,
                samplesUsed: userLocation.samplesUsed,
                calculatedDistance: distance,
                allowedDistance: ALLOWED_DISTANCE,
                algorithm: 'Vincenty + 3D Pythagorean',
            });

            // Check if user is within allowed range
            if (distance > ALLOWED_DISTANCE) {
                Alert.alert(
                    'Location Verification Failed',
                    `You must be within ${ALLOWED_DISTANCE}m of campus to mark attendance.\n\nYour distance: ${distance.toFixed(1)}m\nGPS accuracy: ±${userLocation.accuracy.toFixed(1)}m\n\nPlease move closer to the campus center.`,
                    [{ text: 'OK' }]
                );
                return;
            }

            // Location verified, show custom confirmation modal
            setConfirmModal({
                visible: true,
                session: session,
                distance: distance.toFixed(1),
                accuracy: userLocation.accuracy.toFixed(1)
            });
        } catch (error) {
            console.error('Location error:', error);
            Alert.alert(
                'Location Error',
                error.message || 'Unable to get your location. Please make sure you have clear sky view and location services are enabled.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleConfirmAttendance = async () => {
        const session = confirmModal.session;
        const distance = confirmModal.distance;
        const accuracy = confirmModal.accuracy;
        setConfirmModal({ visible: false, session: null, distance: 0, accuracy: 0 });

        if (!session || !user) return;

        const userEmail = user.email;
        const userName = user.name || user.given_name || user.nickname || 'Student';

        try {
            // Generate a consistent student_id from email
            const studentId = generateUUIDFromString(userEmail);

            // Check if already marked
            const { data: existingRecord } = await supabase
                .from('attendance_records')
                .select('id')
                .eq('session_id', session.id)
                .eq('student_email', userEmail)
                .single();

            if (existingRecord) {
                Alert.alert('Already Marked', 'You have already marked attendance for this session');
                return;
            }

            // Insert attendance record with location data
            const { error } = await supabase
                .from('attendance_records')
                .insert({
                    session_id: session.id,
                    student_id: studentId,
                    student_email: userEmail,
                    student_name: userName,
                    status: 'present',
                    marked_at: new Date().toISOString(),
                    distance_from_campus: parseFloat(distance),
                    gps_accuracy: parseFloat(accuracy),
                    location_verified: true,
                });

            if (error) {
                console.error('Error marking attendance:', error);
                Alert.alert('Error', 'Failed to mark attendance. Please try again.');
                return;
            }

            Alert.alert(
                'Success', 
                `Attendance marked successfully!\n\nVerified distance: ${distance}m\nGPS accuracy: ±${accuracy}m`
            );
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Failed to mark attendance');
        }
    };

    const quickAccessItems = [
        { icon: 'checklist', label: 'Attendance', color: '#F97316', onPress: () => navigation.navigate('StudentAttendance') },
        { icon: 'menu-book', label: 'Learning', color: '#06B6D4', onPress: () => navigation.navigate('LearningHub') },
        { icon: 'restaurant', label: 'Food', color: '#EF4444' },
        { icon: 'local-library', label: 'Library', color: '#10B981' },
        { icon: 'campaign', label: 'Student Voice', color: '#A855F7' },        
        { icon: 'storefront', label: 'Campus Marketplace', color: '#EC4899' },

    ];

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Main Content */}
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.contentColumn}>
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.title}>Dashboard</Text>
                                <Text style={styles.subtitle}>
                                    {user?.email ? `Welcome, ${user.email.split('@')[0]}!` : 'Welcome back!'}
                                </Text>
                            </View>
                            <View style={styles.headerButtons}>
                                <TouchableOpacity 
                                    style={styles.notificationButton}
                                    onPress={() => navigation.navigate('Notices')}
                                >
                                    <MaterialIcons name="notifications" size={24} color="#ffffff" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.profilePicContainer}
                                    onPress={() => navigation.navigate('ProfileDetail')}
                                >
                                    <Image
                                        source={{ 
                                            uri: user?.picture || 
                                            'https://lh3.googleusercontent.com/aida-public/AB6AXuC_UmOn2Ca2nFEDCfiijmx_SEi5EH7D2Y6catOJoHdc88XpwtWj5zuuQ5dwNK3a7Vj-26z0EWTwIWx9VZAGwkLntb__QkElZ01Us3OAPD9MqMORkDD0exnYBC5tsdW0CqAXJPvj5vQ2xXB5z23WE7ht34HAKNIQ2JaMajtyMPmUoBdGtODTxv_B148bL522wslFyfrgwmODlqI6XuD9T1Go9MhoAdT0_OCGvuW7aPDZeK-3c0mk5T1l3noLxaYZqL_N6G4BNePt4Xs' 
                                        }}
                                        style={styles.profilePic}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <MaterialIcons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search videos, subjects, or pages..."
                                placeholderTextColor="#8E8E93"
                                value={searchQuery}
                                onChangeText={handleSearch}
                                returnKeyType="search"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity 
                                    onPress={() => {
                                        setSearchQuery('');
                                        setShowSearchResults(false);
                                        setSearchResults([]);
                                    }}
                                    style={styles.clearButton}
                                >
                                    <MaterialIcons name="close" size={20} color="#8E8E93" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Search Results */}
                        {showSearchResults && (
                            <View style={styles.searchResultsContainer}>
                                {searchLoading ? (
                                    <View style={styles.searchLoadingContainer}>
                                        <ActivityIndicator color="#0A84FF" />
                                        <Text style={styles.searchLoadingText}>Searching...</Text>
                                    </View>
                                ) : searchResults.length === 0 ? (
                                    <View style={styles.noResultsContainer}>
                                        <MaterialIcons name="search-off" size={48} color="#8E8E93" />
                                        <Text style={styles.noResultsText}>No results found</Text>
                                        <Text style={styles.noResultsSubtext}>Try searching for something else</Text>
                                    </View>
                                ) : (
                                    <ScrollView style={styles.searchResultsList} nestedScrollEnabled>
                                        {searchResults.map((result, index) => (
                                            <TouchableOpacity 
                                                key={index}
                                                style={styles.searchResultItem}
                                                onPress={result.action}
                                            >
                                                <View style={styles.searchResultIcon}>
                                                    <MaterialIcons name={result.icon} size={24} color="#0A84FF" />
                                                </View>
                                                <View style={styles.searchResultContent}>
                                                    <Text style={styles.searchResultTitle}>{result.title}</Text>
                                                    <Text style={styles.searchResultSubtitle}>{result.subtitle}</Text>
                                                </View>
                                                <MaterialIcons name="arrow-forward-ios" size={16} color="#8E8E93" />
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        )}

                        {/* Active Attendance Sessions */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Active Sessions</Text>
                                <TouchableOpacity 
                                    onPress={fetchActiveSessions}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="refresh" size={20} color="#8E8E93" />
                                </TouchableOpacity>
                            </View>
                            
                            {loadingSessions ? (
                                <View style={styles.loadingCard}>
                                    <ActivityIndicator color="#0A84FF" />
                                    <Text style={styles.loadingText}>Loading sessions...</Text>
                                </View>
                            ) : activeSessions.length === 0 ? (
                                <View style={styles.emptyCard}>
                                    <MaterialIcons name="event-busy" size={32} color="#8E8E93" />
                                    <Text style={styles.emptyText}>No active sessions</Text>
                                    <Text style={styles.emptySubtext}>Check back when your instructor starts attendance</Text>
                                </View>
                            ) : (
                                activeSessions.map((session) => (
                                    <View key={session.id} style={styles.attendanceCard}>
                                        <View style={styles.attendanceContent}>
                                            <View style={styles.attendanceIconBox}>
                                                <MaterialIcons name="school" size={24} color="#0A84FF" />
                                            </View>
                                            <View style={styles.sessionDetails}>
                                                <Text style={styles.attendanceSubject}>
                                                    {session.classes?.subject || session.classes?.name || 'Class'}
                                                </Text>
                                                <Text style={styles.attendanceTime}>
                                                    {session.classes?.start_time && session.classes?.end_time 
                                                        ? `${formatTime(session.classes.start_time)} - ${formatTime(session.classes.end_time)}`
                                                        : 'Active Now'
                                                    }
                                                </Text>
                                                {session.session_code && (
                                                    <View style={styles.codeContainer}>
                                                        <MaterialIcons name="qr-code" size={14} color="#0A84FF" />
                                                        <Text style={styles.sessionCode}>Code: {session.session_code}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.markButton} 
                                            activeOpacity={0.8}
                                            onPress={() => handleMarkAttendance(session)}
                                        >
                                            <Text style={styles.markButtonText}>Mark</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </View>


                        {/* Quick Access */}
                        <View style={[styles.section, { marginBottom: 100 }]}>
                            <Text style={styles.sectionTitle}>Quick Access</Text>
                            <View style={styles.gridContainer}>
                                {quickAccessItems.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.quickAccessCard}
                                        activeOpacity={0.8}
                                        onPress={item.onPress}
                                    >
                                        <MaterialIcons name={item.icon} size={28} color={item.color} />
                                        <Text style={styles.quickAccessLabel}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Confirmation Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={confirmModal.visible}
                    onRequestClose={() => setConfirmModal({ visible: false, session: null, distance: 0, accuracy: 0 })}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <MaterialIcons name="check-circle" size={48} color="#10B981" />
                            </View>
                            
                            <Text style={styles.modalTitle}>Mark Attendance</Text>
                            
                            <View style={styles.modalInfo}>
                                <View style={styles.infoRow}>
                                    <MaterialIcons name="location-on" size={20} color="#10B981" />
                                    <Text style={styles.infoText}>Distance: {confirmModal.distance}m from campus</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <MaterialIcons name="gps-fixed" size={20} color="#10B981" />
                                    <Text style={styles.infoText}>GPS Accuracy: ±{confirmModal.accuracy}m</Text>
                                </View>
                                {confirmModal.session && (
                                    <View style={styles.infoRow}>
                                        <MaterialIcons name="school" size={20} color="#0A84FF" />
                                        <Text style={styles.infoText}>
                                            {confirmModal.session.classes?.subject || confirmModal.session.classes?.name || 'Class'}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.modalMessage}>Location verified using Vincenty formula with {confirmModal.session ? (confirmModal.accuracy < 30 ? 'high' : 'moderate') : ''} precision ({LOCATION_SAMPLES} GPS samples)</Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setConfirmModal({ visible: false, session: null, distance: 0, accuracy: 0 })}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleConfirmAttendance}
                                >
                                    <Text style={styles.confirmButtonText}>Mark Attendance</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    contentColumn: {
        width: '100%',
        maxWidth: 1400,
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    notificationButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    profilePicContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#0A84FF',
    },
    profilePic: {
        width: '100%',
        height: '100%',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 12,
    },
    loadingCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#8E8E93',
        fontSize: 14,
    },
    emptyCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        color: '#8E8E93',
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
    attendanceCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }
        }),
    },
    attendanceContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    attendanceIconBox: {
        backgroundColor: 'rgba(10, 132, 255, 0.2)',
        padding: 12,
        borderRadius: 24,
    },
    sessionDetails: {
        flex: 1,
    },
    attendanceSubject: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        marginBottom: 4,
    },
    attendanceTime: {
        fontSize: 14,
        color: '#8E8E93',
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    sessionCode: {
        fontSize: 12,
        color: '#0A84FF',
        fontWeight: '600',
    },
    markButton: {
        backgroundColor: '#0A84FF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    markButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    quickAccessCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        width: '47%',
        minHeight: 100,
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }
        }),
    },
    quickAccessLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        marginTop: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'rgba(28, 28, 46, 0.98)',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    modalHeader: {
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalInfo: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#ffffff',
        flex: 1,
    },
    modalMessage: {
        fontSize: 15,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cancelButtonText: {
        color: '#8E8E93',
        fontSize: 15,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#0A84FF',
    },
    confirmButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginTop: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#ffffff',
        fontSize: 15,
        paddingVertical: 12,
    },
    clearButton: {
        padding: 4,
    },
    searchResultsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        marginBottom: 16,
        maxHeight: 400,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchLoadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 12,
    },
    searchLoadingText: {
        color: '#8E8E93',
        fontSize: 14,
    },
    noResultsContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    noResultsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginTop: 12,
    },
    noResultsSubtext: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 4,
    },
    searchResultsList: {
        maxHeight: 400,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    searchResultIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(10, 132, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    searchResultContent: {
        flex: 1,
    },
    searchResultTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 2,
    },
    searchResultSubtitle: {
        fontSize: 13,
        color: '#8E8E93',
    },
});
