# Contributing to TaskShell

First off, thank you for considering contributing to TaskShell! It's people like you that make TaskShell such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and encourage diverse perspectives
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**

- Device: [e.g. iPhone 12, Samsung Galaxy S21]
- OS: [e.g. iOS 15.0, Android 12]
- App Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description** of the enhancement
- **Use case**: Why would this enhancement be useful?
- **Possible implementation**: If you have ideas on how to implement it
- **Alternatives**: Any alternative solutions you've considered

### 🔨 Pull Requests

1. **Fork the repo** and create your branch from `dev`
2. **Follow the code style** (TypeScript, ESLint rules)
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**

#### Pull Request Process:

1. **Create a feature branch from dev**

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write clean, maintainable code
   - Follow existing code style and patterns
   - Add comments for complex logic
   - Keep changes focused and atomic

3. **Test your changes**

   ```bash
   npm test
   npx expo start
   ```

4. **Commit your changes**

   ```bash
   git commit -m "feat: add amazing feature"
   ```

   Use conventional commit format:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Target the `dev` branch (not `master`)
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure CI checks pass

## Branching Strategy

We follow a two-branch workflow:

- **`master`** - Stable production branch (protected)
- **`dev`** - Development branch where all PRs are merged
- **`feature/*`** - Feature branches created from `dev`
- **`bugfix/*`** - Bug fix branches created from `dev`

**Important:** All pull requests should target the `dev` branch, not `master`.

## Development Setup

### Prerequisites

- Node.js v16+
- npm or yarn
- Expo CLI
- Android Studio / Xcode (for testing)

### Setup Instructions

1. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ToDoAppExpo.git
   cd ToDoAppExpo/ToDoAppExpo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npx expo start
   ```

4. **Run on device**
   - Press `a` for Android
   - Press `i` for iOS

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary

### React Native

- Use functional components with hooks
- Follow React Native best practices
- Keep components small and focused
- Use meaningful component and variable names

### File Structure

- Components go in `src/components/`
- Screens go in `src/screens/`
- Services go in `src/services/`
- Types go in `src/types/`
- Utils go in `src/utils/`

### Naming Conventions

- **Components**: PascalCase (e.g., `TaskCard.tsx`)
- **Files**: camelCase for utilities (e.g., `dataExport.ts`)
- **Variables**: camelCase (e.g., `taskList`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `STORAGE_KEYS`)

### Code Formatting

- Use 2 spaces for indentation
- Single quotes for strings
- Semicolons at the end of statements
- Run `npm run lint` before committing

## Testing

- Test your changes on both iOS and Android if possible
- Test with different screen sizes
- Test with different themes
- Verify that existing features still work

## Documentation

- Update README.md if you add new features
- Add JSDoc comments for complex functions
- Update inline comments for clarity
- Add types and interfaces documentation

## What to Contribute?

### Good First Issues

Look for issues labeled `good first issue` - these are perfect for newcomers!

### Areas That Need Help

- 🐛 Bug fixes
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Adding tests
- 🌐 Translations/Internationalization
- ♿ Accessibility improvements

## Getting Help

- 💬 Open a discussion on GitHub
- 📧 Email: vikashkelly@gmail.com
- 🐛 Check existing issues and discussions

## Recognition

Contributors will be recognized in the README.md file and release notes.

## Questions?

Don't hesitate to ask! Open an issue with the label `question` or reach out directly.

---

Thank you for contributing to TaskShell! 🚀

_Happy Coding!_ 👨‍💻
