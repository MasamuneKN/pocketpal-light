import * as RNFS from '@dr.pogodin/react-native-fs';
import {v4 as uuidv4} from 'uuid';

const CHAT_IMAGES_DIRECTORY = `${RNFS.DocumentDirectoryPath}/chat-images`;

const toAbsolutePath = (uri: string): string => {
  if (uri.startsWith('file://')) {
    return decodeURIComponent(uri.slice('file://'.length));
  }

  if (uri.startsWith('/')) {
    return uri;
  }

  throw new Error(`Unsupported gallery image URI: ${uri}`);
};

const getFileExtension = (uri: string): string => {
  const pathname = uri.split(/[?#]/, 1)[0];
  const filename = pathname.slice(pathname.lastIndexOf('/') + 1);
  return filename.match(/\.[a-z0-9]{1,8}$/i)?.[0]?.toLowerCase() ?? '.jpg';
};

/**
 * Copy gallery images out of the picker's cache into persistent app storage.
 * Chat history stores these returned file URIs, so they must not point at a
 * cache directory that Android may clear independently of the database.
 */
export const persistChatImages = async (
  imageUris: string[],
): Promise<string[]> => {
  if (imageUris.length === 0) {
    return [];
  }

  const sourcePaths = imageUris.map(toAbsolutePath);
  for (const sourcePath of sourcePaths) {
    if (!(await RNFS.exists(sourcePath))) {
      throw new Error(`Selected gallery image does not exist: ${sourcePath}`);
    }
  }

  if (!(await RNFS.exists(CHAT_IMAGES_DIRECTORY))) {
    await RNFS.mkdir(CHAT_IMAGES_DIRECTORY);
  }

  const destinationPaths: string[] = [];
  try {
    for (const uri of imageUris) {
      const destinationPath = `${CHAT_IMAGES_DIRECTORY}/${uuidv4()}${getFileExtension(uri)}`;
      destinationPaths.push(destinationPath);
      await RNFS.copyFile(
        sourcePaths[destinationPaths.length - 1],
        destinationPath,
      );
    }

    return destinationPaths.map(path => `file://${path}`);
  } catch (error) {
    await Promise.all(
      destinationPaths.map(path => RNFS.unlink(path).catch(() => undefined)),
    );
    throw error;
  }
};


/**
 * Remove deleted-message images only when no remaining database message
 * references them. Only direct children of the app-owned chat-images folder
 * are eligible; arbitrary file paths from message metadata are never unlinked.
 */
export const removeUnreferencedChatImages = async (
  candidateUris: string[],
  referencedUris: string[],
): Promise<void> => {
  if (candidateUris.length === 0) {
    return;
  }

  const referencedPaths = new Set<string>();
  for (const uri of referencedUris) {
    try {
      referencedPaths.add(toAbsolutePath(uri));
    } catch {
      // Ignore unrelated URI schemes; they cannot identify an app-owned file.
    }
  }

  const candidatePaths = new Set<string>();
  const managedPrefix = `${CHAT_IMAGES_DIRECTORY}/`;
  for (const uri of candidateUris) {
    try {
      const path = toAbsolutePath(uri);
      const relativePath = path.startsWith(managedPrefix)
        ? path.slice(managedPrefix.length)
        : '';
      if (
        relativePath.length > 0 &&
        !relativePath.includes('/') &&
        !relativePath.includes('\\')
      ) {
        candidatePaths.add(path);
      }
    } catch {
      // Ignore unsupported or malformed candidate URIs.
    }
  }

  for (const path of candidatePaths) {
    if (referencedPaths.has(path)) {
      continue;
    }

    try {
      if (await RNFS.exists(path)) {
        await RNFS.unlink(path);
      }
    } catch (error) {
      // Database deletion has already succeeded; cleanup is best-effort.
      console.warn(`Failed to remove orphaned chat image: ${path}`, error);
    }
  }
};
