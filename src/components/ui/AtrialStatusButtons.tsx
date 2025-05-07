export function AtrialStatusButtons({
  current,
  setSinusStatus,
}: {
  current: string;
  setSinusStatus: (s: string) => void;
}) {
  const options = ["Af", "AFL", "stop", "AtrialNormal"];

  return (
    <div className="flex gap-2 text-xs">
      {options.map((s) => (
        <button
          key={s}
          className={`px-2 py-1 rounded border ${
            current === s ? "bg-zinc-300" : "bg-white"
          }`}
          onClick={() => setSinusStatus(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
