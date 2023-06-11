import { createHash } from "crypto";

export const encryptPin = (pin) => {
  const hash = createHash("sha256");
  hash.update(pin.toString());
  return hash.digest("hex");
};

export const isEncryptedPinMatch = (encryptedPin, pin) => {
  const encryptedActualPin = encryptPin(pin);
  return encryptedPin === encryptedActualPin;
};
