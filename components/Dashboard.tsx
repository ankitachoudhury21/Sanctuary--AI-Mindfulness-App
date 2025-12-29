

import React from 'react';
import { AppView, UserProfile, SleepData, ActivityData, JournalEntry } from '../types';

// Moved component imports from App.tsx here as needed
import MusicPlayer from './MusicPlayer'; 
import HomeView from './HomeView';
import UserFlow from './UserFlow';
import PlanetaryMission from './PlanetaryMission';
import ImageGenerator from './ImageGenerator';
import Journal from './Journal'; // Fix: Added missing import for Journal component
import SleepTracker from './SleepTracker'; // Fix: Added missing import for SleepTracker component


interface Props {
  view: AppView;
  setView: (view: AppView) => void;
  user: UserProfile | null;
  sleepData: SleepData[];
  setSleepData: (data: SleepData[]) => void;
  activity: ActivityData;
  setActivity: React.Dispatch<React.SetStateAction<ActivityData>>;
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  aiInsights: any;
  setIsAnyTrackPlaying: (playing: boolean) => void;
}

const Dashboard: React.FC<Props> = ({ 
  view, setView, user, sleepData, setSleepData, activity, setActivity, journalEntries, setJournalEntries, aiInsights, setIsAnyTrackPlaying 
}) => {
  switch (view) {
    case AppView.DASHBOARD:
      return (
        <HomeView 
          user={user} 
          sleepData={sleepData} 
          activity={activity} 
          setActivity={setActivity} 
          aiInsights={aiInsights}
          setView={setView}
        />
      );
    case AppView.JOURNAL:
      return (
        <Journal 
          entries={journalEntries} 
          setEntries={setJournalEntries} 
          setView={setView}
          // Passing user prop to Journal
          user={user}
        />
      );
    case AppView.SLEEP:
      return (
        <SleepTracker 
          data={sleepData} 
          setData={setSleepData}
          aiInsights={aiInsights}
          setView={setView}
        />
      );
    case AppView.MUSIC:
      return <MusicPlayer setView={setView} setIsAnyTrackPlaying={setIsAnyTrackPlaying} />;
    case AppView.PLANETARY:
      return <PlanetaryMission setView={setView} setIsAnyTrackPlaying={setIsAnyTrackPlaying} />;
    case AppView.IMAGE_GEN: // New case for image generation
      return <ImageGenerator setView={setView} />;
    case AppView.ACTIVITY:
      return <UserFlow setView={setView} />;
    default:
      return null;
  }
};

export default Dashboard;