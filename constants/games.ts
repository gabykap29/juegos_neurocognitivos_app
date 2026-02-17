export interface Game {
  id: string;
  title: string;
  description: string;
  route: string;
  image: string; // URL or require path if local
  color: string;
}

export const GAMES: Game[] = [
  {
    id: 'neuro-exercises',
    title: 'Ejercicios Neurocognitivos',
    description: 'Mejora tu memoria y atención con estos ejercicios diseñados para estimular tu cerebro.',
    route: '/game/exercises',
    image: 'https://images.unsplash.com/photo-1559757175-5b2d07521c82?q=80&w=2600&auto=format&fit=crop',
    color: '#4A90E2',
  },
  // Add more games here to scale
];
