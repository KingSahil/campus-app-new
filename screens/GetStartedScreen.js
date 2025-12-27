import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function GetStartedScreen({ navigation }) {
    const handleJoin = () => {
        navigation.navigate('Dashboard');
    };

    const handleCreate = () => {
        navigation.navigate('AdminDashboard');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.header}>
                        <Text style={styles.title}>Get Started</Text>
                        <Text style={styles.subtitle}>Join an existing classroom or create a new one.</Text>
                    </View>

                    <View style={styles.main}>
                        {/* Join Classroom Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                    <MaterialIcons name="group" size={24} color="#60A5FA" />
                                </View>
                                <Text style={styles.cardTitle}>Join Classroom</Text>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.srOnly}>Classroom Code</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="ENTER CODE"
                                    placeholderTextColor="#94a3b8"
                                    autoCapitalize="characters"
                                />
                                <TouchableOpacity style={styles.joinButton} activeOpacity={0.8} onPress={handleJoin}>
                                    <Text style={styles.buttonText}>Join</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.divider} />
                        </View>

                        {/* Create Classroom Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                                    <MaterialIcons name="add-circle-outline" size={24} color="#C084FC" />
                                </View>
                                <Text style={styles.cardTitle}>Create Classroom</Text>
                            </View>
                            <Text style={styles.cardDescription}>Start a new classroom as an instructor.</Text>
                            <TouchableOpacity style={styles.createButton} activeOpacity={0.8} onPress={handleCreate}>
                                <Text style={styles.createButtonText}>Create</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Background color is handled by the parent or common background component, 
        // but we can keep transparent here or fallback
        backgroundColor: 'transparent',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 16,
        textAlign: 'center',
    },
    main: {
        maxWidth: 448, // max-w-md
        width: '100%',
        alignSelf: 'center',
        gap: 32, // space-y-8 equivalent roughly
    },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)', // bg-slate-800/50
        borderColor: '#334155', // border-slate-700
        borderWidth: 1,
        borderRadius: 16,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 16,
    },
    iconBox: {
        padding: 8,
        borderRadius: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    formGroup: {
        gap: 16,
    },
    srOnly: {
        height: 0,
        width: 0,
        opacity: 0,
    },
    input: {
        backgroundColor: 'rgba(51, 65, 85, 0.5)', // bg-slate-700/50
        borderColor: '#475569', // border-slate-600
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 4.8, // tracking-[0.3em] -> 16 * 0.3
    },
    joinButton: {
        backgroundColor: '#2563EB', // bg-blue-600
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0 4px 8px rgba(37, 99, 235, 0.2)',
            }
        }),
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#334155', // border-slate-700
    },
    dividerText: {
        color: '#64748b', // text-slate-500
        fontSize: 14,
        fontWeight: '500',
        marginHorizontal: 16,
    },
    cardDescription: {
        color: '#94a3b8', // text-slate-400
        fontSize: 14,
        marginBottom: 16,
    },
    createButton: {
        backgroundColor: '#334155', // bg-slate-700
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
});
