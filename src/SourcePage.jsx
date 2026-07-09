import { useParams, useNavigate } from "react-router";
import FeatherIcon from "feather-icons-react";
import { useState } from "react";

export default function SourcePage() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const referencesList = JSON.parse(localStorage.getItem("references") || "[]");
  const source = referencesList.find((ref) => ref.id === uid);
  const [references, setReferences] = useState(() => {
    return JSON.parse(localStorage.getItem("references") || "[]");
  });

  if (!source) {
    return (
      <div className="min-h-screen bg-[#feffde] flex items-center justify-center font-ibm">
        <div className="bg-[#fff1d3] border-[3px] border-black rounded-2xl p-8 shadow-[6px_6px_0px_black]">
          <h1 className="text-2xl font-bold">Source not found</h1>
          <button
            onClick={() => navigate("/notebook")}
            className="mt-5 bg-[#fcff60] border-[3px] border-black rounded-xl px-5 py-2 font-bold"
          >
            Back to Sources
          </button>
        </div>
      </div>
    );
  }

  function updateNotes(value) {
    const updatedReferences = references.map((ref) =>
      ref.id === uid
        ? { ...ref, notes: value }
        : ref
    );

    setReferences(updatedReferences);
    localStorage.setItem("references", JSON.stringify(updatedReferences));
  }

  return (
    <div className="min-h-screen bg-[repeating-linear-gradient(100deg,#fff1d3,#fff1d3_40px,#feffde_40px,#feffde_80px)] text-black font-ibm">
      <div className="max-w-6xl mx-auto px-8 py-8">
        <button
          onClick={() => navigate(`/notebook/category/${source.sourceType}`)}
          className="mb-8 flex items-center gap-2 bg-[#fcff60] border-[3px] border-black rounded-full px-5 py-2 font-bold shadow-[3px_3px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
        >
          <FeatherIcon icon="arrow-left" size={18} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <main className="bg-[#feffde] border-[3px] border-black rounded-3xl p-8 shadow-[8px_8px_0px_black]">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-black/60 font-bold">
                  Source
                </p>

                <h1 className="text-4xl font-black mt-2">
                  {source.title || "Untitled Source"}
                </h1>

                <p className="text-black/60 mt-3">
                  {source.author || "Unknown author"}
                </p>
              </div>

              <div className="h-16 w-16 rounded-full bg-[#fcff60] border-[3px] border-black flex items-center justify-center">
                <FeatherIcon icon="book-open" size={28} />
              </div>
            </div>

            <div className="h-2 my-8 bg-[repeating-linear-gradient(90deg,#fcff60,#fcff60_8px,#ffd760_8px,#ffd760_16px)]" />

            <section>
              <h2 className="text-xl font-black mb-3">My Notes</h2>

              <textarea
                value={source.notes || ""}
                onChange={(e) => updateNotes(e.target.value)}
                placeholder="Write notes about this source..."
                className="w-full min-h-105 resize-none rounded-2xl border-[3px] border-black bg-[#fff1d3] p-5 leading-8 outline-none focus:bg-[#feffde]"
              />
            </section>
          </main>

          <aside className="flex flex-col gap-5">
            <InfoCard title="Classification">
              <Badge>{source.sourceType || "unknown"}</Badge>
              <Badge>{source.format || "unknown"}</Badge>
              <Badge>
                {source.paywalled === "yes"
                  ? "paywalled"
                  : source.paywalled === "partial"
                    ? "partial paywall"
                    : "free"}
              </Badge>
            </InfoCard>

            <InfoCard title="Details">
              <InfoRow label="Publisher" value={source.publisher} />
              <InfoRow label="Date" value={source.date} />
              <InfoRow label="UID" value={source.uid} />
            </InfoCard>

            <InfoCard title="URL">
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 underline break-all"
                >
                  {source.url}
                </a>
              ) : (
                <p className="text-black/50">No URL</p>
              )}
            </InfoCard>

            <InfoCard title="AI Reason">
              <p className="text-sm leading-6">
                {source.reason || "No AI reasoning saved yet."}
              </p>
            </InfoCard>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-[#fff1d3] border-[3px] border-black rounded-2xl p-5 shadow-[4px_4px_0px_black]">
      <h2 className="font-black mb-3">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="w-full">
      <p className="text-xs uppercase tracking-widest text-black/50 font-bold">
        {label}
      </p>
      <p className="break-all">{value || "—"}</p>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full bg-[#fcff60] border-2 border-black px-3 py-1 text-xs font-bold uppercase">
      {children}
    </span>
  );
}