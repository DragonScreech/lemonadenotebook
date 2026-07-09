import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import FeatherIcon from "feather-icons-react";

export default function SourceCategoryPage() {
  const { sourceType } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [paywallFilter, setPaywallFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [hasURLFilter, setHasURLFilter] = useState("all");

  const references = useMemo(() => {
    return JSON.parse(localStorage.getItem("references") || "[]");
  }, []);

  const filteredSources = useMemo(() => {
    const cleanType = sourceType?.toLowerCase();

    return references
      .filter((source) => {
        const currentType = source.sourceType || "unknown";
        return currentType.toLowerCase() === cleanType;
      })
      .filter((source) => {
        const text = [
          source.title,
          source.author,
          source.publisher,
          source.link,
          source.notes,
          source.reason,
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(search.toLowerCase());
      })
      .filter((source) => {
        if (formatFilter === "all") return true;
        return source.format === formatFilter;
      })
      .filter((source) => {
        if (paywallFilter === "all") return true;
        return source.paywalled === paywallFilter;
      })
      .filter((source) => {
        const hasUrl = Boolean(source.link || source.url);

        if (hasURLFilter === "all") return true;
        if (hasURLFilter === "yes") return hasUrl;
        if (hasURLFilter === "no") return !hasUrl;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date") {
          return new Date(b.date || 0) - new Date(a.date || 0);
        }

        if (sortBy === "author") {
          return (a.author || "").localeCompare(b.author || "");
        }

        return (a.title || "").localeCompare(b.title || "");
      });
  }, [references, sourceType, search, formatFilter, paywallFilter, sortBy, hasURLFilter]);

  return (
    <div className="min-h-screen bg-[repeating-linear-gradient(100deg,#fff1d3,#fff1d3_40px,#feffde_40px,#feffde_80px)] text-black font-ibm">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <button
          onClick={() => navigate("/notebook")}
          className="mb-6 flex items-center gap-2 rounded-full border-[3px] border-black bg-[#fcff60] px-5 py-2 font-bold shadow-[3px_3px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
        >
          <FeatherIcon icon="arrow-left" size={18} />
          Back to Notebook
        </button>

        <div className="rounded-3xl border-[3px] border-black bg-[#fff1d3] p-8 shadow-[8px_8px_0px_black]">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-black/60 font-bold">
                Source Category
              </p>

              <h1 className="text-4xl font-black capitalize">
                {sourceType} Sources
              </h1>

              <p className="mt-2 text-black/60">
                {filteredSources.length} source
                {filteredSources.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="h-16 w-16 rounded-full border-[3px] border-black bg-[#fcff60] flex items-center justify-center">
              <FeatherIcon icon="folder" size={28} />
            </div>
          </div>

          <div className="h-2 my-6 bg-[repeating-linear-gradient(90deg,#fcff60,#fcff60_8px,#ffd760_8px,#ffd760_16px)]" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px_180px_180px] gap-4">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search within this category..."
                className="w-full rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-3 pr-10 outline-none"
              />

              <FeatherIcon
                icon="search"
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 pointer-events-none"
              />
            </div>

            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-3 outline-none"
            >
              <option value="all">All formats</option>
              <option value="website">Website</option>
              <option value="book">Book</option>
              <option value="journal">Journal</option>
              <option value="newspaper">Newspaper</option>
              <option value="report">Report</option>
              <option value="encyclopedia">Encyclopedia</option>
              <option value="video">Video</option>
              <option value="podcast">Podcast</option>
              <option value="other">Other</option>
            </select>

            <select
              value={paywallFilter}
              onChange={(e) => setPaywallFilter(e.target.value)}
              className="rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-3 outline-none"
            >
              <option value="all">All paywalls</option>
              <option value="unknown">Unknown</option>
              <option value="yes">Paywalled</option>
              <option value="no">Free</option>
              <option value="partial">Partial</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-3 outline-none"
            >
              <option value="title">Sort by title</option>
              <option value="author">Sort by author</option>
              <option value="date">Sort by date</option>
            </select>

            <select
              value={hasURLFilter}
              onChange={(e) => setHasURLFilter(e.target.value)}
            >
              <option value="all">All URLs</option>
              <option value="yes">Has URL</option>
              <option value="no">No URL</option>
            </select>

          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredSources.map((source) => (
            <button
              key={source.id}
              onClick={() => navigate(`/sources/${source.id}`)}
              className="text-left rounded-2xl border-[3px] border-black bg-[#feffde] p-5 shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
            >
              <div className="flex justify-between gap-5">
                <div>
                  <h2 className="text-xl font-black">
                    {source.title || "Untitled Source"}
                  </h2>

                  <p className="mt-1 text-black/60">
                    {source.author || "Unknown author"}
                  </p>
                </div>

                <FeatherIcon icon="arrow-right" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{source.format || "unknown"}</Badge>
                <Badge>{source.sourceType || "unknown"}</Badge>
                <Badge>
                  {source.paywalled === "yes"
                    ? "paywalled"
                    : source.paywalled === "partial"
                      ? "partial"
                      : source.paywalled === "unknown"
                        ? "unknown"
                        : "free"}
                </Badge>
              </div>

              {source.publisher && (
                <p className="mt-4 text-sm">
                  <span className="font-bold">Publisher:</span>{" "}
                  {source.publisher}
                </p>
              )}

              {source.date && (
                <p className="text-sm">
                  <span className="font-bold">Date:</span> {source.date}
                </p>
              )}
            </button>
          ))}
        </div>

        {filteredSources.length === 0 && (
          <div className="mt-8 rounded-2xl border-[3px] border-black bg-[#fff1d3] p-8 text-center shadow-[4px_4px_0px_black]">
            <h2 className="text-2xl font-black">No sources found</h2>
            <p className="mt-2 text-black/60">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full border-2 border-black bg-[#fcff60] px-3 py-1 text-xs font-bold uppercase">
      {children}
    </span>
  );
}