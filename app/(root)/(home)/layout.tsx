import { Metadata } from 'next';
import { ReactNode } from 'react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'MoMEET',
  description: 'A workspace for your team, powered by Stream Chat and Clerk.',
};

const RootLayout = ({ children }: Readonly<{children: ReactNode}>) => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060b16] bg-hero bg-cover bg-top bg-no-repeat before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(2,6,23,0.62),rgba(2,6,23,0.92)),radial-gradient(circle_at_75%_10%,rgba(14,120,249,0.22),transparent_34%)] before:content-['']">
      <Navbar />

      <div className="relative z-10 flex">
        <Sidebar />
        
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-8 pt-28 max-md:pb-14 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-[1320px] flex-1">{children}</div>
          <Footer />
        </section>
      </div>
    </main>
  );
};

export default RootLayout;
