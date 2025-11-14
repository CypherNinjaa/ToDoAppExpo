# GitHub Copilot Instructions - Developer Todo App

## Project Context

Building a developer-themed todo app for Android using React Native with Expo. The app features code-inspired UI elements, terminal aesthetics, and is designed specifically for developers and CS students.

## Core Principles

### 1. Documentation & File Creation

- NEVER create .md files without explicit user permission
- Do not generate summary documents, changelog files, or documentation files automatically
- Only create code files (.ts, .tsx, .js, .jsx, .json) unless specifically requested
- If user asks to document something, ask for confirmation before creating .md files

### 2. Memory Management

- Use MCP Memory tools (mcp*memory*\*) to save important project decisions, architecture choices, and context
- Store key information that should persist across sessions:
  - Design decisions and rationale
  - API structures and data models
  - Component patterns and conventions
  - Bug fixes and their solutions
  - User preferences and requirements
- Create entities for major concepts (components, screens, services)
- Add observations to track progress and learnings
- Use relations to connect related concepts

### 3. Error Prevention & Quality Assurance

- ALWAYS check for errors before running the project
- Use get_errors tool before executing run commands
- Validate TypeScript types and imports
- Check for missing dependencies before running
- Test code changes incrementally
- Never assume code will work - verify first

### 4. Communication Style

- NEVER use emojis in responses (user explicitly requested this)
- Keep responses concise and technical
- Use plain text formatting only
- Focus on code and implementation details
- Avoid decorative or casual language

### 5. Asset Management (Icons & Images)

- Never generate placeholder icons or SVG code without user providing assets
- When icons are needed, ask user to provide them in their preferred format
- Support multiple formats: SVG, PNG, vector code, icon libraries
- Wait for user to supply assets rather than creating generic ones
- Use react-native-svg for custom SVG icons when user provides them

### 6. Technology Stack Requirements

- Framework: React Native with Expo (SDK 51+)
- Language: TypeScript (strict mode)
- Storage: @react-native-async-storage/async-storage
- Notifications: expo-notifications
- Navigation: @react-navigation/native with bottom tabs
- State Management: Zustand or React Context (user preference)
- Fonts: expo-font with Fira Code, JetBrains Mono, or Source Code Pro
- Icons: User-provided assets with react-native-svg

### 7. Code Quality Standards

- Use TypeScript strict mode
- Define proper interfaces and types
- Follow React Native best practices
- Implement error boundaries
- Add proper error handling in async operations
- Use meaningful variable and function names
- Keep components focused and reusable
- Avoid inline styles when possible (use StyleSheet.create)

### 8. Development Workflow

1. Before any code execution:
   - Run get_errors to check current state
   - Verify all imports are available
   - Check TypeScript compilation
2. When implementing features:
   - Break down into smaller tasks using manage_todo_list
   - Implement incrementally
   - Test each piece before moving forward
   - Save progress to memory using mcp_memory_create_entities
3. After making changes:
   - Run get_errors again to validate
   - Check for warnings
   - Verify app compiles successfully

### 9. File Structure Conventions

```
src/
├── components/           # Reusable UI components
│   ├── code-editor/     # Code-themed input components
│   ├── terminal/        # Terminal-style UI components
│   └── tasks/           # Task-related components
├── screens/             # Screen components
├── services/            # Business logic & API calls
│   ├── storage.ts      # AsyncStorage wrapper
│   ├── notifications.ts # Notification service
│   └── themes.ts       # Theme management
├── types/               # TypeScript type definitions
├── constants/           # App constants and config
├── hooks/               # Custom React hooks
└── utils/               # Helper functions
```

### 10. Component Patterns

- Use functional components with hooks
- Implement proper TypeScript interfaces for props
- Use React.memo for performance optimization when needed
- Keep components under 300 lines (split if larger)
- Export components from index.ts files for clean imports

### 11. State Management

- Use Zustand for global state (tasks, settings, theme)
- Local state with useState for component-specific data
- Persist state to AsyncStorage through service layer
- Never directly call AsyncStorage from components

### 12. Styling Approach

- VS Code Dark+ theme as base colors
- Use StyleSheet.create for all styles
- Create reusable style constants in constants/themes.ts
- Support theme switching (multiple IDE themes)
- Use monospace fonts for code-themed elements
- Maintain consistent spacing and sizing

### 13. Performance Guidelines

- Use FlatList for long lists (never ScrollView with map)
- Implement proper keys for list items
- Optimize re-renders with React.memo and useMemo
- Lazy load screens and heavy components
- Keep bundle size minimal

### 14. Testing & Validation

- Test on Expo Go app during development
- Verify AsyncStorage operations work correctly
- Test notifications permissions and functionality
- Validate all navigation flows
- Check keyboard behavior and input handling

### 15. Git & Version Control

- Make atomic commits with clear messages
- Follow conventional commit format (feat:, fix:, refactor:)
- Never commit node_modules or .expo directories
- Keep .gitignore properly configured

### 16. Dependencies Management

- Only install necessary packages
- Prefer Expo-compatible packages
- Check compatibility with current Expo SDK version
- Document why each dependency is needed (in memory, not .md file)

### 17. Error Handling Patterns

```typescript
// Always wrap AsyncStorage operations
try {
	const data = await storage.getData();
	return data;
} catch (error) {
	console.error("Storage error:", error);
	return null;
}

// Handle notification permissions
const { status } = await Notifications.requestPermissionsAsync();
if (status !== "granted") {
	// Handle gracefully
}
```

### 18. Notification Implementation

- Request permissions on first launch
- Use expo-notifications for local notifications
- Schedule reminders based on task due dates
- Implement daily summary notifications
- Add notification handling when app is in foreground/background

### 19. Storage Schema

```typescript
interface StorageSchema {
	tasks: Task[];
	settings: UserSettings;
	theme: ThemeConfig;
	stats: ProductivityStats;
}
```

- Use versioning for schema migrations
- Handle corrupted data gracefully
- Implement data backup/restore

### 20. When User Reports Errors

- First: Use get_errors to see exact error details
- Check the full error stack trace
- Identify root cause before suggesting fixes
- Test the fix before applying
- If error persists, try alternative approaches
- Never apply the same failed solution repeatedly

## Memory Usage Examples

### Save Important Decisions

```typescript
// Use mcp_memory_create_entities to save:
-"Decided to use Zustand for state management because it's lightweight and TypeScript-friendly" -
	"Terminal-style task list uses FlatList with custom row renderer for performance" -
	"Notification service checks permissions on app start and handles denied state gracefully";
```

### Track Component Patterns

```typescript
// Create entity for reusable pattern:
- Entity: "CodeInput Component Pattern"
- Observations:
  - "Uses TextInput with monospace font"
  - "Syntax highlighting with color-coded text"
  - "Includes line numbers on left side"
```

### Record Bug Fixes

```typescript
// Save bug resolution:
- Entity: "BlurView tint prop Android error"
- Observation: "tint prop causes 'String cannot be cast to Boolean' error on Android"
- Solution: "Remove tint prop, use only intensity prop for cross-platform compatibility"
```

## Quick Reference Commands

### Before Starting Work

1. Check errors: `get_errors()`
2. Read project plan: `read_file('PROJECT_PLAN.md')`
3. Load memory: `mcp_memory_read_graph()`
4. Create todo list: `manage_todo_list()`

### During Development

1. Save decisions to memory: `mcp_memory_create_entities()`
2. Update todo progress: `manage_todo_list()`
3. Check errors frequently: `get_errors()`
4. Test incrementally in Expo Go

### Before Committing

1. Final error check: `get_errors()`
2. Verify compilation
3. Test core functionality
4. Save learnings to memory

## Prohibited Actions

- Creating .md files without permission
- Using emojis in any responses
- Generating placeholder icons/assets
- Running code without error checking
- Making assumptions about user preferences
- Installing packages without verification
- Applying same failed fix multiple times

## Always Remember

- User is learning BCA, be educational but concise
- App must work 100% offline
- No authentication or backend ever
- Developer theme is core to the experience
- Performance and user experience are critical
- Save important context to memory for future sessions
- Check errors before running anything
- Never use emojis in responses
