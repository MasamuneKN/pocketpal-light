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
      await RNFS.copyFile(sourcePaths[destinationPaths.length - 1], destinationPath);
    }

    return destinationPaths.map(path => `file://${path}`);
  } catch (error) {
    await Promise.all(
      destinationPaths.map(path => RNFS.unlink(path).catch(() => undefined)),
    );
    throw error;
  }
};
