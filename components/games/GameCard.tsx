import { useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Game } from '@/constants/games';
import { Colors } from '@/constants/Colors';

type Props = {
  game: Game;
};

export function GameCard({ game }: Props) {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    router.push(game.route as any);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.card,
          {
            backgroundColor: Colors[theme].background,
            borderColor: Colors[theme].icon,
            shadowColor: Colors[theme].text,
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: game.image }}
            style={styles.image}
            contentFit="cover"
            transition={1000}
          />
          <View style={[styles.badge, { backgroundColor: game.color }]}>
            <ThemedText style={styles.badgeText}>JUEGO</ThemedText>
          </View>
        </View>
        <View style={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            {game.title}
          </ThemedText>
          <ThemedText style={styles.description} numberOfLines={2}>
            {game.description}
          </ThemedText>
          <View style={styles.footer}>
            <ThemedText style={{ color: game.color, fontWeight: '600' }}>
              Jugar ahora →
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0553',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
