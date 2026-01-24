import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Background from '../components/Background';

export default function MaterialSelectScreen({ navigation, route }) {
    const { subjectId, subjectName, topicId, topicName, subject: subjectObj, topic: topicObj } = route.params || {};

    const subject = subjectObj || { id: subjectId, name: subjectName };
    const topic = topicObj || { id: topicId, name: topicName };

    // Handle missing params
    if (!subject.id || !topic.id) {
        return (
            <View style={styles.container}>
                <Background />
                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    <View style={[styles.contentColumn, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                        <MaterialIcons name="error-outline" size={48} color="#8E8E93" />
                        <Text style={styles.emptyText}>Missing subject or topic information</Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    const materials = [
        {
            id: 'videos',
            title: 'Videos',
            subtitle: 'Watch lectures and tutorials',
            icon: 'play-circle',
            route: 'VideosList',
        },
        {
            id: 'notes',
            title: 'Notes',
            subtitle: 'Read summaries and key points',
            icon: 'description',
            route: 'NotesList',
        },
        {
            id: 'questions',
            title: 'Ques / PYQ',
            subtitle: 'Practice and review questions',
            icon: 'quiz',
            route: 'QuestionsList',
        },
    ];

    return (
        <View style={styles.container}>
            <Background />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.contentColumn}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerText}>
                                <Text style={styles.title}>{topic.name}</Text>
                                <Text style={styles.subtitle}>{subject.name}</Text>
                            </View>
                            <View style={styles.placeholder} />
                        </View>

                        {/* Material Cards */}
                        <View style={styles.materialsContainer}>
                            {materials.map((material) => (
                                <TouchableOpacity
                                    key={material.id}
                                    style={styles.materialCard}
                                    onPress={() => navigation.navigate(material.route, {
                                        subjectId: subject.id,
                                        subjectName: subject.name,
                                        topicId: topic.id,
                                        topicName: topic.name
                                    })}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.materialContent}>
                                        <View>
                                            <Text style={styles.materialTitle}>{material.title}</Text>
                                            <Text style={styles.materialSubtitle}>{material.subtitle}</Text>
                                        </View>
                                        <MaterialIcons name={material.icon} size={32} color="#8E8E93" />
                                    </View>
                                </TouchableOpacity>
                            ))}
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
        backgroundColor: 'transparent',
    },
    safeArea: {
        flex: 1,
        ...Platform.select({ web: { paddingTop: 20 } }),
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
        alignItems: 'center',
        marginBottom: 32,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 4,
    },
    placeholder: {
        width: 48,
    },
    materialsContainer: {
        gap: 16,
    },
    materialCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 24,
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
    materialContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    materialTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0A84FF',
        marginBottom: 4,
    },
    materialSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    emptyText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 20,
    },
});