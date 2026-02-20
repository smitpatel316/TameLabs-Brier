// Brier - Enhanced features
import AsyncStorage from '@react-native-async-storage/async-storage';

// Streak tracking
export const StreakTracker = {
  async getStreak() {
    const data = await AsyncStorage.getItem('brier-streak');
    return data ? JSON.parse(data) : { current: 0, longest: 0, lastDate: null };
  },

  async updateStreak() {
    const streak = await this.getStreak();
    const today = new Date().toDateString();
    const lastDate = streak.lastDate ? new Date(streak.lastDate).toDateString() : null;
    
    if (lastDate === today) {
      return streak; // Already logged today
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = 1;
    if (lastDate === yesterday.toDateString()) {
      newStreak = streak.current + 1;
    }
    
    const updated = {
      current: newStreak,
      longest: Math.max(streak.longest, newStreak),
      lastDate: today
    };
    
    await AsyncStorage.setItem('brier-streak', JSON.stringify(updated));
    return updated;
  }
};

// Weekly/Monthly reports
export const Reports = {
  async generateWeekly(predictions) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeek = predictions.filter(p => new Date(p.createdAt) >= weekAgo);
    const resolved = thisWeek.filter(p => p.status === 'resolved');
    
    // Calculate stats
    let brierSum = 0;
    let correct = 0;
    
    resolved.forEach(p => {
      const prob = p.probability / 100;
      const outcome = p.outcome ? 1 : 0;
      brierSum += Math.pow(prob - outcome, 2);
      if ((p.outcome && p.probability > 50) || (!p.outcome && p.probability < 50)) {
        correct++;
      }
    });
    
    const brierScore = resolved.length > 0 ? brierSum / resolved.length : null;
    const accuracy = resolved.length > 0 ? (correct / resolved.length) * 100 : 0;
    
    // Category breakdown
    const byCategory = {};
    thisWeek.forEach(p => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    });
    
    return {
      period: 'Week',
      dateRange: { start: weekAgo, end: now },
      total: thisWeek.length,
      resolved: resolved.length,
      pending: thisWeek.length - resolved.length,
      brierScore: brierScore ? (brierScore * 100).toFixed(1) : null,
      accuracy: accuracy.toFixed(0),
      byCategory,
      insights: this.generateInsights(brierScore, accuracy, byCategory)
    };
  },

  generateInsights(brierScore, accuracy, categories) {
    const insights = [];
    
    if (brierScore !== null) {
      if (brierScore < 0.2) {
        insights.push('🎉 Excellent calibration this week!');
      } else if (brierScore > 0.4) {
        insights.push('📉 Your predictions were often wrong. Consider being less confident.');
      }
    }
    
    if (categories.social && categories.social > 3) {
      insights.push('👥 You made many social predictions - how did they turn out?');
    }
    
    if (insights.length === 0) {
      insights.push('📊 Keep predicting to get personalized insights!');
    }
    
    return insights;
  }
};

// Challenge Mode - gamification
export const Challenges = {
  daily: [
    { id: 'first_pred', name: 'Make a prediction', xp: 10 },
    { id: 'resolve_one', name: 'Resolve a prediction', xp: 15 },
    { id: 'be_honest', name: 'Log a fear that actually happened', xp: 20 },
  ],
  
  weekly: [
    { id: 'five_pred', name: 'Make 5 predictions', xp: 50 },
    { id: 'perfect_week', name: 'Get a Brier score under 0.2', xp: 100 },
    { id: 'all_cats', name: 'Predict in 3+ categories', xp: 30 },
  ],

  checkProgress(predictions) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeek = predictions.filter(p => new Date(p.createdAt) >= weekAgo);
    const resolved = thisWeek.filter(p => p.status === 'resolved');
    
    const progress = [];
    
    // Daily challenges
    if (predictions.length > 0) {
      progress.push({ ...this.daily[0], completed: true });
    }
    if (resolved.length > 0) {
      progress.push({ ...this.daily[1], completed: true });
    }
    
    // Weekly challenges
    if (thisWeek.length >= 5) {
      progress.push({ ...this.weekly[0], completed: true });
    }
    
    const categories = new Set(thisWeek.map(p => p.category));
    if (categories.size >= 3) {
      progress.push({ ...this.weekly[2], completed: true });
    }
    
    return {
      challenges: progress,
      totalXP: progress.filter(p => p.completed).reduce((sum, p) => sum + p.xp, 0),
      streak: 0 // Would connect to streak tracker
    };
  }
};

// Export data functionality
export const DataExport = {
  toJSON(predictions) {
    return JSON.stringify(predictions, null, 2);
  },

  toCSV(predictions) {
    const headers = ['ID', 'Event', 'Fear', 'Probability', 'Category', 'Status', 'Outcome', 'Created', 'Resolved'];
    const rows = predictions.map(p => [
      p.id,
      `"${p.event}"`,
      `"${p.fear}"`,
      p.probability,
      p.category,
      p.status,
      p.outcome !== undefined ? p.outcome : '',
      new Date(p.createdAt).toISOString(),
      p.resolvedAt ? new Date(p.resolvedAt).toISOString() : ''
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
