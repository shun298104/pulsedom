import { SimOptions } from "../types/SimOptions";
import { encodeSimOptionsToURL } from '../utils/simOptionsURL';
import { useAppState } from '../hooks/AppStateContext';
import { Share2, MonitorPlay, VolumeX, Volume2, Bell, BellOff, LogIn } from "lucide-react";

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
    resetSimOptions,
  } = useAppState();

  const { shareCase } = useAppState();

  const updateRate = (
    node: "sinus" | "junction" | "ventricle" | "respiration" | "etco2" | "pi",
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
      case "pi":
        next.pi = value; // パルス振幅（オプション）
        break;
    }
    updateSimOptions(next);
  };

  return (

    <div className="space-y-1">

      <div className="flex w-full items-stretch gap-1">
        {/* 左：音・アラーム（60%） */}
        <div className="flex flex-col gap-1 w-[60%]">
          <button
            className="h-6 w-full flex items-center gap-1 border border-gray-300 bg-white rounded px-2 text-xs text-gray-800"
            onClick={toggleBeep}
            type="button"
          >
            {isBeepOn
              ? <Volume2 className="w-3 h-3 text-green-600" />
              : <VolumeX className="w-3 h-3 text-gray-500" />}
            SYNC BEEP {isBeepOn ? "ON" : "OFF"}
          </button>
          <button
            className="h-6 w-full flex items-center gap-1 border border-gray-300 bg-white rounded px-2 text-xs text-gray-800"
            onClick={toggleAlarm}
            type="button"
          >
            {isAlarmOn
              ? <Bell className="w-3 h-3 text-yellow-600" />
              : <BellOff className="w-3 h-3 text-yellow-500" />}
            ALARM {isAlarmOn ? "ON" : "OFF"}
          </button>
        </div>
        {/* PC・大画面（md以上）：STARTボタン */}
        <button
          className="hidden md:flex relative w-[40%] h-13 items-center justify-center border border-gray-300 bg-white rounded text-gray-800 px-2 text-xs overflow-hidden"
          onClick={shareCase}
          type="button"
        >
          <MonitorPlay
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-blue-400 opacity-10 pointer-events-none"
            aria-hidden="true"
          />
          <span className="relative z-10 text-gray-800 text-xs text-center leading-tight pointer-events-none select-none">
            START SHARED SESSION
          </span>
        </button>

        {/* スマホ（md未満）：JOINボタン */}
        <button
          className="flex md:hidden relative w-[40%] h-13 items-center justify-center border border-gray-300 bg-white rounded text-gray-800 px-2 text-xs overflow-hidden"
          onClick={shareCase}
          type="button"
        >
          <LogIn
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-green-400 opacity-10 pointer-events-none"
            aria-hidden="true"
          />
          <span className="relative z-10 text-gray-800 text-xs text-center leading-tight pointer-events-none select-none">
            JOIN SHARED SESSION
          </span>
        </button>
      </div>

      <WaveformSlider
        label="SpO₂"
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
              label="SpO₂"
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
            <WaveformSlider
              label="perfusion index"
              value={simOptions.pi ?? 0.2}
              min={0.1}
              max={4}
              step={0.1}
              digits={1}
              unit=""
              onChange={(v: number) => updateRate("pi", v)}
              colorClass="accent-cyan-600"
            />
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
          const url = `${window.location.origin}/pulsedom/?sim=${encoded}`;
          navigator.clipboard.writeText(url)
            .then(() => alert("✅ URL copied!"))
            .catch(() => alert("❌ Failed to copy URL"));
        }}
      >
        <Share2 className="w-6 h-6" />

      </button>
      <button
        className="absolute bottom-2 right-20 text-xs font-medium tracking-wide px-3 py-1 rounded border border-zinc-400 transition hover:bg-red-200"
        onClick={() => {
          if (window.confirm("本当に全員の設定をリセットしますか？")) {
            resetSimOptions();
            alert("✅ シミュレータをリセットしました！");
          }
        }}
      >
        <span className="inline-block align-middle mr-2">
          {/* Refreshアイコン */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 12A9 9 0 1 1 3 12h3m0 0V9m0 3h3" /></svg>
        </span>
        Reset
      </button>
    </div >
  );
}

export default AccordionUIMock;
