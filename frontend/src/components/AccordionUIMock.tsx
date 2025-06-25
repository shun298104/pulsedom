import { SimOptions } from "../types/SimOptions";
import { encodeSimOptionsToURL } from '../utils/simOptionsURL';
import { useAppState } from '../hooks/AppStateContext';
import { Share2 } from "lucide-react";

import WaveformSlider from "./ui/WaveformSlider";
import StatusButtons from "./ui/StatusButtons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const AccordionUIMock: React.FC = () => {
  // Contextからすべて取得！
  const {
    simOptions,
    updateSimOptions,
    isBeepOn,
    isAlarmOn,
    toggleBeep,
    toggleAlarm,
  } = useAppState();

  // ------- 状態更新関数（SimOptions クラス対応） --------
  const updateRate = (
    node: "sinus" | "junction" | "ventricle" | "respiration" | "etco2",
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
      case "respiration":
        next.respRate = value;
        break;
      case "etco2":
        next.etco2 = value; // ETCO₂はrespirationとは別の値
        break;
    }
    updateSimOptions(next);
  };

  return (

    <div className="space-y-1">
      <div className="flex justify-between items-center gap-1 px-1">
        <button
          className={`text-xs font-medium tracking-wide px-1 py-1 rounded border border-zinc-400 transition ${isBeepOn
            ? "bg-zinc-300 text-green-700"
            : "hover:bg-zinc-200"
            }`}
          onClick={toggleBeep}
        >
          {isBeepOn ? "	🔊 SYNC BEEP ON " : "🔇 SYNC BEEP OFF "}
        </button>
        {/* アラームON/OFFボタン */}
        <button
          className={`text-xs font-medium tracking-wide px-1 py-1 rounded border border-zinc-400 transition ${isAlarmOn
            ? "bg-zinc-300 text-green-700"
            : "hover:bg-zinc-200"
            }`}
          onClick={toggleAlarm}
        >
          {isAlarmOn ? "🔔 ALARM ON " : "🔕 ALARM OFF"}
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
          updateSimOptions(next);
        }}
        colorClass="accent-cyan-600"
      />
      <div className="flex gap-1">
        <div className="flex-[2] min-w-0">
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
              updateSimOptions(next);
            }}
            colorClass="accent-orange-600"
          />
        </div>
        <div className="flex-[1] min-w-0">
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
              updateSimOptions(next);
            }}
            colorClass="accent-orange-600"
          />
        </div>
      </div>
      <Accordion type="multiple" className="w-full space-y-1">
        <AccordionItem value="sinus">
          <AccordionTrigger>Sinus Node</AccordionTrigger>
          <AccordionContent className="space-y-1 text-sm">
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
              updateSimOptions={updateSimOptions}
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
              updateSimOptions={updateSimOptions}
            />
            <StatusButtons
              group="conduction_status"
              current={simOptions.getStatus('conduction_status') ?? ''}
              simOptions={simOptions}
              updateSimOptions={updateSimOptions}
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
              colorClass="accent-green-500"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="respiration">
          <AccordionTrigger>Respiration</AccordionTrigger>
          <AccordionContent className="space-y-1">
            <WaveformSlider
              label="Respiration Rate"
              value={simOptions.respRate ?? 12}
              min={0}
              max={60}
              step={1}
              digits={0}
              unit="bpm"
              onChange={(v: number) => updateRate("respiration", v)}
              colorClass="accent-yellow-400"
            />
          </AccordionContent>
          <AccordionContent className="space-y-1">
            <WaveformSlider
              label="ETCO₂"
              value={simOptions.etco2 ?? 38}
              min={0}
              max={80}
              step={1}
              digits={0}
              unit="mmHg"
              onChange={(v: number) => updateRate("etco2", v)}
              colorClass="accent-yellow-400"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <button
        className="abosolute bottom-2 text-xs font-medium tracking-wide px-3 py-1 rounded border border-zinc-400 transition hover:bg-zinc-200"
        onClick={() => {
          const encoded = encodeSimOptionsToURL(simOptions);
          const url = `${window.location.origin}?sim=${encoded}`;
          navigator.clipboard.writeText(url)
            .then(() => alert("✅ URL copied!"))
            .catch(() => alert("❌ Failed to copy URL"));
        }}
      >
        <Share2 className="w-6 h-6" />

      </button>

    </div >
  );
}

export default AccordionUIMock;
