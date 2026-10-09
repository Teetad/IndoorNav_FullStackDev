import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface NavigationContextType {
  startNode: string;
  goalNode: string;
  setStartNode: (node: string) => void;
  setGoalNode: (node: string) => void;
  isNavigating: boolean;
  startNavigation: (start: string, goal: string) => void;
  stopNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [startNode, setStartNode] = useState("");
  const [goalNode, setGoalNode] = useState("");

  const startNavigation = (start: string, goal: string) => {
    setStartNode(start);
    setGoalNode(goal);
  };

  const stopNavigation = () => {
    setStartNode("");
    setGoalNode("");
  };

  // ตรวจสอบว่ากำลังนำทางอยู่หรือไม่ (ถ้ามี start และ goal ถือว่านำทางอยู่)
  const isNavigating = Boolean(startNode && goalNode);

  return (
    <NavigationContext.Provider 
      value={{ startNode, goalNode, setStartNode, setGoalNode, isNavigating, startNavigation, stopNavigation }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

// ฮุกสำหรับดึงไปใช้ง่ายๆ
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("useNavigation must be used within NavigationProvider");
  return context;
};