import React from 'react';
import { AppView, UserProfile, JournalEntry, MindfulnessInsights, DailyMantraItem } from '../types';
import MusicPlayer from './MusicPlayer';
import HomeView from './HomeView';
import { PlanetaryMission } from './PlanetaryMission';
import Journal from './Journal';

interface Props {
  view: AppView;
  setView: (view: AppView) => void;
  user: UserProfile | null;
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  aiInsights: MindfulnessInsights | null;
  dailyMantras: DailyMantraItem[];
  isLoadingMantras: boolean;
  mantrasError: string | null;
  onRefreshMantras: () => void;
  setIsAnyTrackPlaying: (playing: boolean) => void;
}

const Dashboard: React.FC<Props> = ({
  view,
  setView,
  user,
  journalEntries,
  setJournalEntries,
  aiInsights,
  dailyMantras,
  isLoadingMantras,
  mantrasError,
  onRefreshMantras,
  setIsAnyTrackPlaying,
}) => {
  switch (view) {
    case AppView.DASHBOARD:
      return (
        <HomeView
          user={user}
          journalCount={journalEntries.length}
          aiInsights={aiInsights}
          dailyMantras={dailyMantras}
          isLoadingMantras={isLoadingMantras}
          mantrasError={mantrasError}
          onRefreshMantras={onRefreshMantras}
          setView={setView}
        />
      );
    case AppView.JOURNAL:
      return (
        <Journal
          entries={journalEntries}
          setEntries={setJournalEntries}
          setView={setView}
          user={user}
        />
      );
    case AppView.MUSIC:
      return <MusicPlayer setView={setView} setIsAnyTrackPlaying={setIsAnyTrackPlaying} />;
    case AppView.PLANETARY:
      return <PlanetaryMission setView={setView} setIsAnyTrackPlaying={setIsAnyTrackPlaying} />;
    default:
      return null;
  }
};

export default Dashboard;