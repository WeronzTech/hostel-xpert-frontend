import { EncryptStorage } from "encrypt-storage";

const secretKey = import.meta.env.VITE_APP_LOCALSTORAGE_KEY;

export const encryptedStorage = new EncryptStorage(secretKey, {
  storageType: "localStorage",
  prefix: "heavens",
});
