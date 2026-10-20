
import Navbar from "../components/navbar";
import blueWave from "../assets/blue_wave.png";

// icons 
import openMapIcon from "../assets/icons/map_icon.png"
import cloudIcon from "../assets/icons/cloud_icon.png"
import observationIcon from "../assets/icons/obs_icon.png"

import { useState } from "react";



const Homepage = () => {
  const [isOffline, setIsOffline] = useState(false);
  return (
   <div className="min-h-dvh bg-white">
  <div className="relative isolate min-h-dvh overflow-hidden bg-white">
    <Navbar />

    {/* Blue wave at the bottom */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px]">
      <img
        src={blueWave}
        alt=""
        aria-hidden="true"
        className="block h-full w-full object-fill" />
    </div>

    <main className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-44 pt-8 text-left sm:px-8 sm:pb-52 sm:pt-10 md:px-12 lg:px-16">

          {/* Kamusta sign */}
          <section className="mb-4 sm:mb-3">
            <h1 className="m-0 text-3xl font-bold leading-tight text-[#194568] sm:text-4xl">Kamusta?</h1>
            <p className="mt-2 max-w-sm text-base leading-relaxed text-[#194568] sm:text-lg md:text-xl">
              Map, mark, and share your marine knowledge.
            </p>
          </section>

          {/* Open Map button */}
          <button
            type="button"
            onClick={() => console.log("Open Map clicked")}
            className="mb-5 flex min-h-20 w-full items-center gap-3 rounded-xl bg-[#4e9a83] p-3 text-left text-white transition-colors hover:bg-[#438b75] active:scale-[0.99] sm:mb-6 sm:min-h-24 sm:gap-5 sm:p-5"
          >
            <img
              src={openMapIcon}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 shrink-0 sm:h-13 sm:w-18"
            />

            <span className="flex-1 text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
              Open Map
            </span>

            <span
              className="shrink-0 text-3xl font-light sm:text-4xl md:text-5xl"
              aria-hidden="true"
            >
              →
            </span>
          </button>

          {/* Offline mode */}
          <section className="space-y-2.5">
          <button
            type="button"
            onClick={() => setIsOffline((prev) => !prev)}
            aria-pressed={isOffline}
            className="flex min-h-[68px] w-full items-stretch overflow-hidden rounded-xl border border-gray-300 bg-white text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4e9a83] focus-visible:ring-offset-2">
            {
            /* Status indicator */}
            <div
              className={`flex w-16 shrink-0 items-center justify-center sm:w-[76px] ${
                isOffline ? "bg-[#a1c9bd]" : "bg-[#d77d8c]"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isOffline ? "bg-[#25c271]" : "bg-[#c8102e]"
                }`}
              >
                <span className="h-1 w-1 rounded-full bg-white" />
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2 sm:px-4">
              <h2 className="text-sm font-bold text-[#142f44] sm:text-base">Offline mode</h2>
              <p className="text-xs text-[#243d50] sm:text-sm">You can still map and save data.</p>
            </div>
          </button>


            {/* Saved observations */}
            <article className="flex min-h-[68px] items-stretch overflow-hidden rounded-xl border border-gray-300 bg-white">
              <div className="flex w-16 shrink-0 items-center justify-center bg-[#a1bdcc] text-[#173e56] sm:w-[76px]">
                <img
                  src={observationIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10 sm:h-10 sm:w-12"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2 text-left sm:px-4">
                <h2 className="text-sm font-bold text-[#142f44] sm:text-base">
                  24 saved observations
                </h2>
                <p className="text-xs text-[#243d50] sm:text-sm">
                  Waiting to sync
                </p>
              </div>
            </article>
          </section>

          {/* sync changes */}
          <section className="mt-6 flex min-h-12 items-center gap-3 rounded-xl bg-[#7198bd] px-3 py-2 text-[#173e5c] sm:mt-7 sm:gap-5 sm:px-4">
            
            <img
              src={cloudIcon}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 shrink-0 sm:h-10 sm:w-10"
            />

            <p className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold sm:gap-x-5 sm:text-sm">
              <span> <strong>Last synced:</strong> Apr 28, 2025 </span>
              <span>2:15 PM</span>
            </p>
          </section>

        </main>
      </div>
    </div>
  );
};

export default Homepage;
