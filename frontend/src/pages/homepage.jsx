
import { useNavigate } from "react-router";
import Navbar from "../components/navbar";

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[#faf8f2] text-[#16394a]">
      <Navbar />

      <main className="mx-auto grid min-h-[calc(100dvh-64px)] w-full max-w-7xl grid-cols-1 items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:px-12">
        {/* Welcome content */}
      <section className="flex flex-col items-center text-center lg:items-center">
        <span className="mb-6 inline-block rounded-full bg-[#e8f1e9] px-4 py-2 text-xs font-bold tracking-wide text-[#37756f] sm:text-sm">
          A community mapping activity · Western Visayas
        </span>

        <h1 className="mx-auto max-w-xl font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Every fishing journey tells a story.
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4c6670] sm:text-lg">
          Map the places you fish, the routes you take, and the conditions
          you encounter. Your knowledge can help build a clearer picture
          of safety at sea.
        </p>

        <div className="mt-7 flex items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => navigate("/map")}
            className="min-h-12 rounded-xl bg-[#126c80] px-6 py-3 font-bold text-white transition hover:bg-[#0d596a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#df7767]"
          >
            Start mapping →
          </button>

          <button
            type="button"
            onClick={() => navigate("/map?view=explorer")}
            className="min-h-12 rounded-xl border border-[#cbd9d8] bg-white px-6 py-3 font-bold text-[#16394a] transition hover:bg-[#e9f2ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#df7767]"
          >
            Open research explorer
          </button>
        </div>

        <p className="pt-6 mt-4 max-w-lg text-xs leading-relaxed text-[#607783]">
          Research demonstration · No real-time safety warnings ·
          Preloaded observations are synthetic.
        </p>
      </section>

        {/* Map preview */}
        <section className="overflow-hidden rounded-2xl border border-[#e3e8e1] bg-[#fffdf9] p-3 shadow-lg sm:p-4">
          <div className="relative h-64 overflow-hidden rounded-xl bg-[#c9e4e6] sm:h-80 lg:h-[420px]">
            <iframe
              title="ReSEAlience map preview"
              src="/map?embed=preview"
              className="h-full w-full border-0"
              loading="lazy"
              allow="geolocation"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1 pt-4 text-xs font-bold sm:text-sm">
            <span>Panay Island + Guimaras</span>
            <span className="text-[#607783]">
              Community mapping
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Homepage;
