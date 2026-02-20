// New Prediction Screen - Make a wager
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { usePredictionStore } from '../stores/predictionStore';

const CATEGORIES = [
  { id: 'social', emoji: '👥', label: 'Social', color: '#E53E3E' },
  { id: 'work', emoji: '💼', label: 'Work', color: '#3182CE' },
  { id: 'dating', emoji: '💕', label: 'Dating', color: '#D53F8C' },
  { id: 'health', emoji: '❤️', label: 'Health', color: '#38A169' },
  { id: 'finance', emoji: '💰', label: 'Finance', color: '#D69E2E' },
  { id: 'other', emoji: '🔮', label: 'Other', color: '#718096' },
];

const PROBABILITY_PRESETS = [10, 25, 50, 75, 90];

export default function NewPredictionScreen({ navigation }) {
  const addPrediction = usePredictionStore((state) => state.addPrediction);
  
  const [event, setEvent] = useState('');
  const [fear, setFear] = useState('');
  const [probability, setProbability] = useState(50);
  const [category, setCategory] = useState('social');

  const handleSubmit = () => {
    if (!event.trim()) {
      Alert.alert('Required', 'Please describe what you\'re about to do');
      return;
    }
    if (!fear.trim()) {
      Alert.alert('Required', 'Please describe your fear');
      return;
    }

    addPrediction({
      event: event.trim(),
      fear: fear.trim(),
      probability,
      category,
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Event Input */}
        <View style={styles.section}>
          <Text style={styles.label}>What are you about to do?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Ask my boss for a raise"
            placeholderTextColor="#718096"
            value={event}
            onChangeText={setEvent}
            multiline
          />
        </View>

        {/* Fear Input */}
        <View style={styles.section}>
          <Text style={styles.label}>What do you fear will happen?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., They'll say no and think less of me"
            placeholderTextColor="#718096"
            value={fear}
            onChangeText={setFear}
            multiline
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categories}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  category === cat.id && { backgroundColor: cat.color },
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[
                  styles.categoryLabel,
                  category === cat.id && styles.categoryLabelActive,
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Probability Slider */}
        <View style={styles.section}>
          <Text style={styles.label}>
            How likely do you think this fear is? <Text style={styles.probValue}>{probability}%</Text>
          </Text>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>0%</Text>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${probability}%` }]} />
              <TouchableOpacity
                style={[styles.sliderThumb, { left: `${probability - 5}%` }]}
                onPress={() => {}}
              />
            </View>
            <Text style={styles.sliderLabel}>100%</Text>
          </View>
          
          {/* Quick Select Buttons */}
          <View style={styles.presets}>
            {PROBABILITY_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetButton,
                  probability === preset && styles.presetButtonActive,
                ]}
                onPress={() => setProbability(preset)}
              >
                <Text style={[
                  styles.presetText,
                  probability === preset && styles.presetTextActive,
                ]}>
                  {preset}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Make Prediction</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16213e' },
  content: { padding: 20 },
  section: { marginBottom: 24 },
  label: { color: '#A0AEC0', fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  probValue: { color: '#E53E3E', fontWeight: 'bold', fontSize: 18 },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  sliderLabel: { color: '#718096', width: 40, textAlign: 'center' },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#2D3748',
    borderRadius: 4,
    marginHorizontal: 10,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#E53E3E',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  presetButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  presetButtonActive: { backgroundColor: '#E53E3E', borderColor: '#E53E3E' },
  presetText: { color: '#A0AEC0', fontWeight: '600' },
  presetTextActive: { color: '#fff' },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  categoryEmoji: { fontSize: 16, marginRight: 6 },
  categoryLabel: { color: '#A0AEC0', fontSize: 12 },
  categoryLabelActive: { color: '#fff' },
  submitButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
