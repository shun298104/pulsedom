// src/components/AppUILayout.tsx
import React, { useState } from 'react';
import WaveCanvas from './WaveCanvas';
import VitalDisplay from './VitalDisplay';
import { AccordionUIMock } from './AccordionUIMock';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HR_PARAM, SPO2_PARAM, NIBP_SYS_PARAM, NIBP_DIA_PARAM } from '../types/VitalParameter';
import { WaveBuffer } from '../engine/WaveBuffer';
import { SimOptions } from '../types/SimOptions';

interface AppUILayoutProps {
    bufferRef: React.MutableRefObject<Record<string, WaveBuffer>>;
    hr: number;
    isEditorVisible: boolean;
    setEditorVisible: (v: boolean) => void;
    simOptions: SimOptions;
    afOptions: { fWaveFreq: number; fWaveAmp: number };
    aflOptions: { aflFreq: number; conductRatio: number };  
    handleSimOptionsChange: (next: SimOptions) => void;
    isBeepOn: boolean;
    handleBeepToggle: () => void;
    handleCustomOptionsChange: (ruleId: string, nextOptions: any) => void;
}

const AppUILayout: React.FC<AppUILayoutProps> = ({
    bufferRef,
    hr,
    isEditorVisible,
    setEditorVisible,
    simOptions,
    afOptions,
    aflOptions,
    handleSimOptionsChange,
    isBeepOn,
    handleBeepToggle,
    handleCustomOptionsChange,
}) => {
    const [is12LeadMode, set12LeadMode] = useState(false);

    // 12誘導リスト
    const leads12 = ["I", "aVR", "V1", "V4", "II", "aVL", "V2", "V5", "III", "aVF", "V3", "V6"];

    return (
        <div className="relative min-h-screen bg-gray-50">
            {/* サイドエディタトグルボタン */}
            <button
                onClick={() => setEditorVisible(!isEditorVisible)}
                className={`fixed top-4 z-50 bg-white border border-zinc-400 px-2 py-1 rounded-l transition-all duration-300 ${isEditorVisible ? 'right-[250px]' : 'right-0'}`}
            >
                {isEditorVisible ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <div className="flex min-h-screen">
                {/* メインコンテンツエリア */}
                <div className="flex-1 bg-black text-white p-4 bg-gray-900">
                    {/* ヘッダ */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold">Vital Signs Simulator PULSEDOM BETA</span>
                        <button
                            onClick={() => set12LeadMode(!is12LeadMode)}
                            className="bg-teal-500 px-4 py-2 rounded-lg font-bold"
                        >
                            {is12LeadMode ? "Back to Monitor" : "Show 12 Leads"}
                        </button>
                    </div>

                    {/* 通常モニタモード */}
                    {!is12LeadMode && (
                        <div className="grid grid-cols-2 gap-1 rounded-none md:grid-cols-4 lg:grid-cols-6">
                            <div className="col-span-2 col-span-4 md:col-span-3 order-2 lg:col-span-4 text-sm text-left order-1">
                                <WaveCanvas bufferRef={bufferRef} signalKey="II" label="Lead II" />
                            </div>
                            <div className="col-span-2 col-span-4 md:col-span-3 order-4 lg:col-span-4 text-sm text-left order-4">
                                <WaveCanvas bufferRef={bufferRef} signalKey="V5" label="V5" />
                            </div>
                            <div className="h-full col-span-1 md:order-1 lg:order-2">
                                <VitalDisplay param={HR_PARAM} value={hr} />
                            </div>
                            <div className="h-full col-span-1 md:order-2 lg:order-3">
                                <VitalDisplay param={SPO2_PARAM} value={simOptions.spo2} />
                            </div>
                            <div className="h-full col-span-2 md: lg: order-5">
                                <div className="h-full relative flex items-end justify-between bg-black">
                                    <div className="h-full w-1/2">
                                        <VitalDisplay param={NIBP_SYS_PARAM} value={simOptions.sysBp} />
                                    </div>
                                    <div className="h-full w-1/2">
                                        <VitalDisplay param={NIBP_DIA_PARAM} value={simOptions.diaBp} />
                                    </div>
                                </div>
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
                    md:relative md:flex-shrink-0 md:w-[250px]
                  "><AccordionUIMock
                            simOptions={simOptions}
                            afOptions={afOptions}
                            aflOptions={aflOptions}
                            onSimOptionsChange={handleSimOptionsChange}
                            isBeepOn={isBeepOn}
                            onToggleBeep={handleBeepToggle}
                            handleCustomOptionsChange={handleCustomOptionsChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppUILayout;
