import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';

interface TypingTextProps {
  text: string;
  speed?: number;
  style?: TextStyle;
  onComplete?: () => void;
}

export const TypingText: React.FC<TypingTextProps> = ({ text, speed = 50, style, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete && currentIndex === text.length) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <Text style={style}>{displayedText}</Text>;
};

interface CommandExecutionProps {
  command: string;
  output?: string;
  speed?: number;
  style?: TextStyle;
  outputStyle?: TextStyle;
  onComplete?: () => void;
}

export const CommandExecution: React.FC<CommandExecutionProps> = ({
  command,
  output,
  speed = 50,
  style,
  outputStyle,
  onComplete,
}) => {
  const [stage, setStage] = useState<'command' | 'executing' | 'output'>('command');

  const handleCommandComplete = () => {
    setTimeout(() => {
      setStage('executing');
      setTimeout(() => {
        setStage('output');
      }, 300);
    }, 200);
  };

  const handleOutputComplete = () => {
    onComplete?.();
  };

  return (
    <>
      <TypingText text={command} speed={speed} style={style} onComplete={handleCommandComplete} />
      {stage === 'executing' && <Text style={outputStyle}>...</Text>}
      {stage === 'output' && output && (
        <TypingText
          text={output}
          speed={speed}
          style={outputStyle}
          onComplete={handleOutputComplete}
        />
      )}
    </>
  );
};
