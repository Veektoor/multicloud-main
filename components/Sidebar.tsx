'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail } from 'lucide-react';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 hidden h-screen w-fit flex-col justify-between border-r border-white/10 bg-[#0b1020] p-6 pt-28 text-white shadow-[20px_0_60px_rgba(2,6,23,0.2)] max-sm:hidden lg:flex lg:w-[264px]">
      <div className="flex flex-1 flex-col gap-6">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
          
          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                'flex items-center justify-start gap-4 rounded-2xl border border-white/5 p-4 transition hover:bg-white/5',
                {
                  'border-cyan-400/40 bg-cyan-500/10': isActive,
                }
              )}
            >
              <Image
                src={item.imgURL}
                alt={item.label}
                width={24}
                height={24}
              />
              <p className="text-lg font-semibold max-lg:hidden">
                {item.label}
              </p>
            </Link>
          );
        })}

        <Link
          href="/contact"
          className={cn(
            'flex items-center justify-start gap-4 rounded-2xl border border-white/5 p-4 transition hover:bg-white/5',
            {
              'border-cyan-400/40 bg-cyan-500/10': pathname === '/contact',
            },
          )}
        >
          <Mail size={22} className="text-cyan-300" />
          <span className="text-lg font-semibold max-lg:hidden">Contact</span>
          <span className="text-sm font-semibold lg:hidden">Contact</span>
        </Link>
      </div>
    </section>
  );
};

export default Sidebar;
