// Home Screen - Main prediction list
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { usePredictionStore } from '../stores/predictionStore';

const CATEGORIES = {
  social: { emoji: '👥', color: '#E53E3E', label: 'Social' },
  work: { emoji: '💼', color: '#3182CE', label: 'Work' },
  dating: { emoji: '💕', color: '#D53F8C', label: 'Dating' },
  health: { emoji: '❤️', color: '#38A169', label: 'Health' },
  finance: { emoji: '💰', color: '#D69E2E', label: 'Finance' },
  other: { emoji: '🔮', color: '#718096', label: 'Other' },
};

export default function HomeScreen({ navigation }) {
  const { predictions, getBrierScore, getStats } = usePredictionStore();
  const brierScore = getBrierScore();
  const stats = getStats();

  const renderPrediction = ({ item }) => {
    const category = CATEGORIES[item.category] || CATEGORIES.other;
    const isPending = item.status === 'pending';
    
    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: category.color }]}
        onPress={() => navigation.navigate('PredictionDetail', { id: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.event} numberOfLines={1}>
              {item.event}
            </Text>
            <Text style={styles.fear} numberOfLines={1}>
              {item.fear}
            </Text>
          </View>
          <View style={[styles.probability, { backgroundColor: getProbabilityColor(item.probability) }]}>
            <Text style={styles.probabilityText}>{item.probability}%</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {isPending ? (
            <TouchableOpacity
              style={styles.resolveButton}
              onPress={() => navigation.navigate('PredictionDetail', { id: item.id })}
            >
              <Text style={styles.resolveText}>→ Resolve</Text>
            </TouchableOpacity>
          ) : (
            <View style={[
              styles.outcomeBadge,
              { backgroundColor: item.outcome ? '#C6F6D5' : '#FED7D7' }
            ]}>
              <Text style={[
                styles.outcomeText,
                { color: item.outcome ? '#276749' : '#C53030' }
              ]}>
                {item.outcome ? '✓ Happened' : '✗ Did not'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.brierScore}>
          <Text style={styles.brierLabel}>Your Brier Score</Text>
          <Text style={styles.brierValue}>
            {brierScore !== null ? (brierScore * 100).toFixed(1) : '--'}
          </Text>
          <Text style={styles.brierDesc}>
            {brierScore !== null ? getBrierDescription(brierScore) : 'No predictions yet'}
          </Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.accuracy.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
      </View>

      {/* Prediction List */}
      <FlatList
        data={predictions}
        keyExtractor={(item) => item.id}
        renderItem={renderPrediction}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>No predictions yet</Text>
            <Text style={styles.emptySubtext}>
              Make your first prediction to start calibrating your fears
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewPrediction')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function getProbabilityColor(prob) {
  if (prob >= 80) return '#FC8181';
  if (prob >= 60) return '#F6E05E';
  if (prob >= 40) return '#68D391';
  if (prob >= 20) return '#63B3ED';
  return '#B794F4';
}

function getBrierDescription(score) {
  if (score === null) return 'Start predicting!';
  if (score <= 0.1) return '🎯 Superhuman!';
  if (score <= 0.2) return '🔥 Excellent';
  if (score <= 0.3) return '👍 Good';
  if (score <= 0.4) return '😐 Average';
  if (score <= 0.5) return '😬 Needs work';
  return '🤦 Systematic bias';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16213e' },
  header: { padding: 20, backgroundColor: '#1a1a2e' },
  brierScore: { alignItems: 'center', marginBottom: 20 },
  brierLabel: { color: '#A0AEC0', fontSize: 14 },
  brierValue: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  brierDesc: { color: '#A0AEC0', fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#A0AEC0', fontSize: 12 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  categoryEmoji: { fontSize: 24, marginRight: 12 },
  cardInfo: { flex: 1 },
  event: { color: '#fff', fontSize: 16, fontWeight: '600' },
  fear: { color: '#A0AEC0', fontSize: 14, marginTop: 2 },
  probability: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  probabilityText: { color: '#1a1a2e', fontWeight: 'bold' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  timestamp: { color: '#718096', fontSize: 12 },
  resolveButton: { paddingHorizontal: 12, paddingVertical: 6 },
  resolveText: { color: '#63B3ED', fontWeight: '600' },
  outcomeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  outcomeText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  emptySubtext: { color: '#A0AEC0', marginTop: 8, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E53E3E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: 30, fontWeight: '300' },
});
