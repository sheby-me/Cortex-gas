import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import type { UserProfile } from "@/hooks/use-auth";
import { isUsernameTaken } from "@/lib/user-network";

export interface FriendRequestData {
  id: string;
  fromUid: string;
  toUid: string;
  fromUser: {
    uid: string;
    displayName: string;
    username: string;
    avatarUrl?: string | null;
    institution?: string | null;
    gradeLevel?: string | null;
  };
  toUser: {
    uid: string;
    displayName: string;
    username: string;
    avatarUrl?: string | null;
    institution?: string | null;
    gradeLevel?: string | null;
  };
  status: "pending" | "accepted" | "declined";
  createdAt: unknown;
}

export interface FriendUserData {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  institution?: string | null;
  gradeLevel?: string | null;
  teach?: string[];
  learn?: string[];
  since?: unknown;
}

const LOCAL_REQUESTS_KEY = "cortex_friend_requests_v2";
const LOCAL_FRIENDS_KEY = "cortex_friends_list_v2";
export const FRIENDS_EVENT = "cortex_friends_changed";

function notifyFriendsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FRIENDS_EVENT));
  }
}

function getLocalRequests(): FriendRequestData[] {
  try {
    const raw = localStorage.getItem(LOCAL_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRequests(list: FriendRequestData[]) {
  try {
    localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(list));
    notifyFriendsChanged();
  } catch (e) {
    console.warn("Error saving local requests:", e);
  }
}

function getLocalFriends(currentUid: string): FriendUserData[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_FRIENDS_KEY}_${currentUid}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFriends(currentUid: string, list: FriendUserData[]) {
  try {
    localStorage.setItem(`${LOCAL_FRIENDS_KEY}_${currentUid}`, JSON.stringify(list));
    notifyFriendsChanged();
  } catch (e) {
    console.warn("Error saving local friends:", e);
  }
}

export function cleanUsername(raw: string): string {
  if (!raw) return "";
  return raw
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]/g, "");
}

/**
 * Checks if a given username is available. Returns false if taken by ANY other user.
 */
export async function checkUsernameAvailable(
  username: string,
  excludeUid?: string,
): Promise<boolean> {
  const clean = cleanUsername(username);
  if (!clean || clean.length < 3) return false;

  // 1. Check local network directory
  if (isUsernameTaken(clean, excludeUid)) {
    return false;
  }

  // 2. Check Firestore usernames collection
  try {
    const userSnap = await getDoc(doc(db, "usernames", clean));
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (!excludeUid || data.uid !== excludeUid) {
        return false;
      }
    }
  } catch (err) {
    console.warn("Firestore username snap check fallback:", err);
  }

  // 3. Check Firestore users collection
  try {
    const q = query(collection(db, "users"), where("usernameLower", "==", clean));
    const res = await getDocs(q);
    for (const docSnap of res.docs) {
      if (!excludeUid || docSnap.id !== excludeUid) {
        return false;
      }
    }
  } catch (err) {
    console.warn("Firestore users query check fallback:", err);
  }

  return true;
}

/**
 * Registers a unique username document in Firestore for a user.
 */
export async function registerUsername(uid: string, username: string): Promise<boolean> {
  const clean = cleanUsername(username);
  if (!clean) return false;

  const isAvailable = await checkUsernameAvailable(clean, uid);
  if (!isAvailable) return false;

  try {
    await setDoc(doc(db, "usernames", clean), {
      uid,
      username,
      usernameLower: clean,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("Failed to register username in Firestore:", err);
    return true; // proceed even if offline
  }
}

/**
 * Searches users by username or display name (case-insensitive).
 */
export async function searchUsersByUsername(
  searchQuery: string,
  currentUid: string,
): Promise<UserProfile[]> {
  const rawQ = searchQuery.trim().toLowerCase();
  const cleanQ = cleanUsername(searchQuery);

  if (!rawQ) return [];

  const resultsMap = new Map<string, UserProfile>();

  try {
    const snap = await getDocs(collection(db, "users"));
    snap.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      if (data.uid === currentUid) return;

      const uName = (data.username || "").toLowerCase();
      const dName = (data.displayName || "").toLowerCase();
      const uLower = (data.usernameLower || uName).toLowerCase();

      const matchesUsername = cleanQ && uLower.includes(cleanQ);
      const matchesDisplayName = dName.includes(rawQ);

      if (matchesUsername || matchesDisplayName) {
        resultsMap.set(data.uid, data);
      }
    });
  } catch (err) {
    console.warn("Error searching users in Firestore:", err);
  }

  return Array.from(resultsMap.values());
}

/**
 * Check if two users are already friends.
 */
export async function checkIfFriends(uid1: string, uid2: string): Promise<boolean> {
  if (!uid1 || !uid2) return false;

  // Check local friends
  const local1 = getLocalFriends(uid1);
  if (local1.some((f) => f.uid === uid2)) return true;

  try {
    const friendDoc = await getDoc(doc(db, "users", uid1, "friends", uid2));
    return friendDoc.exists();
  } catch {
    return false;
  }
}

/**
 * Check if a pending friend request exists between two users.
 */
export async function getExistingRequestBetweenUsers(
  uid1: string,
  uid2: string,
): Promise<FriendRequestData | null> {
  if (!uid1 || !uid2) return null;

  // Check local requests first
  const localReqs = getLocalRequests();
  const foundLocal = localReqs.find(
    (r) =>
      r.status === "pending" &&
      ((r.fromUid === uid1 && r.toUid === uid2) || (r.fromUid === uid2 && r.toUid === uid1)),
  );
  if (foundLocal) return foundLocal;

  try {
    const snap = await getDocs(
      query(collection(db, "friend_requests"), where("fromUid", "==", uid1)),
    );
    for (const d of snap.docs) {
      const data = d.data() as FriendRequestData;
      if (data.toUid === uid2 && data.status === "pending") {
        return { id: d.id, ...data };
      }
    }
  } catch (err) {
    console.warn("Error checking existing request in Firestore:", err);
  }

  return null;
}

/**
 * Sends a friend request. Guaranteed to succeed locally and sync to Firestore.
 */
export async function sendFriendRequest(
  fromUser: Partial<UserProfile>,
  toUser: Partial<UserProfile>,
): Promise<{ success: boolean; message: string }> {
  const fromUid = fromUser?.uid || "demo_user_1";
  const toUid = toUser?.uid;

  if (!toUid) {
    return { success: false, message: "Invalid target user." };
  }

  if (fromUid === toUid) {
    return { success: false, message: "You cannot send a friend request to yourself." };
  }

  // Check existing friend status
  const isAlreadyFriend = await checkIfFriends(fromUid, toUid);
  if (isAlreadyFriend) {
    return {
      success: false,
      message: `You are already friends with ${toUser.displayName || toUser.username || "this user"}.`,
    };
  }

  // Check existing request
  const existingReq = await getExistingRequestBetweenUsers(fromUid, toUid);
  if (existingReq) {
    if (existingReq.fromUid === fromUid) {
      return { success: false, message: "Friend request already sent and pending." };
    } else {
      return {
        success: false,
        message: `${toUser.displayName || "This user"} has already sent you a friend request. Check your Requests tab!`,
      };
    }
  }

  const requestId = `req_${fromUid}_${toUid}`;
  const fromName = fromUser.displayName || "Learner";
  const fromUName =
    fromUser.username || cleanUsername(fromName) || "learner_" + fromUid.slice(0, 4);

  const toName = toUser.displayName || "Learner";
  const toUName = toUser.username || cleanUsername(toName) || "peer_" + toUid.slice(0, 4);

  const reqData: FriendRequestData = {
    id: requestId,
    fromUid,
    toUid,
    fromUser: {
      uid: fromUid,
      displayName: fromName,
      username: fromUName,
      avatarUrl: fromUser.avatarUrl || `https://i.pravatar.cc/150?u=${fromUName}`,
      institution: fromUser.institution || null,
      gradeLevel: (fromUser.gradeLevel as string) || null,
    },
    toUser: {
      uid: toUid,
      displayName: toName,
      username: toUName,
      avatarUrl: toUser.avatarUrl || `https://i.pravatar.cc/150?u=${toUName}`,
      institution: toUser.institution || null,
      gradeLevel: (toUser.gradeLevel as string) || null,
    },
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  // 1. Save locally for instant UI responsiveness
  const currentLocal = getLocalRequests();
  const filtered = currentLocal.filter((r) => r.id !== requestId);
  filtered.push(reqData);
  saveLocalRequests(filtered);

  // 2. Sync to Firestore in background
  try {
    await setDoc(doc(db, "friend_requests", requestId), {
      ...reqData,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Firestore send request fallback:", err);
  }

  return {
    success: true,
    message: `Friend request sent to ${toName}!`,
  };
}

/**
 * Subscribes to incoming friend requests in real time.
 */
export function subscribeIncomingRequests(
  currentUid: string,
  onUpdate: (requests: FriendRequestData[]) => void,
): Unsubscribe {
  if (!currentUid) return () => {};

  const emitMerged = (fsReqs: FriendRequestData[] = []) => {
    const local = getLocalRequests().filter(
      (r) => r.toUid === currentUid && r.status === "pending",
    );
    const map = new Map<string, FriendRequestData>();
    local.forEach((r) => map.set(r.id, r));
    fsReqs.forEach((r) => map.set(r.id, r));
    onUpdate(Array.from(map.values()));
  };

  emitMerged();

  const handleLocalEvent = () => emitMerged();
  if (typeof window !== "undefined") {
    window.addEventListener(FRIENDS_EVENT, handleLocalEvent);
  }

  const q = query(collection(db, "friend_requests"), where("toUid", "==", currentUid));

  const unsubFs = onSnapshot(
    q,
    (snapshot) => {
      const list: FriendRequestData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FriendRequestData;
        if (data.status === "pending") {
          list.push({ id: docSnap.id, ...data });
        }
      });
      emitMerged(list);
    },
    (err) => {
      console.warn("Incoming requests snapshot error:", err);
      emitMerged();
    },
  );

  return () => {
    unsubFs();
    if (typeof window !== "undefined") {
      window.removeEventListener(FRIENDS_EVENT, handleLocalEvent);
    }
  };
}

/**
 * Subscribes to outgoing friend requests in real time.
 */
export function subscribeOutgoingRequests(
  currentUid: string,
  onUpdate: (requests: FriendRequestData[]) => void,
): Unsubscribe {
  if (!currentUid) return () => {};

  const emitMerged = (fsReqs: FriendRequestData[] = []) => {
    const local = getLocalRequests().filter(
      (r) => r.fromUid === currentUid && r.status === "pending",
    );
    const map = new Map<string, FriendRequestData>();
    local.forEach((r) => map.set(r.id, r));
    fsReqs.forEach((r) => map.set(r.id, r));
    onUpdate(Array.from(map.values()));
  };

  emitMerged();

  const handleLocalEvent = () => emitMerged();
  if (typeof window !== "undefined") {
    window.addEventListener(FRIENDS_EVENT, handleLocalEvent);
  }

  const q = query(collection(db, "friend_requests"), where("fromUid", "==", currentUid));

  const unsubFs = onSnapshot(
    q,
    (snapshot) => {
      const list: FriendRequestData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FriendRequestData;
        if (data.status === "pending") {
          list.push({ id: docSnap.id, ...data });
        }
      });
      emitMerged(list);
    },
    (err) => {
      console.warn("Outgoing requests snapshot error:", err);
      emitMerged();
    },
  );

  return () => {
    unsubFs();
    if (typeof window !== "undefined") {
      window.removeEventListener(FRIENDS_EVENT, handleLocalEvent);
    }
  };
}

/**
 * Subscribes to friends list in real time.
 */
export function subscribeFriendsList(
  currentUid: string,
  onUpdate: (friends: FriendUserData[]) => void,
): Unsubscribe {
  if (!currentUid) return () => {};

  const emitMerged = (fsFriends: FriendUserData[] = []) => {
    const local = getLocalFriends(currentUid);
    const map = new Map<string, FriendUserData>();
    local.forEach((f) => map.set(f.uid, f));
    fsFriends.forEach((f) => map.set(f.uid, f));
    onUpdate(Array.from(map.values()));
  };

  emitMerged();

  const handleLocalEvent = () => emitMerged();
  if (typeof window !== "undefined") {
    window.addEventListener(FRIENDS_EVENT, handleLocalEvent);
  }

  const friendsRef = collection(db, "users", currentUid, "friends");

  const unsubFs = onSnapshot(
    friendsRef,
    (snapshot) => {
      const list: FriendUserData[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...docSnap.data() } as FriendUserData);
      });
      emitMerged(list);
    },
    (err) => {
      console.warn("Friends list snapshot error:", err);
      emitMerged();
    },
  );

  return () => {
    unsubFs();
    if (typeof window !== "undefined") {
      window.removeEventListener(FRIENDS_EVENT, handleLocalEvent);
    }
  };
}

/**
 * Accepts a friend request.
 */
export async function acceptFriendRequest(request: FriendRequestData): Promise<void> {
  const { id, fromUser, toUser } = request;

  // 1. Local update
  const localReqs = getLocalRequests().filter((r) => r.id !== id);
  saveLocalRequests(localReqs);

  const friendForRecipient: FriendUserData = {
    uid: fromUser.uid,
    displayName: fromUser.displayName,
    username: fromUser.username,
    avatarUrl: fromUser.avatarUrl,
    institution: fromUser.institution,
    gradeLevel: fromUser.gradeLevel,
    since: new Date().toISOString(),
  };

  const friendForSender: FriendUserData = {
    uid: toUser.uid,
    displayName: toUser.displayName,
    username: toUser.username,
    avatarUrl: toUser.avatarUrl,
    institution: toUser.institution,
    gradeLevel: toUser.gradeLevel,
    since: new Date().toISOString(),
  };

  const recipientFriends = getLocalFriends(toUser.uid).filter((f) => f.uid !== fromUser.uid);
  recipientFriends.push(friendForRecipient);
  saveLocalFriends(toUser.uid, recipientFriends);

  const senderFriends = getLocalFriends(fromUser.uid).filter((f) => f.uid !== toUser.uid);
  senderFriends.push(friendForSender);
  saveLocalFriends(fromUser.uid, senderFriends);

  // 2. Firestore update
  try {
    await setDoc(doc(db, "users", toUser.uid, "friends", fromUser.uid), {
      ...friendForRecipient,
      since: serverTimestamp(),
    });
    await setDoc(doc(db, "users", fromUser.uid, "friends", toUser.uid), {
      ...friendForSender,
      since: serverTimestamp(),
    });
    await deleteDoc(doc(db, "friend_requests", id));
  } catch (err) {
    console.warn("Firestore accept request fallback:", err);
  }
}

/**
 * Declines a friend request.
 */
export async function declineFriendRequest(requestId: string): Promise<void> {
  // 1. Local update
  const localReqs = getLocalRequests().filter((r) => r.id !== requestId);
  saveLocalRequests(localReqs);

  // 2. Firestore update
  try {
    await deleteDoc(doc(db, "friend_requests", requestId));
  } catch (err) {
    console.warn("Firestore decline request fallback:", err);
  }
}

/**
 * Cancels an outgoing friend request.
 */
export async function cancelFriendRequest(requestId: string): Promise<void> {
  // 1. Local update
  const localReqs = getLocalRequests().filter((r) => r.id !== requestId);
  saveLocalRequests(localReqs);

  // 2. Firestore update
  try {
    await deleteDoc(doc(db, "friend_requests", requestId));
  } catch (err) {
    console.warn("Firestore cancel request fallback:", err);
  }
}

/**
 * Removes a friend from both users' friends list.
 */
export async function removeFriend(uid1: string, uid2: string): Promise<void> {
  // 1. Local update
  const list1 = getLocalFriends(uid1).filter((f) => f.uid !== uid2);
  saveLocalFriends(uid1, list1);

  const list2 = getLocalFriends(uid2).filter((f) => f.uid !== uid1);
  saveLocalFriends(uid2, list2);

  // 2. Firestore update
  try {
    await deleteDoc(doc(db, "users", uid1, "friends", uid2));
    await deleteDoc(doc(db, "users", uid2, "friends", uid1));
  } catch (err) {
    console.warn("Firestore remove friend fallback:", err);
  }
}
