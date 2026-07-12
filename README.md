# SDPD — Systems Design Police Department 🔍

> **An interactive educational game for mastering distributed systems design through detective-style problem-solving**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.3-purple.svg)](https://vitejs.dev)
[![Languages](https://img.shields.io/badge/Languages-English%20%7C%20Portuguese-brightgreen.svg)](#-internationalization)

## 📖 Overview

SDPD is a gamified learning platform that teaches distributed systems design concepts through interactive detective cases. Instead of reading theory, you solve **33 real-world system failure scenarios** where you must:

1. **Investigate** — Inspect system components and logs to understand what failed
2. **Diagnose** — Identify the root cause of the failure
3. **Solve** — Recommend the appropriate fix to prevent recurrence

Each case is tied to specific distributed systems concepts (replication, consistency, load balancing, caching, messaging, storage, networking, and more), making learning engaging and practical.

---

## ✨ Features

- 🎮 **33 Interactive Cases** — Progressive difficulty, unlocked sequentially
- 🏆 **Achievement System** — 7 ranks from Rookie to Chief based on completion
- 🔬 **Visual System Diagrams** — Interactive node inspection with debug logs
- 🌍 **Multilingual** — English and Portuguese (Brazil) support
- 💾 **Progress Persistence** — All progress saved to browser localStorage
- 🎨 **Beautiful UI** — Dark-mode cyberpunk aesthetic with smooth animations
- 📚 **Educational Content** — Linked concepts explaining distributed systems theory
- 🚀 **Performance** — Built with modern tooling (Vite, React 19, TypeScript)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended 20+)
- **npm** 8+ or **yarn** 3+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sdpd.git
cd sdpd

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build and type-check
npm run build

# Preview production build locally
npm run preview
```

---

## 📚 How It Works

### Game Flow

1. **Home Page** — View all 33 cases organized by concept category
   - See your current rank and progress percentage
   - Click on a case to begin investigation

2. **Case Investigation** — For each case:
   - **Read the Brief** — Understand the scenario, symptoms, and objective
   - **Inspect the Diagram** — Click nodes to view logs and system data
   - **Diagnose Root Cause** — Answer multiple-choice questions about what failed
   - **Recommend Fix** — Answer follow-up questions about the solution
   - **Earn Badge** — Complete the case and unlock the next one

3. **Progression**
   - Cases unlock sequentially (complete case N to unlock case N+1)
   - Your rank automatically upgrades based on completed cases
   - All progress persists across sessions

### Case Categories

| Category | Cases | Concepts |
|----------|-------|----------|
| 🔄 **Replication** | 1-3 | Leader-follower, redundancy, failover |
| 🎯 **Consistency** | 4-8 | CAP theorem, eventual consistency, conflict resolution |
| ⚖️ **Load Balancing** | 9-13 | Distribution algorithms, health checks, sticky sessions |
| 💾 **Caching** | 14-17 | Cache invalidation, TTL, write-through strategies |
| 📬 **Messaging** | 18-21 | Message queues, delivery guarantees, backpressure |
| 💿 **Storage** | 22-25 | Partitioning, indexing, write amplification |
| 🌐 **Networking** | 26-29 | Latency, bandwidth, packet loss, timeouts |
| 🔮 **Advanced** | 30-33 | Distributed tracing, chaos engineering, orchestration |

---

## 🎯 Player Ranks

Complete cases to climb the ranks:

| Rank | Required Cases | Badge |
|------|---|---|
| Rookie | 0 | 🥋 |
| Cadet | 1 | 👮 |
| Officer | 5 | 🚓 |
| Detective | 10 | 🔎 |
| Sergeant | 17 | ⭐ |
| Lieutenant | 25 | 🎖️ |
| Chief | 33 | 👑 |

---

## 🛠️ Technology Stack

### Frontend
- **React 19** — UI library
- **TypeScript 5.8** — Type safety
- **Vite 6.3** — Build tool & dev server
- **Tailwind CSS 4.1** — Styling
- **Framer Motion 12.34** — Animations

### State & Data
- **Zustand 5.0** — Global state management
- **React Router 6.30** — Client-side routing
- **localStorage** — Data persistence

### Visualization
- **XYFlow (React Flow) 12.10** — Interactive system diagrams
- **dnd-kit 6.3** — Drag-and-drop support

### Development
- **ESLint 9.25** — Code linting
- **TypeScript ESLint** — Type-aware linting

---

## 📁 Project Structure

```
sdpd/
├── src/
│   ├── components/              # React components
│   │   ├── common/              # Reusable UI (Button, Badge, ProgressBar)
│   │   ├── diagram/             # Node components for system visualization
│   │   ├── game/                # Case gameplay (SystemDiagram, DiagnosisPanel)
│   │   ├── guide/               # Educational guide panel
│   │   └── layout/              # Page layout (Header, Sidebar, GameLayout)
│   ├── data/
│   │   ├── cases/               # 33 case JSON files
│   │   │   └── pt-BR/           # Portuguese translations
│   │   ├── concepts.json        # Educational material (EN)
│   │   └── concepts-pt-BR.json  # Educational material (PT)
│   ├── engine/
│   │   └── validator.ts         # Answer validation logic
│   ├── hooks/
│   │   ├── useCase.ts           # Load case data
│   │   └── useGameState.ts      # Global game state (Zustand)
│   ├── i18n/                    # Internationalization
│   │   ├── index.ts
│   │   ├── useTranslation.ts    # Hook for translations
│   │   └── locales/             # Translation JSON files
│   ├── pages/
│   │   ├── HomePage.tsx         # Case selection board
│   │   └── CasePage.tsx         # Individual case gameplay
│   ├── types/
│   │   ├── case.ts              # Case, DiagramNode, DiagramEdge types
│   │   └── game.ts              # GameState, Rank types
│   ├── utils/
│   │   └── storage.ts           # localStorage helpers
│   ├── App.tsx                  # Root component
│   ├── index.css                # Global styles
│   └── main.tsx                 # Entry point
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
└── index.html
```

---

## 🎓 Creating New Cases

Cases are defined as JSON files. Here's the structure:

```json
{
  "id": "case-01",
  "number": 1,
  "title": "The Single Point of Failure",
  "subtitle": "Criminal records go dark across all precincts",
  "brief": {
    "narrative": "Story describing the system failure...",
    "symptoms": [
      "Symptom 1",
      "Symptom 2"
    ],
    "objective": "What needs to be solved..."
  },
  "diagram": {
    "nodes": [
      {
        "id": "db-central",
        "type": "database",
        "label": "Central Records DB",
        "status": "failed",
        "position": { "x": 350, "y": 50 },
        "inspectable": true,
        "inspectData": {
          "title": "Component Name",
          "logs": ["[time] Log message"],
          "data": { "key": "value" },
          "status": "Status description"
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "db-central",
        "target": "server-1",
        "label": "Connection",
        "style": "normal"
      }
    ]
  },
  "diagnosis": {
    "rootCause": {
      "question": "What is the root cause?",
      "options": [
        {
          "id": "opt-1",
          "text": "Correct answer",
          "correct": true,
          "feedback": "Explanation of why this is correct..."
        }
      ]
    },
    "fix": {
      "question": "How do we fix this?",
      "options": []
    }
  },
  "conceptId": "replication-basics",
  "badge": {
    "name": "Replication Master",
    "icon": "🔄"
  }
}
```

**Node Types:** `database`, `server`, `client`  
**Node Status:** `healthy`, `degraded`, `failed`  
**Edge Styles:** `normal`, `broken`, `slow`

To add a new case:
1. Create `src/data/cases/case-XX.json`
2. Create translation: `src/data/cases/pt-BR/case-XX.json`
3. Increment case count in code if needed

---

## 🌍 Internationalization

SDPD supports English and Portuguese (Brazil). Translations are in:
- `src/i18n/locales/en.json`
- `src/i18n/locales/pt-BR.json`
- Case files: `src/data/cases/pt-BR/`

To add a new language:
1. Create `src/i18n/locales/[locale].json`
2. Update `src/i18n/index.ts` to export new locale type
3. Add case translations in `src/data/cases/[locale]/`

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Bug Reports

Found an issue? Please create a GitHub issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Feature Requests

Have ideas? Open an issue with:
- Description of the feature
- Use case and motivation
- Mockups or examples if applicable

### Code Contributions

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** with clear messages: `git commit -m "Add feature description"`
4. **Push** to your fork: `git push origin feature/your-feature`
5. **Open a Pull Request** with:
   - Description of changes
   - Related issues (if any)
   - Testing notes

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style (eslint will enforce this)
- Add comments for complex logic
- Test changes in both browser localStorage scenarios
- Update README if adding features

```bash
# Run linter
npm run lint

# Run linter with auto-fix
npm run lint -- --fix

# Build for testing
npm run build
```

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🐛 Troubleshooting

### Cases don't appear
- Ensure case JSON files are in `src/data/cases/`
- Check case `number` fields are sequential
- Verify JSON syntax is valid

### Progress not saving
- Check browser localStorage is enabled
- Open DevTools → Application → Storage → Local Storage
- Look for `game-state` key

### Icons appear cut off
- Clear browser cache
- Try `npm run build` and `npm run preview`
- Check SVG `preserveAspectRatio` attributes

### Translation missing
- Verify key exists in both locale files
- Check `useTranslation()` is imported correctly
- Run `npm run lint` to catch missing keys

---

## 📊 Statistics

- **33 Cases** across 8 categories
- **50+ Concepts** explained
- **100+ Multiple-choice Questions**
- **7 Achievement Ranks**
- **2 Languages** (extensible)

---

## 🗺️ Roadmap

### Planned Features
- [ ] Dark/Light theme toggle
- [ ] Difficulty settings (beginner/intermediate/expert)
- [ ] Hint system for cases
- [ ] Time tracking per case
- [ ] Social sharing of achievements
- [ ] Case editor/creator tool
- [ ] Discord integration for leaderboard
- [ ] Mobile app (React Native)

### Community Requests
- Help me prioritize! Open an issue to request features

---

## 💡 Educational Value

SDPD teaches:

**Core Concepts**
- Database replication and failover
- Consistency models (strong, eventual, causal)
- Distributed consensus algorithms
- Load balancing strategies
- Cache invalidation patterns
- Message queue semantics
- Storage partitioning
- Network failures and timeouts

**Soft Skills**
- Problem analysis and diagnosis
- Root cause thinking
- System design tradeoffs
- Debugging distributed systems

**Use Cases**
- 🎓 University distributed systems courses
- 🧑‍💼 Software engineer interview prep
- 🏢 Company onboarding (systems design knowledge)
- 👥 Self-paced learning

---

## 🙏 Acknowledgments

- Inspired by distributed systems challenges encountered in production
- Based on concepts from:
  - "Designing Data-Intensive Applications" by Martin Kleppmann
  - Papers on distributed consensus, replication, and storage
  - Real-world incident postmortems
- And based primarily from [sqlpd](https://sqlpd.com)

---

## 📈 How to Use This Project

### For Learning
1. Complete cases in order (they build on each other)
2. Read the linked concepts for each case
3. Review case feedback carefully
4. Retake difficult cases to solidify understanding

### For Teaching
1. Assign specific cases to students
2. Use cases as discussion starters
3. Reference case scenarios in lectures
4. Create similar cases for your domain

### For Contributing
1. Star ⭐ the repo if you find it useful
2. Share with others interested in distributed systems
3. Contribute new cases, concepts, or translations
4. Report bugs and suggest improvements

---

**Made with ❤️ by me**

[⬆ back to top](#sdpd--systems-design-police-department-)
