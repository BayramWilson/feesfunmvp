'use client';
import { createContext } from 'react';

interface ViewContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const ViewContext = createContext<ViewContextType>({
  currentView: '',
  setCurrentView: () => {},
}); 