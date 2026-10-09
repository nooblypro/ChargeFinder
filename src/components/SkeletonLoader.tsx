export const HubCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#0c101c] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-slate-800 rounded"></div>
            <div className="h-6 w-44 bg-slate-800 rounded"></div>
          </div>
          <div className="h-6 w-14 bg-slate-800 rounded"></div>
        </div>

        <div className="flex gap-2 mb-5 pb-4 border-b border-slate-800/80">
          <div className="h-6 w-28 bg-slate-800 rounded"></div>
          <div className="h-6 w-24 bg-slate-800 rounded"></div>
        </div>

        <div className="mb-5 bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="h-3 w-32 bg-slate-800 rounded"></div>
          <div className="h-8 w-36 bg-slate-800 rounded-lg"></div>
          <div className="h-3 w-48 bg-slate-800 rounded"></div>
        </div>

        <div className="mb-5 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-2">
          <div className="h-3 w-32 bg-slate-800 rounded"></div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="h-10 bg-slate-800 rounded"></div>
            <div className="h-10 bg-slate-800 rounded"></div>
            <div className="h-10 bg-slate-800 rounded"></div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="h-3 w-36 bg-slate-800 rounded"></div>
          <div className="h-4 w-full bg-slate-800 rounded"></div>
          <div className="h-4 w-full bg-slate-800 rounded"></div>
        </div>
      </div>

      <div className="h-12 w-full bg-slate-800 rounded-xl"></div>
    </div>
  );
};
