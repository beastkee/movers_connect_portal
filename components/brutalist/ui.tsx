import Link from "next/link";
import React from "react";

type Tone = "light" | "dark" | "accent" | "danger";

const toneClasses: Record<Tone, string> = {
  light: "bg-white text-black hover:bg-black hover:text-white",
  dark: "bg-black text-white hover:bg-white hover:text-black",
  accent: "bg-[#ffe55a] text-black hover:bg-black hover:text-white",
  danger: "bg-[#ffd8cf] text-black hover:bg-black hover:text-white",
};

export const brutal = {
  page: "min-h-screen bg-[#efe9dc] text-black",
  frame: "mx-auto max-w-6xl border-x-4 border-black",
  header: "border-b-4 border-black p-5",
  eyebrow: "text-xs font-black uppercase tracking-[0.2em]",
  title: "mt-1 text-4xl font-black uppercase",
  section: "bg-white p-5",
  input: "mt-1 w-full border-4 border-black bg-[#fffdf7] px-3 py-3 text-sm font-semibold outline-none focus:bg-[#fff6c8]",
  label: "text-xs font-black uppercase",
  alert: "border-4 border-black bg-[#ffd8cf] p-3 text-sm font-bold",
  success: "border-4 border-black bg-[#dbf7d0] p-3 text-sm font-bold",
};

interface ShellProps {
  headerClassName?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

export const BrutalistShell = ({ headerClassName, eyebrow, title, children }: ShellProps) => {
  return (
    <div className={brutal.page}>
      <div className={brutal.frame}>
        <header className={`${brutal.header} ${headerClassName || "bg-[#ffe55a]"}`}>
          <p className={brutal.eyebrow}>{eyebrow}</p>
          <h1 className={brutal.title}>{title}</h1>
        </header>
        {children}
      </div>
    </div>
  );
};

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}

export const BrutalistLinkButton = ({ href, children, tone = "light", className }: LinkButtonProps) => {
  return (
    <Link
      href={href}
      className={`inline-block border-4 border-black px-3 py-2 text-xs font-black uppercase transition ${toneClasses[tone]} ${className || ""}`}
    >
      {children}
    </Link>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  full?: boolean;
}

export const BrutalistButton = ({ tone = "dark", full = false, className, children, ...rest }: ButtonProps) => {
  return (
    <button
      {...rest}
      className={`${full ? "w-full" : ""} border-4 border-black px-4 py-3 text-sm font-black uppercase transition disabled:opacity-50 ${toneClasses[tone]} ${className || ""}`}
    >
      {children}
    </button>
  );
};
