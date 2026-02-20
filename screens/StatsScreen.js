// Stats Screen - Detailed analytics
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { usePredictionStore } from '../stores/predictionStore';

const CATEGORIES = {
  social: { emoji: '👥', color: '#E53E3E', label: 'Social' },
  work: { emoji: '💼', color: '#3182CE', label: 'Work' },
  dating: { emoji: '💕', color: '#D53F8C', label: 'Dating' },
  health: { emoji: '❤️', color: '#38A169', label: 'Health' },
  finance: { emoji: '💰', color: '#D69E2E', label: 'Finance' },
  other: { emoji: '🔮', color: '#718096', label: 'Other' },
};

export default function StatsScreen() {
  const { predictions, getBrierScore, getStats } = usePredictionStore();
  const brierScore = getBrierScore();
  const stats = getStats();

  // Calculate category-specific stats
  const categoryStats = {};
  Object.keys(CATEGORIES).forEach((cat) => {
    const catPredictions = predictions.filter((p) => p.category === cat);
    const resolved = catPredictions.filter((p) => p.status === 'resolved');
    const correct = resolved.filter(
      (p) => (p.outcome && p.probability > 50) || (!p.outcome && p.probability < 50)
    );

    if (resolved.length > 0) {
      const catSum = resolved.reduce((acc, p) => {
        const probability = p.probability / 100;
        const outcome = p.outcome ? 1 : 0;
        return acc + Math.pow(probability - outcome, 2);
      }, 0);
      
      categoryStats[cat] = {
        total: catPredictions.length,
        resolved: resolved.length,
        accuracy: (correct.length / resolved.length) * 100,
        brier: catSum / resolved.length,
      };
    } else {
      categoryStats[cat] = { total: catPredictions.length, resolved: 0 };
    }
  });

  // Recent predictions
  const recent = predictions.slice(0, 10);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Overall Score */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Overall Performance</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>
                {brierScore !== null ? (brierScore * 100).toFixed(1) : '--'}
              </Text>
              <Text style={styles.scoreLabel}>Brier Score</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{stats.accuracy.toFixed(0)}%</Text>
              <Text style={styles.scoreLabel}>Accuracy</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{stats.total}</Text>
              <Text style={styles.scoreLabel}>Predictions</Text>
            </View>
          </View>
        </View>

        {/* By Category */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📁 By Category</Text>
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const stat = categoryStats[key];
            return (
              <View key={key} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </View>
                <View style={styles.categoryStats}>
                  <Text style={styles.categoryStat}>{stat.total} total</Text>
                  {stat.resolved > 0 && (
                    <Text style={[
                      styles.categoryAccuracy,
                      { color: stat.accuracy > 50 ? '#38A169' : '#E53E3E' }
                    ]}>
                      {stat.accuracy.toFixed(0)}% acc
                    </Text>
                  )}
                </View>
                <View style={[
                  styles.categoryBar,
                  { width: `${Math.min(100, (stat.total / (stats.total || 1)) * 100)}%`, backgroundColor: cat.color }
                ]} />
              </View>
            );
          })}
        </View>

        {/* Calibration Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Calibration Tips</Text>
          {brierScore !== null && brierScore > 0.4 ? (
            <View style={styles.tip}>
              <Text style={styles.tipText}>
                Your Brier score is { (brierScore * 100).toFixed(0) }%, indicating systematic overconfidence. 
                Try predicting lower probabilities - your fears often don't come true!
              </Text>
            </View>
          ) : brierScore !== null && brierScore < 0.2 ? (
            <View style={styles.tip}>
              <Text style={styles.tipText}>
                🎉 Your calibration is excellent! You're accurately predicting the likelihood of your fears.
              </Text>
            </View>
          ) : (
            <View style={styles.tip}>
              <Text style={styles.tipText}>
                Make more predictions to get personalized insights about your fear patterns.
              </Text>
            </View>
          )}
        </View>

        {/* What to work on */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Focus Areas</Text>
          {Object.entries(categoryStats)
            .filter(([_, stat]) => stat.resolved > 0 && stat.accuracy < 50)
            .map(([key, stat]) => (
              <View key={key} style={styles.focusItem}>
                <Text style={styles.focusEmoji}>{CATEGORIES[key].emoji}</Text>
                <Text style={styles.focusText}>
                  You're {stat.accuracy.toFixed(0)}% accurate on {CATEGORIES[key].label} predictions
                </Text>
              </View>
            ))}
          {Object.entries(categoryStats).filter(([_, stat]) => stat.resolved > 0 && stat.accuracy < 50).length === 0 && stats.total > 0 && (
            <Text style={styles.goodText}>You're doing great across all categories! 🌟</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16213e' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around' },
  scoreItem: { alignItems: 'center' },
  scoreValue: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  scoreLabel: { color: '#A0AEC0', fontSize: 12, marginTop: 4 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  categoryInfo: { flexDirection: 'row', alignItems: 'center', width: 100 },
  categoryEmoji: { fontSize: 20, marginRight: 8 },
  categoryLabel: { color: '#fff', fontSize: 14 },
  categoryStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  categoryStat: { color: '#A0AEC0', fontSize: 12 },
  categoryAccuracy: { fontSize: 12, fontWeight: 'bold' },
  categoryBar: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    height: 3,
    borderRadius: 2,
    opacity: 0.3,
  },
  tip: { backgroundColor: '#2D3748', borderRadius: 8, padding: 12 },
  tipText: { color: '#A0AEC0', fontSize: 14, lineHeight: 20 },
  focusItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  focusEmoji: { fontSize: 20, marginRight: 12 },
  focusText: { color: '#A0AEC0', flex: 1 },
  goodText: { color: '#38A169', textAlign: 'center', marginTop: 8 },
});
