

import React from 'react';
import { AppView, UserProfile, SleepData, ActivityData, JournalEntry } from '../types';

// Moved component imports from App.tsx here as needed
import MusicPlayer from './MusicPlayer'; 
import HomeView from './HomeView';
import UserFlow from './UserFlow';
import PlanetaryMission from './PlanetaryMission';
import Journal from './Journal';
import SleepTracker from './SleepTracker';


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
          // FIX: Changed 'data' to 'sleepData' to match the prop name in Dashboard
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
    case AppView.ACTIVITY:
      return <UserFlow setView={setView} />;
    default:
      return null;
  }
};

export default Dashboard;