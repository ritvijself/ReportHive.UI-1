import { v4 as uuidv4 } from "uuid";

export function convertMongoIdToUUID(mongoId) {
  // If it's already a valid UUID, return it directly
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(mongoId)) return mongoId;

  // If it's a 24-character hex (Mongo ObjectId)
  if (/^[0-9a-fA-F]{24}$/.test(mongoId)) {
    // Take first 12 bytes (24 hex chars = 12 bytes)
    const padded = mongoId.padEnd(32, "0"); // make it 16 bytes (32 hex chars)
    // Format it as a UUID v4-like string
    return (
      padded.substring(0, 8) +
      "-" +
      padded.substring(8, 12) +
      "-4" + // set version 4 bit
      padded.substring(13, 16) +
      "-" +
      padded.substring(16, 20) +
      "-" +
      padded.substring(20, 32)
    ).toLowerCase();
  }

  // Fallback to random UUID if invalid format
  return uuidv4();
}
