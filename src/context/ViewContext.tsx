'use client';
import { createContext, Dispatch, SetStateAction } from 'react';

type ViewType = string;

interface ViewContextType {
  currentView: ViewType;
  setCurrentView: Dispatch<SetStateAction<ViewType>>;
  hideBottomIcons: boolean;
  setHideBottomIcons: Dispatch<SetStateAction<boolean>>;
}

export const ViewContext = createContext<ViewContextType>({
  currentView: '',
  setCurrentView: () => {},
  hideBottomIcons: false,
  setHideBottomIcons: () => {},
}); 