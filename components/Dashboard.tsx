
import React from 'react';
import { AppView, UserProfile, SleepData, ActivityData, JournalEntry } from '../types';
import Journal from './Journal';
import SleepTracker from './SleepTracker';
import MusicPlayer from './MusicPlayer';
import HomeView from './HomeView';
import UserFlow from './UserFlow';

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
}

const Dashboard: React.FC<Props> = ({ 
  view, setView, user, sleepData, setSleepData, activity, setActivity, journalEntries, setJournalEntries, aiInsights 
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
      return <MusicPlayer setView={setView} />;
    case AppView.ACTIVITY:
      return <UserFlow setView={setView} />;
    default:
      return null;
  }
};

export default Dashboard;
