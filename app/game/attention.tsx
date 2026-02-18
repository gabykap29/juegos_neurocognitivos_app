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

type Direction = {
  id: string;
  label: string;
  angle: number; // Rotation in degrees
  color: string;
};

const DIRECTIONS: Direction[] = [
  { id: "N", label: "ARRIBA", angle: 0, color: "#FF5252" },
  { id: "NE", label: "NORESTE", angle: 45, color: "#FF4081" },
  { id: "E", label: "DERECHA", angle: 90, color: "#E040FB" },
  { id: "SE", label: "SURESTE", angle: 135, color: "#7C4DFF" },
  { id: "S", label: "ABAJO", angle: 180, color: "#536DFE" },
  { id: "SW", label: "SUROESTE", angle: 225, color: "#448AFF" },
  { id: "W", label: "IZQUIERDA", angle: 270, color: "#40C4FF" },
  { id: "NW", label: "NOROESTE", angle: 315, color: "#18FFFF" },
];

import { useRandomGameMusic } from "@/hooks/useGameMusic";

export default function AttentionGameScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const audioPlayer = useRandomGameMusic();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<Direction>(
    DIRECTIONS[0],
  );
  const [initialDuration, setInitialDuration] = useState(3000); // Default 3s (ball throwing takes time)
  const [intervalMs, setIntervalMs] = useState(3000);
  const [changeCount, setChangeCount] = useState(0);

  // Game Timer
  const [gameDuration, setGameDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef<any>(null);
  const gameTimerRef = useRef<any>(null);

  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    return () => {
      stopGame();
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setChangeCount(0);
    setIntervalMs(initialDuration);
    changeDirection();

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
      changeDirection();
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

    rotation.value = withSpring(0);
    scale.value = withTiming(1);
  };

  const changeDirection = () => {
    // Pick random direction different from current (or allow same? usually better different)
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * DIRECTIONS.length);
    } while (
      DIRECTIONS[nextIndex].id === currentDirection.id &&
      DIRECTIONS.length > 1
    );

    const nextDir = DIRECTIONS[nextIndex];
    setCurrentDirection(nextDir);
    setChangeCount((prev) => prev + 1);

    // Animate
    // For smooth rotation, we need to handle the 315 -> 0 wrap around or simply animate to the new absolute angle
    // Since we store absolute angle 0-360, wrapping is tricky with standard spring if we want shortest path.
    // For simplicity, let's just animate strictly to the value.
    // To fix the spin behavior (e.g. 315 -> 45 spinning all the way back), we can optimize logic, but simple is fine for now.

    // Actually, let's just use the angle directly.
    rotation.value = withSpring(nextDir.angle, { damping: 12 });

    // Pulse effect
    scale.value = withTiming(1.2, { duration: 100 }, (finished) => {
      if (finished) {
        scale.value = withTiming(1, { duration: 200 });
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Atención Selectiva" }} />

      {!isPlaying ? (
        <View style={styles.startContainer}>
          <View style={styles.titleSection}>
            <ThemedText type="title" style={styles.title}>
              🎯 Dirección y Lanzamiento
            </ThemedText>
            <ThemedText style={styles.description}>
              Aparecerá una flecha rotativa indicando direcciones cardinales.
              Lanza la pelota o muévete rápidamente hacia la dirección mostrada.
            </ThemedText>
          </View>

          <View
            style={[
              styles.settingsCard,
              { backgroundColor: theme === "dark" ? "#1a1a2e" : "#f5f5f5" },
            ]}
          >
            <ThemedText style={styles.settingsLabel}>
              ⚡ Velocidad de Cambio
            </ThemedText>
            <View style={styles.buttonsRow}>
              {[2000, 3000, 5000].map((duration) => (
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
            style={[styles.startButton, { backgroundColor: "#4ECDC4" }]}
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

          <View style={styles.directionDisplay}>
            <Animated.View style={[styles.arrowContainer, animatedStyle]}>
              <Ionicons
                name="arrow-up"
                size={width * 0.6}
                color={currentDirection.color}
              />
            </Animated.View>
            <ThemedText
              style={[styles.directionText, { color: currentDirection.color }]}
            >
              {currentDirection.label}
            </ThemedText>
          </View>

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
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },
  directionDisplay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowContainer: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  directionText: {
    fontSize: 42,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  stopButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 2,
    borderColor: "#FF3B30",
    marginBottom: 20,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF3B30",
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
    zIndex: 10,
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
