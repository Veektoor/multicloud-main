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
    <main className="relative min-h-screen bg-[#060b16]">
      <Navbar />

      <div className="flex">
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
