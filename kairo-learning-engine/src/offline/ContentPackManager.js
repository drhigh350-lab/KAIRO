/**
 * Kairo — ContentPackManager
 * Manages downloadable question packs, explanations, and revision materials.
 * Students download by subject/topic. Everything works offline after download.
 */

import { STORES } from "../data/LocalStore.js";

export class ContentPackManager {
  constructor(localStore) {
    this.store = localStore;
    this.packMetaKey = 'content_pack_meta';
  }

  /**
   * Available packs structure.
   */
  static getAvailablePacks() {
    return [
      { id: 'bio_cell',     subject: 'Biology',    topic: 'Cell Biology',      questions: 500, sizeMB: 1.2, type: 'topic_pack' },
      { id: 'bio_genetics', subject: 'Biology',    topic: 'Genetics',          questions: 400, sizeMB: 1.0, type: 'topic_pack' },
      { id: 'bio_ecology',  subject: 'Biology',    topic: 'Ecology',           questions: 350, sizeMB: 0.9, type: 'topic_pack' },
      { id: 'chem_stoich',  subject: 'Chemistry',  topic: 'Stoichiometry',     questions: 500, sizeMB: 1.1, type: 'topic_pack' },
      { id: 'chem_organic', subject: 'Chemistry',  topic: 'Organic Chemistry', questions: 600, sizeMB: 1.3, type: 'topic_pack' },
      { id: 'chem_physical',subject: 'Chemistry',  topic: 'Physical Chemistry',questions: 450, sizeMB: 1.0, type: 'topic_pack' },
      { id: 'phy_mechanics',subject: 'Physics',    topic: 'Mechanics',         questions: 500, sizeMB: 1.2, type: 'topic_pack' },
      { id: 'phy_waves',    subject: 'Physics',    topic: 'Waves',             questions: 400, sizeMB: 1.0, type: 'topic_pack' },
      { id: 'phy_electric', subject: 'Physics',    topic: 'Electricity',       questions: 450, sizeMB: 1.1, type: 'topic_pack' },
      { id: 'math_algebra', subject: 'Mathematics',topic: 'Algebra',           questions: 500, sizeMB: 1.0, type: 'topic_pack' },
      { id: 'math_calc',    subject: 'Mathematics',topic: 'Calculus',          questions: 400, sizeMB: 0.9, type: 'topic_pack' },
      { id: 'eng_comp',     subject: 'English',    topic: 'Comprehension',     questions: 300, sizeMB: 0.8, type: 'topic_pack' },
      { id: 'eng_lexis',    subject: 'English',    topic: 'Lexis',             questions: 400, sizeMB: 0.9, type: 'topic_pack' },
      // Full subject packs
      { id: 'biology_full',    subject: 'Biology',    questions: 2000, sizeMB: 4.2, type: 'subject_pack' },
      { id: 'chemistry_full',  subject: 'Chemistry',  questions: 2000, sizeMB: 4.0, type: 'subject_pack' },
      { id: 'physics_full',    subject: 'Physics',    questions: 2000, sizeMB: 4.1, type: 'subject_pack' },
      { id: 'mathematics_full',subject: 'Mathematics',questions: 2000, sizeMB: 3.8, type: 'subject_pack' },
      { id: 'english_full',    subject: 'English',    questions: 1500, sizeMB: 3.0, type: 'subject_pack' }
    ];
  }

  /**
   * Mark a pack as downloaded and store its content.
   * In real implementation, this fetches from CDN/Supabase and stores in IndexedDB.
   */
  async downloadPack(packId, questionsData = []) {
    const pack = ContentPackManager.getAvailablePacks().find(p => p.id === packId);
    if (!pack) throw new Error(`Pack ${packId} not found`);

    const meta = await this._getMeta();
    meta[packId] = {
      downloadedAt: Date.now(),
      ...pack,
      localQuestions: questionsData.length,
      synced: false
    };

    // Store questions in IndexedDB
    for (const q of questionsData) {
      await this.store.put(STORES.QUEUE, {
        ...q,
        packId,
        storedAt: Date.now()
      });
    }

    await this._saveMeta(meta);
    return meta[packId];
  }

  async getDownloadedPacks() {
    const meta = await this._getMeta();
    return Object.values(meta).filter(m => m.downloadedAt);
  }

  async isPackDownloaded(packId) {
    const meta = await this._getMeta();
    return !!meta[packId]?.downloadedAt;
  }

  async getStorageUsage() {
    const packs = await this.getDownloadedPacks();
    const totalMB = packs.reduce((s, p) => s + (p.sizeMB || 0), 0);
    const totalQuestions = packs.reduce((s, p) => s + (p.localQuestions || p.questions || 0), 0);
    return { totalMB: Math.round(totalMB * 10) / 10, totalQuestions, packCount: packs.length };
  }

  async _getMeta() {
    const raw = await this.store.get(STORES.PROFILE, this.packMetaKey);
    return raw || {};
  }

  async _saveMeta(meta) {
    await this.store.put(STORES.PROFILE, { studentId: this.packMetaKey, ...meta });
  }

  /**
   * Get questions for offline practice from downloaded packs.
   */
  async getOfflineQuestions({ subject, topic, count = 20 }) {
    const all = await this.store.getAll(STORES.QUEUE);
    let pool = all;
    if (subject) pool = pool.filter(q => q.subject === subject);
    if (topic) pool = pool.filter(q => q.topic === topic);

    // Shuffle and return
    return pool.sort(() => Math.random() - 0.5).slice(0, count);
  }
}
