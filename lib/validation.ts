/**
 * Validation utilities for the application
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMeetingLink = (link: string): boolean => {
  try {
    const url = new URL(link);
    return url.pathname.includes('/meeting/');
  } catch {
    return false;
  }
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
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
  const invalidChars = /[<>:"|?*\x00-\x1f]/g;
  return !invalidChars.test(fileName);
};

export const getMeetingIdFromLink = (link: string): string | null => {
  try {
    const url = new URL(link);
    const parts = url.pathname.split('/');
    const meetingIndex = parts.indexOf('meeting');
    if (meetingIndex !== -1 && meetingIndex + 1 < parts.length) {
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
