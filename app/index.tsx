import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const EXERCISES = [
  {
    id: "memory-visual",
    title: "Reacción Direccional",
    description: "Reacciona a la dirección indicada",
    icon: "brain.head.profile",
    gradient: ["#FF6B6B", "#FF8E53"],
    route: "/game/memory",
  },
  {
    id: "attention-focus",
    title: "Dirección y Lanzamiento",
    description:
      "Toca el cono del color correcto o lanza una pelota al objetivo",
    icon: "eye.fill",
    gradient: ["#4ECDC4", "#44A08D"],
    route: "/game/attention",
  },
  {
    id: "logic-puzzles",
    title: "Desplazamiento Lateral",
    description: "Muévete de lado a lado siguiendo el indicador",
    icon: "puzzlepiece.fill",
    gradient: ["#FFE66D", "#FFAB40"],
    route: "/game/logic",
  },
  {
    id: "reaction-colors",
    title: "Reacción de Colores",
    description: "Toca el cono del color correcto",
    icon: "eye.fill",
    gradient: ["#FF9F43", "#FF6B6B"],
    route: "/game/reaction",
  },
];

export default function ExercisesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.mainTitle}>
            Ejercicios Neurocognitivos
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Selecciona un área para entrenar tu mente y cuerpo
          </ThemedText>
        </View>

        {/* Exercise Cards */}
        <View style={styles.grid}>
          {EXERCISES.map((exercise, index) => (
            <Animated.View
              key={exercise.id}
              entering={FadeInDown.delay(index * 100).springify()}
            >
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    backgroundColor: theme === "dark" ? "#1a1a2e" : "#ffffff",
                  },
                ]}
                onPress={() => router.push(exercise.route as any)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={exercise.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconContainer}
                >
                  <IconSymbol
                    name={exercise.icon as any}
                    size={36}
                    color="#ffffff"
                  />
                </LinearGradient>

                <View style={styles.content}>
                  <ThemedText type="subtitle" style={styles.cardTitle}>
                    {exercise.title}
                  </ThemedText>
                  <ThemedText style={styles.cardDescription}>
                    {exercise.description}
                  </ThemedText>
                </View>

                <View style={styles.arrowContainer}>
                  <IconSymbol
                    name="chevron.right"
                    size={22}
                    color={theme === "dark" ? "#666" : "#999"}
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Footer spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.65,
    lineHeight: 22,
  },
  grid: {
    gap: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.55,
    lineHeight: 20,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});
