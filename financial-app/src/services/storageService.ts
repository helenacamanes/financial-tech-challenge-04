import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "./firebaseConfig";

export type LocalAttachmentInput = {
  uri: string;
  name: string;
  mimeType?: string | null;
};

export type UploadedAttachment = {
  url: string;
  path: string;
  name: string;
  contentType?: string | null;
};

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]/g, "_");
}

async function uriToBlob(uri: string) {
  const response = await fetch(uri);
  return await response.blob();
}

export async function uploadTransactionAttachment(
  uid: string,
  transactionId: string,
  attachment: LocalAttachmentInput,
): Promise<UploadedAttachment> {
  const safeName = sanitizeFileName(attachment.name);
  const path = `users/${uid}/transactions/${transactionId}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);

  const blob = await uriToBlob(attachment.uri);

  await uploadBytes(storageRef, blob, {
    contentType: attachment.mimeType ?? blob.type ?? undefined,
  });

  const url = await getDownloadURL(storageRef);

  return {
    url,
    path,
    name: attachment.name,
    contentType: attachment.mimeType ?? blob.type ?? undefined,
  };
}

export async function deleteAttachmentByPath(path?: string | null) {
  if (!path) return;
  await deleteObject(ref(storage, path));
}
