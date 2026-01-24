import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function QuizTab({
    quiz,
    loadingQuiz,
    selectedAnswers,
    setSelectedAnswers,
    showResults,
    setShowResults,
    generateQuiz,
    submitQuiz,
    resetQuiz
}) {
    if (!quiz) {
        return (
            <View style={styles.quizCard}>
                <MaterialIcons name="quiz" size={48} color="#3B82F6" />
                <Text style={styles.quizText}>
                    Test your understanding with AI-generated questions
                </Text>
                <TouchableOpacity
                    style={styles.quizButton}
                    onPress={generateQuiz}
                    disabled={loadingQuiz}
                >
                    {loadingQuiz ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.quizButtonText}>Generate Quiz</Text>
                            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View>
            {quiz.map((q, index) => (
                <View key={index} style={styles.questionCard}>
                    <Text style={styles.questionText}>
                        {index + 1}. {q.question}
                    </Text>
                    {q.options.map((option, optIndex) => {
                        const optionLetter = option.charAt(0);
                        const isSelected = selectedAnswers[index] === optionLetter;
                        const isCorrect = q.correct === optionLetter;
                        const showCorrect = showResults && isCorrect;
                        const showWrong = showResults && isSelected && !isCorrect;

                        return (
                            <TouchableOpacity
                                key={optIndex}
                                style={[
                                    styles.optionButton,
                                    isSelected && styles.selectedOption,
                                    showCorrect && styles.correctOption,
                                    showWrong && styles.wrongOption,
                                ]}
                                onPress={() => {
                                    if (!showResults) {
                                        setSelectedAnswers({ ...selectedAnswers, [index]: optionLetter });
                                    }
                                }}
                                disabled={showResults}
                            >
                                <Text style={[
                                    styles.optionText,
                                    (isSelected || showCorrect) && styles.selectedOptionText
                                ]}>
                                    {option}
                                </Text>
                                {showCorrect && <MaterialIcons name="check-circle" size={20} color="#10B981" />}
                                {showWrong && <MaterialIcons name="cancel" size={20} color="#EF4444" />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}

            {!showResults ? (
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={submitQuiz}
                >
                    <Text style={styles.submitButtonText}>Submit Quiz</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.resultsCard}>
                    <MaterialIcons name="emoji-events" size={48} color="#F59E0B" />
                    <Text style={styles.resultsText}>
                        Score: {Object.values(selectedAnswers).filter((ans, idx) => ans === quiz[idx]?.correct).length} / {quiz.length}
                    </Text>
                    <TouchableOpacity
                        style={styles.retakeButton}
                        onPress={resetQuiz}
                    >
                        <Text style={styles.retakeButtonText}>Take New Quiz</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    quizCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        gap: 16,
        marginTop: 40,
    },
    quizText: {
        fontSize: 16,
        color: '#D1D5DB',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 8,
    },
    quizButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quizButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    questionCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
        lineHeight: 24,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    selectedOption: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
    },
    correctOption: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10B981',
    },
    wrongOption: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: '#EF4444',
    },
    optionText: {
        fontSize: 14,
        color: '#D1D5DB',
        flex: 1,
    },
    selectedOptionText: {
        color: '#fff',
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsCard: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginTop: 16,
    },
    resultsText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F59E0B',
        marginVertical: 16,
    },
    retakeButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retakeButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
