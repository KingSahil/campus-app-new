import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export default function ProfileEnterScreen({ navigation, route }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        department: '',
        course: '',
        semester: '',
        phoneNumber: '',
    });

    const { image } = route.params || {};

    useEffect(() => {
        if (image) {
            analyzeStudentID();
        }
    }, [image]);

    const analyzeStudentID = async () => {
        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            // Convert image URI to base64
            const response = await fetch(image);
            const blob = await response.blob();
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1];
                    resolve(base64data);
                };
                reader.readAsDataURL(blob);
            });

            const prompt = `Analyze this student ID card and extract the following information in JSON format:
{
  "fullName": "student's full name",
  "department": "department name",
  "course": "course or program name",
  "semester": "semester or year",
  "phoneNumber": "phone number if visible"
}

If any field is not visible or unclear, use an empty string. Only return valid JSON, no additional text.`;

            const imagePart = {
                inlineData: {
                    data: base64,
                    mimeType: 'image/jpeg',
                },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const text = result.response.text();
            
            // Parse JSON response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const extractedData = JSON.parse(jsonMatch[0]);
                setFormData({
                    fullName: extractedData.fullName || '',
                    department: extractedData.department || '',
                    course: extractedData.course || '',
                    semester: extractedData.semester || '',
                    phoneNumber: extractedData.phoneNumber || '',
                });
            }
        } catch (error) {
            console.error('Error analyzing student ID:', error);
            Alert.alert('Error', 'Failed to analyze student ID. Please fill the details manually.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        // Validate required fields
        if (!formData.fullName || !formData.department || !formData.course || !formData.semester) {
            Alert.alert('Missing Information', 'Please fill in all required fields.');
            return;
        }

        // Navigate to dashboard or next screen
        navigation.navigate('GetStarted');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>My Profile</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* AI Info Banner */}
                    {loading ? (
                        <View style={styles.loadingBanner}>
                            <ActivityIndicator size="small" color="#60a5fa" />
                            <Text style={styles.loadingText}>Analyzing student ID with AI...</Text>
                        </View>
                    ) : (
                        <View style={styles.infoBanner}>
                            <MaterialIcons name="auto-awesome" size={20} color="#60a5fa" />
                            <Text style={styles.infoText}>
                                Details pre-filled from your student ID scan. Please verify and edit if necessary.
                            </Text>
                        </View>
                    )}

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Full Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name *</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#64748b"
                                    value={formData.fullName}
                                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                    editable={!loading}
                                />
                                <MaterialIcons name="edit" size={18} color="#64748b" style={styles.inputIcon} />
                            </View>
                        </View>

                        {/* Department and Course Row */}
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Department *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Comp. Sci"
                                    placeholderTextColor="#64748b"
                                    value={formData.department}
                                    onChangeText={(text) => setFormData({ ...formData, department: text })}
                                    editable={!loading}
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Course *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., B.Tech"
                                    placeholderTextColor="#64748b"
                                    value={formData.course}
                                    onChangeText={(text) => setFormData({ ...formData, course: text })}
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Semester */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Semester *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 5th Semester"
                                placeholderTextColor="#64748b"
                                value={formData.semester}
                                onChangeText={(text) => setFormData({ ...formData, semester: text })}
                                editable={!loading}
                            />
                        </View>

                        {/* Phone Number */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                placeholderTextColor="#64748b"
                                keyboardType="phone-pad"
                                value={formData.phoneNumber}
                                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                                editable={!loading}
                            />
                        </View>

                        {/* Continue Button */}
                        <TouchableOpacity
                            style={[styles.continueButton, loading && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.continueButtonText}>Continue</Text>
                            <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0F19',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(11, 15, 25, 0.8)',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    saveButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#c084fc',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    loadingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderRadius: 12,
        padding: 12,
        marginTop: 24,
        gap: 12,
    },
    loadingText: {
        fontSize: 13,
        color: '#60a5fa',
        flex: 1,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderRadius: 12,
        padding: 12,
        marginTop: 24,
        gap: 12,
    },
    infoText: {
        fontSize: 12,
        color: '#93c5fd',
        flex: 1,
        lineHeight: 18,
    },
    formContainer: {
        marginTop: 24,
        paddingBottom: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: '#c084fc',
        marginBottom: 8,
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#e2e8f0',
        fontSize: 15,
    },
    inputIcon: {
        position: 'absolute',
        right: 16,
        top: 14,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    halfWidth: {
        flex: 1,
    },
    continueButton: {
        backgroundColor: '#c084fc',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
    },
    continueButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
});
