// src/components/AppUILayout.tsx
import React from 'react';
import WaveCanvas from './WaveCanvas';
import VitalDisplay from './VitalDisplay';
import { AccordionUIMock } from './AccordionUIMock';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HR_PARAM, SPO2_PARAM, NIBP_SYS_PARAM, NIBP_DIA_PARAM } from '../models/VitalParameter';
import { WaveBuffer } from '../engine/WaveBuffer';
import { SimOptions } from '../types/SimOptions';


interface AppUILayoutProps {
    bufferRef: React.MutableRefObject<Record<string, WaveBuffer>>; // ← 修正ポイント
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
    return (
        <div className="relative min-h-screen bg-gray-50">
            <button
                onClick={() => setEditorVisible(!isEditorVisible)}
                className={`fixed top-4 z-50 bg-white border border-zinc-400 px-2 py-1 rounded-l transition-all duration-300 ${isEditorVisible ? 'right-[250px]' : 'right-0'}`}
            >
                {isEditorVisible ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <div className="flex min-h-screen">
                <div className="flex-1 bg-gray-900 text-white p-4">
                    <div className="max-w-screen-xl mx-auto grid grid-cols-2 gap-3 lg:grid-cols-6">
                        <div className="col-span-2 md:col-span-4 lg:col-span-6 text-left text-white text-lg font-semibold mb-1">
                            PULSEDOM SIMULATOR BETA
                        </div>
                        <div className="col-span-2 md:col-span-4 lg:col-span-4 order-1 lg:order-1">
                            <WaveCanvas bufferRef={bufferRef} signalKey="II" label="Lead II" />                        </div>
                        <div className="col-span-1 md:col-span-1 lg:col-span-1 order-3 lg:order-2">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-green-500 text-lg">HR</span>
                            </div>
                            <VitalDisplay
                                param={HR_PARAM}
                                value={hr}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-4 lg:col-span-4 order-2 lg:order-3">
                            <WaveCanvas bufferRef={bufferRef} signalKey="V1" label="SpO2" />
                        </div>
                        <div className="col-span-1 md:col-span-1 lg:col-span-1 order-4 lg:order-4">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-cyan-400 text-lg">SpO₂</span>
                            </div>
                            <VitalDisplay
                                param={SPO2_PARAM}
                                value={spo2}
                            />
                        </div>
                        <div className="hidden md:block col-span-2 md:col-span-4 lg:col-span-4 order-5 lg:order-5 text-sm text-left">
                        <WaveCanvas bufferRef={bufferRef} signalKey="V5" label="V5" />
                        </div>
                        <div className="col-span-2 order-6 md:order-4 md:col-span-2 lg:col-span-2 lg:order-6">
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
                                {/*<div className="hidden md:block text-orange-600 text-xl font-mono font-bold text-right">
                                    ({Math.round(sysBp / 3 + (diaBp * 2) / 3)})
                                </div>*/}
                            </div>
                        </div>
                    </div>
                </div>

                {isEditorVisible && (
                    <div className="md:relative w-[250px] h-full max-h-screen overflow-y-auto bg-white text-black border-l border-zinc-300 p-4 transition-all duration-300">
                        <AccordionUIMock
                            simOptions={simOptions}  // ← これでOK！
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
