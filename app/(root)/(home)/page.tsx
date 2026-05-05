import MeetingTypeList from "@/components/MeetingTypeList";
import { formatNairobiDate, formatNairobiTime } from "@/lib/datetime";

const Home = () => {
  const now = new Date();
  const time = formatNairobiTime(now);
  const date = formatNairobiDate(now);

  return (
    <section className="flex flex-col gap-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-[#0f1729] px-6 py-8">
        <p className="text-sm text-slate-400">Workspace time (Nairobi)</p>
        <h1 className="mt-2 text-5xl font-semibold">{time}</h1>
        <p className="mt-2 text-sm text-slate-300">{date}</p>
        <p className="mt-6 max-w-2xl text-sm text-slate-300">
          Join, record, and keep minutes in one place.
        </p>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;
