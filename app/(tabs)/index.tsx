import { useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Animated } from 'react-native';
import { Image } from 'expo-image';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GameCard } from '@/components/games/GameCard';
import { GAMES } from '@/constants/games';

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Juegos Neurocognitivos</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Explora tus habilidades</ThemedText>
        <ThemedText>
          Selecciona un juego para comenzar a entrenar tu cerebro.
        </ThemedText>
      </ThemedView>

      <View style={styles.gamesGrid}>
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 24,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  gamesGrid: {
    gap: 16,
    paddingBottom: 40,
  },
});
