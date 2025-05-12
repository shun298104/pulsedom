import { SimOptions, RawSimOptions } from "../types/SimOptions";
import WaveformSlider from "./ui/WaveformSlider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { StatusButtons } from "./ui/StatusButtons";

interface AccordionUIMockProps {
  simOptions: SimOptions;
  onSimOptionsChange: (next: SimOptions) => void;
  isBeepOn: boolean;
  onToggleBeep: () => void;
}

export function AccordionUIMock({
  simOptions,
  onSimOptionsChange,
  isBeepOn,
  onToggleBeep,
}: AccordionUIMockProps) {
  // ------- 状態更新関数（SimOptions クラス対応） --------
  const updateRate = (
    node: "sinus" | "junction" | "ventricle",
    value: number
  ) => {
    const next = new SimOptions(simOptions);
    switch (node) {
      case "sinus":
        next.sinusRate = value;
        break;
      case "junction":
        next.junctionRate = value;
        break;
      case "ventricle":
        next.ventricleRate = value;
        break;
    }
    onSimOptionsChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center gap-2 px-1">
        <button
          className={`text-xs font-medium tracking-wide px-3 py-1 rounded border border-zinc-400 transition ${isBeepOn
            ? "bg-zinc-300 text-green-700"
            : "hover:bg-zinc-200"
            }`}
          onClick={onToggleBeep}
        >
          {isBeepOn ? "🔔 SYNC BEEP ON" : "🔕 SYNC BEEP"}
        </button>
      </div>

      <WaveformSlider
        label="SpO₂ (%)"
        value={simOptions.spo2}
        min={50}
        max={100}
        step={1}
        digits={0}
        unit="%"
        onChange={(v) => {
          const next = new SimOptions(simOptions);
          next.spo2 = v;
          onSimOptionsChange(next);
        }}
      />
      <div className="flex gap-4">
      <WaveformSlider
        label="NIBP"
        value={simOptions.sysBp}
        min={0}
        max={250}
        step={1}
        digits={0}
        unit=""
        onChange={(v) => {
          const next = new SimOptions(simOptions);
          next.sysBp = v;
          onSimOptionsChange(next);
        }}
      />
      <WaveformSlider
        label="/"
        value={simOptions.diaBp}
        min={0}
        max={250}
        step={1}
        digits={0}
        unit="mmHg"
        onChange={(v) => {
          const next = new SimOptions(simOptions);
          next.diaBp = v;
          onSimOptionsChange(next);
        }}
      />

    </div>
      <Accordion type="multiple" className="w-full space-y-2">
        <AccordionItem value="sinus">
          <AccordionTrigger>Sinus Node</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <WaveformSlider
              label="Sinus Rate (bpm)"
              value={simOptions.sinusRate}
              min={0}
              max={200}
              step={1}
              digits={0}
              unit="bpm"
              onChange={(v) => updateRate("sinus", v)}
            />

            <StatusButtons
              group = "AtrialStatus"
              current={simOptions.sinus_status ?? "AtrialNormal"}
              setSinusStatus={(s) => {
                const next = new SimOptions(simOptions);
                next.sinus_status = s;
                onSimOptionsChange(next);
              }}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="junction">
          <AccordionTrigger>Junction Node</AccordionTrigger>
          <AccordionContent className="space-y-1">
            <WaveformSlider
              label="Junction Rate (bpm)"
              value={simOptions.junctionRate}
              min={0}
              max={200}
              step={1}
              digits={0}
              unit="bpm"
              onChange={(v) => updateRate("junction", v)}
            />
            <StatusButtons
              group = "JunctionStatus"
              current={simOptions.sinus_status ?? "AtrialNormal"}
              setSinusStatus={(s) => {
                const next = new SimOptions(simOptions);
                next.sinus_status = s;
                onSimOptionsChange(next);
              }}
            />          
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ventricle">
          <AccordionTrigger>Ventricle Node</AccordionTrigger>
          <AccordionContent className="space-y-1">
            <WaveformSlider
              label="Ventricle Rate (bpm)"
              value={simOptions.ventricleRate}
              min={0}
              max={200}
              step={1}
              digits={0}
              unit="bpm"
              onChange={(v) => updateRate("ventricle", v)}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="devmode">
          <AccordionTrigger>in Development</AccordionTrigger>
          <AccordionContent className="space-y-1">
        <StatusButtons
              group = "demo"
              current={simOptions.sinus_status ?? "AtrialNormal"}
              setSinusStatus={(s) => {
                const next = new SimOptions(simOptions);
                next.sinus_status = s;
                onSimOptionsChange(next);
              }}
            />          
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
