import MinutesArchive from '@/components/MinutesArchive';

const MinutesPage = () => {
  return (
    <section className="flex size-full flex-col gap-8 text-white">
      <h1 className="text-3xl font-bold">Minutes</h1>
      <MinutesArchive />
    </section>
  );
};

export default MinutesPage;
