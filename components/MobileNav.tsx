'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger asChild>
          <Image
            src="/icons/hamburger.svg"
            width={36}
            height={36}
            alt="hamburger icon"
            className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-2 sm:hidden"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-[#0b1020]">
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/icons/logo.svg"
              width={32}
              height={32}
              alt="yoom logo"
            />
            <p className="text-[26px] font-extrabold text-white">MoMeet</p>
          </Link>
            <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
              <SheetClose asChild>
                <section className=" flex h-full flex-col gap-6 pt-16 text-white">
                {sidebarLinks.map((item) => {
                  const isActive = pathname === item.route;

                  return (
                    <SheetClose asChild key={item.route}>
                      <Link
                        href={item.route}
                        key={item.label}
                        className={cn(
                          'flex w-full max-w-60 items-center gap-4 rounded-2xl border border-white/5 p-4',
                          {
                            'border-cyan-400/40 bg-cyan-500/10': isActive,
                          }
                        )}
                      >
                        <Image
                          src={item.imgURL}
                          alt={item.label}
                          width={20}
                          height={20}
                        />
                        <p className="font-semibold">{item.label}</p>
                      </Link>
                    </SheetClose>
                  );
                })}
                <SheetClose asChild>
                  <Link
                    href="/contact"
                    className="flex w-full max-w-60 items-center gap-4 rounded-2xl border border-white/5 p-4"
                  >
                    <p className="font-semibold">Contact</p>
                  </Link>
                </SheetClose>
              </section>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
