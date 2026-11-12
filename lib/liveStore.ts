import {
  collection, doc, setDoc, deleteDoc, updateDoc,
  onSnapshot, writeBatch, getDocs, Firestore,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import {
  Opportunity, ArsenalProject, RadarDay, SubTask, AIChatMessage,
} from './types';

function getDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore is not configured. Check Firebase environment variables.');
  return db;
}

class ChunkedBatch {
  private batch = writeBatch(this.db);
  private opCount = 0;
  constructor(private db: Firestore) {}

  set(ref: any, data: any, options?: any) {
    this.batch.set(ref, data, options);
    this.opCount++;
  }
  delete(ref: any) {
    this.batch.delete(ref);
    this.opCount++;
  }
  async commitStep(limit = 400) {
    if (this.opCount >= limit) {
      await this.batch.commit();
      this.batch = writeBatch(this.db);
      this.opCount = 0;
    }
  }
  async commit() {
    if (this.opCount > 0) {
      await this.batch.commit();
      this.batch = writeBatch(this.db);
      this.opCount = 0;
    }
  }
}

export function subscribeOpportunities(
  userId: string,
  onUpdate: (opps: Opportunity[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getDb();
  const oppsCol = collection(db, 'users', userId, 'opportunities');
  let cancelled = false;
  let latestSeq = 0;

  const unsubscribe = onSnapshot(
    oppsCol,
    async (snapshot) => {
      const currentSeq = ++latestSeq;
      try {
        const opps = await Promise.all(
          snapshot.docs.map(async (d) => {
            const data = d.data() as Opportunity;
            const [tasksSnap, aiChatSnap] = await Promise.all([
              getDocs(collection(db, 'users', userId, 'opportunities', d.id, 'tasks')),
              getDocs(collection(db, 'users', userId, 'opportunities', d.id, 'aiChat')),
            ]);

            const tasks: SubTask[] = tasksSnap.docs.map((td) => td.data() as SubTask);
            tasks.sort((a, b) => a.sortOrder - b.sortOrder);

            const aiChat: AIChatMessage[] = aiChatSnap.docs.map((ad) => ad.data() as AIChatMessage);
            aiChat.sort((a, b) => (new Date(a.createdAt).getTime() || 0) - (new Date(b.createdAt).getTime() || 0));

            return { ...data, id: d.id, tasks, aiChat };
          })
        );
        if (cancelled || currentSeq !== latestSeq) return;
        opps.sort((a, b) => (a.sortOrder - b.sortOrder) || (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));
        onUpdate(opps);
      } catch (err) {
        if (!cancelled && onError && err instanceof Error) onError(err);
      }
    },
    (err) => {
      if (!cancelled && onError) onError(err);
    }
  );

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export async function saveOpportunityToFirestore(
  userId: string,
  opp: Opportunity,
  options: { syncTasks?: boolean; syncChat?: boolean } = { syncTasks: true, syncChat: true }
): Promise<void> {
  const db = getDb();
  const oppRef = doc(db, 'users', userId, 'opportunities', opp.id);
  const { tasks, aiChat, ...rootData } = opp;

  if (!options.syncTasks && !options.syncChat) {
    await setDoc(oppRef, rootData, { merge: true });
    return;
  }

  const batch = new ChunkedBatch(db);
  batch.set(oppRef, rootData, { merge: true });

  if (options.syncTasks) {
    const tasksCol = collection(db, 'users', userId, 'opportunities', opp.id, 'tasks');
    const existingTasksSnap = await getDocs(tasksCol);
    const currentTaskIds = new Set(tasks.map((t) => t.id));
    for (const d of existingTasksSnap.docs) {
      if (!currentTaskIds.has(d.id)) { batch.delete(d.ref); await batch.commitStep(); }
    }
    for (const t of tasks) {
      batch.set(doc(tasksCol, t.id), t, { merge: true });
      await batch.commitStep();
    }
  }

  if (options.syncChat) {
    const aiChatCol = collection(db, 'users', userId, 'opportunities', opp.id, 'aiChat');
    const existingChatSnap = await getDocs(aiChatCol);
    const currentChatIds = new Set(aiChat.map((msg) => msg.id));
    for (const d of existingChatSnap.docs) {
      if (!currentChatIds.has(d.id)) { batch.delete(d.ref); await batch.commitStep(); }
    }
    for (const msg of aiChat) {
      batch.set(doc(aiChatCol, msg.id), msg, { merge: true });
      await batch.commitStep();
    }
  }

  await batch.commit();
}

export async function deleteOpportunityFromFirestore(userId: string, oppId: string): Promise<void> {
  const db = getDb();
  const batch = new ChunkedBatch(db);

  const [tasksSnap, aiChatSnap] = await Promise.all([
    getDocs(collection(db, 'users', userId, 'opportunities', oppId, 'tasks')),
    getDocs(collection(db, 'users', userId, 'opportunities', oppId, 'aiChat')),
  ]);
  for (const d of tasksSnap.docs) { batch.delete(d.ref); await batch.commitStep(); }
  for (const d of aiChatSnap.docs) { batch.delete(d.ref); await batch.commitStep(); }

  batch.delete(doc(db, 'users', userId, 'opportunities', oppId));
  await batch.commit();
}

export function subscribeProjects(
  userId: string,
  onUpdate: (projects: ArsenalProject[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getDb();
  let cancelled = false;
  const unsubscribe = onSnapshot(
    collection(db, 'users', userId, 'projects'),
    (snapshot) => {
      if (cancelled) return;
      onUpdate(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as ArsenalProject)));
    },
    (err) => {
      if (!cancelled && onError) onError(err);
    }
  );
  return () => {
    cancelled = true;
    unsubscribe();
  };
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
  let cancelled = false;
  let latestSeq = 0;

  const unsubscribe = onSnapshot(
    collection(db, 'users', userId, 'radarDays'),
    async (snapshot) => {
      const currentSeq = ++latestSeq;
      try {
        const days = await Promise.all(
          snapshot.docs.map(async (dayDoc) => {
            const dayData = dayDoc.data() as Omit<RadarDay, 'items'>;
            const itemsSnap = await getDocs(collection(db, 'users', userId, 'radarDays', dayDoc.id, 'items'));
            const items = itemsSnap.docs.map((idoc) => ({ ...idoc.data(), id: idoc.id }));
            return { ...dayData, date: dayDoc.id, items: items as RadarDay['items'] };
          })
        );
        if (cancelled || currentSeq !== latestSeq) return;
        days.sort((a, b) => b.date.localeCompare(a.date));
        onUpdate(days);
      } catch (err) {
        if (!cancelled && onError && err instanceof Error) onError(err);
      }
    },
    (err) => {
      if (!cancelled && onError) onError(err);
    }
  );

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export async function updateRadarItemFlagsInFirestore(
  userId: string, dayDate: string, itemId: string,
  flags: { promoted?: boolean; verified?: boolean }
): Promise<void> {
  const db = getDb();
  const updatePayload: Record<string, boolean> = {};
  if (flags.promoted !== undefined) updatePayload.promoted = flags.promoted;
  if (flags.verified !== undefined) updatePayload.verified = flags.verified;
  await updateDoc(doc(db, 'users', userId, 'radarDays', dayDate, 'items', itemId), updatePayload);
}

export async function migrateLocalDataToFirestore(
  userId: string,
  data: { opportunities: Opportunity[]; projects: ArsenalProject[] }
): Promise<{ oppsCount: number; projsCount: number }> {
  const db = getDb();

  const [existingOppsSnap, existingProjsSnap] = await Promise.all([
    getDocs(collection(db, 'users', userId, 'opportunities')),
    getDocs(collection(db, 'users', userId, 'projects')),
  ]);

  const existingOppIds = new Set<string>();
  const existingUrlHashes = new Set<string>();
  existingOppsSnap.docs.forEach((d) => {
    existingOppIds.add(d.id);
    const uHash = d.data().urlHash;
    if (uHash && typeof uHash === 'string') existingUrlHashes.add(uHash);
  });

  const existingProjIds = new Set<string>();
  const existingProjTitleMap = new Map<string, string>();
  existingProjsSnap.docs.forEach((d) => {
    existingProjIds.add(d.id);
    const title = d.data().title;
    if (title && typeof title === 'string') existingProjTitleMap.set(title.trim().toLowerCase(), d.id);
  });

  const projectIdRemap = new Map<string, string>();
  let projsCount = 0;
  for (const proj of data.projects) {
    const normTitle = proj.title.trim().toLowerCase();
    const existingId = existingProjTitleMap.get(normTitle);
    if (existingId) {
      projectIdRemap.set(proj.id, existingId);
      continue;
    }
    if (existingProjIds.has(proj.id)) continue;

    await saveProjectToFirestore(userId, proj);
    existingProjIds.add(proj.id);
    existingProjTitleMap.set(normTitle, proj.id);
    projsCount++;
  }

  let oppsCount = 0;
  for (const opp of data.opportunities) {
    if (existingOppIds.has(opp.id) || (opp.urlHash && existingUrlHashes.has(opp.urlHash))) continue;
    const remappedProjectIds = opp.projectIds.map((pid) => projectIdRemap.get(pid) || pid);
    await saveOpportunityToFirestore(userId, { ...opp, projectIds: remappedProjectIds });
    existingOppIds.add(opp.id);
    if (opp.urlHash) existingUrlHashes.add(opp.urlHash);
    oppsCount++;
  }

  return { oppsCount, projsCount };
}
