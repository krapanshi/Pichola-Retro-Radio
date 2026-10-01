"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track as trackAnalyticsEvent } from "@vercel/analytics";
import { playlists } from "./tracks";
import type { Track } from "./types";

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: Record<string, unknown>
      ) => YTPlayerInstance;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });

  return apiLoadPromise;
}

function isPlayableId(videoId: string | undefined): videoId is string {
  return Boolean(videoId) && !videoId!.startsWith("PLACEHOLDER");
}

export function useYouTubeEngine(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playerRef = useRef<YTPlayerInstance | null>(null);
  const playlistIndexRef = useRef(playlistIndex);
  const trackIndexRef = useRef(trackIndex);
  playlistIndexRef.current = playlistIndex;
  trackIndexRef.current = trackIndex;

  const playlist = playlists[playlistIndex];
  const currentTrack: Track = playlist.tracks[trackIndex];

  const advance = useCallback((direction: 1 | -1) => {
    const activePlaylist = playlists[playlistIndexRef.current];
    const count = activePlaylist.tracks.length;
    setTrackIndex((current) => (current + direction + count) % count);
    setCurrentTime(0);
  }, []);

  const next = useCallback(() => advance(1), [advance]);
  const prev = useCallback(() => advance(-1), [advance]);

  const selectPlaylist = useCallback((id: string) => {
    const index = playlists.findIndex((p) => p.id === id);
    if (index === -1) return;
    setPlaylistIndex(index);
    setTrackIndex(0);
    setCurrentTime(0);
  }, []);

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player || isUnavailable) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [isPlaying, isUnavailable]);

  const seekToFraction = useCallback(
    (fraction: number) => {
      const player = playerRef.current;
      if (!player || !duration) return;
      player.seekTo(Math.min(Math.max(fraction, 0), 1) * duration, true);
    },
    [duration]
  );

  // Create the player once the API is loaded and the target element exists.
  useEffect(() => {
    let cancelled = false;

    loadYouTubeIframeAPI().then(() => {
      if (cancelled || !containerRef.current || playerRef.current || !window.YT) return;

      const startTrack = playlists[playlistIndexRef.current].tracks[trackIndexRef.current];

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "100%",
        width: "100%",
        videoId: isPlayableId(startTrack.videoId) ? startTrack.videoId : undefined,
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event: { data: number }) => {
            const states = window.YT!.PlayerState;
            if (event.data === states.PLAYING) {
              setIsPlaying(true);
              const player = playerRef.current;
              if (player) setDuration(player.getDuration());
            } else if (event.data === states.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === states.ENDED) {
              setIsPlaying(false);
              next();
            }
          },
          onError: (event: { data: number }) => {
            const failedTrack =
              playlists[playlistIndexRef.current].tracks[trackIndexRef.current];
            trackAnalyticsEvent("youtube_video_unavailable", {
              code: event.data,
              videoId: failedTrack.videoId,
            });
            next();
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load whichever track is now selected.
  useEffect(() => {
    const player = playerRef.current;
    if (!isReady || !player) return;

    if (!isPlayableId(currentTrack.videoId)) {
      setIsUnavailable(true);
      setIsPlaying(false);
      setDuration(currentTrack.duration);
      setCurrentTime(0);
      return;
    }

    setIsUnavailable(false);
    player.loadVideoById(currentTrack.videoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, playlistIndex, trackIndex]);

  // Poll playback position while a real video is playing.
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime());
      setDuration(player.getDuration() || currentTrack.duration);
    }, 400);
    return () => window.clearInterval(interval);
  }, [isPlaying, currentTrack.duration]);

  return {
    playlists,
    playlist,
    currentTrack,
    isPlaying,
    isReady,
    isUnavailable,
    currentTime,
    duration: duration || currentTrack.duration,
    next,
    prev,
    toggle,
    selectPlaylist,
    seekToFraction,
  };
}
