import { SimOptions } from "../types/SimOptions";
import WaveformSlider from "./ui/WaveformSlider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { StatusButtons } from "./ui/StatusButtons";
import { graphControlRules } from "../rules/graphControlRuleList";
import { AfCustomControl } from "./controls/AfCustomControl";

interface AccordionUIMockProps {
  simOptions: SimOptions;
  afOptions: { fWaveFreq: number; fWaveAmp: number, conductProb: number };
  aflOptions: { aflFreq: number; conductRatio: number };
  onSimOptionsChange: (next: SimOptions) => void;
  isBeepOn: boolean;
  onToggleBeep: () => void;
  handleCustomOptionsChange: (ruleId: string, nextOptions: any) => void;
}

export function AccordionUIMock({

  simOptions,
  afOptions,
  aflOptions,
  onSimOptionsChange,
  isBeepOn,
  onToggleBeep,
  handleCustomOptionsChange,

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

  const selectedRule = graphControlRules.find(
    (r) => r.id === simOptions.sinus_status
  );

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
        onChange={(v: number) => {
          const next = new SimOptions(simOptions);
          next.spo2 = v;
          onSimOptionsChange(next);
        }}
        colorClass="accent-cyan-600"
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
          onChange={(v: number) => {
            const next = new SimOptions(simOptions);
            next.sysBp = v;
            onSimOptionsChange(next);
          }}
          colorClass="accent-orange-600"
        />
        <WaveformSlider
          label="/"
          value={simOptions.diaBp}
          min={0}
          max={250}
          step={1}
          digits={0}
          unit="mmHg"
          onChange={(v: number) => {
            const next = new SimOptions(simOptions);
            next.diaBp = v;
            onSimOptionsChange(next);
          }}
          colorClass="accent-orange-600"
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
              onChange={(v: number) => updateRate("sinus", v)}
              colorClass="accent-green-500"
            />

            <StatusButtons
              group="AtrialStatus"
              current={simOptions.sinus_status ?? ''}
              simOptions={simOptions}
              onSimOptionsChange={onSimOptionsChange}
            />
            {simOptions.sinus_status === 'Af' && (
              <AfCustomControl
                options={{
                  fWaveFreq: afOptions.fWaveFreq ?? 400,
                  fWaveAmp: afOptions.fWaveAmp ?? 0.5,
                  conductProb: afOptions.conductProb ?? 0.3,
                }}
                onOptionsChange={(key, value) => {
                  const next = { ...afOptions, [key]: value };
                  handleCustomOptionsChange("Af", next);
                }}
              />
            )}
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
              onChange={(v: number) => updateRate("junction", v)}
              colorClass="accent-green-500"
            />
            <StatusButtons
              group="JunctionStatus"
              current={simOptions.junction_status ?? ''}
              simOptions={simOptions}
              onSimOptionsChange={onSimOptionsChange}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ventricle">
          <AccordionTrigger>Ventricle Node</AccordionTrigger>
          <AccordionContent className="space-y-1">
            <WaveformSlider
              label="Ventricle Rate (bpm) "
              value={simOptions.ventricleRate}
              min={0}
              max={200}
              step={1}
              digits={0}
              unit="bpm"
              onChange={(v: number) => updateRate("ventricle", v)}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="devmode">
          <AccordionTrigger>in Development</AccordionTrigger>
          <AccordionContent className="space-y-1">
            <StatusButtons
              group="demo"
              current={simOptions.sinus_status ?? "AtrialNormal"}
              simOptions={simOptions}
              onSimOptionsChange={onSimOptionsChange}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div >
  );
}
