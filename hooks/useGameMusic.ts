import { useAudioPlayer } from "expo-audio";
import { useEffect, useState } from "react";

const MUSIC_TRACKS = [
  require("@/assets/music/ejercicios.mp3"),
  require("@/assets/music/ejercicios2.mp3"),
  require("@/assets/music/ejercicios3.mp3"),
  require("@/assets/music/ejercicios4.mp3"),
  require("@/assets/music/ejercicios5.mp3"),
];

export function useRandomGameMusic() {
  const [source] = useState(() => {
    const index = Math.floor(Math.random() * MUSIC_TRACKS.length);
    return MUSIC_TRACKS[index];
  });

  const player = useAudioPlayer(source);

  useEffect(() => {
    return () => {
      try {
        if (player.playing) {
          player.pause();
        }
      } catch (e) {}
    };
  }, [player]);

  return player;
}
