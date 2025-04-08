// App.tsx - LARK Voice Assistant
import React, { useState, useEffect, lazy, Suspense } from 'react';
import './styles/voice-assistant.css';
import './styles/fluid-theme.css';
// Import smaller components directly
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import LarkLogo from './components/LarkLogo';

// Lazy load larger components
// Use named import for LarkChat to avoid TypeScript issues
import { LarkChat } from './components/LarkChat';
import { VoiceAssistantV2 } from './components/VoiceAssistantV2';
import ChatBox from './components/ChatBox';
const MirandaRights = lazy(() => import('./components/MirandaRights').then(module => ({ default: module.MirandaRights })));
const RSCodes = lazy(() => import('./components/RSCodes').then(module => ({ default: module.RSCodes })));
const ReportAssistant = lazy(() => import('./components/ReportAssistant'));
const MirandaWorkflow = lazy(() => import('./components/MirandaWorkflow'));
const ThreatDetection = lazy(() => import('./components/ThreatDetection').then(module => ({ default: module.ThreatDetection })));
const IncidentTimeline = lazy(() => import('./components/IncidentTimeline'));
const Tools = lazy(() => import('./components/Tools').then(module => ({ default: module.Tools })));
const Settings = lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));
const FluidDesignDemo = lazy(() => import('./components/FluidDesignDemo').then(module => ({ default: module.FluidDesignDemo })));
const LiveKitRealtimeVoiceTest = lazy(() => import('./components/LiveKitRealtimeVoiceTest'));
const AdvancedDashboard = lazy(() => import('./components/AdvancedDashboard').then(module => ({ default: module.AdvancedDashboard })));
import { LiveKitVoiceProvider } from './contexts/LiveKitVoiceContext';
import ErrorBoundary from './components/ErrorBoundary';
import MirandaErrorBoundary from './components/MirandaErrorBoundary';
import { initNetworkMonitoring } from './utils/networkOptimizer';
import { initLocationTracking, getCurrentLocation, onLocationUpdate, LocationData } from './utils/locationTracker';
import { 
  ShieldIcon, 
  BookTextIcon, 
  AlertTriangleIcon, 
  MicIcon, 
  Activity, 
  Radio, 
  BatteryMedium,
  Clock,
  MapPin,
  WifiIcon,
  CheckCircle2,
  WrenchIcon,
  Settings as SettingsIcon,
  Volume as VolumeUpIcon,
  FileTextIcon
} from 'lucide-react';

interface AppProps {
  initialTab?: string;
}

function App({ initialTab = 'voice' }: AppProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [messages, setMessages] = useState<import('./components/ChatBox').ChatMessage[]>([]);
  // Fluid design is now the default and only design
  // Removed unused variable: const [showVoiceTest, setShowVoiceTest] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [connected, setConnected] = useState(true);
  const [location, setLocation] = useState('Baton Rouge, LA');
  // Location state is now managed by the locationTracker utility

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Initialize network monitoring and location tracking
  useEffect(() => {
    // Initialize network monitoring
    initNetworkMonitoring();
    
    // Initialize location tracking
    initLocationTracking().then(success => {
      if (success) {
        console.log('Location tracking initialized successfully');
        // Update location when it changes
        onLocationUpdate((locationData: LocationData) => {
          if (locationData.address) {
            setLocation(locationData.address);
          } else {
            setLocation(`${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`);
          }
        });
        
        // Set initial location if available
        const initialLocation = getCurrentLocation();
        if (initialLocation && initialLocation.address) {
          setLocation(initialLocation.address);
        } else if (initialLocation) {
          setLocation(`${initialLocation.latitude.toFixed(4)}, ${initialLocation.longitude.toFixed(4)}`);
        }
      } else {
        console.warn('Location tracking initialization failed');
      }
    });
  }, []);

  // Simulate battery drain
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(prev - 1, 5));
    }, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <LiveKitVoiceProvider>
      <div className="min-h-screen fluid-background text-foreground p-4 md:p-6 overflow-hidden antialiased selection:bg-primary/20 selection:text-primary relative" style={{ background: 'linear-gradient(135deg, #e9f2f9 0%, #d1e6f9 100%)' }}>
        {/* Decorative wave elements for fluid design */}
        <div className="fluid-wave"></div>
        <div className="fluid-wave-gold"></div>
        {/* Voice detection indicator - shows when voice is detected */}
        {/* <VoiceIndicator /> */}
        <div className="max-w-6xl mx-auto relative">
        {/* Enhanced background accents for visual interest */}
                {/* Modern header with sleek design */}
        <header className="mb-8 relative fluid-card rounded-2xl p-4 border border-[rgba(255,255,255,0.5)] backdrop-blur-sm shadow-md" style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <LarkLogo width={45} height={45} className="mr-1" />
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight leading-none flex items-center">
                  <span className="fluid-heading">LARK</span>
                  <span className="ml-2 text-xs font-medium fluid-badge px-2 py-1 rounded-full">1.0</span>
                </h1>
                <p className="text-muted-foreground text-sm font-light tracking-wide mt-1">
                  Law Enforcement Assistance and Response Kit
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0 w-full md:w-auto">
              {/* Location indicator */}
              <div className="flex items-center px-4 py-2 rounded-full bg-card text-card-foreground border border-border/10 shadow-sm transition-all hover:bg-secondary/10 group">
                <MapPin className="w-4 h-4 text-black/70 group-hover:text-black" />
                <span className="text-foreground text-sm font-medium ml-2 group-hover:text-black">{location}</span>
              </div>
              
              {/* Status indicators group */}
              <div className="flex items-center gap-4 px-5 py-2 rounded-full bg-card text-card-foreground border border-border/10 shadow-sm backdrop-blur-sm">
                {/* Time */}
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground text-sm font-medium ml-1.5 font-mono">{formatTime(currentTime)}</span>
                </div>
                
                <span className="w-[1px] h-4 bg-border"></span>
                
                {/* Battery */}
                <div className="flex items-center gap-1.5">
                  <BatteryMedium 
                    className={`w-4 h-4 ${batteryLevel < 20 ? 'text-destructive' : batteryLevel > 50 ? 'text-success' : 'text-warning'}`} 
                  />
                  <span className={`text-xs font-medium ml-0.5 ${batteryLevel < 20 ? 'text-destructive' : batteryLevel > 50 ? 'text-foreground' : 'text-warning'}`}>
                    {batteryLevel}%
                  </span>
                </div>
                
                {/* Connection status */}
                {connected ? (
                  <div className="flex items-center gap-1">
                    <WifiIcon className="w-4 h-4 text-success" />
                    <span className="text-xs font-medium text-success">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <WifiIcon className="w-4 h-4 text-destructive" />
                    <span className="text-xs font-medium text-destructive">Offline</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="relative mb-8 space-y-6 z-10">
          {/* Dashboard and Performance Monitor removed as requested */}

          
          <Tabs defaultValue="voice" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 fluid-glass rounded-2xl p-3 flex flex-wrap md:flex-nowrap justify-between border border-[rgba(255,255,255,0.4)] shadow-lg gap-2 backdrop-blur-sm sticky top-0 z-20 bg-white/20">
              <TabsTrigger 
                value="voice" 
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#003087] data-[state=active]:to-[#004db3] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-md"
                style={{ color: activeTab === 'voice' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/20 rounded-full p-1.5 shadow-inner">
                    <MicIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Assistant</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="miranda" 
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#003087] data-[state=active]:to-[#004db3] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-md"
                style={{ color: activeTab === 'miranda' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/20 rounded-full p-1.5 shadow-inner">
                    <BookTextIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Miranda</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="statutes" 
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#003087] data-[state=active]:to-[#004db3] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-md"
                style={{ color: activeTab === 'statutes' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/20 rounded-full p-1.5 shadow-inner">
                    <ShieldIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Statutes</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#003087] data-[state=active]:to-[#004db3] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-md"
                style={{ color: activeTab === 'reports' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/20 rounded-full p-1.5 shadow-inner">
                    <FileTextIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Reports</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="tools" 
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#003087] data-[state=active]:to-[#004db3] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-md"
                style={{ color: activeTab === 'tools' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/20 rounded-full p-1.5 shadow-inner">
                    <WrenchIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Tools</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#003087] data-[state=active]:to-[#004db3] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-md"
                style={{ color: activeTab === 'settings' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/20 rounded-full p-1.5 shadow-inner">
                    <SettingsIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Settings</span>
                </div>
              </TabsTrigger>

            </TabsList>

            <div className="fluid-card rounded-xl overflow-hidden border border-[rgba(255,255,255,0.3)] shadow-md backdrop-blur-sm bg-opacity-90" style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)' }}>
              <TabsContent value="voice" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                  <Suspense fallback={<div className="p-8 text-center">Loading voice assistant...</div>}>
                    <div className="flex flex-col gap-4">
                      {/* <VoiceAssistantV2 /> */}
                      <ChatBox messages={messages} setMessages={setMessages} isSpeaking={false} />
                    </div>
                  </Suspense>
              </TabsContent>

              <TabsContent value="miranda" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <Suspense fallback={<div className="p-8 text-center">Loading Miranda Workflow...</div>}>
                  <MirandaWorkflow />
                </Suspense>
              </TabsContent>

              <TabsContent value="statutes" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <Suspense fallback={<div className="p-8 text-center">Loading Statutes...</div>}>
                  <RSCodes />
                </Suspense>
              </TabsContent>

              <TabsContent value="reports" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <Suspense fallback={<div className="p-8 text-center">Loading Report Assistant...</div>}>
                  <div className="rounded-lg border border-blue-900/50 bg-blue-950/10 p-4 mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-blue-300 flex items-center gap-2">
                      <FileTextIcon className="h-5 w-5" />
                      Report Assistant
                    </h3>
                    <p className="text-blue-400/70 text-sm mb-4">
                      Review, edit, and improve your reports with AI assistance.
                    </p>
                    <ReportAssistant />
                  </div>
                </Suspense>
              </TabsContent>
              
              <TabsContent value="tools" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <Suspense fallback={<div className="p-8 text-center">Loading Tools...</div>}>
                  <Tools />
                  <div className="mt-6">
                  </div>
                </Suspense>
              </TabsContent>

              <TabsContent value="settings" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <Suspense fallback={<div className="p-4 text-center">Loading Settings...</div>}>
                        <Settings />
                      </Suspense>
                    </div>
                    <div className="space-y-6">
                      <div className="fluid-card rounded-lg border border-[rgba(255,255,255,0.3)] shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border/60 bg-muted/30">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <VolumeUpIcon className="h-5 w-5 text-primary" />
                          </h3>
                         
                        </div>
                        <div className="p-4">
                          {process.env.NODE_ENV !== 'production' && (
                            <Suspense fallback={<div className="p-4 text-center">Loading LiveKit Test...</div>}>
                              <LiveKitRealtimeVoiceTest />
                            </Suspense>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              

            </div>
          </Tabs>
        </main>

        {/* Status indicators removed as requested */}

        <footer className="mt-8 text-center text-xs text-muted-foreground pt-6 border-t border-border">
          <p className="flex items-center justify-center gap-1 font-medium">
            <span>© 2025 Zooner Enterprises</span>
            <span className="text-border/80">•</span>
            <span>All Rights Reserved</span>
          </p>
        </footer>
      </div>
      </div>
    </LiveKitVoiceProvider>
  );
}

export default App;
