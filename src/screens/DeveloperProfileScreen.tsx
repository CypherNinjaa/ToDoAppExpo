import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export const DeveloperProfileScreen: React.FC = () => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const getThemeColors = useThemeStore((state) => state.getThemeColors);
  const theme = getThemeColors();

  const [activeFile, setActiveFile] = useState<'readme' | 'skills' | 'projects' | 'contact'>(
    'readme'
  );
  const [typedText, setTypedText] = useState('');
  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cursorBlink = useRef(new Animated.Value(1)).current;

  const fullIntro = "const developer = { name: 'Vikash Kumar', role: 'Full Stack Developer' };";

  useEffect(() => {
    // Typing effect
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullIntro.length) {
        setTypedText(fullIntro.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Cursor blink
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorBlink, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorBlink, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    return () => clearInterval(typingInterval);
  }, []);

  const skills = {
    'Languages & Frameworks': [
      'TypeScript',
      'JavaScript',
      'React Native',
      'React.js',
      'Node.js',
      'Python',
    ],
    'Mobile Development': ['Expo', 'Android Native', 'iOS Development', 'Cross-Platform Apps'],
    'Backend & Database': ['Express.js', 'Firebase', 'MongoDB', 'PostgreSQL', 'REST APIs'],
    'Tools & DevOps': ['Git', 'VS Code', 'Docker', 'CI/CD', 'Agile/Scrum'],
  };

  const projects = [
    {
      name: 'TaskShell - Developer Todo',
      desc: 'A powerful task management app with cyberpunk aesthetics, Pomodoro timer, file management, and smart notifications.',
      tech: ['React Native', 'Expo', 'TypeScript', 'Zustand'],
      lines: '10K+',
      status: 'production',
    },
    {
      name: 'Focus Timer System',
      desc: 'Background-persistent Pomodoro timer with silent notifications and productivity tracking.',
      tech: ['Background Tasks', 'Notifications', 'AsyncStorage'],
      lines: '2K+',
      status: 'integrated',
    },
    {
      name: 'File Management Module',
      desc: 'Advanced file attachment system with previews, tagging, task linking, and bulk operations.',
      tech: ['Document Picker', 'File System', 'Image Processing'],
      lines: '3K+',
      status: 'completed',
    },
  ];

  const socialLinks = [
    {
      platform: 'GitHub',
      handle: '@CypherNinjaa',
      url: 'https://github.com/CypherNinjaa',
      lottie: require('../../assets/icons8-github.json'),
    },
    {
      platform: 'LinkedIn',
      handle: '/vikashintech',
      url: 'https://www.linkedin.com/in/vikashintech/',
      lottie: require('../../assets/icons8-linkedin.json'),
    },
    {
      platform: 'Instagram',
      handle: '@vikashintech',
      url: 'https://www.instagram.com/vikashintech/',
      lottie: require('../../assets/icons8-instagram.json'),
    },
    {
      platform: 'Email',
      handle: 'vikashkelly@gmail.com',
      url: 'mailto:vikashkelly@gmail.com',
      lottie: require('../../assets/icons8-email.json'),
    },
  ];

  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.primary + '40', theme.primary + 'A0'],
  });

  const renderFileTab = (file: typeof activeFile, icon: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.fileTab,
        activeFile === file && [styles.fileTabActive, { backgroundColor: theme.surface }],
      ]}
      onPress={() => setActiveFile(file)}
    >
      <Text
        style={[styles.fileIcon, { color: activeFile === file ? theme.primary : theme.comment }]}
      >
        {icon}
      </Text>
      <Text
        style={[
          styles.fileLabel,
          { color: activeFile === file ? theme.textPrimary : theme.comment },
        ]}
      >
        {label}
      </Text>
      {activeFile === file && (
        <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Editor Header - File Tabs */}
      <View
        style={[
          styles.editorHeader,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View style={styles.fileTabs}>
          {renderFileTab('readme', '📄', 'README.md')}
          {renderFileTab('skills', '⚡', 'skills.ts')}
          {renderFileTab('projects', '📦', 'projects.json')}
          {renderFileTab('contact', '📧', 'contact.sh')}
        </View>
        <View style={styles.editorControls}>
          <View style={[styles.controlDot, { backgroundColor: '#ff5f56' }]} />
          <View style={[styles.controlDot, { backgroundColor: '#ffbd2e' }]} />
          <View style={[styles.controlDot, { backgroundColor: '#27c93f' }]} />
        </View>
      </View>

      {/* Line Numbers & Content Area */}
      <ScrollView style={styles.editorContent} showsVerticalScrollIndicator={false}>
        <View style={styles.codeArea}>
          {/* Line Numbers Column */}
          <View style={[styles.lineNumbers, { backgroundColor: theme.surface }]}>
            {Array.from({ length: 50 }).map((_, i) => (
              <Text key={i} style={[styles.lineNumber, { color: theme.comment }]}>
                {i + 1}
              </Text>
            ))}
          </View>

          {/* Content Column */}
          <Animated.View style={[styles.codeContent, { opacity: fadeAnim }]}>
            {/* README.md */}
            {activeFile === 'readme' && (
              <View style={styles.fileContent}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                  <Animated.View style={[styles.avatarContainer, { borderColor: glowColor }]}>
                    <Image
                      source={require('../../assets/developer.jpg')}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                    <Animated.View style={[styles.avatarGlow, { backgroundColor: glowColor }]} />
                  </Animated.View>

                  <View style={styles.heroText}>
                    <Text style={[styles.greeting, { color: theme.comment }]}>
                      {'// Hello World!'}
                    </Text>
                    <Text style={[styles.name, { color: theme.textPrimary }]}>
                      <Text style={{ color: theme.keyword }}>const</Text>{' '}
                      <Text style={{ color: theme.variable }}>name</Text>{' '}
                      <Text style={{ color: theme.textSecondary }}>=</Text>{' '}
                      <Text style={{ color: theme.string }}>"Vikash Kumar"</Text>;
                    </Text>
                    <Text style={[styles.role, { color: theme.primary }]}>
                      {'<'} Full Stack Developer {' />'}
                    </Text>

                    <View style={styles.statusLine}>
                      <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
                      <Text style={[styles.statusText, { color: theme.success }]}>
                        Available for opportunities
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Typing Animation */}
                <View
                  style={[
                    styles.terminalBlock,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <View style={[styles.terminalHeader, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.terminalTitle, { color: theme.comment }]}>terminal</Text>
                  </View>
                  <View style={styles.terminalBody}>
                    <Text style={[styles.terminalPrompt, { color: theme.success }]}>$ </Text>
                    <Text style={[styles.terminalText, { color: theme.textPrimary }]}>
                      {typedText}
                    </Text>
                    <Animated.Text
                      style={[styles.cursor, { opacity: cursorBlink, color: theme.primary }]}
                    >
                      ▊
                    </Animated.Text>
                  </View>
                </View>

                {/* About */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.function }]}>
                    {'## About Me'}
                  </Text>
                  <Text style={[styles.markdown, { color: theme.textPrimary }]}>
                    Passionate **Full Stack Developer** specializing in building elegant mobile and
                    web applications. I love creating intuitive user experiences and writing clean,
                    maintainable code.
                  </Text>
                  <Text style={[styles.markdown, { color: theme.textPrimary }]}>
                    Currently focused on **React Native** and **modern web technologies**, I enjoy
                    solving complex problems and turning ideas into reality through code.
                  </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsSection}>
                  <Text style={[styles.sectionTitle, { color: theme.function }]}>{'## Stats'}</Text>
                  <View style={styles.statsGrid}>
                    <View
                      style={[
                        styles.statCard,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                      ]}
                    >
                      <Text style={[styles.statValue, { color: theme.number }]}>50+</Text>
                      <Text style={[styles.statLabel, { color: theme.comment }]}>Projects</Text>
                    </View>
                    <View
                      style={[
                        styles.statCard,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                      ]}
                    >
                      <Text style={[styles.statValue, { color: theme.number }]}>5K+</Text>
                      <Text style={[styles.statLabel, { color: theme.comment }]}>Commits</Text>
                    </View>
                    <View
                      style={[
                        styles.statCard,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                      ]}
                    >
                      <Text style={[styles.statValue, { color: theme.number }]}>5+</Text>
                      <Text style={[styles.statLabel, { color: theme.comment }]}>Years Exp</Text>
                    </View>
                    <View
                      style={[
                        styles.statCard,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                      ]}
                    >
                      <Text style={[styles.statValue, { color: theme.number }]}>∞</Text>
                      <Text style={[styles.statLabel, { color: theme.comment }]}>Coffee</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* skills.ts */}
            {activeFile === 'skills' && (
              <View style={styles.fileContent}>
                <Text style={[styles.codeComment, { color: theme.comment }]}>{'/**'}</Text>
                <Text style={[styles.codeComment, { color: theme.comment }]}>
                  {' * Technical Skills & Expertise'}
                </Text>
                <Text style={[styles.codeComment, { color: theme.comment }]}>
                  {' * @author Vikash Kumar'}
                </Text>
                <Text style={[styles.codeComment, { color: theme.comment }]}>{' */'}</Text>
                <Text style={{ height: 10 }} />

                {Object.entries(skills).map(([category, items], catIndex) => (
                  <View key={catIndex} style={styles.skillBlock}>
                    <Text style={[styles.codeLine, { color: theme.textPrimary }]}>
                      <Text style={{ color: theme.keyword }}>interface</Text>{' '}
                      <Text style={{ color: theme.function }}>{category.replace(/\s+/g, '')}</Text>{' '}
                      <Text style={{ color: theme.textSecondary }}>{'{'}</Text>
                    </Text>
                    {items.map((skill, index) => (
                      <Text
                        key={index}
                        style={[styles.codeLine, { color: theme.textPrimary, paddingLeft: 20 }]}
                      >
                        <Text style={{ color: theme.variable }}>
                          {skill.toLowerCase().replace(/[.\s]/g, '_')}
                        </Text>
                        <Text style={{ color: theme.textSecondary }}>:</Text>{' '}
                        <Text style={{ color: theme.string }}>'expert'</Text>
                        <Text style={{ color: theme.textSecondary }}>,</Text>
                      </Text>
                    ))}
                    <Text style={[styles.codeLine, { color: theme.textSecondary }]}>{'}'}</Text>
                    <Text style={{ height: 10 }} />
                  </View>
                ))}
              </View>
            )}

            {/* projects.json */}
            {activeFile === 'projects' && (
              <View style={styles.fileContent}>
                <Text style={[styles.codeLine, { color: theme.textSecondary }]}>{'{'}</Text>
                <Text style={[styles.codeLine, { color: theme.textPrimary, paddingLeft: 10 }]}>
                  <Text style={{ color: theme.variable }}>"projects"</Text>
                  <Text style={{ color: theme.textSecondary }}>: [</Text>
                </Text>

                {projects.map((project, index) => (
                  <View key={index} style={{ paddingLeft: 20, marginBottom: 15 }}>
                    <Text style={[styles.codeLine, { color: theme.textSecondary }]}>{'{'}</Text>
                    <Text style={[styles.codeLine, { color: theme.textPrimary, paddingLeft: 30 }]}>
                      <Text style={{ color: theme.variable }}>"name"</Text>
                      <Text style={{ color: theme.textSecondary }}>: </Text>
                      <Text style={{ color: theme.string }}>"{project.name}"</Text>,
                    </Text>
                    <Text style={[styles.codeLine, { color: theme.textPrimary, paddingLeft: 30 }]}>
                      <Text style={{ color: theme.variable }}>"description"</Text>
                      <Text style={{ color: theme.textSecondary }}>: </Text>
                      <Text style={{ color: theme.string }}>"{project.desc}"</Text>,
                    </Text>
                    <Text style={[styles.codeLine, { color: theme.textPrimary, paddingLeft: 30 }]}>
                      <Text style={{ color: theme.variable }}>"technologies"</Text>
                      <Text style={{ color: theme.textSecondary }}>: [</Text>
                    </Text>
                    {project.tech.map((tech, techIndex) => (
                      <Text
                        key={techIndex}
                        style={[styles.codeLine, { color: theme.string, paddingLeft: 40 }]}
                      >
                        "{tech}"{techIndex < project.tech.length - 1 ? ',' : ''}
                      </Text>
                    ))}
                    <Text
                      style={[styles.codeLine, { color: theme.textSecondary, paddingLeft: 30 }]}
                    >
                      ],
                    </Text>
                    <Text style={[styles.codeLine, { color: theme.textPrimary, paddingLeft: 30 }]}>
                      <Text style={{ color: theme.variable }}>"linesOfCode"</Text>
                      <Text style={{ color: theme.textSecondary }}>: </Text>
                      <Text style={{ color: theme.number }}>"{project.lines}"</Text>,
                    </Text>
                    <Text style={[styles.codeLine, { color: theme.textPrimary, paddingLeft: 30 }]}>
                      <Text style={{ color: theme.variable }}>"status"</Text>
                      <Text style={{ color: theme.textSecondary }}>: </Text>
                      <Text style={{ color: theme.success }}>"{project.status}"</Text>
                    </Text>
                    <Text
                      style={[styles.codeLine, { color: theme.textSecondary, paddingLeft: 20 }]}
                    >
                      {'}'}
                      {index < projects.length - 1 ? ',' : ''}
                    </Text>
                  </View>
                ))}

                <Text style={[styles.codeLine, { color: theme.textSecondary, paddingLeft: 10 }]}>
                  ]
                </Text>
                <Text style={[styles.codeLine, { color: theme.textSecondary }]}>{'}'}</Text>
              </View>
            )}

            {/* contact.sh */}
            {activeFile === 'contact' && (
              <View style={styles.fileContent}>
                <Text style={[styles.codeComment, { color: theme.comment }]}>{'#!/bin/bash'}</Text>
                <Text style={[styles.codeComment, { color: theme.comment }]}>
                  {'# Contact Information'}
                </Text>
                <Text style={{ height: 10 }} />

                <Text style={[styles.codeLine, { color: theme.textPrimary }]}>
                  <Text style={{ color: theme.keyword }}>echo</Text>{' '}
                  <Text style={{ color: theme.string }}>
                    "Let\'s connect and build something amazing!"
                  </Text>
                </Text>
                <Text style={{ height: 20 }} />

                {socialLinks.map((link, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.contactCard,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                    onPress={() => handleLinkPress(link.url)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.contactIcon}>
                      <LottieView
                        source={link.lottie}
                        autoPlay
                        loop
                        style={styles.lottieIcon}
                        colorFilters={[
                          {
                            keypath: '*',
                            color: theme.primary,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactPlatform, { color: theme.textPrimary }]}>
                        {link.platform}
                      </Text>
                      <Text style={[styles.contactHandle, { color: theme.primary }]}>
                        {link.handle}
                      </Text>
                    </View>
                    <Text style={[styles.contactArrow, { color: theme.comment }]}>→</Text>
                  </TouchableOpacity>
                ))}

                <View style={[styles.footerSection, { borderTopColor: theme.border }]}>
                  <Text style={[styles.footerText, { color: theme.comment }]}>
                    {'# Made with ❤️ For developers'}
                  </Text>
                  <Text style={[styles.footerText, { color: theme.comment }]}>
                    {'# © 2025 Vikash Kumar. All rights reserved.'}
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Bottom Status Bar */}
      <View
        style={[styles.statusBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}
      >
        <View style={styles.statusLeft}>
          <Text style={[styles.statusText, { color: theme.success }]}>● </Text>
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>UTF-8</Text>
          <Text style={[styles.statusText, { color: theme.textSecondary }]}> | </Text>
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>TypeScript React</Text>
        </View>
        <View style={styles.statusRight}>
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>
            Ln 1, Col 1 |{' '}
            {activeFile === 'readme'
              ? '📄'
              : activeFile === 'skills'
                ? '⚡'
                : activeFile === 'projects'
                  ? '📦'
                  : '📧'}{' '}
            {activeFile}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editorHeader: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  fileTabs: {
    flexDirection: 'row',
    flex: 1,
  },
  fileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 2,
    position: 'relative',
  },
  fileTabActive: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  fileIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  fileLabel: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 12,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  editorControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  editorContent: {
    flex: 1,
  },
  codeArea: {
    flexDirection: 'row',
  },
  lineNumbers: {
    width: 50,
    paddingTop: 20,
    paddingLeft: 10,
  },
  lineNumber: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'right',
    paddingRight: 10,
  },
  codeContent: {
    flex: 1,
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 40,
  },
  fileContent: {
    paddingLeft: 10,
  },
  heroSection: {
    marginBottom: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 57,
  },
  avatarGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    top: -8,
    left: -8,
    opacity: 0.3,
  },
  heroText: {
    marginTop: 10,
  },
  greeting: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  name: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 24,
    marginBottom: 8,
    lineHeight: 32,
  },
  role: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 16,
    marginBottom: 12,
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 12,
  },
  terminalBlock: {
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 30,
    overflow: 'hidden',
  },
  terminalHeader: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  terminalTitle: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 11,
  },
  terminalBody: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  terminalPrompt: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 14,
  },
  terminalText: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 14,
    flex: 1,
  },
  cursor: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 18,
    marginBottom: 12,
  },
  markdown: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 12,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 120) / 2,
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 28,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 11,
  },
  codeComment: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  codeLine: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 13,
    lineHeight: 22,
  },
  skillBlock: {
    marginBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  lottieIcon: {
    width: 40,
    height: 40,
  },
  contactInfo: {
    flex: 1,
  },
  contactPlatform: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  contactHandle: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 12,
  },
  contactArrow: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 20,
  },
  footerSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  footerText: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 11,
    marginBottom: 6,
  },
  statusBar: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

