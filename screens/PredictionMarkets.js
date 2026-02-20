// Brier - Custom Prediction Markets
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { usePredictionStore } from '../stores/predictionStore';

// Prediction Market types
const MARKET_TYPES = [
  { id: 'binary', name: 'Yes/No', emoji: '❓', description: 'Simple outcome' },
  { id: 'multiple', name: 'Multiple Choice', emoji: '🔀', description: 'Pick from options' },
  { id: 'range', name: 'Range', emoji: '📊', description: 'Guess a number' },
  { id: 'percentage', name: 'Percentage', emoji: '%', description: 'Estimate probability' },
];

// Pre-built markets
const TEMPLATE_MARKETS = [
  { id: 'sports', name: 'Sports', emoji: '🏆', markets: [
    'Who wins the Super Bowl?',
    'Who wins the NBA Finals?',
    'World Series winner?',
  ]},
  { id: 'tech', name: 'Tech', emoji: '💻', markets: [
    'Apple stock price target?',
    'Bitcoin end of year?',
    'AI breakthrough this year?',
  ]},
  { id: 'life', name: 'Life', emoji: '�的生活', markets: [
    'Get promoted this year?',
    'Start new hobby?',
    'Travel internationally?',
  ]},
];

export default function PredictionMarkets() {
  const [activeTab, setActiveTab] = useState('create');
  const [markets, setMarkets] = useState([]);
  const [marketName, setMarketName] = useState('');
  const [marketType, setMarketType] = useState('binary');
  const [options, setOptions] = useState(['Yes', 'No']);
  const [viewMarket, setViewMarket] = useState(null);

  const addMarket = () => {
    if (!marketName.trim()) return;
    
    const newMarket = {
      id: Date.now().toString(),
      name: marketName.trim(),
      type: marketType,
      options: marketType === 'binary' ? ['Yes', 'No'] : options.filter(o => o.trim()),
      predictions: [],
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    
    setMarkets([newMarket, ...markets]);
    setMarketName('');
    setOptions(['Yes', 'No']);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const addTemplateMarket = (template) => {
    const newMarket = {
      id: Date.now().toString(),
      name: template,
      type: 'binary',
      options: ['Yes', 'No'],
      predictions: [],
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setMarkets([newMarket, ...markets]);
  };

  const joinMarket = (marketId, prediction) => {
    setMarkets(markets.map(m => {
      if (m.id === marketId) {
        return {
          ...m,
          predictions: [...m.predictions, {
            id: Date.now().toString(),
            ...prediction,
            joinedAt: new Date().toISOString()
          }]
        };
      }
      return m;
    }));
  };

  const renderCreate = () => (
    <View style={styles.tab}>
      {/* Market Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>What's the prediction?</Text>
        <TextInput
          style={styles.input}
          value={marketName}
          onChangeText={setMarketName}
          placeholder="e.g., Will it rain tomorrow?"
          placeholderTextColor="#718096"
        />
      </View>

      {/* Market Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Market Type</Text>
        <View style={styles.typeGrid}>
          {MARKET_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeButton, marketType === type.id && styles.typeActive]}
              onPress={() => setMarketType(type.id)}
            >
              <Text style={styles.typeEmoji}>{type.emoji}</Text>
              <Text style={[styles.typeName, marketType === type.id && styles.typeNameActive]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Options (for non-binary) */}
      {marketType !== 'binary' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Options</Text>
          {options.map((opt, i) => (
            <View key={i} style={styles.optionRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={opt}
                onChangeText={(v) => updateOption(i, v)}
                placeholder={`Option ${i + 1}`}
                placeholderTextColor="#718096"
              />
              {options.length > 2 && (
                <TouchableOpacity onPress={() => removeOption(i)}>
                  <Text style={styles.removeOption}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {options.length < 5 && (
            <TouchableOpacity style={styles.addOption} onPress={addOption}>
              <Text style={styles.addOptionText}>+ Add Option</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Create Button */}
      <TouchableOpacity style={styles.createButton} onPress={addMarket}>
        <Text style={styles.createButtonText}>Create Market</Text>
      </TouchableOpacity>

      {/* Templates */}
      <View style={styles.templates}>
        <Text style={styles.label}>Quick Add</Text>
        {TEMPLATE_MARKETS.map(cat => (
          <View key={cat.id} style={styles.templateCat}>
            <Text style={styles.templateEmoji}>{cat.emoji} {cat.name}</Text>
            {cat.markets.map((m, i) => (
              <TouchableOpacity
                key={i}
                style={styles.templateItem}
                onPress={() => addTemplateMarket(m)}
              >
                <Text style={styles.templateText}>+ {m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );

  const renderMarkets = () => (
    <View style={styles.tab}>
      <FlatList
        data={markets}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>No markets yet</Text>
            <Text style={styles.emptySub}>Create your first prediction market!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.marketCard}
            onPress={() => setViewMarket(item)}
          >
            <View style={styles.marketHeader}>
              <Text style={styles.marketName}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'open' ? '#38A169' : '#718096' }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.marketOptions}>
              {item.options.map((opt, i) => (
                <View key={i} style={styles.optionBadge}>
                  <Text style={styles.optionText}>{opt}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.marketPredictions}>
              {item.predictions.length} prediction{item.predictions.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'create' && styles.tabActive]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>
            Create Market
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'markets' && styles.tabActive]}
          onPress={() => setActiveTab('markets')}
        >
          <Text style={[styles.tabText, activeTab === 'markets' && styles.tabTextActive]}>
            My Markets ({markets.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'create' ? renderCreate() : renderMarkets()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16213e' },
  tabs: { flexDirection: 'row', backgroundColor: '#1a1a2e' },
  tabButton: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#E53E3E' },
  tabText: { color: '#A0AEC0', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  tab: { padding: 16 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#A0AEC0', fontSize: 14, marginBottom: 8 },
  input: { backgroundColor: '#1a1a2e', color: '#fff', padding: 14, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#2D3748' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeButton: { flex: 1, minWidth: '45%', backgroundColor: '#1a1a2e', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2D3748' },
  typeActive: { borderColor: '#E53E3E', backgroundColor: '#2D1F1F' },
  typeEmoji: { fontSize: 24, marginBottom: 4 },
  typeName: { color: '#A0AEC0', fontSize: 12 },
  typeNameActive: { color: '#fff' },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  removeOption: { color: '#E53E3E', paddingLeft: 12, fontSize: 18 },
  addOption: { paddingVertical: 8 },
  addOptionText: { color: '#63B3ED', fontSize: 14 },
  createButton: { backgroundColor: '#E53E3E', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  templates: { marginTop: 30 },
  templateCat: { marginBottom: 12 },
  templateEmoji: { color: '#fff', fontWeight: '600', marginBottom: 8 },
  templateItem: { paddingVertical: 8 },
  templateText: { color: '#63B3ED', fontSize: 14 },
  marketCard: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 12 },
  marketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  marketName: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  marketOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  optionBadge: { backgroundColor: '#2D3748', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  optionText: { color: '#A0AEC0', fontSize: 13 },
  marketPredictions: { color: '#718096', fontSize: 13 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize marginBottom: : 48,16 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  emptySub: { color: '#A0AEC0', marginTop: 8 },
});
