'use client';

import type { MeetingDocument } from './meeting';

const MINUTE_FILES_STORAGE_KEY = 'momeet-minute-files';

type MinuteFilesStore = Record<string, MeetingDocument[]>;

function readStore(): MinuteFilesStore {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(MINUTE_FILES_STORAGE_KEY);
    if (!raw) return {};

    return JSON.parse(raw) as MinuteFilesStore;
  } catch (error) {
    console.error('Failed to read minute files from storage:', error);
    return {};
  }
}

function writeStore(store: MinuteFilesStore) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(MINUTE_FILES_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Failed to save minute files to storage:', error);
  }
}

export function mergeMeetingDocuments(
  left: MeetingDocument[],
  right: MeetingDocument[],
) {
  const merged = [...left];

  right.forEach((document) => {
    const alreadyExists = merged.some(
      (currentDocument) =>
        currentDocument.name === document.name &&
        currentDocument.uploadedAt === document.uploadedAt &&
        currentDocument.dataUrl === document.dataUrl,
    );

    if (!alreadyExists) {
      merged.push(document);
    }
  });

  return merged.sort(
    (currentDocument, nextDocument) =>
      new Date(nextDocument.uploadedAt).getTime() -
      new Date(currentDocument.uploadedAt).getTime(),
  );
}

export function getStoredMinuteFiles(callId: string | undefined) {
  if (!callId) return [];

  const store = readStore();
  return store[callId] || [];
}

export function saveStoredMinuteFiles(callId: string, files: MeetingDocument[]) {
  const store = readStore();
  store[callId] = files;
  writeStore(store);
}
