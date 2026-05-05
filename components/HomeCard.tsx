'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

interface HomeCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
  handleClick?: () => void;
}

const HomeCard = ({ className, img, title, description, handleClick }: HomeCardProps) => {
  return (
    <section
      className={cn(
        'flex min-h-[220px] w-full cursor-pointer flex-col justify-between rounded-[24px] border border-white/10 bg-[#10182b] px-5 py-6 text-white shadow-[0_20px_60px_rgba(7,12,24,0.35)] transition duration-200 hover:-translate-y-1 hover:border-cyan-400/40 xl:max-w-[320px]',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex-center size-12 rounded-2xl border border-white/10 bg-white/10">
        <Image src={img} alt="meeting" width={27} height={27} />
      </div>
      
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm font-normal leading-6 text-slate-300">{description}</p>
      </div>
    </section>
  );
};

export default HomeCard;
