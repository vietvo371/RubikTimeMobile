import React, { createContext, useContext, useState, useEffect } from 'react';

const LandscapeTimerDisplayContext = createContext();

export const LandscapeTimerDisplayProvider = ({ children, externalHandlers }) => {
  const [time, setTime] = useState('00:00.000');
  const [isRunning, setIsRunning] = useState(false);
  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [timeList, setTimeList] = useState([]);
  const [averageTime, setAverageTime] = useState('00:00.000');
  const [sub15Count, setSub15Count] = useState(0);
  const [sub20Times, setSub20Times] = useState([]);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [stopTime, setStopTime] = useState(0);

  useEffect(() => {
    console.log('Context isTimerStarted changed:', isTimerStarted);
  }, [isTimerStarted]);

  const value = {
    time,
    setTime,
    isRunning,
    setIsRunning,
    isReadyToStart,
    setIsReadyToStart,
    isShowingResult,
    setIsShowingResult,
    timeList,
    setTimeList,
    averageTime,
    setAverageTime,
    sub15Count,
    setSub15Count,
    sub20Times,
    setSub20Times,
    onTimerStart: externalHandlers?.onTimerStart,
    onTimerStop: externalHandlers?.onTimerStop,
    onStopTimerReady: externalHandlers?.onStopTimerReady,
    onBestTimeUpdate: externalHandlers?.onBestTimeUpdate,
    updateTrigger: externalHandlers?.updateTrigger,
    onClearAll: externalHandlers?.onClearAll,
    isTimerStarted,
    setIsTimerStarted,
    stopTime,
    setStopTime,
  };

  return (
    <LandscapeTimerDisplayContext.Provider value={value}>
      {children}
    </LandscapeTimerDisplayContext.Provider>
  );
};

export const useLandscapeTimerDisplay = () => {
  const context = useContext(LandscapeTimerDisplayContext);
  if (!context) {
    throw new Error('useLandscapeTimerDisplay must be used within a LandscapeTimerDisplayProvider');
  }
  return context;
}; 