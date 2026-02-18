import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

import { useRandomGameMusic } from "@/hooks/useGameMusic";

export default function LogicGameScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const audioPlayer = useRandomGameMusic();

  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState<
    "IZQUIERDA" | "DERECHA" | "CENTRO"
  >("CENTRO");
  const [initialDuration, setInitialDuration] = useState(2000); // Default 2s
  const [intervalMs, setIntervalMs] = useState(2000);
  const [count, setCount] = useState(0);

  // Game Timer
  const [gameDuration, setGameDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef<any>(null);
  const gameTimerRef = useRef<any>(null);

  // Animation values
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    return () => {
      stopGame();
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setCount(0);
    setIntervalMs(initialDuration);

    // Start with a direction immediately
    toggleDirection("IZQUIERDA");

    // Start music
    audioPlayer.loop = true;
    if (!audioPlayer.playing) {
      audioPlayer.play();
    }

    startTimer(initialDuration);

    // Start Game Timer
    setTimeLeft(gameDuration);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startTimer = (duration: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      toggleDirection();
    }, duration) as unknown as number;
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }

    try {
      if (audioPlayer.playing) {
        audioPlayer.pause();
      }
    } catch (e) {
      // Ignore error if player is already released
    }

    translateX.value = withSpring(0);
    scale.value = withTiming(1);
    setDirection("CENTRO");
  };

  const toggleDirection = (forceSide?: "IZQUIERDA" | "DERECHA") => {
    setCount((prev) => prev + 1);

    // If forced side provided, use it, otherwise toggle
    let nextSide: "IZQUIERDA" | "DERECHA";

    if (forceSide) {
      nextSide = forceSide;
    } else {
      // Toggle based on current state (or simple alternating if strictly Left-Right-Left-Right)
      // Check current translateX value or state to decide
      // Ideally we want to alternate, but random is also good for reaction?
      // User asked "vaya de un costado a otro", implies alternating.
      // Let's rely on the stateRef or just toggle based on previous `direction` state variable?
      // Note: inside setInterval, state closure is stale unless we use functional update or refs.
      // Let's use functional update pattern for safety if we had logic,
      // but here we can just check `translateX.value` or keep it simple with random/alternating.

      // Let's implement randomness to keep it engaging, but biased to switch sides?
      // Actually, "De un costado a otro" strongly implies L -> R -> L -> R.
      // But the state inside setInterval will be stale if we don't be careful.
      // Since we are resetting the interval on duration change (not happening here), it's fine.
      // However, `direction` state inside setInterval will be the closure value from when startTimer was called?
      // No, `startTimer` is called once. The closure captures the scope.
      // BETTER APPROACH: Use a ref to track current side for the logic, or just a simple toggle based on count inside functional updaters if possible?
      // Simplest: Check `translateX.value`.

      if (translateX.value > 0) {
        // Currently Right
        nextSide = "IZQUIERDA";
      } else {
        nextSide = "DERECHA";
      }
    }

    setDirection(nextSide);

    // Animation with Spring
    const targetX = nextSide === "IZQUIERDA" ? -width * 0.35 : width * 0.35;

    translateX.value = withSpring(targetX, {
      damping: 12,
      stiffness: 90,
    });

    // Pulse
    scale.value = withTiming(1.2, { duration: 150 }, (finished) => {
      if (finished) scale.value = withTiming(1, { duration: 200 });
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Desplazamiento" }} />

      {!isPlaying ? (
        <View style={styles.startContainer}>
          <View style={styles.titleSection}>
            <ThemedText type="title" style={styles.title}>
              🏃 Desplazamiento Lateral
            </ThemedText>
            <ThemedText style={styles.description}>
              Muévete físicamente de lado a lado siguiendo el indicador en la
              pantalla. Perfecto para activar tu cuerpo y entrar en calor.
            </ThemedText>
          </View>

          <View
            style={[
              styles.settingsCard,
              { backgroundColor: theme === "dark" ? "#1a1a2e" : "#f5f5f5" },
            ]}
          >
            <ThemedText style={styles.settingsLabel}>
              ⚡ Intervalo de Cambio
            </ThemedText>
            <View style={styles.buttonsRow}>
              {[1000, 2000, 3000].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    initialDuration === duration && styles.durationButtonActive,
                    initialDuration !== duration && {
                      borderColor: theme === "dark" ? "#333" : "#ddd",
                      backgroundColor: "transparent",
                    },
                  ]}
                  onPress={() => setInitialDuration(duration)}
                >
                  <ThemedText
                    style={[
                      styles.durationButtonText,
                      initialDuration === duration &&
                        styles.durationButtonTextActive,
                    ]}
                  >
                    {duration / 1000}s
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                O personaliza (seg):
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[theme].text,
                    borderColor: theme === "dark" ? "#333" : "#ddd",
                    backgroundColor: theme === "dark" ? "#0f0f1e" : "#fff",
                  },
                ]}
                keyboardType="numeric"
                value={
                  initialDuration > 0 ? (initialDuration / 1000).toString() : ""
                }
                onChangeText={(text) => {
                  const val = text.replace(/[^0-9]/g, "");
                  if (val) setInitialDuration(parseInt(val, 10) * 1000);
                  else setInitialDuration(0);
                }}
                placeholder="Vel"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.divider} />

            <ThemedText style={styles.settingsLabel}>
              ⏱️ Duración del Juego
            </ThemedText>
            <View style={styles.buttonsRow}>
              {[30, 60, 120].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    gameDuration === duration && styles.durationButtonActive,
                    gameDuration !== duration && {
                      borderColor: theme === "dark" ? "#333" : "#ddd",
                      backgroundColor: "transparent",
                    },
                  ]}
                  onPress={() => setGameDuration(duration)}
                >
                  <ThemedText
                    style={[
                      styles.durationButtonText,
                      gameDuration === duration &&
                        styles.durationButtonTextActive,
                    ]}
                  >
                    {duration}s
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Min 30s:</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[theme].text,
                    borderColor: theme === "dark" ? "#333" : "#ddd",
                    backgroundColor: theme === "dark" ? "#0f0f1e" : "#fff",
                  },
                ]}
                keyboardType="numeric"
                value={gameDuration.toString()}
                onChangeText={(text) => {
                  const val = text.replace(/[^0-9]/g, "");
                  if (val) {
                    const num = parseInt(val, 10);
                    setGameDuration(num);
                  } else {
                    setGameDuration(0);
                  }
                }}
                onEndEditing={() => {
                  if (gameDuration < 30) setGameDuration(30);
                }}
                placeholder="Duración"
                placeholderTextColor="#888"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: "#FFE66D" }]}
            onPress={() => {
              if (gameDuration < 30) setGameDuration(30);
              startGame();
            }}
          >
            <ThemedText style={[styles.startButtonText, { color: "#333" }]}>
              COMENZAR ENTRENAMIENTO
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameContainer}>
          <View
            style={[
              styles.statsBar,
              {
                backgroundColor:
                  theme === "dark"
                    ? "rgba(0,0,0,0.3)"
                    : "rgba(255,255,255,0.9)",
                top: 10,
                position: "absolute",
                zIndex: 10,
              },
            ]}
          >
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Tiempo</ThemedText>
              <ThemedText style={styles.statValue}>
                {formatTime(timeLeft)}
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Cambios</ThemedText>
              <ThemedText style={styles.statValue}>{count}</ThemedText>
            </View>
          </View>

          <View style={styles.centerLine} />

          <Animated.View
            style={[
              styles.indicator,
              { backgroundColor: Colors[theme].tint },
              animatedStyle,
            ]}
          >
            <Ionicons
              name={direction === "IZQUIERDA" ? "arrow-back" : "arrow-forward"}
              size={40}
              color="white"
            />
          </Animated.View>

          <ThemedText style={styles.directionText}>{direction}</ThemedText>

          <TouchableOpacity style={styles.stopButton} onPress={stopGame}>
            <ThemedText style={styles.stopButtonText}>⏸ DETENER</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  startContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  titleSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  description: {
    textAlign: "center",
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  settingsCard: {
    width: "100%",
    padding: 24,
    borderRadius: 20,
    marginBottom: 8,
  },
  settingsLabel: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: 70,
    alignItems: "center",
  },
  durationButtonActive: {
    backgroundColor: "#FFE66D",
    borderColor: "#FFE66D",
  },
  durationButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  durationButtonTextActive: {
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(150, 150, 150, 0.2)",
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    width: 80,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  startButton: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: 24,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  gameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  centerLine: {
    position: "absolute",
    width: 2,
    height: "100%",
    backgroundColor: "rgba(150, 150, 150, 0.3)",
  },
  indicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  directionText: {
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 60,
    letterSpacing: 2,
  },
  stopButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 2,
    borderColor: "#FF3B30",
    position: "absolute",
    bottom: 40,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF3B30",
  },
  statsBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flexDirection: "row",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(150, 150, 150, 0.3)",
  },
});
