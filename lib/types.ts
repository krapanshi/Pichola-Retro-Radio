export type Track = {
  id: string;
  title: string;
  artist: string;
  film: string;
  year: number;
  /** Duration in seconds — used as a fallback label before the player reports the real duration. */
  duration: number;
  /** YouTube video ID (the part after v= or after youtu.be/). */
  videoId: string;
};

export type Playlist = {
  id: string;
  name: string;
  tracks: Track[];
};
