// src/components/AppUILayout.tsx
import React, { useState } from 'react';
import WaveCanvas from './WaveCanvas';
import VitalDisplay from './VitalDisplay';
import { AccordionUIMock } from './AccordionUIMock';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HR_PARAM, SPO2_PARAM, NIBP_SYS_PARAM, NIBP_DIA_PARAM } from '../models/VitalParameter';
import { WaveBuffer } from '../engine/WaveBuffer';
import { SimOptions } from '../types/SimOptions';

interface AppUILayoutProps {
    bufferRef: React.MutableRefObject<Record<string, WaveBuffer>>;
    hr: number;
    spo2: number;
    sysBp: number;
    diaBp: number;
    setSysBp: (v: number) => void;
    setDiaBp: (v: number) => void;
    isEditorVisible: boolean;
    setEditorVisible: (v: boolean) => void;
    simOptions: SimOptions;
    handleSimOptionsChange: (next: SimOptions) => void;
    isBeepOn: boolean;
    handleBeepToggle: () => void;
}

const AppUILayout: React.FC<AppUILayoutProps> = ({
    bufferRef,
    hr,
    spo2,
    sysBp,
    diaBp,
    isEditorVisible,
    setEditorVisible,
    simOptions,
    handleSimOptionsChange,
    isBeepOn,
    handleBeepToggle,
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
                <div className="flex-1 bg-gray-900 text-white p-4">
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
                        <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
                            {/* Main Lead II */}
                            <div className="col-span-2 md:col-span-4  lg:col-span-4 order-1">
                                <WaveCanvas bufferRef={bufferRef} signalKey="II" label="Lead II" />
                            </div>

                            {/* V5 */}
                            <div className="hidden md:block col-span-2 md:col-span-4 lg:col-span-4 text-sm text-left order-4">
                                <WaveCanvas bufferRef={bufferRef} signalKey="V5" label="V5" />
                            </div>

                            {/* HR */}
                            <div className="col-span-1 lg:order-2">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-green-500 text-lg">HR</span>
                                </div>
                                <VitalDisplay param={HR_PARAM} value={hr} />
                            </div>

                            {/* SpO2 */}
                            <div className="col-span-1 lg:order-3">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-cyan-400 text-lg">SpO₂</span>
                                </div>
                                <VitalDisplay param={SPO2_PARAM} value={spo2} />
                            </div>

                            {/* NIBP */}
                            <div className="col-span-2 md:col-span-2 lg:col-span-2 order-5">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-orange-500 text-lg">NIBP</span>
                                </div>
                                <div className="flex items-baseline space-x-2 w-full bg-black rounded-2xl">
                                    <div className="w-1/2">
                                        <VitalDisplay param={NIBP_SYS_PARAM} value={sysBp} />
                                    </div>
                                    <div className="w-1/2">
                                        <VitalDisplay param={NIBP_DIA_PARAM} value={diaBp} />
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
                            onSimOptionsChange={handleSimOptionsChange}
                            isBeepOn={isBeepOn}
                            onToggleBeep={handleBeepToggle}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppUILayout;
