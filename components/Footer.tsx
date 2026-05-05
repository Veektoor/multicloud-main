import Link from "next/link";
import { ChevronDown } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/recordings", label: "Recordings" },
  { href: "/minutes", label: "Minutes" },
  { href: "/personal-room", label: "Room" },
  { href: "/contact", label: "Contact" },
];

const Footer = () => {
  return (
    <footer className="mt-10 rounded-2xl border border-white/10 bg-[#0f1729] p-5 text-sm text-slate-300">
      <div className="hidden items-center justify-between gap-6 md:flex">
        <p className="text-white">MoMeet</p>
        <div className="flex items-center gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()}</p>
      </div>

      <div className="md:hidden">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between text-white">
            <span>MoMeet</span>
            <ChevronDown className="size-4 transition group-open:rotate-180" />
          </summary>
          <div className="mt-4 grid gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-white/10 px-4 py-3 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">© {new Date().getFullYear()}</p>
        </details>
      </div>
    </footer>
  );
};

export default Footer;
