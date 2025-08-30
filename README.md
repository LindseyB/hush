# ☁️ Hush - Breathing Exercise App

A beautiful, mindful breathing exercise app built with React. Hush helps you practice various breathing techniques for relaxation, focus, and stress relief.

## 🚀 Live Demo

Try it now: **https://LindseyB.github.io/hush**

## 🍎 iPhone screen recording

<div align="center">

  https://github.com/user-attachments/assets/c30f2ffc-fc7b-4195-821f-ad79c479d5d8

</div>

## ✨ Features

### 🫁 **Four Breathing Techniques**
- **Box Breathing (4-4-4-4)** - Inhale 4s → Hold 4s → Exhale 4s → Hold 4s
  - Perfect for focus, concentration, and anxiety relief
- **Triangle Breathing (3-3-3)** - Inhale 3s → Hold 3s → Exhale 3s
  - Quick stress relief and mindfulness practice
- **Resonant Breathing (5-5)** - Inhale 5s → Exhale 5s
  - Optimal for heart rate variability and deep relaxation
- **4-7-8 Breathing (4-7-8)** - Inhale 4s → Hold 7s → Exhale 8s
  - Based on ancient yogic pranayama for stress relief and sleep preparation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LindseyB/hush.git
   cd hush
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The app will automatically reload when you make changes


## 📱 How to Use

1. **Choose your breathing technique** using the toggle buttons at the top
2. **Click "Start"** to begin your breathing session
3. **Follow the animated circle**:
   - Circle expands during inhale phases
   - Circle contracts during exhale phases
   - Circle stays steady during hold phases
4. **Watch the phase labels** to know when to breathe in, hold, or breathe out
5. **Track your progress** with the cycle counter
6. **Use "Pause"** to take a break
7. **Switch exercises** anytime - the app will automatically reset

### 💡 Tips for Best Practice

- **Find a comfortable position** - sit with straight back or lie down
- **Create a calm environment** - minimize distractions
- **Start with shorter sessions** - 2-4 cycles for beginners
- **Be consistent** - regular practice yields better results
- **Listen to your body** - stop if you feel lightheaded

## 🛠️ Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will reload if you make edits.

### `npm run build`
Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**
If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time.

### `npm run deploy`
Builds and deploys the app to GitHub Pages. The app will be available at https://LindseyB.github.io/hush

## 🧪 Testing

This app includes comprehensive test coverage to ensure reliability and maintainability.

### **Running Tests**

```bash
# Run tests in interactive watch mode
npm test

# Run all tests once without watch mode
npm test -- --watchAll=false

# Run tests with coverage report
npm test -- --coverage --watchAll=false

# Run a specific test file
npm test App.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="breathing exercise"
```

### **Continuous Integration**

This project uses GitHub Actions for automated testing:

- **Automated Testing**: All tests run automatically on Pull Requests and pushes to `main`
- **Multi-Version Support**: Tests run on Node.js 18.x and 20.x to ensure compatibility
- **Quality Gates**: Deployment only occurs after all tests pass successfully

The CI workflow includes:
- ✅ **Test Suite**: Full test execution across multiple Node.js versions

See `.github/workflows/test.yml` for the complete workflow configuration.

## 🚀 Deployment

This app is automatically deployed to GitHub Pages using GitHub Actions when code is pushed to the `main` branch.

**Live URL:** https://LindseyB.github.io/hush

### Manual Deployment
```bash
npm run deploy
```

### Automatic Deployment
- Triggered on push to `main` branch
- Uses GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Deploys to GitHub Pages automatically

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🙏 Acknowledgments

- The rain falls against the parasol by straget -- https://freesound.org/s/531947/ -- License: Attribution 4.0

---

**Made with ☁️ for mindful breathing and wellness**
