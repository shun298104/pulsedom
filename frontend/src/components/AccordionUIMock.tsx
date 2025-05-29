import { SimOptions } from "../types/SimOptions";
import { ruleMap } from '../rules/graphControlRuleList';
import { encodeSimOptionsToURL } from '../utils/simOptionsURL';

import WaveformSlider from "./ui/WaveformSlider";
import StatusButtons from "./ui/StatusButtons";
import RuleControlUI from './ui/RuleControlUI';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface AccordionUIMockProps {
  simOptions: SimOptions;
  handleSimOptionsChange: (next: SimOptions) => void;
  isBeepOn: boolean;
  onToggleBeep: () => void;
}

export function AccordionUIMock({

  simOptions,
  handleSimOptionsChange,
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
    handleSimOptionsChange(next);
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
        <button
          className="text-xs font-medium tracking-wide px-3 py-1 rounded border border-zinc-400 transition hover:bg-zinc-200"
          onClick={() => {
            const encoded = encodeSimOptionsToURL(simOptions);
            const url = `${window.location.origin}?sim=${encoded}`;
            navigator.clipboard.writeText(url)
              .then(() => alert("✅ URL copied!"))
              .catch(() => alert("❌ Failed to copy URL"));
          }}
        >
          🔗 COPY URL
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
          handleSimOptionsChange(next);
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
            handleSimOptionsChange(next);
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
            handleSimOptionsChange(next);
          }}
          colorClass="accent-orange-600"
        />

      </div>
      <Accordion type="multiple" className="w-full space-y-2">
        <AccordionItem value="sinus">
          <AccordionTrigger>Sinus Node</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <WaveformSlider
              label="Sinus Rate"
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
              group="sinus_status"
              current={simOptions.getStatus('sinus_status') ?? ''}
              simOptions={simOptions}
              handleSimOptionsChange={handleSimOptionsChange}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="junction">
          <AccordionTrigger>Junction Node</AccordionTrigger>
          <AccordionContent className="space-y-1">
            <WaveformSlider
              label="Junction Rate"
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
              group="junction_status"
              current={simOptions.getStatus('junction_status') ?? ''}
              simOptions={simOptions}
              handleSimOptionsChange={handleSimOptionsChange}
            />
            
            <StatusButtons
              group="conduction_status"
              current={simOptions.getStatus('conduction_status') ?? ''}
              simOptions={simOptions}
              handleSimOptionsChange={handleSimOptionsChange}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ventricle">
          <AccordionTrigger>Ventricle Node</AccordionTrigger>
          <AccordionContent className="space-y-1">
            <WaveformSlider
              label="Ventricle Rate"
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
              current={simOptions.sinus_status ?? ''}
              simOptions={simOptions}
              handleSimOptionsChange={handleSimOptionsChange}
            />

          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div >
  );
}
