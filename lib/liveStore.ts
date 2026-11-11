import {
  collection, doc, setDoc, deleteDoc, updateDoc,
  onSnapshot, writeBatch, getDocs, Firestore,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import {
  Opportunity, ArsenalProject, RadarDay, SettingsProfile, SubTask, AIChatMessage,
} from './types';

function getDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore is not configured. Check Firebase environment variables.');
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
        const tasksSnap = await getDocs(collection(db, 'users', userId, 'opportunities', d.id, 'tasks'));
        const tasks: SubTask[] = tasksSnap.docs.map((td) => td.data() as SubTask);
        tasks.sort((a, b) => a.sortOrder - b.sortOrder);

        const aiChatSnap = await getDocs(collection(db, 'users', userId, 'opportunities', d.id, 'aiChat'));
        const aiChat: AIChatMessage[] = aiChatSnap.docs.map((ad) => ad.data() as AIChatMessage);
        aiChat.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        opps.push({ ...data, id: d.id, tasks, aiChat });
      }
      opps.sort((a, b) => a.sortOrder - b.sortOrder);
      onUpdate(opps);
    },
    onError
  );
}

export async function saveOpportunityToFirestore(userId: string, opp: Opportunity): Promise<void> {
  const db = getDb();
  const oppRef = doc(db, 'users', userId, 'opportunities', opp.id);
  const { tasks, aiChat, ...rootData } = opp;
  await setDoc(oppRef, rootData, { merge: true });

  const tasksCol = collection(db, 'users', userId, 'opportunities', opp.id, 'tasks');
  const existingTasksSnap = await getDocs(tasksCol);
  const currentTaskIds = new Set(tasks.map((t) => t.id));

  const batch = writeBatch(db);
  for (const d of existingTasksSnap.docs) {
    if (!currentTaskIds.has(d.id)) batch.delete(d.ref);
  }
  for (const t of tasks) {
    batch.set(doc(tasksCol, t.id), t, { merge: true });
  }

  const aiChatCol = collection(db, 'users', userId, 'opportunities', opp.id, 'aiChat');
  const existingChatSnap = await getDocs(aiChatCol);
  const currentChatIds = new Set(aiChat.map((msg) => msg.id));

  for (const d of existingChatSnap.docs) {
    if (!currentChatIds.has(d.id)) batch.delete(d.ref);
  }
  for (const msg of aiChat) {
    batch.set(doc(aiChatCol, msg.id), msg, { merge: true });
  }

  await batch.commit();
}

export async function deleteOpportunityFromFirestore(userId: string, oppId: string): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);

  const tasksSnap = await getDocs(collection(db, 'users', userId, 'opportunities', oppId, 'tasks'));
  tasksSnap.docs.forEach((d) => batch.delete(d.ref));

  const aiChatSnap = await getDocs(collection(db, 'users', userId, 'opportunities', oppId, 'aiChat'));
  aiChatSnap.docs.forEach((d) => batch.delete(d.ref));

  batch.delete(doc(db, 'users', userId, 'opportunities', oppId));
  await batch.commit();
}

export function subscribeProjects(
  userId: string,
  onUpdate: (projects: ArsenalProject[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getDb();
  return onSnapshot(
    collection(db, 'users', userId, 'projects'),
    (snapshot) => {
      onUpdate(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as ArsenalProject)));
    },
    onError
  );
}

export async function saveProjectToFirestore(userId: string, proj: ArsenalProject): Promise<void> {
  const db = getDb();
  await setDoc(doc(db, 'users', userId, 'projects', proj.id), proj, { merge: true });
}

export async function deleteProjectFromFirestore(userId: string, projId: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, 'users', userId, 'projects', projId));
}

export function subscribeRadarDays(
  userId: string,
  onUpdate: (days: RadarDay[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getDb();
  return onSnapshot(
    collection(db, 'users', userId, 'radarDays'),
    async (snapshot) => {
      const days: RadarDay[] = [];
      for (const dayDoc of snapshot.docs) {
        const dayData = dayDoc.data() as Omit<RadarDay, 'items'>;
        const itemsSnap = await getDocs(collection(db, 'users', userId, 'radarDays', dayDoc.id, 'items'));
        const items = itemsSnap.docs.map((idoc) => ({ ...idoc.data(), id: idoc.id }));
        days.push({ ...dayData, date: dayDoc.id, items: items as RadarDay['items'] });
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
  return onSnapshot(
    doc(db, 'users', userId, 'settings', 'profile'),
    (snapshot) => {
      if (snapshot.exists()) onUpdate(snapshot.data() as SettingsProfile);
    },
    onError
  );
}

export async function saveSettingsToFirestore(userId: string, settings: SettingsProfile): Promise<void> {
  const db = getDb();
  await setDoc(doc(db, 'users', userId, 'settings', 'profile'), settings, { merge: true });
}

export async function migrateLocalDataToFirestore(
  userId: string,
  data: { opportunities: Opportunity[]; projects: ArsenalProject[]; settings?: SettingsProfile }
): Promise<{ oppsCount: number; projsCount: number }> {
  const db = getDb();

  const existingOppsSnap = await getDocs(collection(db, 'users', userId, 'opportunities'));
  const existingOppIds = new Set<string>();
  const existingUrlHashes = new Set<string>();
  existingOppsSnap.docs.forEach((d) => {
    existingOppIds.add(d.id);
    const uHash = d.data().urlHash;
    if (uHash && typeof uHash === 'string') existingUrlHashes.add(uHash);
  });

  const existingProjsSnap = await getDocs(collection(db, 'users', userId, 'projects'));
  const existingProjIds = new Set<string>();
  const existingProjTitles = new Set<string>();
  existingProjsSnap.docs.forEach((d) => {
    existingProjIds.add(d.id);
    const title = d.data().title;
    if (title && typeof title === 'string') existingProjTitles.add(title.trim().toLowerCase());
  });

  let oppsCount = 0;
  for (const opp of data.opportunities) {
    if (existingOppIds.has(opp.id) || (opp.urlHash && existingUrlHashes.has(opp.urlHash))) continue;
    await saveOpportunityToFirestore(userId, opp);
    existingOppIds.add(opp.id);
    if (opp.urlHash) existingUrlHashes.add(opp.urlHash);
    oppsCount++;
  }

  let projsCount = 0;
  for (const proj of data.projects) {
    const normTitle = proj.title.trim().toLowerCase();
    if (existingProjIds.has(proj.id) || existingProjTitles.has(normTitle)) continue;
    await saveProjectToFirestore(userId, proj);
    existingProjIds.add(proj.id);
    existingProjTitles.add(normTitle);
    projsCount++;
  }

  if (data.settings) await saveSettingsToFirestore(userId, data.settings);
  return { oppsCount, projsCount };
}
