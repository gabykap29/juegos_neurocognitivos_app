import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
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
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useRandomGameMusic } from "@/hooks/useGameMusic";

const { width } = Dimensions.get("window");

// Colors for the shapes/cones
const GAME_COLORS = [
  "#FF0000", // Red
  "#0000FF", // Blue
  "#00FF00", // Green
  "#FFFF00", // Yellow
];

const COLOR_NAMES = ["ROJO", "AZUL", "VERDE", "AMARILLO"];

export default function ReactionGameScreen() {
  const audioPlayer = useRandomGameMusic();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayColor, setDisplayColor] = useState(GAME_COLORS[0]);
  const [displayName, setDisplayName] = useState(COLOR_NAMES[0]);
  const [initialDuration, setInitialDuration] = useState(5000);
  const [intervalMs, setIntervalMs] = useState(5000);
  const [changeCount, setChangeCount] = useState(0);

  // Game Timer State
  const [gameDuration, setGameDuration] = useState(30); // Default 30s
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef<any>(null);
  const gameTimerRef = useRef<any>(null);

  // Animation values
  const scale = useSharedValue(1);

  // Audio cleanup is handled by the hook
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Speed up logic
    if (isPlaying && changeCount > 0 && changeCount % 4 === 0) {
      // Decrease interval every 4 changes
      setIntervalMs((prev) => Math.max(1000, prev - 1000)); // Minimum 1 second
    }
  }, [changeCount, isPlaying]);

  const startGame = () => {
    setIsPlaying(true);
    setChangeCount(0);
    audioPlayer.loop = true;
    if (!audioPlayer.playing) {
      audioPlayer.play();
    }
    setIntervalMs(initialDuration);

    // Initial start
    changeColor();

    // Start loop
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
      changeColor();
    }, duration);
  };

  // Re-set interval when duration changes
  useEffect(() => {
    if (isPlaying) {
      startTimer(intervalMs);
    }
  }, [intervalMs, isPlaying]);

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
    setDisplayName("LISTO");
    setDisplayColor(Colors[theme].text);
  };

  const changeColor = () => {
    // Pulse animation
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 200 }),
    );

    const nextIndex = Math.floor(Math.random() * GAME_COLORS.length);
    setCurrentIndex(nextIndex);
    setDisplayColor(GAME_COLORS[nextIndex]);
    setDisplayName("");
    setChangeCount((prev) => prev + 1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Reacción" }} />

      {!isPlaying ? (
        <View style={styles.startContainer}>
          <View style={styles.titleSection}>
            <ThemedText type="title" style={styles.title}>
              🎯 Reacción de Colores
            </ThemedText>
            <ThemedText style={styles.description}>
              Reacciona rápidamente al color que aparece en pantalla. La
              velocidad aumentará progresivamente cada 4 cambios.
            </ThemedText>
          </View>

          <View
            style={[
              styles.settingsCard,
              { backgroundColor: theme === "dark" ? "#1a1a2e" : "#f5f5f5" },
            ]}
          >
            <ThemedText style={styles.settingsLabel}>
              ⚡ Velocidad Inicial
            </ThemedText>
            <View style={styles.buttonsRow}>
              {[1000, 3000, 5000].map((duration) => (
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
                    setGameDuration(0); // Temporary while typing
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
            style={[styles.startButton, { backgroundColor: "#4CAF50" }]}
            onPress={() => {
              if (gameDuration < 30) setGameDuration(30);
              startGame();
            }}
          >
            <ThemedText style={styles.startButtonText}>
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
              <ThemedText style={styles.statValue}>{changeCount}</ThemedText>
            </View>
          </View>

          <Animated.View
            style={[
              styles.colorDisplay,
              { backgroundColor: displayColor },
              animatedStyle,
            ]}
          >
            <ThemedText style={styles.colorName}>{displayName}</ThemedText>
          </Animated.View>

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
    padding: 20,
  },
  statsBar: {
    position: "absolute",
    top: 20,
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  colorDisplay: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
  },
  colorName: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  stopButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 2,
    borderColor: "#FF3B30",
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF3B30",
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
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  durationButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  durationButtonTextActive: {
    color: "white",
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
});
