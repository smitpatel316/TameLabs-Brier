# Product Roadmap: Brier (The Prediction Log)

## 1. Product Identity

- **Name:** Brier
- **Origin:** Named after the "Brier Score," a mathematical function that measures the accuracy of probabilistic predictions.
- **Tagline:** Calibrate your fear. Debug your reality.
- **The Core Loop:** 
  1. **Wager:** User predicts a social disaster (Fear + Probability).
  2. **Action:** User lives their life.
  3. **Result:** User logs the truth.
  4. **Feedback:** App displays the "Mammoth Error Rate."

## 2. Execution Milestones

### Milestone 1: The MVP (The "Wager" Engine)

**Target:** Month 1-2

**Platform:** Web (PWA) + React Native (Expo)

**Core Features:**
- **Quick Log:** "I am about to..." (Event) + "I predict..." (Fear) + "Probability" (0-100%).
- **Resolution:** Simple push notification to mark "Did it happen?" (Yes/No).
- **The Graph:** A simple scatter plot showing Prediction vs. Reality.
- **Storage:** Local SQLite/AsyncStorage only.

**Technical Requirements:**
- React Native (Expo) - Single codebase for Web/iOS/Android
- Local SQLite storage
- PWA capabilities for web deployment

### Milestone 2: V1.0 (The Calibration)

**Target:** Month 3-4

**Platform:** iOS / Android App Stores

**Core Features:**
- **The Brier Score:** A dynamic score (0.0 to 1.0) showing how accurate your fears are.
- **Categorization:** Tag fears (e.g., "Social", "Work", "Dating").
- **Reality Check:** Automated prompt 2 hours after an event.
- **Data Export:** JSON/CSV export for engineers who want to analyze their own data.

**Technical Requirements:**
- Mobile app store deployment
- Local database with export capabilities

### Milestone 3: V2.0 (The Pattern Recognition)

**Target:** Month 6+

**Platform:** SaaS / Cloud Integration

**Core Features:**
- **Tame Cloud Sync:** Encrypted backup across devices.
- **Insight Engine:** "You are 94% inaccurate about Public Speaking, but 80% accurate about Deadlines."
- **Wearable Integration:** Correlate Heart Rate (Apple Health) with perceived fear.
- **Challenge Mode:** App suggests progressively harder social risks based on your Brier score (Gamified Rejection Therapy).

**Technical Requirements:**
- Node.js + PostgreSQL backend (Supabase)
- Zero-knowledge encryption (User holds the keys)
- AI/ML for pattern recognition
- Wearable health data integration

## 3. Technical Architecture

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React Native (Expo) | Single codebase for all platforms |
| Local DB | SQLite | Offline-first, local storage |
| Backend (V2) | Node.js + PostgreSQL | Supabase for easier deployment |
| Security | Zero-knowledge | User holds encryption keys |
| AI/Logic | Local: Bayesian updating | Cloud: Small LLM for sentiment |

## 4. Data Model

### Prediction Entry
```typescript
interface Prediction {
  id: string;
  event: string;           // "I am about to..."
  fear: string;            // "I predict..."
  probability: number;      // 0-100
  category: string;        // "Social", "Work", "Dating", etc.
  createdAt: Date;
  resolvedAt?: Date;
  outcome?: boolean;       // true = happened, false = didn't happen
  notes?: string;          // Post-resolution notes
}
```

### Brier Score Calculation
```
Brier Score = (1/N) × Σ(predicted_probability - actual_outcome)²

Where:
- predicted_probability = 0.0 to 1.0
- actual_outcome = 0 (didn't happen) or 1 (happened)
- Lower score = better calibration (0 = perfect, 1 = completely wrong)
```

## 5. Milestone Checklist

- [ ] **MVP:**
  - [ ] Quick Log UI
  - [ ] Probability slider/input
  - [ ] Resolution flow (Yes/No)
  - [ ] Basic scatter plot
  - [ ] Local SQLite storage

- [ ] **V1.0:**
  - [ ] Brier Score display
  - [ ] Category tagging
  - [ ] Automated reminders
  - [ ] JSON/CSV export
  - [ ] App Store deployment

- [ ] **V2.0:**
  - [ ] Cloud sync (E2E encrypted)
  - [ ] Pattern insights
  - [ ] Health data integration
  - [ ] Challenge mode gamification

---

*Last Updated: 2026-02-16*
*Derived from: Hubble (https://github.com/smitpatel316/TameLabs-Hubble)*
