import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Player, Team, Match, Tournament } from '../types';

// Player Services
export const playerServices = {
  async createPlayer(player: Omit<Player, 'id'>) {
    const docRef = await addDoc(collection(db, 'players'), {
      ...player,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getPlayer(id: string) {
    const docRef = doc(db, 'players', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Player : null;
  },

  async updatePlayer(id: string, data: Partial<Player>) {
    const docRef = doc(db, 'players', id);
    await updateDoc(docRef, data);
  },

  async deletePlayer(id: string) {
    const docRef = doc(db, 'players', id);
    await deleteDoc(docRef);
  },

  async getPlayersByTeam(teamId: string) {
    const q = query(collection(db, 'players'), where('teamId', '==', teamId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
  },
};

// Team Services
export const teamServices = {
  async createTeam(team: Omit<Team, 'id'>) {
    const docRef = await addDoc(collection(db, 'teams'), {
      ...team,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getTeam(id: string) {
    const docRef = doc(db, 'teams', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Team : null;
  },

  async updateTeam(id: string, data: Partial<Team>) {
    const docRef = doc(db, 'teams', id);
    await updateDoc(docRef, data);
  },

  async deleteTeam(id: string) {
    const docRef = doc(db, 'teams', id);
    await deleteDoc(docRef);
  },
};

// Match Services
export const matchServices = {
  async createMatch(match: Omit<Match, 'id'>) {
    const docRef = await addDoc(collection(db, 'matches'), {
      ...match,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getMatch(id: string) {
    const docRef = doc(db, 'matches', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Match : null;
  },

  async updateMatch(id: string, data: Partial<Match>) {
    const docRef = doc(db, 'matches', id);
    await updateDoc(docRef, data);
  },

  async getUpcomingMatches(limit: number = 5) {
    const q = query(
      collection(db, 'matches'),
      where('status', '==', 'scheduled'),
      orderBy('date', 'asc'),
      limit(limit)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
  },
};

// Tournament Services
export const tournamentServices = {
  async createTournament(tournament: Omit<Tournament, 'id'>) {
    const docRef = await addDoc(collection(db, 'tournaments'), {
      ...tournament,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getTournament(id: string) {
    const docRef = doc(db, 'tournaments', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Tournament : null;
  },

  async updateTournament(id: string, data: Partial<Tournament>) {
    const docRef = doc(db, 'tournaments', id);
    await updateDoc(docRef, data);
  },

  async getActiveTournaments() {
    const q = query(
      collection(db, 'tournaments'),
      where('status', '==', 'in-progress')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tournament));
  },
}; 