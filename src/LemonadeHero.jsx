import FeatherIcon from "feather-icons-react";
import { useNavigate } from "react-router";

export default function LemonadeHero() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#feffde] text-black font-ibm overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-black/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#fcff60] border-2 border-black flex items-center justify-center">
            🍋
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Lemonade Notebook
          </h1>
        </div>

        {/* <div className="hidden md:flex gap-10 text-sm font-semibold">
          <a href="#">Features</a>
          <a href="#">How it Works</a>
          <a href="#">Pricing</a>
          <a href="#">About</a>
        </div> */}

        <button className="rounded-xl border-2 border-black bg-[#ffd760] px-6 py-2 font-bold shadow-[3px_3px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition" onClick={(e) => navigate("/notebook")}>
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 px-8 md:px-16 py-20 items-center">
        {/* Left */}
        <div className="z-10">
          <div className="inline-block rounded-full border border-[#ffd760] bg-[#fff1d3] px-4 py-2 text-sm font-bold mb-8">
            Smart notes. Real sources.
          </div>

          <h2 className="text-6xl md:text-7xl font-black leading-none tracking-tight">
            Your ideas.
            <br />
            Organized.
            <br />
            <span className="relative inline-block">
              Cited.
              <span className="absolute left-0 bottom-1 -z-10 h-5 w-full bg-[#fcff60]" />
            </span>
          </h2>

          <p className="mt-8 max-w-xl text-lg leading-8 text-black/70">
            Lemonade Notebook helps you capture ideas, organize your research,
            and keep every source beautifully in check.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="flex items-center gap-3 rounded-xl border-2 border-black bg-[#ffd760] px-7 py-3 font-bold shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition" onClick={(e) => navigate("/notebook")}>
              Start your notebook
              <FeatherIcon icon="arrow-right" size={20} />
            </button>
          </div>
        </div>

        {/* Right visual */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative rotate-3 w-82.5 md:w-105 rounded-3xl border-[3px] border-black bg-[#ffd760] p-8 shadow-[14px_14px_0px_rgba(0,0,0,0.85)]">
            <div className="absolute -left-4.5 top-12 flex flex-col gap-5">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-10 rounded-full border-2 border-black bg-[#feffde]"
                />
              ))}
            </div>

            <div className="ml-6 rounded-2xl border-2 border-black bg-[#fff1d3] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#fcff60] border-2 border-black flex items-center justify-center">
                  🍋
                </div>
                <div>
                  <h3 className="font-black text-xl">Lemonade</h3>
                  <p className="text-sm text-black/60">Notebook</p>
                </div>
              </div>

              <div className="space-y-3">
                {["Research", "Notes", "Sources", "Ideas"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg bg-[#feffde] border border-black/20 px-3 py-2"
                  >
                    <FeatherIcon icon="check" size={18} />
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute right-10 top-0 h-20 w-20 rounded-full bg-[#fff1d3] border-2 border-black rotate-12 hidden md:flex items-center justify-center text-4xl">
            ✦
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-[#fff1d3] border-t-2 border-black px-8 md:px-16 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <Feature icon="edit-3" title="Capture anything" text="Jot down ideas, notes, and thoughts in one place." />
        <Feature icon="folder" title="Organize effortlessly" text="Keep notebooks tidy and easy to navigate." />
        <Feature icon="book-open" title="Source confidently" text="Save and format your references clearly." />
        <Feature icon="zap" title="Focus faster" text="Simple tools that help you think, not overthink." />
      </section>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="h-14 w-14 rounded-full bg-[#ffd760] border-2 border-black flex items-center justify-center">
        <FeatherIcon icon={icon} size={24} />
      </div>
      <h3 className="font-black">{title}</h3>
      <p className="text-sm text-black/70 max-w-52">{text}</p>
    </div>
  );
}