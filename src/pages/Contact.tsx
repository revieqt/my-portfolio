"use client";

import { useState, useEffect, useRef } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import type { FormData, HistoryItem } from "@/types/contact";
import { PROMPTS } from "@/types/contact";
import CliContainer from "@/components/ui/CliContainer";

export default function Contact() {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [form, setForm] = useState<FormData>({ name: "", email: "", message: "" });
  const [inputValue, setInputValue] = useState("");
  const [done, setDone] = useState(false);
  const [isPromptActive, setIsPromptActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPromptActive) return;
    inputRef.current?.focus();
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, step, isPromptActive]);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const push = (...items: HistoryItem[]) =>
    setHistory((h) => [...h, ...items]);

  const handleEnter = async () => {
    const val = inputValue.trim();
    const p = PROMPTS[step];

    if (!val) {
      push(
        { type: "prompt", label: p.label + ":" },
        { type: "error", text: "This field cannot be empty." }
      );
      setInputValue("");
      return;
    }

    if (p.key === "email" && !isValidEmail(val)) {
      push(
        { type: "prompt", label: p.label + ":" },
        { type: "value", value: val },
        { type: "error", text: "Invalid email. Enter your email again." }
      );
      setInputValue("");
      return;
    }

    const updatedForm = { ...form, [p.key]: val };
    setForm(updatedForm);
    push(
      { type: "prompt", label: p.label + ":" },
      { type: "value", value: val }
    );
    setInputValue("");

    if (step + 1 === PROMPTS.length) {
      push({ type: "info", text: "Sending message..." });
      setDone(true);
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedForm),
        });
        const data = await res.json();
        push(
          res.ok
            ? { type: "success", text: `Message sent! Thank you, ${updatedForm.name}.` }
            : { type: "error", text: data.message || "Failed to send message." }
        );
      } catch {
        push({ type: "error", text: "Error sending message." });
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  const currentPrompt = PROMPTS[step];

  return (
      <section id="contact" className="relative py-20 px-6">
        <div className="mx-auto max-w-5xl grid gap-12 md:grid-cols-2 items-center z-30">

          {/* Left — info */}
          <div
            className="px-3 z-30"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <h2 className="text-2xl md:text-4xl font-extrabold mb-6 text-center text-[#E6EDF3] [text-shadow:0_0_18px_rgba(76,201,240,0.55)] md:text-left">
            ~/contact-me
            </h2>

            <p className="md:max-w-md mb-8 text-center text-[#8793A3] md:text-left">
              I'm always interested in hearing about new projects and opportunities. Feel free to reach out!
            </p>

            <div className="flex flex-row gap-5 justify-center md:flex-col">
              <a
                href="mailto:revie.dev@gmail.com"
                className="flex items-center gap-3 text-[#E6EDF3] transition hover:text-[#4CC9F0]"
              >
                <EnvelopeIcon className="w-6 h-6" />
                <span className="hidden md:inline">revie.dev@gmail.com</span>
              </a>
              <a
                href="https://github.com/revieqt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#E6EDF3] transition hover:text-[#4CC9F0]"
              >
                <FaGithub className="w-6 h-6" />
                <span className="hidden md:inline">revieqt</span>
              </a>
              <a
                href="https://linkedin.com/in/joshua-opsima-09a3a7316"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#E6EDF3] transition hover:text-[#4CC9F0]"
              >
                <FaLinkedin className="w-6 h-6" />
                <span className="hidden md:inline">Joshua Opsima</span>
              </a>
            </div>
          </div>

          {/* Right — CLI form */}
          <CliContainer
            title="contact — bash"
            containerClassName="w-full h-[480px] z-30"
            content={
              <div>
                {history.map((item, i) => {
                  if (item.type === "prompt")
                    return (
                      <div key={i} className="flex gap-2 mb-0.5">
                        <span className="text-green-400 text-sm shrink-0 font-mono">$</span>
                        <span className="text-gray-500 text-sm font-mono">{item.label}</span>
                      </div>
                    );
                  if (item.type === "value")
                    return (
                      <div key={i} className="flex gap-2 mb-2.5">
                        <span className="text-green-400 text-sm shrink-0 font-mono">&gt;</span>
                        <span className="text-gray-200 text-sm font-mono break-all">{item.value}</span>
                      </div>
                    );
                  if (item.type === "error")
                    return (
                      <p key={i} className="text-red-400 text-sm mb-2.5 ml-5 font-mono">
                        ✖ {item.text}
                      </p>
                    );
                  if (item.type === "success")
                    return (
                      <p key={i} className="text-green-400 text-sm font-medium ml-5 font-mono">
                        ✔ {item.text}
                      </p>
                    );
                  if (item.type === "info")
                    return (
                      <p key={i} className="text-gray-600 text-sm ml-5 font-mono">
                        {item.text}
                      </p>
                    );
                  return null;
                })}

                {/* Inline active prompt + input */}
                {!done && (
                  <div>
                    <div className="flex gap-2 mb-1">
                      <span className="text-green-400 text-sm shrink-0 font-mono">$</span>
                      <span className="text-green-400 text-sm font-medium font-mono">
                        {currentPrompt.label}:
                      </span>
                    </div>
                    <div
                      className="flex gap-2 items-start"
                      onClick={() => setIsPromptActive(true)}
                      style={{ cursor: isPromptActive ? "text" : "pointer" }}
                    >
                      <span className="text-green-400 text-sm shrink-0 font-mono leading-[1.7]">&gt;</span>
                      {currentPrompt.textarea ? (
                        <textarea
                          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                          rows={1}
                          value={inputValue}
                          readOnly={!isPromptActive}
                          onChange={(e) => {
                            setInputValue(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleEnter();
                            }
                          }}
                          className="bg-transparent border-none outline-none text-gray-200 text-sm w-full resize-none overflow-hidden caret-green-400 placeholder-gray-700 font-mono leading-[1.7]"
                          placeholder={isPromptActive ? "..." : "Click to start typing"}
                          style={{ height: "auto" }}
                        />
                      ) : (
                        <input
                          ref={inputRef as React.RefObject<HTMLInputElement>}
                          type="text"
                          value={inputValue}
                          readOnly={!isPromptActive}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                          className="bg-transparent border-none outline-none text-gray-200 text-sm w-full caret-green-400 placeholder-gray-700 font-mono"
                          placeholder={isPromptActive ? "..." : "Click to start typing"}
                        />
                      )}
                    </div>
                    <p className="text-gray-700 text-xs mt-1.5 ml-5 font-mono">
                      {currentPrompt.textarea
                        ? "shift+enter for new line · enter to submit"
                        : "press enter to continue"}
                    </p>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            }
          />

        </div>
      </section>
  );
}