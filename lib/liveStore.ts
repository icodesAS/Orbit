import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import {
  Opportunity,
  ArsenalProject,
  RadarDay,
  SettingsProfile,
  SubTask,
  AIChatMessage,
} from './types';

function getDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firestore is not configured. Check Firebase environment variables.');
  }
  return db;
}

export function subscribeOpportunities(
  userId: string,
  onUpdate: (opps: Opportunity[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getDb();
  const oppsCol = collection(db, 'users', userId, 'opportunities');

  return onSnapshot(
    oppsCol,
    async (snapshot) => {
      const opps: Opportunity[] = [];
      for (const d of snapshot.docs) {
        const data = d.data() as Opportunity;
        // Fetch subcollections: tasks & aiChat
        const tasksSnap = await getDocs(
          collection(db, 'users', userId, 'opportunities', d.id, 'tasks')
        );
        const tasks: SubTask[] = tasksSnap.docs.map((td) => td.data() as SubTask);
        tasks.sort((a, b) => a.sortOrder - b.sortOrder);

        const aiChatSnap = await getDocs(
          collection(db, 'users', userId, 'opportunities', d.id, 'aiChat')
        );
        const aiChat: AIChatMessage[] = aiChatSnap.docs.map(
          (ad) => ad.data() as AIChatMessage
        );
        aiChat.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        opps.push({
          ...data,
          id: d.id,
          tasks,
          aiChat,
        });
      }
      opps.sort((a, b) => a.sortOrder - b.sortOrder);
      onUpdate(opps);
    },
    onError
  );
}

export async function saveOpportunityToFirestore(
  userId: string,
  opp: Opportunity
): Promise<void> {
  const db = getDb();
  const oppRef = doc(db, 'users', userId, 'opportunities', opp.id);

  // Exclude nested subcollection arrays from the root document
  const { tasks, aiChat, ...rootData } = opp;
  await setDoc(oppRef, rootData, { merge: true });

  // Sync tasks subcollection
  const tasksCol = collection(db, 'users', userId, 'opportunities', opp.id, 'tasks');
  const existingTasksSnap = await getDocs(tasksCol);
  const existingTaskIds = new Set(existingTasksSnap.docs.map((d) => d.id));
  const currentTaskIds = new Set(tasks.map((t) => t.id));

  // Batch delete removed tasks
  const batch = writeBatch(db);
  for (const d of existingTasksSnap.docs) {
    if (!currentTaskIds.has(d.id)) {
      batch.delete(d.ref);
    }
  }
  // Upsert current tasks
  for (const t of tasks) {
    const taskDocRef = doc(tasksCol, t.id);
    batch.set(taskDocRef, t, { merge: true });
  }

  // Upsert chat messages (and delete removed ones)
  const aiChatCol = collection(db, 'users', userId, 'opportunities', opp.id, 'aiChat');
  const existingChatSnap = await getDocs(aiChatCol);
  const currentChatIds = new Set(aiChat.map((msg) => msg.id));
  
  // Delete removed chat messages
  for (const d of existingChatSnap.docs) {
    if (!currentChatIds.has(d.id)) {
      batch.delete(d.ref);
    }
  }
  
  // Upsert current chat messages
  for (const msg of aiChat) {
    const chatDocRef = doc(aiChatCol, msg.id);
    batch.set(chatDocRef, msg, { merge: true });
  }

  await batch.commit();
}

export async function deleteOpportunityFromFirestore(
  userId: string,
  oppId: string
): Promise<void> {
  const db = getDb();
  
  // Delete all tasks in subcollection
  const tasksCol = collection(db, 'users', userId, 'opportunities', oppId, 'tasks');
  const tasksSnap = await getDocs(tasksCol);
  const batch = writeBatch(db);
  
  tasksSnap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  // Delete all aiChat messages in subcollection
  const aiChatCol = collection(db, 'users', userId, 'opportunities', oppId, 'aiChat');
  const aiChatSnap = await getDocs(aiChatCol);
  
  aiChatSnap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  // Delete the parent opportunity document
  const oppRef = doc(db, 'users', userId, 'opportunities', oppId);
  batch.delete(oppRef);
  
  await batch.commit();
}

export function subscribeProjects(
  userId: string,
  onUpdate: (projects: ArsenalProject[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getDb();
  const projsCol = collection(db, 'users', userId, 'projects');

  return onSnapshot(
    projsCol,
    (snapshot) => {
      const projects: ArsenalProject[] = snapshot.docs.map(
        (d) => ({ ...d.data(), id: d.id } as ArsenalProject)
      );
      onUpdate(projects);
    },
    onError
  );
}

export async function saveProjectToFirestore(
  userId: string,
  proj: ArsenalProject
): Promise<void> {
  const db = getDb();
  const projRef = doc(db, 'users', userId, 'projects', proj.id);
  await setDoc(projRef, proj, { merge: true });
}

export async function deleteProjectFromFirestore(
  userId: string,
  projId: string
): Promise<void> {
  const db = getDb();
  const projRef = doc(db, 'users', userId, 'projects', projId);
  await deleteDoc(projRef);
}

export function subscribeRadarDays(
  userId: string,
  onUpdate: (days: RadarDay[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getDb();
  const daysCol = collection(db, 'users', userId, 'radarDays');

  return onSnapshot(
    daysCol,
    async (snapshot) => {
      const days: RadarDay[] = [];
      for (const dayDoc of snapshot.docs) {
        const dayData = dayDoc.data() as Omit<RadarDay, 'items'>;
        const itemsSnap = await getDocs(
          collection(db, 'users', userId, 'radarDays', dayDoc.id, 'items')
        );
        const items = itemsSnap.docs.map((idoc) => ({
          ...idoc.data(),
          id: idoc.id,
        }));
        days.push({
          ...dayData,
          date: dayDoc.id,
          items: items as RadarDay['items'],
        });
      }
      onUpdate(days);
    },
    onError
  );
}

export async function updateRadarItemFlagsInFirestore(
  userId: string,
  dayDate: string,
  itemId: string,
  flags: { promoted?: boolean; verified?: boolean }
): Promise<void> {
  const db = getDb();
  const itemRef = doc(db, 'users', userId, 'radarDays', dayDate, 'items', itemId);
  // Strictly only send allowed keys per firestore.rules
  const updatePayload: Record<string, boolean> = {};
  if (flags.promoted !== undefined) updatePayload.promoted = flags.promoted;
  if (flags.verified !== undefined) updatePayload.verified = flags.verified;
  await updateDoc(itemRef, updatePayload);
}

export function subscribeSettings(
  userId: string,
  onUpdate: (settings: SettingsProfile) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getDb();
  const settingsRef = doc(db, 'users', userId, 'settings', 'profile');

  return onSnapshot(
    settingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as SettingsProfile);
      }
    },
    onError
  );
}

export async function saveSettingsToFirestore(
  userId: string,
  settings: SettingsProfile
): Promise<void> {
  const db = getDb();
  const settingsRef = doc(db, 'users', userId, 'settings', 'profile');
  await setDoc(settingsRef, settings, { merge: true });
}

export async function migrateLocalDataToFirestore(
  userId: string,
  data: {
    opportunities: Opportunity[];
    projects: ArsenalProject[];
    settings?: SettingsProfile;
  }
): Promise<{ oppsCount: number; projsCount: number }> {
  // Filter out sample data (isSample: true) before migration
  const realOpportunities = data.opportunities.filter(opp => !(opp as any).isSample);
  const realProjects = data.projects.filter(proj => !(proj as any).isSample);
  
  for (const opp of realOpportunities) {
    // Remove isSample property if present
    const { isSample, ...oppData } = opp as any;
    await saveOpportunityToFirestore(userId, oppData);
  }
  for (const proj of realProjects) {
    // Remove isSample property if present
    const { isSample, ...projData } = proj as any;
    await saveProjectToFirestore(userId, projData);
  }
  if (data.settings) {
    await saveSettingsToFirestore(userId, data.settings);
  }
  return {
    oppsCount: realOpportunities.length,
    projsCount: realProjects.length,
  };
}
