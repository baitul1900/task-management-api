// utils/cursor.js
// Short cursor: just use the ObjectId string

export function encodeCursor(id) {
  return id.toString(); // no base64, no date
}

export function decodeCursor(cursor) {
  if (!cursor) return null;
  return { _id: cursor }; // simply return the ObjectId
}
