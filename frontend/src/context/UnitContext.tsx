import React, { createContext, useContext, useState, useEffect } from 'react';

export type EnergyUnit = 'kcal' | 'kJ';
export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'ft in';

export function parseCmToFtIn(cmVal: number): { feet: number; inches: number; text: string } {
  const safeCm = Number(cmVal) || 0;
  const totalInches = Math.round(safeCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches, text: `${feet} ft ${inches} in` };
}

export function parseFtInToCm(feet: number, inches: number): number {
  const totalInches = (Number(feet) || 0) * 12 + (Number(inches) || 0);
  return Math.round(totalInches * 2.54);
}

interface UnitContextType {
  energyUnit: EnergyUnit;
  setEnergyUnit: (unit: EnergyUnit) => void;
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
  heightUnit: HeightUnit;
  setHeightUnit: (unit: HeightUnit) => void;
  // Conversion helpers
  convertEnergy: (kcalValue: number) => number;
  formatEnergy: (kcalValue: number, showUnit?: boolean) => string;
  convertWeight: (kgValue: number) => number;
  formatWeight: (kgValue: number, showUnit?: boolean) => string;
  convertHeight: (cmValue: number) => number;
  formatHeight: (cmValue: number, showUnit?: boolean) => string;
  energyLabel: EnergyUnit;
  weightLabel: WeightUnit;
  heightLabel: HeightUnit;
}

const UnitContext = createContext<UnitContextType | null>(null);

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [energyUnit, setEnergyUnitState] = useState<EnergyUnit>(() => {
    try {
      return (localStorage.getItem('fitness_energy_unit') as EnergyUnit) || 'kcal';
    } catch {
      return 'kcal';
    }
  });

  const [weightUnit, setWeightUnitState] = useState<WeightUnit>(() => {
    try {
      return (localStorage.getItem('fitness_weight_unit') as WeightUnit) || 'kg';
    } catch {
      return 'kg';
    }
  });

  const [heightUnit, setHeightUnitState] = useState<HeightUnit>(() => {
    try {
      const stored = localStorage.getItem('fitness_height_unit');
      if (stored === 'in' || stored === 'ft in') return 'ft in';
      return 'cm';
    } catch {
      return 'cm';
    }
  });

  const setEnergyUnit = (unit: EnergyUnit) => {
    setEnergyUnitState(unit);
    try {
      localStorage.setItem('fitness_energy_unit', unit);
      window.dispatchEvent(new CustomEvent('fitness_units_changed', { detail: { energyUnit: unit } }));
    } catch {}
  };

  const setWeightUnit = (unit: WeightUnit) => {
    setWeightUnitState(unit);
    try {
      localStorage.setItem('fitness_weight_unit', unit);
      window.dispatchEvent(new CustomEvent('fitness_units_changed', { detail: { weightUnit: unit } }));
    } catch {}
  };

  const setHeightUnit = (unit: HeightUnit) => {
    setHeightUnitState(unit);
    try {
      localStorage.setItem('fitness_height_unit', unit);
      window.dispatchEvent(new CustomEvent('fitness_units_changed', { detail: { heightUnit: unit } }));
    } catch {}
  };

  // Listen to cross-window or event updates
  useEffect(() => {
    const handleUnitEvent = (e: any) => {
      if (e?.detail?.energyUnit) setEnergyUnitState(e.detail.energyUnit);
      if (e?.detail?.weightUnit) setWeightUnitState(e.detail.weightUnit);
      if (e?.detail?.heightUnit) {
        const val = e.detail.heightUnit;
        setHeightUnitState(val === 'in' || val === 'ft in' ? 'ft in' : 'cm');
      }
    };
    window.addEventListener('fitness_units_changed', handleUnitEvent);
    return () => window.removeEventListener('fitness_units_changed', handleUnitEvent);
  }, []);

  const convertEnergy = (kcalVal: number): number => {
    const safeKcal = Number(kcalVal) || 0;
    if (energyUnit === 'kJ') {
      return Math.round(safeKcal * 4.184);
    }
    return Math.round(safeKcal);
  };

  const formatEnergy = (kcalVal: number, showUnit = true): string => {
    const converted = convertEnergy(kcalVal);
    const formatted = converted.toLocaleString();
    return showUnit ? `${formatted} ${energyUnit}` : formatted;
  };

  const convertWeight = (kgVal: number): number => {
    const safeKg = Number(kgVal) || 0;
    if (weightUnit === 'lbs') {
      return parseFloat((safeKg * 2.20462).toFixed(1));
    }
    return parseFloat(safeKg.toFixed(1));
  };

  const formatWeight = (kgVal: number, showUnit = true): string => {
    const converted = convertWeight(kgVal);
    return showUnit ? `${converted} ${weightUnit}` : `${converted}`;
  };

  const convertHeight = (cmVal: number): number => {
    const safeCm = Number(cmVal) || 0;
    if (heightUnit === 'ft in') {
      return Math.round(safeCm / 2.54); // total inches
    }
    return Math.round(safeCm);
  };

  const formatHeight = (cmVal: number, showUnit = true): string => {
    const safeCm = Number(cmVal) || 0;
    if (heightUnit === 'ft in') {
      const { text, feet, inches } = parseCmToFtIn(safeCm);
      return showUnit ? text : `${feet}'${inches}"`;
    }
    const cm = Math.round(safeCm);
    return showUnit ? `${cm} cm` : `${cm}`;
  };

  return (
    <UnitContext.Provider
      value={{
        energyUnit,
        setEnergyUnit,
        weightUnit,
        setWeightUnit,
        heightUnit,
        setHeightUnit,
        convertEnergy,
        formatEnergy,
        convertWeight,
        formatWeight,
        convertHeight,
        formatHeight,
        energyLabel: energyUnit,
        weightLabel: weightUnit,
        heightLabel: heightUnit,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
};

export function useUnits() {
  const context = useContext(UnitContext);
  if (!context) {
    return {
      energyUnit: 'kcal' as EnergyUnit,
      setEnergyUnit: () => {},
      weightUnit: 'kg' as WeightUnit,
      setWeightUnit: () => {},
      heightUnit: 'cm' as HeightUnit,
      setHeightUnit: () => {},
      convertEnergy: (k: number) => Math.round(k || 0),
      formatEnergy: (k: number, s = true) => `${Math.round(k || 0).toLocaleString()}${s ? ' kcal' : ''}`,
      convertWeight: (w: number) => Number((w || 0).toFixed(1)),
      formatWeight: (w: number, s = true) => `${(w || 0).toFixed(1)}${s ? ' kg' : ''}`,
      convertHeight: (h: number) => Math.round(h || 0),
      formatHeight: (h: number, s = true) => `${Math.round(h || 0)}${s ? ' cm' : ''}`,
      energyLabel: 'kcal' as EnergyUnit,
      weightLabel: 'kg' as WeightUnit,
      heightLabel: 'cm' as HeightUnit,
    };
  }
  return context;
}
