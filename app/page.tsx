import Clock from "@/components/Clock";
import ListenerCount from "@/components/ListenerCount";
import SocialLinks from "@/components/SocialLinks";
import Player from "@/components/Player";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      <div className="hero-bg fixed inset-0 -z-20 bg-cover bg-center" aria-hidden />
      <div
        className="fixed inset-0 -z-20 bg-gradient-to-b from-black/35 via-transparent to-black/80"
        aria-hidden
      />
      <div className="grain-overlay fixed inset-0 -z-10" aria-hidden />

      <div className="z-10 grid w-full grid-cols-3 items-start gap-2 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="justify-self-start">
          <Clock />
        </div>
        <div className="justify-self-center">
        </div>
        <div className="justify-self-end">
          <SocialLinks />
        </div>
      </div>

      <Player />
    </main>
  );
}
