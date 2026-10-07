import { useEffect, useRef, useState } from "react";
import { SKILLS } from "@/constants/skills";
import CliContainer from "@/components/ui/CliContainer";

export default function Skills() {
  const [groupIndex, setGroupIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [categoryText, setCategoryText] = useState("");
  const [lines, setLines] = useState<
    { name: string; percent: string; bar: number }[]
  >([]);

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
    const current = SKILLS[groupIndex];

    const sleep = (ms: number) =>
      new Promise((r) => setTimeout(r, ms));

    const run = async () => {
      setCategoryText("");
      setLines([]);

      for (const char of current.category) {
        if (cancelled) return;
        setCategoryText((prev) => prev + char);
        await sleep(60);
      }

      for (const item of current.items) {
        if (cancelled) return;

        let name = "";
        let percent = "";

        setLines((prev) => [...prev, { name: "", percent: "", bar: 0 }]);
        const index = current.items.indexOf(item);

        for (const char of item.name) {
          if (cancelled) return;
          name += char;
          setLines((prev) => {
            const copy = [...prev];
            copy[index].name = name;
            return copy;
          });
          await sleep(35);
        }

        for (const char of `${item.percent}%`) {
          if (cancelled) return;
          percent += char;
          setLines((prev) => {
            const copy = [...prev];
            copy[index].percent = percent;
            return copy;
          });
          await sleep(40);
        }

        for (let i = 0; i <= item.percent; i++) {
          if (cancelled) return;
          setLines((prev) => {
            const copy = [...prev];
            copy[index].bar = i;
            return copy;
          });
        }
      }
    };

    run();

    const auto = setTimeout(next, 6000);

    return () => {
      cancelled = true;
      clearTimeout(auto);
    };
  }, [groupIndex, visible]);

  const next = () =>
    setGroupIndex((i) => (i + 1) % SKILLS.length);

  return (
    <section
      id="skills"
      ref={ref}
      className="relative py-20 px-3 lg:h-screen overflow-hidden justify-center items-center flex"
    >
      <div className="absolute top-0 left-0 right-0 h-[100%] bg-gradient-to-t from-transparent via-transparent to-white dark:to-gray-900 pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-[100%] bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-900 pointer-events-none z-10" />
      <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2 items-center z-30">
        
        <div className="p-4">
          <h2 className="text-2xl lg:text-4xl md:text-3xl font-extrabold mb-6 text-center lg:text-left">~/skills</h2>

          <p className="text-gray-600 dark:text-gray-400 lg:max-w-md mb-8 text-center lg:text-left font-mono">
            Every skill here tells a story of growth, exploration, and curiosity. Together, they map the journey I take from concept to execution.
          </p>

          <div className="flex flex-wrap gap-3 lg:justify-start justify-center">
            {SKILLS.map((skill, i) => (
              <button
                key={skill.category}
                onClick={() => setGroupIndex(i)}
                className={`
                  px-4 py-2 rounded-lg font-mono text-sm transition backdrop-blur-sm
                  border
                  ${
                    groupIndex === i
                      ? "bg-green-500/10 text-green-400 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                      : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-400"
                  }
                `}
              >
                {skill.category}
              </button>
            ))}
          </div>
        </div>
        
        <CliContainer
          title={`/${categoryText}`}
          containerClassName="w-full h-[550px]"
          content={
            <div className="space-y-4">
              {lines.map((line, i) => (
                <div key={i}>
                  <div className="flex justify-between font-mono text-sm mb-1 text-green-400">
                    <span>{line.name}</span>
                    <span>{line.percent}</span>
                  </div>

                  <div className="mt-1 h-1.5 bg-green-900/40 rounded">
                    <div
                      className="h-full bg-green-400 rounded transition-all"
                      style={{ width: `${line.bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          }
        />
      </div>
    </section>
    
  );
}
