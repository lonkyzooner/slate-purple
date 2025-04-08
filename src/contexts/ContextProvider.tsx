import React, { createContext, useContext, useState, useEffect } from 'react';

interface ContextData {
  location: string | null;
  time: string;
  caseNumber: string | null;
  conversationHistory: Array<{ role: string; content: string; timestamp: number }>;
  setConversationHistory: React.Dispatch<React.SetStateAction<Array<{ role: string; content: string; timestamp: number }>>>;
  preferences: Record<string, any>;
  setPreferences: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  ongoingTasks: Array<{ id: string; description: string; status: string }>;
  setOngoingTasks: React.Dispatch<React.SetStateAction<Array<{ id: string; description: string; status: string }>>>;
  geoPermissionDenied?: boolean;
  officerDisplayName: string;
}

const Context = createContext<ContextData>({
  location: null,
  time: new Date().toLocaleString(),
  caseNumber: null,
  conversationHistory: [],
  setConversationHistory: () => {},
  preferences: {},
  setPreferences: () => {},
  ongoingTasks: [],
  setOngoingTasks: () => {},
  officerDisplayName: '',
});

export const useLarkContext = () => useContext(Context);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<string | null>(null);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  const [time, setTime] = useState<string>(new Date().toLocaleString());
  const [geoPermissionDenied, setGeoPermissionDenied] = useState(false);

  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string; timestamp: number }>>([]);
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const [ongoingTasks, setOngoingTasks] = useState<Array<{ id: string; description: string; status: string }>>([]);

  const [officerDisplayName, setOfficerDisplayName] = useState<string>('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = pos.coords;
        setLocation(`Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`);
      },
      (err: GeolocationPositionError) => {
        if (err.code === 1) { // PERMISSION_DENIED
          setGeoPermissionDenied(true);
        }
        setLocation('Location unavailable');
      }
    );

    const interval = setInterval(() => {
      setTime(new Date().toLocaleString());
    }, 1000);

    const handleProfileUpdate = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.displayName) {
        setOfficerDisplayName(detail.displayName);
      }
    };

    document.addEventListener('officerProfileUpdated', handleProfileUpdate);

    return () => {
      clearInterval(interval);
      document.removeEventListener('officerProfileUpdated', handleProfileUpdate);
    };
  }, []);

  return (
    <Context.Provider value={{
      location,
      time,
      caseNumber,
      conversationHistory,
      setConversationHistory,
      preferences,
      setPreferences,
      ongoingTasks,
      setOngoingTasks,
      geoPermissionDenied,
      officerDisplayName
    }}>
      {children}
    </Context.Provider>
  );
};
