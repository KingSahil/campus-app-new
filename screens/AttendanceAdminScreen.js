import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { auth0 } from '../lib/auth0';


export default function AttendanceAdminScreen({ navigation }) {
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());

    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);

    const [selectedDays, setSelectedDays] = useState([0, 2, 4]); // Mon, Wed, Fri
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    const [configuredClasses, setConfiguredClasses] = useState([]);
    const [subjectName, setSubjectName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const user = await auth0.getUser();
            
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform database format to component format
            const transformedClasses = (data || []).map(classItem => ({
                id: classItem.id,
                subject: classItem.subject,
                startTime: new Date(`2000-01-01T${classItem.start_time}`),
                endTime: new Date(`2000-01-01T${classItem.end_time}`),
                days: classItem.days_of_week,
                color: classItem.days_of_week.length > 3 ? '#0A84FF' : '#A855F7',
                daysDisplay: classItem.days_of_week.map(d => days[d]).join(', ')
            }));

            setConfiguredClasses(transformedClasses);
        } catch (error) {
            console.error('Error fetching classes:', error);
            Alert.alert('Error', 'Failed to load classes');
        } finally {
            setLoading(false);
        }
    };



    const toggleDay = (index) => {
        if (selectedDays.includes(index)) {
            setSelectedDays(selectedDays.filter(d => d !== index));
        } else {
            setSelectedDays([...selectedDays, index]);
        }
    };

    const deleteClass = async (id) => {
        try {
            const { error } = await supabase
                .from('classes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setConfiguredClasses(prev =>
                prev.filter(item => item.id !== id)
            );
            
            Alert.alert('Success', 'Class deleted successfully');
        } catch (error) {
            console.error('Error deleting class:', error);
            Alert.alert('Error', 'Failed to delete class');
        }
    };

    const editClass = (classItem) => {
        setSubjectName(classItem.subject);
        setStartTime(new Date(classItem.startTime));
        setEndTime(new Date(classItem.endTime));
        setSelectedDays(classItem.days);

        setConfiguredClasses(prev =>
            prev.filter(item => item.id !== classItem.id)
        );
    };




    return (
        
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.navigate('AdminDashboard')}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Set Up Classes</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Main Content */}
                <ScrollView 
                    style={styles.scrollView} 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Add New Class Card */}
                    <View style={styles.addClassCard}>
                        <View style={styles.cardHeader}>
                            <MaterialIcons name="add-task" size={24} color="#0A84FF" />
                            <Text style={styles.cardHeaderTitle}>Add New Class</Text>
                        </View>

                        <View style={styles.formSection}>
                            {/* Subject Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>SUBJECT NAME</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. Python Programming"
                                    placeholderTextColor="rgba(142, 142, 147, 0.5)"
                                    value={subjectName}
                                    onChangeText={setSubjectName}
                                />
                            </View>

                            {/* Repeat Days */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>REPEAT DAYS</Text>
                                <View style={styles.daysContainer}>
                                    {days.map((day, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.dayButton,
                                                selectedDays.includes(index) && styles.dayButtonSelected
                                            ]}
                                            onPress={() => toggleDay(index)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[
                                                styles.dayButtonText,
                                                selectedDays.includes(index) && styles.dayButtonTextSelected
                                            ]}>
                                                {day}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Time and Room */}
                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>START TIME</Text>

                                    <Pressable onPress={() => setShowStart(true)}>
                                        <Text style={styles.textInput}>
                                            {startTime.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Text>
                                    </Pressable>

                                    {showStart && (
                                        <DateTimePicker
                                            value={startTime}
                                            mode="time"
                                            is24Hour={false}
                                            display="default"
                                            onChange={(event, selectedTime) => {
                                                setShowStart(false);
                                                if (selectedTime) setStartTime(selectedTime);
                                            }}
                                        />
                                    )}
                                </View>

                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>END TIME</Text>

                                    <Pressable onPress={() => setShowEnd(true)}>
                                        <Text style={styles.textInput}>
                                            {endTime.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Text>
                                    </Pressable>

                                    {showEnd && (
                                        <DateTimePicker
                                            value={endTime}
                                            mode="time"
                                            is24Hour={false}
                                            display="default"
                                            onChange={(event, selectedTime) => {
                                                setShowEnd(false);
                                                if (selectedTime) setEndTime(selectedTime);
                                            }}
                                        />
                                    )}
                                </View>
                            </View>


                            {/* Add Button */}
                            <TouchableOpacity
                                style={styles.addButton}
                                activeOpacity={0.8}
                                onPress={async () => {
                                    if (!subjectName.trim()) {
                                        Alert.alert('Error', 'Please enter a subject name');
                                        return;
                                    }

                                    if (selectedDays.length === 0) {
                                        Alert.alert('Error', 'Please select at least one day');
                                        return;
                                    }

                                    try {
                                        setSaving(true);
                                        const user = await auth0.getUser();

                                        // Format times for database
                                        const startTimeStr = startTime.toLocaleTimeString('en-US', { 
                                            hour12: false, 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            second: '2-digit'
                                        });
                                        const endTimeStr = endTime.toLocaleTimeString('en-US', { 
                                            hour12: false, 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            second: '2-digit'
                                        });

                                        const { data, error } = await supabase
                                            .from('classes')
                                            .insert([{
                                                name: subjectName,
                                                subject: subjectName,
                                                instructor_id: user?.sub,
                                                start_time: startTimeStr,
                                                end_time: endTimeStr,
                                                days_of_week: selectedDays
                                            }])
                                            .select()
                                            .single();

                                        if (error) throw error;

                                        // Add to local state
                                        const newClass = {
                                            id: data.id,
                                            subject: subjectName,
                                            days: selectedDays,
                                            startTime: startTime,
                                            endTime: endTime,
                                            color: selectedDays.length > 3 ? '#0A84FF' : '#A855F7',
                                            daysDisplay: selectedDays.map(d => days[d]).join(', ')
                                        };

                                        setConfiguredClasses(prev => [...prev, newClass]);

                                        // reset
                                        setSubjectName('');
                                        setSelectedDays([0, 2, 4]);
                                        
                                        Alert.alert('Success', 'Class added successfully');
                                    } catch (error) {
                                        console.error('Error adding class:', error);
                                        Alert.alert('Error', 'Failed to add class: ' + error.message);
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#0A84FF" />
                                ) : (
                                    <Text style={styles.addButtonText}>Add Subject/Timing</Text>
                                )}
                            </TouchableOpacity>

                        </View>
                    </View>

                    {/* Configured Classes */}
                    <View style={styles.configuredSection}>
                        <View style={styles.configuredHeader}>
                            <Text style={styles.configuredTitle}>Configured Classes</Text>
                            <View style={styles.itemCountBadge}>
                                <Text style={styles.itemCountText}>
                                    {configuredClasses.length} items
                                </Text>
                            </View>
                        </View>

                        {/* Class List */}
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#0A84FF" />
                                <Text style={styles.loadingText}>Loading classes...</Text>
                            </View>
                        ) : configuredClasses.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialIcons name="event-note" size={48} color="#8E8E93" />
                                <Text style={styles.emptyStateText}>No classes configured yet</Text>
                                <Text style={styles.emptyStateSubtext}>Add your first class above</Text>
                            </View>
                        ) : (
                            <View style={styles.classList}>
                                {configuredClasses.map((classItem) => (
                                    <View key={classItem.id} style={styles.classCard}>
                                        <View style={styles.classCardContent}>
                                            <View style={styles.classInfo}>
                                                <Text style={styles.classSubject}>{classItem.subject}</Text>
                                                <View style={styles.classDetails}>
                                                    <View style={[styles.daysBadge, { backgroundColor: `${classItem.color}33`, borderColor: `${classItem.color}66` }]}>
                                                        <Text style={[styles.daysText, { color: classItem.color === '#0A84FF' ? '#60A5FA' : '#C084FC' }]}>
                                                            {classItem.daysDisplay || classItem.days.map(d => days[d]).join(', ')}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.timeContainer}>
                                                        <MaterialIcons name="schedule" size={14} color="#8E8E93" />
                                                    <Text style={styles.timeText}>
                                                        {classItem.startTime.toLocaleTimeString([], {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true,
                                                        })} - {classItem.endTime.toLocaleTimeString([], {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true,
                                                        })}
                                                    </Text>

                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.classActions}>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                activeOpacity={0.7}
                                                onPress={() => editClass(classItem)}
                                            >
                                                <MaterialIcons name="edit" size={20} color="#0A84FF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                activeOpacity={0.7}
                                                onPress={() => deleteClass(classItem.id)}
                                            >
                                                <MaterialIcons name="delete" size={20} color="#FF453A" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                        )}
                    </View>
                </ScrollView>

                {/* Start Session Button */}
                <LinearGradient
                    colors={['transparent', 'rgba(22, 22, 37, 0.95)', '#161625']}
                    style={styles.saveButtonContainer}
                >
                    <TouchableOpacity 
                        style={styles.saveButton}
                        activeOpacity={0.8}
                        onPress={() => {
                            // Navigate to Manage Attendance
                            navigation.navigate('ManageAttendance');
                        }}
                    >
                        <MaterialIcons name="play-arrow" size={24} color="#ffffff" />
                        <Text style={styles.saveButtonText}>Manage Sessions</Text>
                    </TouchableOpacity>
                </LinearGradient>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        flex: 1,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    addClassCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    cardHeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    formSection: {
        gap: 20,
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: '#8E8E93',
        letterSpacing: 1.2,
        marginLeft: 4,
    },
    textInput: {
        backgroundColor: 'rgba(22, 22, 37, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        color: '#ffffff',
        fontSize: 16,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
    },
    dayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayButtonSelected: {
        backgroundColor: '#0A84FF',
        borderColor: '#0A84FF',
        ...Platform.select({
            ios: {
                shadowColor: '#0A84FF',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    dayButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#8E8E93',
    },
    dayButtonTextSelected: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    rowInputs: {
        flexDirection: 'row',
        gap: 16,
    },
    addButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#0A84FF',
        fontSize: 16,
        fontWeight: '600',
    },
    configuredSection: {
        gap: 16,
    },
    configuredHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    configuredTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    itemCountBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    itemCountText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#8E8E93',
    },
    classList: {
        gap: 16,
    },
    classCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
    },
    classCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    classInfo: {
        flex: 1,
        gap: 8,
    },
    classSubject: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    classDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    daysBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
    },
    daysText: {
        fontSize: 10,
        fontWeight: '500',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#8E8E93',
    },
    classActions: {
        flexDirection: 'column',
        gap: 8,
        paddingLeft: 16,
        marginLeft: 16,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255, 255, 255, 0.05)',
    },
    actionButton: {
        padding: 4,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#8E8E93',
        marginTop: 12,
        fontSize: 14,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(28, 28, 46, 0.4)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    emptyStateText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptyStateSubtext: {
        color: '#8E8E93',
        fontSize: 14,
        marginTop: 4,
    },
    saveButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: Platform.select({ ios: 24, default: 24 }),
        paddingTop: 24,
    },
    saveButton: {
        backgroundColor: '#0A84FF',
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#0A84FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
