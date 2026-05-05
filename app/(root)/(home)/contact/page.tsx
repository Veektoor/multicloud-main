const ContactPage = () => {
  return (
    <section className="flex flex-col gap-4 text-white">
      <div className="rounded-2xl border border-white/10 bg-[#0f1729] px-6 py-8">
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          Setup, recording, or support.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0f1729] p-5">
          <p className="text-sm text-slate-400">Email</p>
          <p className="mt-2">stillv20@gmail.com</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f1729] p-5">
          <p className="text-sm text-slate-400">Contact support for queries and challenges with the system</p>
          <p className="mt-2">Nairobi, Kenya</p>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
