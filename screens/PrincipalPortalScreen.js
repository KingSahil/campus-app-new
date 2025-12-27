import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Background from '../components/Background';
import { 
    getAllTeachers, 
    addTeacher, 
    deleteTeacher, 
    getAllStudents,
    getAllClasses,
    assignTeacherToSubject,
    createClass
} from '../lib/userManagement';

export default function PrincipalPortalScreen({ navigation, route }) {
    const { user } = route.params;
    const [activeTab, setActiveTab] = useState('teachers');
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    
    // Form states for adding teacher
    const [newTeacher, setNewTeacher] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        employee_id: '',
        department: '',
        qualification: '',
        specialization: '',
        joining_date: new Date().toISOString().split('T')[0],
    });

    // Form states for assigning teacher
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [subjectName, setSubjectName] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        if (activeTab === 'teachers') {
            const { data } = await getAllTeachers();
            setTeachers(data || []);
        } else if (activeTab === 'students') {
            const { data } = await getAllStudents();
            setStudents(data || []);
        } else if (activeTab === 'classes') {
            const { data } = await getAllClasses();
            setClasses(data || []);
        }
        setLoading(false);
    };

    const handleAddTeacher = async () => {
        if (!newTeacher.full_name || !newTeacher.email || !newTeacher.password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        const { data, error } = await addTeacher(newTeacher);
        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message || 'Failed to add teacher');
        } else {
            Alert.alert('Success', 'Teacher added successfully');
            setAddModalVisible(false);
            setNewTeacher({
                full_name: '',
                email: '',
                password: '',
                phone: '',
                employee_id: '',
                department: '',
                qualification: '',
                specialization: '',
                joining_date: new Date().toISOString().split('T')[0],
            });
            loadData();
        }
    };

    const handleDeleteTeacher = async (teacherId) => {
        Alert.alert(
            'Delete Teacher',
            'Are you sure you want to delete this teacher?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await deleteTeacher(teacherId);
                        if (error) {
                            Alert.alert('Error', 'Failed to delete teacher');
                        } else {
                            Alert.alert('Success', 'Teacher deleted successfully');
                            loadData();
                        }
                    },
                },
            ]
        );
    };

    const handleAssignSubject = async () => {
        if (!selectedTeacher || !selectedClass || !subjectName) {
            Alert.alert('Error', 'Please select teacher, class, and enter subject');
            return;
        }

        const { error } = await assignTeacherToSubject(selectedTeacher, selectedClass, subjectName);
        if (error) {
            Alert.alert('Error', error.message || 'Failed to assign subject');
        } else {
            Alert.alert('Success', 'Subject assigned successfully');
            setAssignModalVisible(false);
            setSelectedTeacher(null);
            setSelectedClass(null);
            setSubjectName('');
        }
    };

    const renderTeachers = () => (
        <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Teachers ({teachers.length})</Text>
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setAddModalVisible(true)}
                >
                    <MaterialIcons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : teachers.length === 0 ? (
                <Text style={styles.emptyText}>No teachers added yet</Text>
            ) : (
                teachers.map((teacher) => (
                    <View key={teacher.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.cardTitle}>{teacher.user?.full_name}</Text>
                                <Text style={styles.cardSubtitle}>{teacher.user?.email}</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => handleDeleteTeacher(teacher.id)}
                                style={styles.deleteButton}
                            >
                                <MaterialIcons name="delete" size={24} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.cardDetails}>
                            <Text style={styles.detailText}>📱 {teacher.user?.phone || 'N/A'}</Text>
                            <Text style={styles.detailText}>🏢 {teacher.department || 'N/A'}</Text>
                            <Text style={styles.detailText}>🎓 {teacher.qualification || 'N/A'}</Text>
                        </View>
                    </View>
                ))
            )}
        </View>
    );

    const renderStudents = () => (
        <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Students ({students.length})</Text>
            </View>

            {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : students.length === 0 ? (
                <Text style={styles.emptyText}>No students enrolled yet</Text>
            ) : (
                students.map((student) => (
                    <View key={student.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.cardTitle}>{student.user?.full_name}</Text>
                                <Text style={styles.cardSubtitle}>Roll: {student.roll_number}</Text>
                            </View>
                        </View>
                        <View style={styles.cardDetails}>
                            <Text style={styles.detailText}>📧 {student.user?.email}</Text>
                            <Text style={styles.detailText}>🏫 {student.class?.class_name} - {student.class?.section}</Text>
                            <Text style={styles.detailText}>👨‍👩‍👦 {student.parent_name || 'N/A'}</Text>
                        </View>
                    </View>
                ))
            )}
        </View>
    );

    const renderClasses = () => (
        <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Classes ({classes.length})</Text>
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setAssignModalVisible(true)}
                >
                    <MaterialIcons name="assignment" size={24} color="#fff" />
                    <Text style={styles.addButtonText}>Assign</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : classes.length === 0 ? (
                <Text style={styles.emptyText}>No classes created yet</Text>
            ) : (
                classes.map((cls) => (
                    <View key={cls.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.cardTitle}>{cls.class_name} - {cls.section}</Text>
                                <Text style={styles.cardSubtitle}>Academic Year: {cls.academic_year}</Text>
                            </View>
                        </View>
                        {cls.teacher && (
                            <View style={styles.cardDetails}>
                                <Text style={styles.detailText}>👨‍🏫 Class Teacher: {cls.teacher.user?.full_name}</Text>
                            </View>
                        )}
                    </View>
                ))
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Background />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Principal Portal</Text>
                        <Text style={styles.headerSubtitle}>{user?.full_name}</Text>
                    </View>
                    <TouchableOpacity>
                        <MaterialIcons name="settings" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'teachers' && styles.activeTab]}
                        onPress={() => setActiveTab('teachers')}
                    >
                        <MaterialIcons name="people" size={24} color={activeTab === 'teachers' ? '#3B82F6' : '#9CA3AF'} />
                        <Text style={[styles.tabText, activeTab === 'teachers' && styles.activeTabText]}>Teachers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'students' && styles.activeTab]}
                        onPress={() => setActiveTab('students')}
                    >
                        <MaterialIcons name="school" size={24} color={activeTab === 'students' ? '#3B82F6' : '#9CA3AF'} />
                        <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>Students</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'classes' && styles.activeTab]}
                        onPress={() => setActiveTab('classes')}
                    >
                        <MaterialIcons name="class" size={24} color={activeTab === 'classes' ? '#3B82F6' : '#9CA3AF'} />
                        <Text style={[styles.tabText, activeTab === 'classes' && styles.activeTabText]}>Classes</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {activeTab === 'teachers' && renderTeachers()}
                    {activeTab === 'students' && renderStudents()}
                    {activeTab === 'classes' && renderClasses()}
                </ScrollView>

                {/* Add Teacher Modal */}
                <Modal
                    visible={addModalVisible}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add New Teacher</Text>
                                <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name *"
                                    placeholderTextColor="#6B7280"
                                    value={newTeacher.full_name}
                                    onChangeText={(text) => setNewTeacher({...newTeacher, full_name: text})}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email *"
                                    placeholderTextColor="#6B7280"
                                    value={newTeacher.email}
                                    onChangeText={(text) => setNewTeacher({...newTeacher, email: text})}
                                    keyboardType="email-address"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password *"
                                    placeholderTextColor="#6B7280"
                                    value={newTeacher.password}
                                    onChangeText={(text) => setNewTeacher({...newTeacher, password: text})}
                                    secureTextEntry
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone"
                                    placeholderTextColor="#6B7280"
                                    value={newTeacher.phone}
                                    onChangeText={(text) => setNewTeacher({...newTeacher, phone: text})}
                                    keyboardType="phone-pad"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Employee ID"
                                    placeholderTextColor="#6B7280"
                                    value={newTeacher.employee_id}
                                    onChangeText={(text) => setNewTeacher({...newTeacher, employee_id: text})}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Department"
                                    placeholderTextColor="#6B7280"
                                    value={newTeacher.department}
                                    onChangeText={(text) => setNewTeacher({...newTeacher, department: text})}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Qualification"
                                    placeholderTextColor="#6B7280"
                                    value={newTeacher.qualification}
                                    onChangeText={(text) => setNewTeacher({...newTeacher, qualification: text})}
                                />
                                <TouchableOpacity 
                                    style={styles.submitButton}
                                    onPress={handleAddTeacher}
                                    disabled={loading}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {loading ? 'Adding...' : 'Add Teacher'}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Assign Subject Modal */}
                <Modal
                    visible={assignModalVisible}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Assign Teacher to Subject</Text>
                                <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView>
                                <Text style={styles.label}>Select Teacher</Text>
                                {teachers.map((teacher) => (
                                    <TouchableOpacity
                                        key={teacher.id}
                                        style={[styles.optionButton, selectedTeacher === teacher.id && styles.selectedOption]}
                                        onPress={() => setSelectedTeacher(teacher.id)}
                                    >
                                        <Text style={styles.optionText}>{teacher.user?.full_name}</Text>
                                    </TouchableOpacity>
                                ))}

                                <Text style={styles.label}>Select Class</Text>
                                {classes.map((cls) => (
                                    <TouchableOpacity
                                        key={cls.id}
                                        style={[styles.optionButton, selectedClass === cls.id && styles.selectedOption]}
                                        onPress={() => setSelectedClass(cls.id)}
                                    >
                                        <Text style={styles.optionText}>{cls.class_name} - {cls.section}</Text>
                                    </TouchableOpacity>
                                ))}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Subject Name"
                                    placeholderTextColor="#6B7280"
                                    value={subjectName}
                                    onChangeText={setSubjectName}
                                />

                                <TouchableOpacity 
                                    style={styles.submitButton}
                                    onPress={handleAssignSubject}
                                >
                                    <Text style={styles.submitButtonText}>Assign Subject</Text>
                                </TouchableOpacity>
                            </ScrollView>
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
        backgroundColor: '#111827',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
    },
    headerContent: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 2,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#1F2937',
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    tab: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 4,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#3B82F6',
    },
    tabText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    activeTabText: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    contentSection: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#374151',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    cardDetails: {
        gap: 6,
    },
    detailText: {
        fontSize: 14,
        color: '#D1D5DB',
    },
    deleteButton: {
        padding: 4,
    },
    loadingText: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 32,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 16,
    },
    modalContent: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    input: {
        backgroundColor: '#374151',
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 16,
        marginTop: 12,
        color: '#fff',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#3B82F6',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    optionButton: {
        backgroundColor: '#374151',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    selectedOption: {
        backgroundColor: '#3B82F6',
    },
    optionText: {
        color: '#fff',
        fontSize: 14,
    },
});
