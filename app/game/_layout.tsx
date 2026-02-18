import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack } from "expo-router";

export default function GameLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        headerTintColor: Colors[colorScheme ?? "light"].text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="memory"
        options={{
          title: "Memoria Visual",
        }}
      />
      <Stack.Screen
        name="attention"
        options={{
          title: "Direccion y Lanzamiento",
        }}
      />
      <Stack.Screen
        name="logic"
        options={{
          title: "Desplazamiento Lateral",
        }}
      />
      <Stack.Screen
        name="reaction"
        options={{
          title: "Reacción",
        }}
      />
    </Stack>
  );
}
