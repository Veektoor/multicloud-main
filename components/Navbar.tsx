import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, UserButton } from '@clerk/nextjs';

import MobileNav from './MobileNav';

const Navbar = () => {
  return (
    <nav className="fixed z-50 w-full border-b border-white/10 bg-[#0b1020]/95 px-6 py-4 backdrop-blur-xl lg:px-10">
      <div className="flex-between mx-auto w-full max-w-[1440px] gap-4">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/icons/logo.svg"
          width={32}
          height={32}
          alt="yoom logo"
          className="max-sm:size-10"
        />
        <p className="text-[26px] font-extrabold text-white max-sm:hidden">
          MoMeet
        </p>
      </Link>

      <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
        <Link href="/" className="transition hover:text-white">
          Landing
        </Link>
        <Link href="/recordings" className="transition hover:text-white">
          Recordings
        </Link>
        <Link href="/contact" className="transition hover:text-white">
          Contact
        </Link>
      </div>

      <div className="flex-between gap-5">
        <SignedIn>
          <UserButton afterSignOutUrl="/sign-in" />
        </SignedIn>

        <MobileNav />
      </div>
      </div>
    </nav>
  );
};

export default Navbar;
