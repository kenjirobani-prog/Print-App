"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getPoints, addPoints as storageAddPoints, spendPoints as storageSpendPoints } from "@/lib/storage";

interface PointsContextType {
  points: number;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => boolean;
  refreshPoints: () => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    setPoints(getPoints());
  }, []);

  const refreshPoints = useCallback(() => {
    setPoints(getPoints());
  }, []);

  const handleAddPoints = useCallback((amount: number) => {
    const newTotal = storageAddPoints(amount);
    setPoints(newTotal);
  }, []);

  const handleSpendPoints = useCallback((amount: number) => {
    const success = storageSpendPoints(amount);
    if (success) {
      setPoints(getPoints());
    }
    return success;
  }, []);

  return (
    <PointsContext.Provider
      value={{
        points,
        addPoints: handleAddPoints,
        spendPoints: handleSpendPoints,
        refreshPoints,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (!context) throw new Error("usePoints must be used within PointsProvider");
  return context;
}
