# Brier - The Prediction Log

Calibrate your fear. Debug your reality.

A mobile app for tracking predictions and measuring forecasting accuracy using the Brier Score.

## Features

- **Quick Log**: Record predictions with probability estimates
- **Resolution Tracking**: Mark outcomes as Yes/No
- **Brier Score**: Real-time accuracy measurement (0.0 = perfect, 1.0 = terrible)
- **Categories**: Tag predictions by type (Social, Work, Dating, etc.)
- **Insights**: Pattern recognition and calibration analysis

## Tech Stack

- React Native (Expo)
- Local SQLite storage
- PWA capabilities

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## The Science

The Brier Score measures the accuracy of probabilistic predictions:

```
Brier Score = (1/N) × Σ(predicted_probability - actual_outcome)²
```

- 0.0 = Perfect calibration
- 0.25 = Random guessing
- 1.0 = Completely wrong every time

## License

MIT
