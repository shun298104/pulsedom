import React, { useState } from 'react';
import WaveCanvas from './WaveCanvas';
import VitalDisplay from './VitalDisplay';
import  AccordionUIMock  from './AccordionUIMock';
import { PanelRightOpen, PanelRightClose, BellOff } from 'lucide-react';
import { HR_PARAM, SPO2_PARAM, NIBP_SYS_PARAM, NIBP_DIA_PARAM } from '../types/VitalParameter';
// import { Graph3D } from './three/Graph3D';
import saChanIcon from '/public/icons/sa_chan_icon.png';
import { useAppState } from '../hooks/AppStateContext';

const leads12 = ["I", "aVR", "V1", "V4", "II", "aVL", "V2", "V5", "III", "aVF", "V3", "V6"];

const AppUILayout: React.FC = () => {
  const {
    bufferRef,
    hr,
    isEditorVisible,
    setEditorVisible,
    simOptions,
    stopAlarm,
    alarmLevel,
    alarmMessages,
    alarmAudioRef,
  } = useAppState();

  const [is12LeadMode, set12LeadMode] = useState(false);

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* サイドエディタトグルボタン */}
      <button
        onClick={() => setEditorVisible(!isEditorVisible)}
        className={`absolute top-2 ${isEditorVisible ? 'right-[262px]' : 'right-2'} w-11 h-11 rounded-full bg-zinc-500 hover:bg-zinc-600 text-white flex items-center justify-center shadow-md z-50`}
      >
        {isEditorVisible ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
      </button>
      {/* Dr.さーちゃんボタン（ダミー） */}
      <button
        onClick={() => alert('Dr.さーちゃん起動〜🩺（※今はダミー）')}
        className={`hidden absolute top-2 ${isEditorVisible ? 'right-[312px]' : 'right-[58px]'} w-11 h-11 rounded-full bg-pink-300 hover:bg-pink-400 ring-2 ring-white shadow-md z-50`}
        title="Ask Dr. Sa-chan"
      >
        <img src={saChanIcon} alt="Dr. Sa-chan" className="w-11 h-11 rounded-full" />
      </button>
      {/* アラーム消音ボタン */}
      <button
        onClick={stopAlarm}
        className={`fixed bottom-2 ${isEditorVisible ? 'right-[262px]' : 'right-2'
          } w-11 h-11 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center text-white shadow-lg z-50`}
        title="Stop alarm"
      >
        <BellOff size={20} />
      </button>
      {/* 12誘導モード切替ボタン */}
      <button
        onClick={() => set12LeadMode(!is12LeadMode)}
        className="hidden fixed bottom-4 left-4 bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-xl font-bold"
      >
        {is12LeadMode ? "Back to Monitor" : "Show 12 Leads"}
      </button>

      <div className="flex min-h-screen">
        {/* メインコンテンツエリア */}
        <div className="flex-1 bg-black text-white p-4 bg-gray-800">
          {/* ヘッダ */}
          <div className={`absolute tracking-tight top-0 left-0 w-full h-12 z-40 flex items-center justify-between text-white font-bold text-base sm:text-lg md:text-xl ${alarmLevel === 'critical' ? 'bg-red-500'
            : alarmLevel === 'warning' ? 'bg-yellow-500 text-black' : 'bg-teal-500 text-white'
            }`}>
            <span className="pl-4">
              {alarmLevel === 'normal'
                ? 'Vital Signs Simulator PULSEDOM BETA'
                : [...alarmMessages]
                  .sort((a) => a.includes('Critical') ? -1 : 1)
                  .map(msg => `[${msg}]`)
                  .join(' ')
              }
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">PULSEDOM</span>
          </div>

          {/* 通常モニタモード */}
          {!is12LeadMode && (
            <div className="grid grid-cols-2 gap-1 rounded-none sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
              <div className="h-full col-span-1 sm:order-1 md:order-1">
                <VitalDisplay param={HR_PARAM} value={hr} />
              </div>
              <div className="h-full col-span-1 sm:order-2 md:order-2">
                <VitalDisplay param={SPO2_PARAM} value={simOptions.spo2} />
              </div>
              <div className="h-full col-span-2 sm:order-3 md:order-4">
                <div className="h-full relative flex items-end justify-between bg-black rounded-md">
                  <div className="h-full w-1/2">
                    <VitalDisplay param={NIBP_SYS_PARAM} value={simOptions.sysBp} />
                  </div>
                  <div className="h-full w-1/2">
                    <VitalDisplay param={NIBP_DIA_PARAM} value={simOptions.diaBp} />
                  </div>
                </div>
              </div>
              <div className=" text-sm text-left col-span-2 sm:order-4 sm:col-span-4 md:order-3 xl:col-span-6">
                <WaveCanvas bufferRef={bufferRef} signalKey="II" label="Lead II" />
              </div>
              <div className=" text-sm text-left col-span-2 sm:order-5 sm:col-span-4 md:order-5 xl:col-span-6">
                <WaveCanvas bufferRef={bufferRef} signalKey="spo2" label="spo2" />
              </div>
            </div>
          )}

          {/* 12誘導モード */}
          {is12LeadMode && (
            <>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {leads12.map((lead) => (
                  <WaveCanvas key={lead} bufferRef={bufferRef} signalKey={lead} label={lead} />
                ))}
              </div>
              {/* II誘導をcol-span-4で追加 */}
              <div className="col-span-4 mb-4">
                <WaveCanvas bufferRef={bufferRef} signalKey="II" label="Lead II (Long Lead)" />
              </div>
            </>
          )}
        </div>

        {/* サイドエディタ */}
        {isEditorVisible && (
          <div className="
            fixed right-0 top-0 w-[250px] h-full bg-white text-black border-l border-zinc-300 p-4 overflow-y-auto z-40 shadow-xl  
          ">
            <AccordionUIMock />
          </div>
        )}
      </div>
      <audio ref={alarmAudioRef} preload="auto" />
    </div>
  );
};

export default AppUILayout;
