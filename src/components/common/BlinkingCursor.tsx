import React, { useEffect, useRef } from 'react';
import { Animated, Text, TextStyle } from 'react-native';

interface BlinkingCursorProps {
  style?: TextStyle;
  blinkSpeed?: number;
}

export const BlinkingCursor: React.FC<BlinkingCursorProps> = ({ style, blinkSpeed = 530 }) => {
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: blinkSpeed,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: blinkSpeed,
        useNativeDriver: true,
      }),
    ]);

    const loop = Animated.loop(blink);
    loop.start();

    return () => {
      loop.stop();
    };
  }, [blinkSpeed]);

  return <Animated.Text style={[style, { opacity: opacityAnim }]}>█</Animated.Text>;
};
