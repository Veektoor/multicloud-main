/**
 * Validation utilities for the application
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMeetingLink = (link: string): boolean => {
  try {
    const url = new URL(link, 'https://momeet.local');
    const parts = url.pathname.split('/').filter(Boolean);
    const meetingIndex = parts.indexOf('meeting');

    return Boolean(
      meetingIndex !== -1 &&
        parts[meetingIndex + 1] &&
        /^[a-zA-Z0-9_-]+$/.test(parts[meetingIndex + 1]),
    );
  } catch {
    return false;
  }
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s+()-]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateFileSize = (
  fileSize: number,
  maxSizeMB: number = 2
): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
};

export const validateFileName = (fileName: string): boolean => {
  const invalidChars = new Set(['<', '>', ':', '"', '|', '?', '*']);
  return !Array.from(fileName).some(
    (character) => invalidChars.has(character) || character.charCodeAt(0) < 32,
  );
};

export const getMeetingIdFromLink = (link: string): string | null => {
  try {
    const url = new URL(link, 'https://momeet.local');
    const parts = url.pathname.split('/').filter(Boolean);
    const meetingIndex = parts.indexOf('meeting');
    if (
      meetingIndex !== -1 &&
      meetingIndex + 1 < parts.length &&
      /^[a-zA-Z0-9_-]+$/.test(parts[meetingIndex + 1])
    ) {
      return parts[meetingIndex + 1];
    }
  } catch {
    // Continue
  }
  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
