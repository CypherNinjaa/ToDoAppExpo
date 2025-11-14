# TaskShell - Developer Todo App

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-FF6B00?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
</div>

<div align="center">
  <h3>🚀 A powerful, cyberpunk-themed task management app designed for developers</h3>
  <p>Built with React Native, Expo SDK 54, and TypeScript</p>
</div>

---

## 📸 Screenshots

<div align="center">
  <img src="ToDoAppExpo/screenshots/dashboard.jpg" alt="Dashboard" width="200"/>
  <img src="ToDoAppExpo/screenshots/tasks.jpg" alt="Tasks" width="200"/>
  <img src="ToDoAppExpo/screenshots/developerprofile.jpg" alt="Developer Profile" width="200"/>
  <img src="ToDoAppExpo/screenshots/files.jpg" alt="Files" width="200"/>
  <img src="ToDoAppExpo/screenshots/calendar.jpg" alt="Calendar" width="200"/>
  <img src="ToDoAppExpo/screenshots/settings.jpg" alt="Settings" width="200"/>
</div>

---

## ✨ Features

### 🎯 **Task Management**

- ✅ Create, edit, and delete tasks with rich text support
- 🏷️ Organize tasks by category, priority, and status
- 📅 Set due dates and reminders
- 🔍 Advanced search with filters (by priority, category, status, date)
- 📊 Sort tasks by date, title, priority, or category
- 🔄 Drag-and-drop task reordering
- 📱 Swipe gestures for quick actions
- 🎨 Color-coded priorities (High, Medium, Low)

### ⏱️ **Pomodoro Focus Timer**

- 🍅 Built-in Pomodoro timer with customizable intervals
- ⏰ Background timer support - keeps running when app is minimized
- 📳 Silent persistent notifications with timer updates (every 5 seconds)
- 🔗 Link tasks to focus sessions
- 📈 Track productivity sessions
- ⚙️ Customizable work/break durations
- 🎯 Focus mode with distraction-free interface

### 📁 **File Management**

- 📎 Attach files and documents to tasks
- 🖼️ Image preview support
- 📄 PDF and document handling
- 🏷️ Tag files for easy organization
- 🔗 Link files to specific tasks
- ⭐ Mark files as favorites
- 🗑️ Bulk file operations
- 📊 File size tracking and limits

### 📅 **Calendar Views**

- 📆 Multiple view modes: Week, Month, Heatmap
- 📊 Visual task distribution
- 🎨 Color-coded task indicators
- 📍 Quick navigation between dates
- 🔥 Activity heatmap for productivity tracking

### 🎨 **Themes & Customization**

- 🌙 **VS Code Dark+** - Classic Visual Studio Code dark theme
- 🧛 **Dracula** - Popular dark theme with vibrant colors
- 🎸 **Monokai** - Iconic developer theme
- 🐙 **GitHub Dark** - GitHub's sleek dark theme
- 💾 Theme persistence across app restarts
- 🎨 Syntax highlighting throughout the UI

### 🔔 **Smart Notifications**

- ⏰ Task deadline reminders
- 🍅 Pomodoro timer alerts
- 📱 Silent persistent timer notifications
- 🔕 Customizable notification preferences
- 📬 Smart notification channels (Low, Default, High priority)
- 🎯 In-app notification handling

### 💾 **Data Management**

- 📤 Export tasks to JSON
- 📥 Import tasks from JSON
- ☁️ Local storage with AsyncStorage
- 🔄 Data persistence and state management
- 📊 Statistics and progress tracking
- 🔥 Streak tracking
- 📈 Completion metrics

### 👨‍💻 **Developer Profile**

- 🎨 Unique code editor-style profile interface
- 📂 File tabs (README.md, skills.ts, projects.json, contact.sh)
- 🎯 Line numbers and syntax highlighting
- ⚡ Animated profile with Lottie icons
- 🔗 Social links (GitHub, LinkedIn, Instagram, Email)
- 💼 Skills and projects showcase
- 📊 Developer stats and achievements

### 🔐 **Permissions & Security**

- 🔔 Notification permissions handling
- 📁 File access permissions
- 🎯 First-time user permission request screen
- 🔒 Secure data storage
- 🛡️ Privacy-focused design

### 🎮 **User Experience**

- ⌨️ Keyboard shortcuts support
- 📱 Gesture controls
- 🎭 Haptic feedback
- ⚡ Fast and responsive UI
- 🎨 Terminal/CLI-inspired interface
- 💫 Smooth animations and transitions
- 🎯 Context-aware interactions

---

## 🛠️ Tech Stack

- **Framework:** React Native with Expo SDK 54
- **Language:** TypeScript
- **State Management:** Zustand
- **Storage:** AsyncStorage
- **Notifications:** expo-notifications
- **Navigation:** Custom navigator
- **Animations:** React Native Animated API, Lottie
- **Fonts:** Fira Code (Monospace)
- **UI Components:** Custom components with terminal aesthetic

---

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/CypherNinjaa/ToDoAppExpo.git
   cd ToDoAppExpo
   ```

2. **Install dependencies**

   ```bash
   cd ToDoAppExpo
   npm install
   # or
   yarn install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

---

## 📱 Build for Production

### Android APK

```bash
eas build --platform android --profile preview
```

### iOS

```bash
eas build --platform ios --profile preview
```

---

## 🎯 Project Structure

```
ToDoAppExpo/
├── App.tsx                 # Main app entry point
├── assets/                 # Images, fonts, Lottie animations
│   ├── fonts/             # Fira Code font files
│   └── *.json             # Lottie animation files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── calendar/      # Calendar-specific components
│   │   ├── common/        # Shared components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── inputs/        # Input and form components
│   │   └── tasks/         # Task-specific components
│   ├── constants/         # Theme and style constants
│   │   ├── styles.ts      # Global styles
│   │   └── themes.ts      # Theme definitions
│   ├── hooks/             # Custom React hooks
│   │   ├── useAppFonts.ts
│   │   └── useInitializeApp.ts
│   ├── navigation/        # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/           # App screens
│   │   ├── CalendarScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── DeveloperProfileScreen.tsx
│   │   ├── FilesScreen.tsx
│   │   ├── PermissionsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── SplashScreen.tsx
│   │   ├── TaskFormScreen.tsx
│   │   ├── TasksScreen.tsx
│   │   └── WelcomeScreen.tsx
│   ├── services/          # Business logic and API services
│   │   ├── exportService.ts
│   │   ├── importService.ts
│   │   ├── notificationService.ts
│   │   ├── storageService.ts
│   │   └── storageKeys.ts
│   ├── stores/            # Zustand state stores
│   │   ├── fileStore.ts
│   │   ├── settingsStore.ts
│   │   ├── statsStore.ts
│   │   ├── taskStore.ts
│   │   ├── themeStore.ts
│   │   └── timerStore.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── file.types.ts
│   │   └── task.types.ts
│   └── utils/             # Utility functions
│       ├── dataExport.ts
│       ├── haptics.ts
│       └── searchFilter.ts
└── package.json
```

---

## 🎨 Features in Detail

### Dashboard

- Welcome message with username
- Today's date and git-style status
- Pomodoro timer with focus mode
- Quick task creation
- Statistics overview (total completed, current streak, today's progress)
- Activity graph (7-day commit graph)
- Quick navigation to all sections

### Tasks Screen

- Terminal-style command header
- Advanced search and filtering
- Multiple sort options
- Task count and status indicators
- Quick actions (mark complete, delete, edit)
- Priority indicators with color coding
- Category badges
- Due date tracking with overdue indicators

### Calendar Screen

- Week view with daily task counts
- Month view with task indicators
- Heatmap view for activity visualization
- Date range navigation
- Color-coded task distribution
- Empty state with helpful messages

### Files Screen

- File browser with search
- Filter by favorites
- Bulk selection mode
- File previews
- Tagging system
- Task linking
- Storage usage tracking

### Settings Screen

- Theme selector with live preview
- Notification preferences
- Display settings
- Timer configuration
- Data management (export/import)
- Developer profile access

---

## 🔧 Configuration

### Notification Channels

- **Low Priority:** Timer updates (silent, no vibration)
- **Default:** General notifications
- **High Priority:** Important reminders

### Timer Settings

- Work duration: Customizable (default: 25 minutes)
- Break duration: Customizable (default: 5 minutes)
- Long break: Customizable (default: 15 minutes)
- Background persistence enabled

---

## 🤝 Contributing

We love contributions! TaskShell is open source and we welcome contributions from the community.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

### Good First Issues

Looking to contribute but not sure where to start? Check out our [good first issues](https://github.com/CypherNinjaa/ToDoAppExpo/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) label!

### Areas We Need Help

- 🐛 Bug fixes
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Adding tests
- 🌐 Translations
- ♿ Accessibility improvements

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Developer

**Vikash Kumar**

- 🌐 GitHub: [@CypherNinjaa](https://github.com/CypherNinjaa)
- 💼 LinkedIn: [vikashintech](https://www.linkedin.com/in/vikashintech/)
- 📸 Instagram: [@vikashintech](https://www.instagram.com/vikashintech/)
- 📧 Email: vikashkelly@gmail.com

---

## 🙏 Acknowledgments

- Icons: [Icons8](https://icons8.com) for Lottie animations
- Fonts: [Fira Code](https://github.com/tonsky/FiraCode) by Nikita Prokopov
- Inspiration: Terminal/CLI interfaces and developer tools

---

## 📈 Roadmap

- [ ] Cloud sync functionality
- [ ] Collaboration features
- [ ] Desktop app (Electron)
- [ ] Voice commands
- [ ] AI-powered task suggestions
- [ ] Integration with GitHub, Jira, etc.
- [ ] Dark/Light mode toggle
- [ ] More theme options
- [ ] Custom theme creator

---

<div align="center">
  <p>Made with ❤️ by Vikash Kumar</p>
  <p>⭐ Star this repo if you find it useful!</p>
</div>
