import { EncryptStorage } from "encrypt-storage";

const secretKey =
  import.meta.env.VITE_APP_LOCALSTORAGE_KEY || "fallback_development_key_123";

export const encryptedStorage = new EncryptStorage(secretKey, {
  storageType: "localStorage",
  prefix: "hostelXpert",
});
