"use client";

import { useCallback, useRef, type RefObject } from "react";
import { useYouTubeEngine } from "@/lib/useYouTubeEngine";
import { formatTime } from "@/lib/format";
import type { Playlist } from "@/lib/types";

/**
 * All sub-components below live at MODULE scope on purpose. Defining them
 * inside Player() would give them a new function identity every render;
 * React would then remount the subtree on every progress tick (~2.5x/sec)
 * and the vinyl's CSS animation would snap back to 0deg each time.
 */

function VinylDisc({ size, spinning }: { size: number; spinning: boolean }) {
  return (
    <div className="relative shrink-0 self-start" style={{ width: size, height: size }}>
      <div
        className="animate-vinyl-spin h-full w-full rounded-full"
        style={{
          animationPlayState: spinning ? "running" : "paused",
          background:
            "repeating-radial-gradient(circle at center, #140d08 0px, #140d08 2px, #34241a 3px, #140d08 4px, #140d08 7px), radial-gradient(circle at 34% 30%, rgba(232,191,122,0.4), transparent 55%)",
          boxShadow: "inset 0 0 14px rgba(0,0,0,0.65), 0 4px 10px rgba(0,0,0,0.5)",
        }}
      />
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/40"
      />
    </div>
  );
}

function SeekBar({
  progress,
  onSeek,
}: {
  progress: number;
  onSeek: (fraction: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      onSeek((clientX - rect.left) / rect.width);
    },
    [onSeek]
  );

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={0}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons !== 1) return;
        updateFromClientX(e.clientX);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onSeek(Math.min(progress + 0.02, 1));
        if (e.key === "ArrowLeft") onSeek(Math.max(progress - 0.02, 0));
      }}
      className="seek-wrap relative flex h-6 w-full touch-none items-center"
    >
      <div className="seek-rail relative h-[3px] w-full rounded-full">
        <div
          className="seek-fill absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="seek-knob absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function PlayIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="translate-x-[1px] text-ink-950">
      <path d="M6 4.5v15l13-7.5-13-7.5Z" />
    </svg>
  );
}
function PauseIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-ink-950">
      <rect x="5" y="4" width="5" height="16" rx="1" />
      <rect x="14" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}
function PrevIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h2.2v16H6V4Zm3.4 8 11 8V4l-11 8Z" />
    </svg>
  );
}
function NextIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 4h-2.2v16H18V4ZM14.6 12l-11-8v16l11-8Z" />
    </svg>
  );
}

function Transport({
  variant,
  isPlaying,
  isUnavailable,
  onPrev,
  onToggle,
  onNext,
}: {
  variant: "desktop" | "mobile";
  isPlaying: boolean;
  isUnavailable: boolean;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
}) {
  const isMobile = variant === "mobile";
  const playSize = isMobile ? "h-[52px] w-[52px]" : "h-10 w-10";
  const hitSize = isMobile ? "h-11 w-11" : "h-8 w-8";
  const iconSize = isMobile ? 22 : 16;
  const gap = isMobile ? "gap-5" : "gap-1.5";

  return (
    <div className={`flex items-center ${gap}`}>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous track"
        className={`transport-button flex ${hitSize} items-center justify-center`}
      >
        <PrevIcon size={iconSize} />
      </button>
      <button
        type="button"
        onClick={onToggle}
        disabled={isUnavailable}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={`play-button flex ${playSize} items-center justify-center rounded-full ring-1 ring-white/25 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        {isPlaying ? <PauseIcon size={iconSize} /> : <PlayIcon size={iconSize} />}
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next track"
        className={`transport-button flex ${hitSize} items-center justify-center`}
      >
        <NextIcon size={iconSize} />
      </button>
    </div>
  );
}

function PlaylistTabs({
  playlists,
  activeId,
  onSelect,
}: {
  playlists: Playlist[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-center gap-1.5">
      {playlists.map((p) => {
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            aria-pressed={active}
            className={
              active
                ? "rounded-full border border-brass-500 bg-brass-500 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-950"
                : "chip rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper-100/75 transition-colors hover:text-paper-100"
            }
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The real, functional YouTube surface. It stays a genuine rectangular
 * aspect-video window at a usable size on purpose: clipping a live embed
 * into the decorative 80px circle below would cut off the corner where the
 * ad "Skip" control usually sits — the same "can't reach the button"
 * problem as a hidden player, just caused by a mask instead of opacity.
 * The spinning vinyl stays purely decorative so this window can stay
 * rectangular and fully tappable.
 */
function VideoWindow({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div className="mx-auto mb-3 w-[168px] max-w-[50vw] shrink-0">
      <p className="mb-1 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-paper-100/45">
        Now playing
      </p>
      <div className="relative aspect-video overflow-hidden rounded-lg ring-1 ring-brass-500/40 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.75)]">
        <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}

function DesktopPlayer({ engine }: { engine: ReturnType<typeof useYouTubeEngine> }) {
  const progress = engine.duration ? engine.currentTime / engine.duration : 0;
  return (
    <div className="glass hidden w-full items-center gap-4 rounded-full p-3 pr-5 sm:flex">
      <VinylDisc size={80} spinning={engine.isPlaying} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate font-display text-[15px] font-semibold leading-tight text-paper-100">
            {engine.currentTrack.title}
          </p>
          <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-paper-100/60">
            {formatTime(engine.currentTime)} / {formatTime(engine.duration)}
          </span>
        </div>
        <p className="truncate text-[12.5px] text-paper-100/70">{engine.currentTrack.artist}</p>
        <div className="mt-1.5">
          <SeekBar progress={progress} onSeek={engine.seekToFraction} />
        </div>
      </div>
      <Transport
        variant="desktop"
        isPlaying={engine.isPlaying}
        isUnavailable={engine.isUnavailable}
        onPrev={engine.prev}
        onToggle={engine.toggle}
        onNext={engine.next}
      />
    </div>
  );
}

function MobilePlayer({ engine }: { engine: ReturnType<typeof useYouTubeEngine> }) {
  const progress = engine.duration ? engine.currentTime / engine.duration : 0;
  return (
    <div className="glass flex w-full flex-col gap-3 rounded-[26px] p-4 sm:hidden">
      <div className="flex items-center gap-3">
        <VinylDisc size={64} spinning={engine.isPlaying} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-semibold leading-tight text-paper-100">
            {engine.currentTrack.title}
          </p>
          <p className="truncate text-[12.5px] text-paper-100/70">{engine.currentTrack.artist}</p>
        </div>
      </div>
      <SeekBar progress={progress} onSeek={engine.seekToFraction} />
      <div className="grid grid-cols-3 items-center">
        <span className="justify-self-start font-mono text-[10.5px] tabular-nums text-paper-100/60">
          {formatTime(engine.currentTime)} / {formatTime(engine.duration)}
        </span>
        <div className="justify-self-center">
          <Transport
            variant="mobile"
            isPlaying={engine.isPlaying}
            isUnavailable={engine.isUnavailable}
            onPrev={engine.prev}
            onToggle={engine.toggle}
            onNext={engine.next}
          />
        </div>
        <span />
      </div>
    </div>
  );
}

export default function Player() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engine = useYouTubeEngine(containerRef);

  return (
    <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-0">
      <VideoWindow containerRef={containerRef} />
      <PlaylistTabs
        playlists={engine.playlists}
        activeId={engine.playlist.id}
        onSelect={engine.selectPlaylist}
      />
      <DesktopPlayer engine={engine} />
      <MobilePlayer engine={engine} />
    </div>
  );
}
