// Prediction Detail Screen - Resolve prediction
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { usePredictionStore } from '../stores/predictionStore';

export default function PredictionDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const predictions = usePredictionStore((state) => state.predictions);
  const resolvePrediction = usePredictionStore((state) => state.resolvePrediction);
  const deletePrediction = usePredictionStore((state) => state.deletePrediction);
  
  const prediction = predictions.find((p) => p.id === id);
  const [notes, setNotes] = useState('');
  
  if (!prediction) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Prediction not found</Text>
      </SafeAreaView>
    );
  }

  const handleResolve = (outcome) => {
    resolvePrediction(id, outcome, notes);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Prediction',
      'Are you sure you want to delete this prediction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          deletePrediction(id);
          navigation.goBack();
        }},
      ]
    );
  };

  const isResolved = prediction.status === 'resolved';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Prediction Info */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>What I was about to do</Text>
          <Text style={styles.event}>{prediction.event}</Text>
          
          <Text style={styles.sectionLabel}>My fear</Text>
          <Text style={styles.fear}>{prediction.fear}</Text>
          
          <View style={styles.probabilityRow}>
            <Text style={styles.probabilityLabel}>Probability predicted:</Text>
            <Text style={styles.probabilityValue}>{prediction.probability}%</Text>
          </View>
        </View>

        {isResolved ? (
          // Show result
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>
              {prediction.outcome ? '✅' : '❌'}
            </Text>
            <Text style={styles.resultText}>
              {prediction.outcome ? 'It happened!' : 'It did not happen'}
            </Text>
            {prediction.notes && (
              <Text style={styles.notes}>{prediction.notes}</Text>
            )}
          </View>
        ) : (
          // Resolution form
          <View style={styles.resolveSection}>
            <Text style={styles.resolveTitle}>Did it happen?</Text>
            
            <View style={styles.resolveButtons}>
              <TouchableOpacity
                style={[styles.resolveButton, styles.yesButton]}
                onPress={() => handleResolve(true)}
              >
                <Text style={styles.resolveButtonText}>✓ Yes, it happened</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.resolveButton, styles.noButton]}
                onPress={() => handleResolve(false)}
              >
                <Text style={styles.resolveButtonText}>✗ No, it didn't</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)"
              placeholderTextColor="#718096"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Prediction</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16213e' },
  content: { padding: 20 },
  errorText: { color: '#fff', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 20 },
  sectionLabel: { color: '#A0AEC0', fontSize: 12, marginBottom: 4, marginTop: 12 },
  event: { color: '#fff', fontSize: 18, fontWeight: '600' },
  fear: { color: '#E53E3E', fontSize: 16 },
  probabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
  },
  probabilityLabel: { color: '#A0AEC0' },
  probabilityValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  resultCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  resultEmoji: { fontSize: 48, marginBottom: 12 },
  resultText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  notes: { color: '#A0AEC0', marginTop: 12, textAlign: 'center' },
  resolveSection: { marginTop: 20 },
  resolveTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  resolveButtons: { gap: 12 },
  resolveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  yesButton: { backgroundColor: '#38A169' },
  noButton: { backgroundColor: '#E53E3E' },
  resolveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  notesInput: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  deleteButton: { marginTop: 30, alignItems: 'center' },
  deleteText: { color: '#E53E3E', fontSize: 14 },
});
