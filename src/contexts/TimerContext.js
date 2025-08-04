import React, { createContext, useContext } from 'react';

const TimerContext = createContext();

export const TimerProvider = ({ children, value }) => {
  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}; 