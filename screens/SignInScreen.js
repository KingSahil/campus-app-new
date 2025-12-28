import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { auth0 } from '../lib/auth0';
import { supabase } from '../lib/supabase';

const GoogleIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24">
        <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
);

export default function SignInScreen({ navigation }) {
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const { data: { session } } = await auth0.getSession();
            console.log('Session check:', session);
            if (session) {
                await checkUserOnboardingStatus();
            }
        } catch (error) {
            console.log('No active session:', error);
        }
    };

    const checkUserOnboardingStatus = async () => {
        try {
            const userInfo = await auth0.getUser();
            const userData = userInfo?.data?.user || userInfo;
            const userId = userData?.sub || userData?.email;

            if (!userId) {
                navigation.replace('Profile');
                return;
            }

            // Check user profile in database
            const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
                navigation.replace('Profile');
                return;
            }

            // Route based on onboarding status
            if (!profile) {
                // No profile exists - go to Profile entry
                navigation.replace('Profile');
            } else if (!profile.profile_completed) {
                // Profile incomplete - go to Profile entry
                navigation.replace('Profile');
            } else if (!profile.onboarding_completed) {
                // Profile complete but onboarding not done - go to GetStarted
                navigation.replace('GetStarted');
            } else {
                // Everything complete - route based on role
                if (profile.role === 'instructor') {
                    navigation.replace('AdminDashboard');
                } else {
                    navigation.replace('Dashboard');
                }
            }
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            navigation.replace('Profile');
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            console.log('Starting Google sign-in...');
            
            const { user, error } = await auth0.signInWithGoogle();
            console.log('Sign-in result:', { user, error });

            if (error) throw error;

            if (user) {
                console.log('User signed in, checking onboarding status...');
                await checkUserOnboardingStatus();
            }
        } catch (error) {
            console.error('Sign in error:', error);
            Alert.alert('Sign In Error', error.message || 'Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>

                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <MaterialIcons name="school" size={48} color="#818cf8" />
                        </View>
                        <Text style={styles.appTitle}>Campus App</Text>
                        <Text style={styles.appSubtitle}>Your all-in-one companion for university life.</Text>
                    </View>

                    {/* Login Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.welcomeText}>Welcome Back</Text>
                            <Text style={styles.instructionText}>Please sign in to continue</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGoogleSignIn}
                            activeOpacity={0.9}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#1e293b" />
                            ) : (
                                <>
                                    <GoogleIcon />
                                    <Text style={styles.googleButtonText}>Sign in with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <Text style={styles.footerText}>
                        By continuing, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
                    </Text>

                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Background handled by parent
    },
    safeArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        padding: 24,
        alignItems: 'center',
        maxWidth: 400,
    },
    header: {
        marginBottom: 48,
        alignItems: 'center',
    },
    logoContainer: {
        backgroundColor: 'rgba(79, 70, 229, 0.1)', // indigo-600/10
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
        ...Platform.select({
            ios: {
                backdropFilter: 'blur(20px)', // Not natively supported in RN, just for ref
            },
        }),
    },
    appTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    appSubtitle: {
        color: '#94a3b8', // text-slate-400
        fontSize: 16,
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 24,
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.6)', // Dark glass background
        borderColor: 'rgba(255, 255, 255, 0.08)', // Subtle border
        borderWidth: 1,
        borderRadius: 24,
        padding: 32,
        marginBottom: 32,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 0,
            },
            web: {
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)', // Helper for web
                backdropFilter: 'blur(10px)',
            }
        }),
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 14,
        color: '#94a3b8', // text-slate-400
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 12,
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(99, 102, 241, 0.1)',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 1,
                shadowRadius: 15,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 10px 15px rgba(99, 102, 241, 0.1)',
            }
        }),
    },
    googleButtonText: {
        color: '#1e293b', // text-slate-800
        fontSize: 15,
        fontWeight: '500',
    },
    footerText: {
        fontSize: 12,
        color: '#64748b', // text-slate-500
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 20,
    },
    linkText: {
        color: '#818cf8', // text-indigo-400
        textDecorationLine: 'underline',
    },
});
