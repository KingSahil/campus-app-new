import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function SignUpScreen({ navigation }) {
    const [image, setImage] = React.useState(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            setImage(imageUri);
            // Navigate to ProfileEnterScreen with the image
            navigation.navigate('ProfileEnter', { image: imageUri });
        }
    };

    const takePhoto = async () => {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to scan your student ID!');
            return;
        }

        // Launch camera
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            setImage(imageUri);
            // Navigate to ProfileEnterScreen with the image
            navigation.navigate('ProfileEnter', { image: imageUri });
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <View style={styles.iconBackground}>
                                {image ? (
                                    <Image source={{ uri: image }} style={styles.image} />
                                ) : (
                                    <MaterialIcons name="add-a-photo" size={40} color="#C084FC" />
                                )}
                            </View>
                            {/* Optional: Add a subtle pulse effect animation here if desired later */}
                        </View>

                        <Text style={styles.title}>Upload Student ID</Text>
                        <Text style={styles.description}>
                            Scanning will auto-fill your details using AI
                        </Text>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={takePhoto}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons name="camera-alt" size={20} color="#CBD5E1" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Scan with Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { marginTop: 12 }]}
                            onPress={pickImage}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons name="upload-file" size={20} color="#CBD5E1" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Select from Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { marginTop: 12 }]}
                            onPress={() => navigation.navigate('ProfileEnter', { image: null })}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons name="edit" size={20} color="#CBD5E1" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Enter Manually</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Background handled by parent, or we can overlay a gradient if needed specific to this screen
    },
    safeArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        padding: 24,
        maxWidth: 400,
    },
    card: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)', // bg-slate-900/80
        borderColor: 'rgba(51, 65, 85, 0.8)', // border-slate-700/80
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(88, 28, 135, 0.1)',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 1,
                shadowRadius: 20,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0 10px 20px rgba(88, 28, 135, 0.1)',
            }
        }),
    },
    iconContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    iconBackground: {
        backgroundColor: '#1E293B', // bg-slate-800
        padding: 16,
        borderRadius: 9999, // rounded-full
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#64748B', // text-slate-500
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
        maxWidth: 220,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B', // bg-slate-800
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderColor: '#334155', // border-slate-700
        borderWidth: 1,
    },
    buttonText: {
        color: '#CBD5E1', // text-slate-300
        fontSize: 14,
        fontWeight: '600',
    },
});
