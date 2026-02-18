import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#1A535C", "#FF9F43"];
const NUM_PARTICLES = 30;

interface ConfettiParticleProps {
  index: number;
}

const ConfettiParticle = ({ index }: ConfettiParticleProps) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Randomize direction and distance
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (SCREEN_WIDTH * 0.5) + 50;
    const duration = Math.random() * 1000 + 1000;

    // Initial hidden state
    scale.value = 0;
    opacity.value = 1;

    // Animate
    scale.value = withSpring(Math.random() * 0.5 + 0.5);
    rotation.value = withTiming(Math.random() * 360 * 2, { duration });

    x.value = withTiming(Math.cos(angle) * distance, {
      duration,
      easing: Easing.out(Easing.quad),
    });

    y.value = withSequence(
      withTiming(Math.sin(angle) * distance, {
        duration: duration * 0.6,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(SCREEN_HEIGHT, {
        duration: duration * 0.4,
        easing: Easing.in(Easing.quad),
      }),
    );

    opacity.value = withDelay(
      duration * 0.5,
      withTiming(0, { duration: duration * 0.5 }),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        style,
        {
          backgroundColor: COLORS[index % COLORS.length],
          left: "50%",
          top: "50%",
        },
      ]}
    />
  );
};

export const CelebrationOverlay = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  particle: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 3,
  },
});
