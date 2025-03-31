import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export const DEFAULT_TEAMS = {
  'blazing-rhinos': {
    id: 'blazing-rhinos',
    name: 'Blazing Rhinos',
    players: [
      { id: 'br-1', name: 'Michael Brown', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'br-2', name: 'James Wilson', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'br-3', name: 'David Clark', role: 'All-Rounder', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'br-4', name: 'Robert Taylor', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'br-5', name: 'John Anderson', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } }
    ],
    stats: { matchesPlayed: 0, wins: 0, losses: 0, points: 0, nrr: 0 }
  },
  'lion-kings': {
    id: 'lion-kings',
    name: 'Lion Kings',
    players: [
      { id: 'lk-1', name: 'William Davis', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'lk-2', name: 'Thomas Martin', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'lk-3', name: 'Joseph White', role: 'All-Rounder', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'lk-4', name: 'Christopher Lee', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'lk-5', name: 'Daniel Harris', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } }
    ],
    stats: { matchesPlayed: 0, wins: 0, losses: 0, points: 0, nrr: 0 }
  },
  'golden-eagles': {
    id: 'golden-eagles',
    name: 'Golden Eagles',
    players: [
      { id: 'ge-1', name: 'Richard Thompson', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'ge-2', name: 'Charles Moore', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'ge-3', name: 'Edward Jackson', role: 'All-Rounder', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'ge-4', name: 'George Wright', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'ge-5', name: 'Andrew King', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } }
    ],
    stats: { matchesPlayed: 0, wins: 0, losses: 0, points: 0, nrr: 0 }
  },
  'royal-tigers': {
    id: 'royal-tigers',
    name: 'Royal Tigers',
    players: [
      { id: 'rt-1', name: 'Kevin Scott', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'rt-2', name: 'Brian Green', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'rt-3', name: 'Steven Baker', role: 'All-Rounder', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'rt-4', name: 'Ronald Adams', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'rt-5', name: 'Jeffrey Hill', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } }
    ],
    stats: { matchesPlayed: 0, wins: 0, losses: 0, points: 0, nrr: 0 }
  },
  'giant-sharks': {
    id: 'giant-sharks',
    name: 'Giant Sharks',
    players: [
      { id: 'gs-1', name: 'Gary Nelson', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'gs-2', name: 'Dennis Carter', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'gs-3', name: 'Jerry Mitchell', role: 'All-Rounder', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'gs-4', name: 'Roger Roberts', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'gs-5', name: 'Howard Turner', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } }
    ],
    stats: { matchesPlayed: 0, wins: 0, losses: 0, points: 0, nrr: 0 }
  },
  'panthers': {
    id: 'panthers',
    name: 'Panthers',
    players: [
      { id: 'p-1', name: 'Eugene Phillips', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'p-2', name: 'Russell Morgan', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'p-3', name: 'Samuel Cooper', role: 'All-Rounder', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'p-4', name: 'Harry Richardson', role: 'Batsman', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } },
      { id: 'p-5', name: 'Bruce Peterson', role: 'Bowler', stats: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }, bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 } } }
    ],
    stats: { matchesPlayed: 0, wins: 0, losses: 0, points: 0, nrr: 0 }
  }
};

// Function to generate random player name
const generatePlayerName = () => {
  const firstNames = ['John', 'David', 'Michael', 'James', 'Robert', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Paul', 'Mark', 'Donald', 'George'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

// Function to create a player object
const createPlayer = (teamId, playerNumber) => ({
  id: `${teamId}_player${playerNumber}`,
  name: generatePlayerName(),
  stats: {
    batting: {
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      outBy: null,
    },
    bowling: {
      overs: 0,
      runs: 0,
      wickets: 0,
      maidens: 0,
      economy: 0,
    },
  },
});

// Function to initialize team with 11 players
export const initializeTeamPlayers = async (teamId) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      // Create new team with players
      const players = Array.from({ length: 11 }, (_, i) => createPlayer(teamId, i + 1));
      await setDoc(teamRef, {
        id: teamId,
        players: players,
        createdAt: new Date().toISOString(),
      });
      return players;
    }
    
    if (!teamDoc.data().players) {
      // Add players to existing team
      const players = Array.from({ length: 11 }, (_, i) => createPlayer(teamId, i + 1));
      await setDoc(teamRef, { players }, { merge: true });
      return players;
    }
    
    return teamDoc.data().players;
  } catch (error) {
    console.error('Error initializing team players:', error);
    throw error;
  }
};

// Function to update player stats
export const updatePlayerStats = async (teamId, playerId, newStats, type) => {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }

    const teamData = teamDoc.data();
    const playerIndex = teamData.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) {
      throw new Error('Player not found');
    }

    const updatedPlayers = [...teamData.players];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      stats: {
        ...updatedPlayers[playerIndex].stats,
        [type]: newStats
      }
    };

    await updateDoc(doc(db, 'teams', teamId), {
      players: updatedPlayers
    });
  } catch (error) {
    console.error('Error updating player stats:', error);
    throw error;
  }
};

export const initializeTeams = async () => {
  try {
    const teamsRef = collection(db, 'teams');
    const teamsSnapshot = await getDocs(teamsRef);
    
    // Get existing team IDs
    const existingTeamIds = new Set(teamsSnapshot.docs.map(doc => doc.id));
    
    // Teams we want to ensure exist
    const requiredTeams = ['royal-tigers', 'panthers'];
    
    // Add missing teams
    await Promise.all(
      requiredTeams.map(async (teamId) => {
        if (!existingTeamIds.has(teamId)) {
          const teamData = DEFAULT_TEAMS[teamId];
          // Create new team with default data
          await setDoc(doc(db, 'teams', teamId), {
            ...teamData,
            createdAt: new Date().toISOString(),
          });
          console.log(`Added team: ${teamData.name}`);
        }
      })
    );
  } catch (error) {
    console.error('Error initializing teams:', error);
    throw error;
  }
};

export const getTeamPlayers = async (teamId) => {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) {
      console.error('Team not found:', teamId);
      return [];
    }
    return teamDoc.data().players || [];
  } catch (error) {
    console.error('Error getting team players:', error);
    throw error;
  }
};

export const updateTeamStats = async (teamId, stats) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    await setDoc(teamRef, stats, { merge: true });
  } catch (error) {
    console.error('Error updating team stats:', error);
    throw error;
  }
};

export const getTeams = async () => {
  try {
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    return teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting teams:', error);
    throw error;
  }
};

export const updateTeamNamesInMatches = async () => {
  try {
    const matchesSnapshot = await getDocs(collection(db, 'matches'));
    const updatePromises = matchesSnapshot.docs.map(async (matchDoc) => {
      const matchData = matchDoc.data();
      let needsUpdate = false;
      const updates = {};

      if (matchData.team1 === 'team1') {
        updates.team1 = 'Panthers';
        updates.team1Id = 'panthers';
        needsUpdate = true;
      }
      if (matchData.team2 === 'team1') {
        updates.team2 = 'Panthers';
        updates.team2Id = 'panthers';
        needsUpdate = true;
      }
      if (matchData.team1 === 'team2') {
        updates.team1 = 'Royal Tigers';
        updates.team1Id = 'royal-tigers';
        needsUpdate = true;
      }
      if (matchData.team2 === 'team2') {
        updates.team2 = 'Royal Tigers';
        updates.team2Id = 'royal-tigers';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await updateDoc(doc(db, 'matches', matchDoc.id), updates);
      }
    });

    await Promise.all(updatePromises);
    console.log('Successfully updated team names in matches');
  } catch (error) {
    console.error('Error updating team names in matches:', error);
    throw error;
  }
};

export const updateTeamNamesInDatabase = async () => {
  try {
    // Update teams collection
    const teamsRef = collection(db, 'teams');
    const teamsSnapshot = await getDocs(teamsRef);
    
    const teamUpdates = teamsSnapshot.docs.map(async (teamDoc) => {
      const teamData = teamDoc.data();
      let needsUpdate = false;
      const updates = {};

      if (teamDoc.id === 'team1') {
        // Update team1 to Panthers
        await setDoc(doc(db, 'teams', 'panthers'), {
          ...DEFAULT_TEAMS['panthers'],
          stats: teamData.stats || DEFAULT_TEAMS['panthers'].stats,
          players: teamData.players || DEFAULT_TEAMS['panthers'].players,
        });
        await deleteDoc(doc(db, 'teams', 'team1'));
        needsUpdate = true;
      }
      
      if (teamDoc.id === 'team2') {
        // Update team2 to Royal Tigers
        await setDoc(doc(db, 'teams', 'royal-tigers'), {
          ...DEFAULT_TEAMS['royal-tigers'],
          stats: teamData.stats || DEFAULT_TEAMS['royal-tigers'].stats,
          players: teamData.players || DEFAULT_TEAMS['royal-tigers'].players,
        });
        await deleteDoc(doc(db, 'teams', 'team2'));
        needsUpdate = true;
      }

      return needsUpdate;
    });

    await Promise.all(teamUpdates);

    // Update matches (using existing function)
    await updateTeamNamesInMatches();

    console.log('Successfully updated team names in database');
  } catch (error) {
    console.error('Error updating team names in database:', error);
    throw error;
  }
}; 