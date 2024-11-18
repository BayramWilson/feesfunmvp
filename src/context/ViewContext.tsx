'use client';
import { createContext } from 'react';

interface ViewContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
  hideBottomIcons: boolean;
  setHideBottomIcons: (hide: boolean) => void;
}

export const ViewContext = createContext<ViewContextType>({
  currentView: '',
  setCurrentView: () => {},
  hideBottomIcons: false,
  setHideBottomIcons: () => {},
}); 