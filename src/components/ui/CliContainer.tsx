import type { ReactNode } from "react";

interface CliContainerProps {
  title: string;
  content?: ReactNode;
  rightButtons?: ReactNode;
  containerClassName?: string;
  contentClassName?: string;
}

export default function CliContainer({
  title,
  content,
  rightButtons,
  containerClassName = "w-full h-[480px]",
  contentClassName = "p-5",
}: CliContainerProps) {
  return (
    <div className={`relative font-mono ${containerClassName}`}>
      <div className="rounded-lg overflow-hidden border border-gray-800 bg-[#0d0d0d] shadow-xl flex flex-col h-full">
        
        {/* Title bar */}
        <div className="flex items-center justify-between gap-2 bg-[#1a1a1a] px-4 py-2.5 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-xs text-gray-600 font-mono">{title}</span>
          </div>
          {rightButtons && (
            <div className="flex items-center gap-2">
              {rightButtons}
            </div>
          )}
        </div>

        {/* Content area */}
        <div className={`flex-1 overflow-y-auto ${contentClassName}`}>
          {content}
        </div>
      </div>
    </div>
  );
}
