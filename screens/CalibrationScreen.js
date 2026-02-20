// Brier - AI Confidence Calibration Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { usePredictionStore } from '../stores/predictionStore';

// AI-powered calibration analysis
export const AICalibration = {
  analyze(predictions) {
    const resolved = predictions.filter(p => p.status === 'resolved');
    if (resolved.length < 5) {
      return {
        ready: false,
        message: 'Make at least 5 predictions to unlock AI insights'
      };
    }

    // Calculate calibration metrics
    const calibration = this.calculateCalibration(resolved);
    const overconfidence = this.detectOverconfidence(resolved);
    const patterns = this.findPatterns(resolved);

    return {
      ready: true,
      calibration,
      overconfidence,
      patterns,
      recommendations: this.generateRecommendations(calibration, overconfidence, patterns)
    };
  },

  calculateCalibration(resolved) {
    // Group by probability bucket
    const buckets = {
      '0-20': { correct: 0, total: 0 },
      '21-40': { correct: 0, total: 0 },
      '41-60': { correct: 0, total: 0 },
      '61-80': { correct: 0, total: 0 },
      '81-100': { correct: 0, total: 0 }
    };

    resolved.forEach(p => {
      const bucket = this.getBucket(p.probability);
      buckets[bucket].total++;
      const wasCorrect = (p.outcome && p.probability > 50) || (!p.outcome && p.probability < 50);
      if (wasCorrect) buckets[bucket].correct++;
    });

    // Calculate accuracy per bucket
    const results = Object.entries(buckets).map(([range, data]) => {
      const expected = parseInt(range.split('-')[0]) + 10;
      const actual = data.total > 0 ? (data.correct / data.total) * 100 : 0;
      return { range, expected, actual, total: data.total };
    });

    // Overall calibration score
    const totalError = results.reduce((sum, r) => {
      if (r.total === 0) return sum;
      return sum + Math.abs(r.expected - r.actual);
    }, 0);
    
    const avgError = totalError / results.filter(r => r.total > 0).length;
    const calibrationScore = Math.max(0, 100 - avgError);

    return { results, calibrationScore: Math.round(calibrationScore) };
  },

  getBucket(prob) {
    if (prob <= 20) return '0-20';
    if (prob <= 40) return '21-40';
    if (prob <= 60) return '41-60';
    if (prob <= 80) return '61-80';
    return '81-100';
  },

  detectOverconfidence(resolved) {
    const highConfidence = resolved.filter(p => p.probability >= 80);
    const lowConfidence = resolved.filter(p => p.probability <= 20);

    const highConfWrong = highConfidence.filter(p => !((p.outcome && p.probability > 50) || (!p.outcome && p.probability < 50)));
    const lowConfRight = lowConfidence.filter(p => (p.outcome && p.probability > 50) || (!p.outcome && p.probability < 50));

    const highConfAccuracy = highConfidence.length > 0 
      ? (highConfidence.length - highConfWrong.length) / highConfidence.length 
      : 1;

    const lowConfAccuracy = lowConfidence.length > 0
      ? lowConfRight.length / lowConfidence.length
      : 0;

    return {
      isOverconfident: highConfAccuracy < 0.7 && highConfidence.length >= 3,
      isUnderconfident: lowConfAccuracy > 0.7 && lowConfidence.length >= 3,
      highConfidenceAccuracy: Math.round(highConfAccuracy * 100),
      message: highConfAccuracy < 0.7 
        ? 'You often predict high confidence but are wrong'
        : lowConfAccuracy > 0.7
          ? 'You\'re underconfident - trust your gut more!'
          : 'Your confidence matches your accuracy'
    };
  },

  findPatterns(resolved) {
    const patterns = [];
    
    // Time-based patterns
    const recent = resolved.slice(-7);
    const older = resolved.slice(-14, -7);
    
    if (recent.length >= 3 && older.length >= 3) {
      const recentAvg = recent.reduce((sum, p) => sum + p.probability, 0) / recent.length;
      const olderAvg = older.reduce((sum, p) => sum + p.probability, 0) / older.length;
      
      if (recentAvg > olderAvg + 10) {
        patterns.push('You\'ve become more pessimistic recently');
      } else if (recentAvg < olderAvg - 10) {
        patterns.push('You\'ve become more optimistic recently');
      }
    }

    // Category patterns
    const byCategory = {};
    resolved.forEach(p => {
      if (!byCategory[p.category]) byCategory[p.category] = { correct: 0, total: 0 };
      byCategory[p.category].total++;
      const wasCorrect = (p.outcome && p.probability > 50) || (!p.outcome && p.probability < 50);
      if (wasCorrect) byCategory[p.category].correct++;
    });

    Object.entries(byCategory).forEach(([cat, data]) => {
      if (data.total >= 3) {
        const acc = (data.correct / data.total) * 100;
        if (acc >= 80) {
          patterns.push(`You're great at ${cat} predictions`);
        } else if (acc <= 40) {
          patterns.push(`You struggle with ${cat} predictions`);
        }
      }
    });

    return patterns;
  },

  generateRecommendations(calibration, overconfidence, patterns) {
    const recs = [];
    
    if (calibration.calibrationScore < 60) {
      recs.push({ type: 'warning', text: 'Your predictions don\'t match reality well. Try being less certain.' });
    }
    
    if (overconfidence.isOverconfident) {
      recs.push({ type: 'warning', text: 'High confidence predictions often fail. Consider lowering them.' });
    }
    
    if (overconfidence.isUnderconfident) {
      recs.push({ type: 'tip', text: 'You\'re more accurate than you think. Trust yourself more!' });
    }
    
    if (patterns.some(p => p.includes('pessimistic'))) {
      recs.push({ type: 'tip', text: 'Recent fears haven\'t materialized. You might be overly worried.' });
    }
    
    recs.push({ type: 'action', text: 'Continue tracking to get more accurate AI insights' });
    
    return recs;
  }
};

export default function CalibrationScreen() {
  const predictions = usePredictionStore((state) => state.predictions);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const result = AICalibration.analyze(predictions);
    setAnalysis(result);
  }, [predictions]);

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Analyzing predictions...</Text>
      </SafeAreaView>
    );
  }

  if (!analysis.ready) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.lockEmoji}>🔒</Text>
          <Text style={styles.lockTitle}>AI Insights Locked</Text>
          <Text style={styles.lockMessage}>{analysis.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🧠 AI Calibration</Text>

        {/* Calibration Score */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calibration Score</Text>
          <View style={styles.scoreContainer}>
            <Text style={[
              styles.score,
              { color: analysis.calibration.calibrationScore >= 70 ? '#38A169' : '#E53E3E' }
            ]}>
              {analysis.calibration.calibrationScore}%
            </Text>
            <Text style={styles.scoreDesc}>
              {analysis.calibration.calibrationScore >= 70 
                ? '🎉 Your confidence matches reality!'
                : '📉 Your predictions are miscalibrated'}
            </Text>
          </View>
        </View>

        {/* Confidence Analysis */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Confidence Analysis</Text>
          <View style={styles.confidenceResult}>
            <Text style={styles.confidenceEmoji}>
              {analysis.overconfidence.isOverconfident ? '⚠️' : analysis.overconfidence.isUnderconfident ? '🤔' : '✅'}
            </Text>
            <Text style={styles.confidenceText}>{analysis.overconfidence.message}</Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{analysis.overconfidence.highConfidenceAccuracy}%</Text>
              <Text style={styles.statLabel}>High Conf. Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Probability Buckets */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Probability Buckets</Text>
          {analysis.calibration.results.map((bucket) => (
            <View key={bucket.range} style={styles.bucketRow}>
              <Text style={styles.bucketRange}>{bucket.range}%</Text>
              <View style={styles.bucketBar}>
                <View style={[
                  styles.bucketFill,
                  { width: `${bucket.total > 0 ? (bucket.correct / bucket.total) * 100 : 0}%` }
                ]} />
              </View>
              <Text style={styles.bucketText}>
                {bucket.total > 0 ? `${Math.round((bucket.correct / bucket.total) * 100)}%` : '-'}
              </Text>
              <Text style={styles.bucketExpected}>({bucket.expected}%)</Text>
            </View>
          ))}
        </View>

        {/* Patterns */}
        {analysis.patterns.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Patterns Found</Text>
            {analysis.patterns.map((pattern, i) => (
              <Text key={i} style={styles.patternItem}>• {pattern}</Text>
            ))}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Recommendations</Text>
          {analysis.recommendations.map((rec, i) => (
            <View key={i} style={[
              styles.recItem,
              { borderLeftColor: rec.type === 'warning' ? '#E53E3E' : rec.type === 'tip' ? '#3182CE' : '#38A169' }
            ]}>
              <Text style={styles.recText}>{rec.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16213e' },
  content: { padding: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  loading: { color: '#fff', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  lockEmoji: { fontSize: 48, textAlign: 'center', marginBottom: 12 },
  lockTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  lockMessage: { color: '#A0AEC0', textAlign: 'center', marginTop: 8 },
  scoreContainer: { alignItems: 'center' },
  score: { fontSize: 48, fontWeight: 'bold' },
  scoreDesc: { color: '#A0AEC0', marginTop: 8 },
  confidenceResult: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  confidenceEmoji: { fontSize: 24, marginRight: 12 },
  confidenceText: { color: '#fff', flex: 1 },
  statRow: { flexDirection: 'row', justifyContent: 'center' },
  stat: { alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#A0AEC0', fontSize: 12 },
  bucketRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bucketRange: { width: 50, color: '#A0AEC0', fontSize: 12 },
  bucketBar: { flex: 1, height: 8, backgroundColor: '#2D3748', borderRadius: 4, marginHorizontal: 8 },
  bucketFill: { height: '100%', backgroundColor: '#38A169', borderRadius: 4 },
  bucketText: { width: 40, color: '#fff', fontSize: 12, textAlign: 'right' },
  bucketExpected: { width: 40, color: '#718096', fontSize: 10 },
  patternItem: { color: '#A0AEC0', marginBottom: 8 },
  recItem: { paddingLeft: 12, marginBottom: 8, borderLeftWidth: 3 },
  recText: { color: '#fff', fontSize: 14 },
});
