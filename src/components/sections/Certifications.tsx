import { useRef, useState, useEffect } from "react";
import { certifications, awards } from "@/constants/certifications";

export default function Certifications() {
  const ref = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState("certifications");
  const [currentPage, setCurrentPage] = useState(0);
  const [categoryText, setCategoryText] = useState("");
  const [visible, setVisible] = useState(false);

  const itemsPerPage = 9;
  const data = category === "certifications" ? certifications : awards;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const displayedItems = data.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise((r) => setTimeout(r, ms));

    const run = async () => {
      setCategoryText("");
      const text = category === "certifications" ? "certifications" : "awards";

      for (const char of text) {
        if (cancelled) return;
        setCategoryText((prev) => prev + char);
        await sleep(60);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [category, visible]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setCurrentPage(0);
  };
  

  return (
    <section
      id="certifications"
      ref={ref}
      className="relative py-20 px-3 lg:h-screen overflow-hidden justify-center items-center flex"
    >
      <div className="absolute top-0 left-0 right-0 h-[100%] bg-gradient-to-t from-transparent via-transparent to-white dark:to-gray-900 pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-[100%] bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-900 pointer-events-none z-10" />
      <div className="mx-auto max-w-7xl flex flex-col-reverse lg:flex-row lg:grid lg:grid-cols-2 gap-12 items-center z-30">
        
        
        
        <div className="w-full">
          {/* 3x3 Grid */}
          <div className="grid grid-cols-3 gap-1 mb-8 animate-fade-in">
            {displayedItems.map((item, index) => (
              <div
                key={`${currentPage}-${index}`}
                className="aspect-square cursor-pointer"
                style={{
                  perspective: "1000px",
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div
                  className="relative w-full h-full transition-transform duration-500 transform-gpu hover:rotate-y-180"
                  style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: "center",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "rotateY(180deg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "rotateY(0deg)";
                  }}
                >
                  {/* Front */}
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-900/20 dark:to-green-900/10 border border-green-500/30 dark:border-green-700/40 rounded-lg p-3 flex flex-col justify-center backdrop-blur-sm"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <h3 className="text-xs font-bold text-gray-600 dark:text-white mb-2 lg:mb-3 animate-fade-in text-center">
                      {item.title}
                    </h3>
                    {/* <div className="space-y-0.5 lg:space-y-1 text-xs lg:text-xs text-gray-600 dark:text-gray-300">
                      <p className="font-mono text-green-600 dark:text-green-400 line-clamp-1 text-xs animate-fade-in">{item.issuedBy}</p>
                      <p className="font-mono text-gray-500 dark:text-gray-400 text-xs animate-fade-in">{item.date}</p>
                    </div> */}
                  </div>

                  {/* Back */}
                  <div
                    className="absolute w-full h-full text-center bg-gradient-to-br from-green-600/20 to-green-600/10 dark:from-green-900/30 dark:to-green-900/20 border border-green-600/40 dark:border-green-700/50 rounded-lg p-3 items-center justify-center backdrop-blur-sm"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <p className="font-mono text-green-600 dark:text-green-400 text-xs animate-fade-in">{item.issuedBy}</p>
                      <p className="font-mono text-gray-500 dark:text-gray-400 text-xs animate-fade-in">{item.date}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Placeholder items for remaining grid spaces */}
            {Array.from({ length: Math.max(0, itemsPerPage - displayedItems.length) }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="aspect-square border border-green-500/20 rounded-lg bg-green-500/5 backdrop-blur-sm"
              />
            ))}
          </div>

          {/* Pagination */}
          <div className={`flex justify-center items-center gap-2 animate-fade-in transition-opacity ${totalPages === 1 ? 'opacity-50' : ''}`}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-2 text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition font-mono text-sm"
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`px-3 py-2 rounded-lg font-mono text-sm transition ${
                  currentPage === i
                    ? "bg-green-500/10 text-green-400 border border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                    : "border border-green-500/30 text-gray-400 hover:text-green-400 hover:border-green-500/60"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-2  text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition font-mono text-sm"
            >
              Next →
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <h2 className="text-2xl lg:text-4xl md:text-3xl font-extrabold mb-6 text-center lg:text-left">~/{categoryText}</h2>
          
          <div className="flex flex-wrap gap-3 lg:justify-start justify-center mb-6">
            <button
              key={'certifications'}
              onClick={() => handleCategoryChange('certifications')}
              className={`
                px-4 py-2 rounded-lg font-mono text-sm transition backdrop-blur-sm
                border
                ${
                  category === 'certifications'
                    ? "bg-green-500/10 text-green-400 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-400"
                }
              `}
            >
              Certifications
            </button>
            <button
              key={'awards'}
              onClick={() => handleCategoryChange('awards')}
              className={`
                px-4 py-2 rounded-lg font-mono text-sm transition backdrop-blur-sm
                border
                ${
                  category === 'awards'
                    ? "bg-green-500/10 text-green-400 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-400"
                }
              `}
            >
              Awards
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 lg:max-w-md text-center lg:text-left font-mono">
            {category === 'certifications' ? " These certifications represent milestones in my learning journey, each one a testament to the skills I've honed and the knowledge I've gained." 
            : "These awards are more than just accolades — they represent moments of recognition for my dedication, creativity, and impact in the tech community."}
          </p>

          
        </div>
      </div>
    </section>
    
  );
}
