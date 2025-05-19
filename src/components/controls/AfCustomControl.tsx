// src/components/controls/AfCustomControl.tsx

export function AfCustomControl({
    options,
    onOptionsChange,
}: {
    options: { fWaveFreq: number; fWaveAmp: number; conductProb: number };
    onOptionsChange: (key: string, value: number) => void;
}) {
    return (
        <div className="flex flex-col gap-2 mt-2 text-xs">
            <label className="flex flex-col">
                f-wave frequency ({options.fWaveFreq})
                <input
                    min={300}
                    max={600}
                    step={10}
                    type="range"
                    className="accent-green-800"
                    value={options.fWaveFreq}
                    onChange={e => onOptionsChange('fWaveFreq', Number(e.target.value))}
                />
            </label>
            <label className="flex flex-col">
                f-wave amplitude ({options.fWaveAmp})
                <input
                    min={0}
                    max={0.2}
                    step={0.02}
                    type="range"
                    className="accent-green-800"
                    value={options.fWaveAmp}
                    onChange={e => onOptionsChange('fWaveAmp', Number(e.target.value))}
                />
            </label>
            <label className="flex flex-col">
                Conduction Probability ({options.conductProb})
                <input
                    min={0.1}
                    max={0.8}
                    step={0.1}
                    type="range"
                    className="accent-green-800"
                    value={options.conductProb}
                    onChange={e => onOptionsChange('conductProb', Number(e.target.value))}
                />
            </label>
        </div>
    );
}
