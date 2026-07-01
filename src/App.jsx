import React, { useEffect, useState } from "react";
import FeatherIcon from "feather-icons-react";

export default function WikipediaReferences() {
  const [query, setQuery] = useState("");
  const [references, setReferences] = useState([]);
  const [wikipediaModal, setWikipediaModal] = useState(false)
  const [error, setError] = useState("");

  async function classifyReferences(references) {
    const res = await fetch("http://localhost:3001/api/classify-sources", {
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

    setError("");
    setReferences([]);

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
      for (let index = 0; index < classified.length; index++) {
        classified[index].notes = ""
      }
      setReferences(classified);
      console.log(classified)
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    console.log(wikipediaModal)
  }, [wikipediaModal])

  return (
    <div className=" w-full min-h-screen bg-[repeating-linear-gradient(100deg,#fff1d3,#fff1d3_40px,#feffde_40px,#feffde_80px)] overflow-x-hidden flex flex-row items-stretch">
      <div className=" w-10 min-h-screen bg-[#fcff60] rounded-r-2xl "></div>
      <div className="content-wrapper m-5 h-fit flex flex-col gap-3">
        <div>
          <h1 className=" font-ibm text-black text-2xl ">Sources</h1>
          <div className="w-full h-2 bg-[repeating-linear-gradient(90deg,#fcff60,#fcff60_8px,#ffd760_8px,#ffd760_16px)]"></div>
        </div>
        {references.length === 0 && <span className="font-ibm text-gray-600">Nothing yet!</span>}
        {references.length === 0 && <div className="card-div flex flex-row gap-5">
          <div className="discover-card flex flex-col" onClick={(e) => setWikipediaModal(true)}>
            <div className="bg-[#fcff60] border-r-[3px] border-l-[3px] border-t-[3px] border-black rounded-t-md px-14 py-4 cursor-pointer">
              <FeatherIcon icon="compass" size={100} strokeWidth={1}></FeatherIcon>
            </div>
            <div className="bg-[#ffd760] rounded-b-md max-w-full h-6 border-black border-[3px] flex items-center justify-center">
              <span className="font-ibm text-black">Discover on Wikipedia</span>
            </div>
          </div>
          <div className="discover-card flex flex-col">
            <div className="bg-[#fcff60] border-r-[3px] border-l-[3px] border-t-[3px] border-black rounded-t-md px-14 py-4 cursor-pointer">
              <FeatherIcon icon="upload" size={100} strokeWidth={1}></FeatherIcon>
            </div>
            <div className="bg-[#ffd760] rounded-b-md max-w-full h-6 border-black border-[3px] flex items-center justify-center">
              <span className="font-ibm text-black">Upload a notebook</span>
            </div>
          </div>
          <div className="discover-card flex flex-col">
            <div className="bg-[#fcff60] border-r-[3px] border-l-[3px] border-t-[3px] border-black rounded-t-md px-14 py-4 cursor-pointer">
              <FeatherIcon icon="plus" size={100} strokeWidth={1}></FeatherIcon>
            </div>
            <div className="bg-[#ffd760] rounded-b-md max-w-full h-6 border-black border-[3px] flex items-center justify-center">
              <span className="font-ibm text-black">Add manually</span>
            </div>
          </div>
        </div>}
      </div>
      {wikipediaModal && <div className="w-full min-h-screen bg-black/70 absolute inset-0 flex items-center justify-center">
        <form className="w-9/12 h-9/12 border-[3px] border-black rounded-lg bg-[repeating-linear-gradient(100deg,#fff1d3,#fff1d3_40px,#feffde_40px,#feffde_80px)] opacity-100 flex flex-col justify-center items-center gap-5" onSubmit={search}>
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
        </form>
      </div>}
    </div>
  );
}