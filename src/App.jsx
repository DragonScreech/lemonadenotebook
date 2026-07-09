import React, { useEffect, useState } from "react";
import FeatherIcon from "feather-icons-react";
import { useNavigate } from "react-router";

export default function WikipediaReferences() {
  const [query, setQuery] = useState("");
  const [references, setReferences] = useState(() => {
    return JSON.parse(localStorage.getItem("references") || "[]");
  });
  // const [references, setReferences] = useState([])
  const [wikipediaModal, setWikipediaModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");
  const [uploadModal, setUploadModal] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate()
  // const [manualText, setManualText] = useState("");
  // const [manualLink, setManualLink] = useState("");
  const emptyManualRef = {
    title: "",
    author: "",
    publisher: "",
    date: "",
    link: "",
    sourceType: "secondary",
    format: "website",
    paywalled: "unknown",
    notes: "",
  };
  const groupedReferences = {
    primary: references.filter((r) => r.sourceType === "primary"),
    secondary: references.filter((r) => r.sourceType === "secondary"),
    tertiary: references.filter((r) => r.sourceType === "tertiary"),
    unknown: references.filter((r) => !r.sourceType || r.sourceType === "unknown"),
  };

  const [manualRef, setManualRef] = useState(emptyManualRef);



  function createBlankNotebook() {
    if (
      references.length > 0 &&
      !window.confirm(
        "Create a new notebook? Your current notebook will be cleared unless you've exported it."
      )
    ) {
      return;
    }

    setReferences([]);
    localStorage.removeItem("references");
  }

  function updateManualRef(field, value) {
    setManualRef((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function evaluatePaywall() {
    if (!manualRef.link.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/evaluate-paywall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: manualRef.link }),
      });

      const data = await res.json();

      setManualRef((prev) => ({
        ...prev,
        paywalled: data.paywalled ?? "unknown",
      }));
    } catch (err) {
      setError("Could not evaluate paywall.");
    } finally {
      setLoading(false);
    }
  }

  function addManualReference(e) {
    e.preventDefault();

    if (!manualRef.link.trim()) return;

    setReferences((prev) => [
      ...prev,
      {
        ...manualRef,
        link: manualRef.link.trim() || null,
        reason: "",
        id: crypto.randomUUID()
      },
    ])

    setManualRef(emptyManualRef);
    setManualModal(false);
  }

  function handleJsonUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setError("Please upload a JSON file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);

        const refs = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.references)
            ? parsed.references
            : Array.isArray(parsed.sources)
              ? parsed.sources
              : null;

        if (!refs) {
          throw new Error("JSON must be an array, or contain references/sources array.");
        }

        setReferences(refs);
        for (let index = 0; index < references.length; index++) {
          if (!references[index].id) {
            references[index].id = crypto.randomUUID()
          }
        }
        setUploadModal(false);
      } catch (err) {
        setError(err.message);
      }
    };

    reader.readAsText(file);
  }

  function downloadObjectAsJson(exportObj, exportName) {
    // 1. Convert the object to a string. The '2' parameter formats it with 2-space indentation.
    const jsonString = JSON.stringify(exportObj, null, 2);

    // 2. Create a Blob with the JSON string and set the content type
    const blob = new Blob([jsonString], { type: "application/json" });

    // 3. Create a temporary URL pointing to the Blob
    const downloadUrl = URL.createObjectURL(blob);

    // 4. Create a hidden virtual anchor element
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", downloadUrl);
    downloadAnchor.setAttribute("download", exportName + ".json");

    // 5. Trigger the download programmatically and clean up
    downloadAnchor.click();
    URL.revokeObjectURL(downloadUrl);
  }

  async function classifyReferences(references) {
    const res = await fetch("https://lumora-hacks-middleware.vercel.app/api/classify-sources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ references }),
    });

    const data = await res.json();
    return data.sources;
  }

  async function search(e) {
    e.preventDefault();
    setLoading(true)
    setError("");
    // setReferences([]);

    try {
      const page = encodeURIComponent(query);

      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&format=json&origin=*`
      );

      const data = await res.json();

      if (data.error) throw new Error(data.error.info);

      const html = data.parse.text["*"];

      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Wikipedia stores references here
      const refs = [...doc.querySelectorAll(".references li")];

      const parsed = refs.map((ref) => {
        const text = ref.innerText.trim();

        // Find the first URL if there is one
        const link = ref.querySelector("a.external")?.href ?? null;

        return {
          text,
          link,
        };
      });
      const classified = await classifyReferences(parsed);

      const newSources = classified.map((source) => ({
        ...source,
        notes: "",
        id: crypto.randomUUID(),
      }));

      setReferences((prev) => [...prev, ...newSources]);

      console.log(newSources);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false)
    }
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    console.log(wikipediaModal)
  }, [wikipediaModal])

  useEffect(() => {
    localStorage.setItem("references", JSON.stringify(references));
  }, [references]);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 300);
    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <div className="w-full min-h-screen bg-[repeating-linear-gradient(100deg,#fff1d3,#fff1d3_40px,#feffde_40px,#feffde_80px)] flex items-start relative">

      <aside className="group sticky top-0 h-screen w-[60px] hover:w-56 bg-[#fcff60] rounded-r-2xl border-r-[3px] border-black transition-all duration-300 ease-in-out overflow-hidden shrink-0 z-40">
        <div className="flex h-full flex-col px-2 py-5 gap-3">

          {/* Header */}
          <div className="mb-6 flex items-center gap-3 overflow-hidden">
            <span className="text-2xl shrink-0">🍋</span>

            <span className="whitespace-nowrap font-ibm font-black opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Notebook
            </span>
          </div>

          {/* ---------- Navigation ---------- */}

          <p className="px-2 mb-2 text-[10px] uppercase tracking-[0.2em] text-black/60 opacity-0 group-hover:opacity-100 transition">
            Navigation
          </p>

          <SidebarTab icon="book-open" label="Primary" type="primary" />
          <SidebarTab icon="layers" label="Secondary" type="secondary" />
          <SidebarTab icon="archive" label="Tertiary" type="tertiary" />

          {/* Divider */}

          <div className="my-5 border-t-[2px] border-black/20" />

          {/* ---------- Actions ---------- */}

          <p className="px-2 mb-2 text-[10px] uppercase tracking-[0.2em] text-black/60 opacity-0 group-hover:opacity-100 transition">
            Actions
          </p>

          <SidebarAction
            icon="plus-circle"
            label="Add Source"
            onClick={() => setManualModal(true)}
          />

          <SidebarAction
            icon="compass"
            label="Wikipedia"
            onClick={() => setWikipediaModal(true)}
          />

          <SidebarAction
            icon="file-plus"
            label="New Notebook"
            onClick={createBlankNotebook}
          />

          <div className="flex-1" />

          {/* Footer */}

          <SidebarAction
            icon="download"
            label="Export"
            onClick={() => downloadObjectAsJson(references, "notebook")}
          />
        </div>
      </aside>

      <div className="content-wrapper m-5 h-fit flex flex-col gap-3">
        <div>
          <h1 className=" font-ibm text-black text-2xl ">Sources</h1>
          <div className="w-full h-2 bg-[repeating-linear-gradient(90deg,#fcff60,#fcff60_8px,#ffd760_8px,#ffd760_16px)]"></div>
        </div>
        {references.length === 0 && <span className="font-ibm text-gray-600">Nothing yet!</span>}
        {references.length === 0 && <div className="card-div flex flex-row gap-5">
          <div className="discover-card flex flex-col rounded-md font-bold shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition" onClick={(e) => setWikipediaModal(true)}>
            <div className="bg-[#fcff60] border-r-[3px] border-l-[3px] border-t-[3px] border-black rounded-t-md px-14 py-4 cursor-pointer">
              <FeatherIcon icon="compass" size={100} strokeWidth={1}></FeatherIcon>
            </div>
            <div className="bg-[#ffd760] rounded-b-md max-w-full h-6 border-black border-[3px] flex items-center justify-center">
              <span className="font-ibm text-black">Discover on Wikipedia</span>
            </div>
          </div>
          <div
            className="upload-card flex flex-col rounded-md font-bold shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
            onClick={() => setUploadModal(true)}
          >
            <div className="bg-[#fcff60] border-r-[3px] border-l-[3px] border-t-[3px] border-black rounded-t-md px-14 py-4 cursor-pointer">
              <FeatherIcon icon="upload" size={100} strokeWidth={1}></FeatherIcon>
            </div>
            <div className="bg-[#ffd760] rounded-b-md max-w-full h-6 border-black border-[3px] flex items-center justify-center">
              <span className="font-ibm text-black">Upload a notebook</span>
            </div>
          </div>
          <div
            className="add-card flex flex-col rounded-md font-bold shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
            onClick={() => setManualModal(true)}
          >
            <div className="bg-[#fcff60] border-r-[3px] border-l-[3px] border-t-[3px] border-black rounded-t-md px-14 py-4 cursor-pointer">
              <FeatherIcon icon="plus" size={100} strokeWidth={1}></FeatherIcon>
            </div>
            <div className="bg-[#ffd760] rounded-b-md max-w-full h-6 border-black border-[3px] flex items-center justify-center">
              <span className="font-ibm text-black">Add manually</span>
            </div>
          </div>
        </div>}
        {Object.entries(groupedReferences).map(([type, refs]) => {
          if (!refs.length) return null;

          return (
            <div key={type} className="mt-8 overflow-y-auto">

              <div className="flex flex-row gap-5 items-center mb-2">
                <h1 className="font-ibm text-2xl capitalize">
                  {type} ({refs.length})
                </h1>
                <button
                  className="bg-[#fcff60] px-3 rounded-4xl border-black border-[3px] font-ibm font-bold"
                  onClick={(e) => navigate(`/notebook/category/${type}`)}
                >
                  See all
                </button>
              </div>


              <div className="h-2 mb-5 bg-[repeating-linear-gradient(90deg,#fcff60,#fcff60_8px,#ffd760_8px,#ffd760_16px)]" />

              <div className="grid lg:grid-cols-2 gap-5 p-5">
                {refs.map((ref, i) => (
                  <SourceCard
                    key={ref.link ?? i}
                    source={ref}
                  />
                ))}
              </div>

            </div>
          );
        })}
      </div>
      {wikipediaModal && <div className="w-full min-h-screen bg-black/70 fixed inset-0 flex items-center justify-center">
        <form className="w-9/12 h-9/12 border-[3px] border-black rounded-lg bg-[repeating-linear-gradient(100deg,#fff1d3,#fff1d3_40px,#feffde_40px,#feffde_80px)] opacity-100 flex flex-col justify-center items-center gap-5 relative" onSubmit={search}>
          <div className="rounded-4xl w-10 h-10 bg-[#fcff60] border-black border-[3px] flex justify-center items-center absolute top-[3%] left-[1%] cursor-pointer" onClick={(e) => setWikipediaModal(false)}>
            <FeatherIcon icon="arrow-left"></FeatherIcon>
          </div>
          <h1 className="font-ibm text-black text-2xl">Search on Wikipedia for references</h1>
          <div className="relative w-3/4">
            <input
              className="w-full rounded-4xl border-[3px] border-black bg-[#feffde] px-3 pr-10 py-2 font-ibm"
              type="search"
              placeholder="Search anything"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />

            <FeatherIcon
              icon="search"
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
            />
          </div>
          {references.length !== 0 && <div className="bg-[#fcff60] w-1/4 rounded-sm flex flex-row border-[3px] border-black py-2 text-center justify-center items-center">
            <p>{references.length} references found!</p>
          </div>}
          {loading && <div className="bg-[#ffd760] w-1/4 rounded-sm flex flex-row border-[3px] border-black py-2 text-center justify-center items-center">Loading...</div>}
          {error && <div className="bg-[#ffd760] w-1/4 rounded-sm flex flex-row border-[3px] border-black py-2 text-center justify-center items-center">An error occured when trying to fetch the references! Try adjusting your query!</div>}
        </form>
      </div>}
      {uploadModal && (
        <div className="w-full min-h-screen bg-black/70 fixed inset-0 flex items-center justify-center z-50">
          <div className="w-9/12 h-9/12 border-[3px] border-black rounded-lg bg-[repeating-linear-gradient(100deg,#fff1d3,#fff1d3_40px,#feffde_40px,#feffde_80px)] flex flex-col justify-center items-center gap-5 relative">
            <div
              className="rounded-4xl w-10 h-10 bg-[#fcff60] border-black border-[3px] flex justify-center items-center absolute top-[3%] left-[1%] cursor-pointer"
              onClick={() => setUploadModal(false)}
            >
              <FeatherIcon icon="arrow-left" />
            </div>

            <h1 className="font-ibm text-black text-2xl">
              Upload a notebook
            </h1>

            <p className="font-ibm text-gray-700 text-center max-w-xl">
              Upload a .txt file. Each line will become one reference. If a line
              contains a URL, it will be saved as the reference link.
            </p>

            <label className="bg-[#fcff60] rounded-md border-[3px] border-black px-8 py-3 font-ibm font-bold cursor-pointer shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition">
              Choose JSON File
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleJsonUpload}
              />
            </label>
          </div>
        </div>
      )}
      {manualModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <form
            className="w-9/12 max-h-[85vh] border-[3px] border-black rounded-lg bg-[repeating-linear-gradient(100deg,#fff1d3,#fff1d3_40px,#feffde_40px,#feffde_80px)] flex flex-col relative overflow-hidden"
            onSubmit={addManualReference}
          >
            <div className="sticky top-0 z-10 bg-[#fff1d3] border-b-[3px] border-black px-10 py-5 flex items-center justify-center">
              <button
                type="button"
                className="rounded-full w-10 h-10 bg-[#fcff60] border-black border-[3px] flex justify-center items-center absolute left-5 cursor-pointer"
                onClick={() => setManualModal(false)}
              >
                <FeatherIcon icon="arrow-left" />
              </button>

              <h1 className="font-ibm text-black text-2xl">
                Add a reference manually
              </h1>
            </div>

            <div className="overflow-y-auto custom-modal-scroll flex flex-col items-center gap-4 p-10">
              <div className="w-3/4 flex flex-col gap-1">
                <label className="font-ibm text-xs font-bold uppercase tracking-wider text-black/70">
                  Title
                </label>

                <input
                  className="rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-2 font-ibm"
                  value={manualRef.title}
                  onChange={(e) => updateManualRef("title", e.target.value)}
                />
              </div>

              <div className="w-3/4 flex flex-col gap-1">
                <label className="font-ibm text-xs font-bold uppercase tracking-wider text-black/70">
                  Author
                </label>

                <input
                  className="rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-2 font-ibm"
                  value={manualRef.author}
                  onChange={(e) => updateManualRef("author", e.target.value)}
                />
              </div>

              <div className="w-3/4 flex flex-col gap-1">
                <label className="font-ibm text-xs font-bold uppercase tracking-wider text-black/70">
                  Publisher
                </label>

                <input
                  className="rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-2 font-ibm"
                  value={manualRef.publisher}
                  onChange={(e) => updateManualRef("publisher", e.target.value)}
                />
              </div>
              <div className="w-3/4 flex flex-col gap-1">
                <label className="font-ibm text-xs font-bold uppercase tracking-wider text-black/70">
                  Date
                </label>

                <input
                  className="rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-2 font-ibm"
                  value={manualRef.date}
                  onChange={(e) => updateManualRef("date", e.target.value)}
                  type="date"
                />
              </div>
              <div className="w-3/4 flex flex-col gap-1">
                <label className="font-ibm text-xs font-bold uppercase tracking-wider text-black/70">
                  Source Type
                </label>

                <select
                  className="rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-2 font-ibm"
                  value={manualRef.sourceType}
                  onChange={(e) => updateManualRef("sourceType", e.target.value)}
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="tertiary">Tertiary</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="w-3/4 flex flex-col gap-1">
                <label className="font-ibm text-xs font-bold uppercase tracking-wider text-black/70">
                  Format
                </label>

                <select
                  className="w-full rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-2 font-ibm"
                  value={manualRef.format}
                  onChange={(e) => updateManualRef("format", e.target.value)}
                >
                  <option value="website">Website</option>
                  <option value="book">Book</option>
                  <option value="journal">Journal Article</option>
                  <option value="newspaper">Newspaper</option>
                  <option value="report">Report</option>
                  <option value="encyclopedia">Encyclopedia</option>
                  <option value="video">Video</option>
                  <option value="podcast">Podcast</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="w-3/4 flex flex-col gap-1">
                <label className="font-ibm text-xs font-bold uppercase tracking-wider text-black/70">
                  URL
                </label>

                <input
                  className="flex-1 rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-2 font-ibm"
                  type="url"
                  placeholder="URL"
                  value={manualRef.link}
                  onChange={(e) => updateManualRef("link", e.target.value)}
                />
              </div>

              <div className="w-3/4 flex flex-col gap-1">
                <label className="font-ibm text-xs font-bold uppercase tracking-wider text-black/70">
                  Paywall
                </label>

                <select
                  className="w-full rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-2 font-ibm"
                  value={manualRef.paywalled}
                  onChange={(e) => updateManualRef("paywalled", e.target.value)}
                >
                  <option value="unknown">Paywall unknown</option>
                  <option value="yes">Paywalled</option>
                  <option value="no">Not paywalled</option>
                  <option value="partial">Partially paywalled</option>
                </select>
              </div>

              <div className="w-3/4 flex flex-col gap-1">
                <label className="font-ibm text-xs font-bold uppercase tracking-wider text-black/70">
                  Notes
                </label>

                <textarea
                  className="w-full min-h-28 rounded-2xl border-[3px] border-black bg-[#feffde] px-4 py-3 font-ibm resize-none"
                  placeholder="Notes"
                  value={manualRef.notes}
                  onChange={(e) => updateManualRef("notes", e.target.value)}
                />
              </div>


              <button
                type="submit"
                className="bg-[#fcff60] rounded-2xl border-[3px] border-black px-8 py-3 font-ibm font-bold shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
              >
                Add Reference
              </button>
            </div>
          </form>
        </div>
      )}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="
      fixed
      bottom-8
      right-8
      z-50
      w-14
      h-14
      rounded-full
      bg-[#fcff60]
      border-[3px]
      border-black
      shadow-[4px_4px_0px_black]
      hover:translate-x-0.5
      hover:translate-y-0.5
      hover:shadow-none
      transition
      flex
      items-center
      justify-center
    "
        >
          <FeatherIcon
            icon="arrow-up"
            size={24}
            strokeWidth={2.5}
          />
        </button>
      )}
      <div className="flex gap-5 items-center fixed top-8 right-8">
        <button className="
      z-50
      w-14
      h-14
      rounded-full
      bg-[#fcff60]
      border-[3px]
      border-black
      shadow-[4px_4px_0px_black]
      hover:translate-x-0.5
      hover:translate-y-0.5
      hover:shadow-none
      transition
      flex
      items-center
      justify-center"
          onClick={() => downloadObjectAsJson(references, "notebook")}>
          <FeatherIcon icon="download" size={30}></FeatherIcon>
        </button>
        <div className="relative group cursor-pointer">
          <input className="
      z-50
      w-14
      h-14
      rounded-full
      bg-[#fcff60]
      border-[3px]
      border-black
      shadow-[4px_4px_0px_black]
      group-hover:translate-x-0.5
      group-hover:translate-y-0.5
      group-hover:shadow-none
      transition
      flex
      items-center
      justify-center
      text-transparent
      cursor-pointer"
            type="file"
            onChange={handleJsonUpload}
          >

          </input>
          <FeatherIcon icon="upload" size={30} className="absolute inset-0 translate-x-[calc(50%-2px)] translate-y-[calc(50%-2px)] cursor-pointer group-hover:translate-x-1/2 group-hover:translate-y-1/2 transition"></FeatherIcon>
        </div>

      </div>

    </div>
  );
}

function SourceCard({ source }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border-[3px] border-black bg-[#fff1d3] shadow-[4px_4px_0px_black] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex justify-between items-start hover:bg-[#fcff60]/20 transition"
      >
        <div className="text-left">

          <h2 className="font-ibm font-bold text-lg">
            {source.title || "Untitled Source"}
          </h2>

          <div className="flex gap-2 mt-2 flex-wrap">

            <Badge color="#fcff60">
              {source.format}
            </Badge>

            <Badge color="#ffd760">
              {source.sourceType}
            </Badge>

            <Badge
              color={
                source.paywalled === "yes"
                  ? "#ffb4b4"
                  : "#b9ffba"
              }
            >
              {source.paywalled === "yes"
                ? "Paywalled"
                : "Free"}
            </Badge>

          </div>
        </div>

        <FeatherIcon
          icon={expanded ? "chevron-up" : "chevron-down"}
        />
      </button>

      {expanded && (
        <div className="border-t-[3px] border-black p-5 bg-[#feffde] flex flex-col gap-3">

          <Field label="Author" value={source.author} />

          <Field label="Publisher" value={source.publisher} />

          <Field label="Date" value={source.date} />

          <Field label="URL">
            <a
              href={source.url}
              target="_blank"
              className="text-blue-700 underline break-all"
            >
              {source.url}
            </a>
          </Field>

          <Field label="Notes">
            {source.notes || "No notes"}
          </Field>

          <Field label="AI Reason">
            {source.reason || "Not evaluated"}
          </Field>

          <button
            onClick={() => navigate(`/sources/${source.id}`)}
            className="bg-[#fcff60] border-[3px] border-black rounded-xl px-5 py-2 font-ibm font-bold shadow-[3px_3px_0px_black]"
          >
            See Details
          </button>
        </div>
      )}
    </div>
  );
}

function Badge({ children, color }) {
  return (
    <span
      className="rounded-full border-2 border-black px-3 py-1 text-xs font-ibm font-bold"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}

function Field({ label, value, children }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-black/60 font-bold font-ibm">
        {label}
      </p>

      <div className="font-ibm text-ellipsis max-w-64">
        {children ?? value ?? "—"}
      </div>
    </div>
  );
}

function SidebarTab({ icon, label, type }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/notebook/category/${type}`)}
      className="flex h-11 items-center gap-3 rounded-xl border-[2px] border-black bg-[#ffd760] px-2 font-ibm font-bold shadow-[2px_2px_0px_black] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
    >
      <FeatherIcon icon={icon} size={22} className="shrink-0" />

      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {label}
      </span>
    </button>
  );
}

function SidebarAction({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        flex
        h-11
        items-center
        gap-3
        rounded-xl
        border-[2px]
        border-black
        bg-[#fff1d3]
        px-2
        font-ibm
        font-bold
        shadow-[2px_2px_0px_black]
        transition
        hover:bg-[#ffd760]
        hover:translate-x-0.5
        hover:translate-y-0.5
        hover:shadow-none
      "
    >
      <FeatherIcon icon={icon} size={22} className="shrink-0" />

      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {label}
      </span>
    </button>
  );
}