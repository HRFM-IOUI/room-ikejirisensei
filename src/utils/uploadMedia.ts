// utils/uploadMedia.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadMediaFile(file: File, pathPrefix = "chatUploads") {
  const storage = getStorage();
  const ext = file.name.split(".").pop()?.toLowerCase();
  const type = file.type.startsWith("image") ? "image" :
               file.type.startsWith("video") ? "video" : "unknown";

  // 拡張子/サイズバリデーション
  if (
    !["jpg", "jpeg", "png", "gif", "mp4"].includes(ext || "") ||
    file.size > 20 * 1024 * 1024
  ) {
    throw new Error("対応ファイル: jpg, png, gif, mp4（20MBまで）");
  }

  const fileName = `${pathPrefix}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, type, ext };
}
