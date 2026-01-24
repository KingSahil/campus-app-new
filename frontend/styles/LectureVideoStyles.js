import { StyleSheet, Platform } from 'react-native';

export const lectureVideoStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        ...Platform.select({
            web: {
                height: '100vh',
                overflow: 'hidden',
                paddingTop: 20,
            }
        })
    },
    safeArea: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
        backgroundColor: '#111827',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#111827',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginHorizontal: 8,
    },
    moreButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    tabContent: {
        padding: 24,
        minHeight: 300,
        paddingBottom: 100, // Extra padding for sticky inputs
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
});
