export function ThoughtMateProgressLoaderAnimated() {
    return (
        <div className="flex">
            <div className="">
                <div className="mb-1 text-center text-[22px] font-semibold tracking-[-0.02em] text-[#f3f3f3]">
                    Thought<span className="text-[#D89B3C]">Mate</span>
                </div>

                <div className="mx-auto mb-3 h-[4px] w-[92px] overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#D89B3C] animate-[tm-progress_2.2s_ease-in-out_infinite]" />
                </div>
            </div>

            <style>{`
        @keyframes tm-progress {
          0% { width: 15%; }
          50% { width: 68%; }
          100% { width: 12%; }
        }
      `}</style>
        </div>
    );
}