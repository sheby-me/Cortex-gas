import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import type { UserProfile } from "@/hooks/use-auth";

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

export function cleanUsername(raw: string): string {
  if (!raw) return "";
  return raw
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]/g, "");
}

/**
 * Checks if a given username is available in Firestore.
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const clean = cleanUsername(username);
  if (!clean || clean.length < 3) return false;

  try {
    const userSnap = await getDoc(doc(db, "usernames", clean));
    return !userSnap.exists();
  } catch (err) {
    console.warn("Username check fallback:", err);
    // Fallback: check users collection
    try {
      const q = query(collection(db, "users"), where("usernameLower", "==", clean));
      const res = await getDocs(q);
      return res.empty;
    } catch {
      return true;
    }
  }
}

/**
 * Registers a unique username document in Firestore for a user.
 */
export async function registerUsername(uid: string, username: string): Promise<boolean> {
  const clean = cleanUsername(username);
  if (!clean) return false;

  const isAvailable = await checkUsernameAvailable(clean);
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
    console.error("Failed to register username:", err);
    return false;
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

  try {
    // Fetch all users to support fuzzy case-insensitive matching in Firestore client
    const snap = await getDocs(collection(db, "users"));
    const results: UserProfile[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      if (data.uid === currentUid) return; // Exclude self

      const uName = (data.username || "").toLowerCase();
      const dName = (data.displayName || "").toLowerCase();
      const uLower = (data.usernameLower || uName).toLowerCase();

      const matchesUsername = cleanQ && uLower.includes(cleanQ);
      const matchesDisplayName = dName.includes(rawQ);

      if (matchesUsername || matchesDisplayName) {
        results.push(data);
      }
    });

    return results;
  } catch (err) {
    console.error("Error searching users in Firestore:", err);
    return [];
  }
}

/**
 * Check if two users are already friends in Firestore.
 */
export async function checkIfFriends(uid1: string, uid2: string): Promise<boolean> {
  if (!uid1 || !uid2) return false;
  try {
    const friendDoc = await getDoc(doc(db, "users", uid1, "friends", uid2));
    return friendDoc.exists();
  } catch (err) {
    console.warn("Error checking friend status:", err);
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
  try {
    // Check outgoing request from uid1 to uid2
    const q1 = query(
      collection(db, "friend_requests"),
      where("fromUid", "==", uid1),
      where("toUid", "==", uid2),
      where("status", "==", "pending"),
    );
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      const first = snap1.docs[0];
      return { id: first.id, ...first.data() } as FriendRequestData;
    }

    // Check incoming request from uid2 to uid1
    const q2 = query(
      collection(db, "friend_requests"),
      where("fromUid", "==", uid2),
      where("toUid", "==", uid1),
      where("status", "==", "pending"),
    );
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      const first = snap2.docs[0];
      return { id: first.id, ...first.data() } as FriendRequestData;
    }

    return null;
  } catch (err) {
    console.warn("Error checking existing requests:", err);
    return null;
  }
}

/**
 * Sends a friend request in Firestore.
 */
export async function sendFriendRequest(
  fromUser: UserProfile,
  toUser: UserProfile,
): Promise<{ success: boolean; message: string }> {
  if (!fromUser?.uid || !toUser?.uid) {
    return { success: false, message: "Invalid user data." };
  }

  if (fromUser.uid === toUser.uid) {
    return { success: false, message: "You cannot send a friend request to yourself." };
  }

  try {
    // Check existing friend status
    const isAlreadyFriend = await checkIfFriends(fromUser.uid, toUser.uid);
    if (isAlreadyFriend) {
      return {
        success: false,
        message: `You are already friends with ${toUser.displayName || toUser.username}.`,
      };
    }

    // Check existing request
    const existingReq = await getExistingRequestBetweenUsers(fromUser.uid, toUser.uid);
    if (existingReq) {
      if (existingReq.fromUid === fromUser.uid) {
        return { success: false, message: "Friend request already sent and pending." };
      } else {
        return {
          success: false,
          message: `${toUser.displayName} has already sent you a friend request. Check your Friend Requests!`,
        };
      }
    }

    // Create friend request document ID
    const requestId = `req_${fromUser.uid}_${toUser.uid}`;
    const reqData: Omit<FriendRequestData, "id"> = {
      fromUid: fromUser.uid,
      toUid: toUser.uid,
      fromUser: {
        uid: fromUser.uid,
        displayName: fromUser.displayName || "Learner",
        username: fromUser.username || "user_" + fromUser.uid.slice(0, 5),
        avatarUrl: fromUser.avatarUrl || null,
        institution: fromUser.institution || null,
        gradeLevel: fromUser.gradeLevel || null,
      },
      toUser: {
        uid: toUser.uid,
        displayName: toUser.displayName || "Learner",
        username: toUser.username || "user_" + toUser.uid.slice(0, 5),
        avatarUrl: toUser.avatarUrl || null,
        institution: toUser.institution || null,
        gradeLevel: toUser.gradeLevel || null,
      },
      status: "pending",
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "friend_requests", requestId), reqData);
    return {
      success: true,
      message: `Friend request sent to ${toUser.displayName || toUser.username}!`,
    };
  } catch (err) {
    console.error("Failed to send friend request:", err);
    return {
      success: false,
      message: "Could not send request right now. Please try again.",
    };
  }
}

/**
 * Subscribes to incoming friend requests in real time via Firestore listener.
 */
export function subscribeIncomingRequests(
  currentUid: string,
  onUpdate: (requests: FriendRequestData[]) => void,
): Unsubscribe {
  if (!currentUid) return () => {};

  const q = query(
    collection(db, "friend_requests"),
    where("toUid", "==", currentUid),
    where("status", "==", "pending"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FriendRequestData[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FriendRequestData);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn("Incoming requests snapshot error:", err);
      onUpdate([]);
    },
  );
}

/**
 * Subscribes to outgoing friend requests in real time via Firestore listener.
 */
export function subscribeOutgoingRequests(
  currentUid: string,
  onUpdate: (requests: FriendRequestData[]) => void,
): Unsubscribe {
  if (!currentUid) return () => {};

  const q = query(
    collection(db, "friend_requests"),
    where("fromUid", "==", currentUid),
    where("status", "==", "pending"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FriendRequestData[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FriendRequestData);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn("Outgoing requests snapshot error:", err);
      onUpdate([]);
    },
  );
}

/**
 * Subscribes to friends list in real time via Firestore listener.
 */
export function subscribeFriendsList(
  currentUid: string,
  onUpdate: (friends: FriendUserData[]) => void,
): Unsubscribe {
  if (!currentUid) return () => {};

  const friendsRef = collection(db, "users", currentUid, "friends");

  return onSnapshot(
    friendsRef,
    (snapshot) => {
      const list: FriendUserData[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...docSnap.data() } as FriendUserData);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn("Friends list snapshot error:", err);
      onUpdate([]);
    },
  );
}

/**
 * Accepts a friend request in Firestore. Adds mutual friend documents and deletes or updates the request.
 */
export async function acceptFriendRequest(request: FriendRequestData): Promise<void> {
  const { id, fromUser, toUser } = request;

  // Add friend to recipient's friends collection
  await setDoc(doc(db, "users", toUser.uid, "friends", fromUser.uid), {
    uid: fromUser.uid,
    displayName: fromUser.displayName,
    username: fromUser.username,
    avatarUrl: fromUser.avatarUrl || null,
    institution: fromUser.institution || null,
    gradeLevel: fromUser.gradeLevel || null,
    since: serverTimestamp(),
  });

  // Add friend to sender's friends collection
  await setDoc(doc(db, "users", fromUser.uid, "friends", toUser.uid), {
    uid: toUser.uid,
    displayName: toUser.displayName,
    username: toUser.username,
    avatarUrl: toUser.avatarUrl || null,
    institution: toUser.institution || null,
    gradeLevel: toUser.gradeLevel || null,
    since: serverTimestamp(),
  });

  // Update request status to accepted (or delete)
  try {
    await updateDoc(doc(db, "friend_requests", id), {
      status: "accepted",
      updatedAt: serverTimestamp(),
    });
  } catch {
    await deleteDoc(doc(db, "friend_requests", id));
  }
}

/**
 * Declines a friend request in Firestore.
 */
export async function declineFriendRequest(requestId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "friend_requests", requestId), {
      status: "declined",
      updatedAt: serverTimestamp(),
    });
  } catch {
    await deleteDoc(doc(db, "friend_requests", requestId));
  }
}

/**
 * Cancels an outgoing friend request in Firestore.
 */
export async function cancelFriendRequest(requestId: string): Promise<void> {
  await deleteDoc(doc(db, "friend_requests", requestId));
}

/**
 * Removes a friend from both users' friends list in Firestore.
 */
export async function removeFriend(uid1: string, uid2: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "users", uid1, "friends", uid2));
  } catch (e) {
    console.warn("Error removing friend uid2 from uid1:", e);
  }
  try {
    await deleteDoc(doc(db, "users", uid2, "friends", uid1));
  } catch (e) {
    console.warn("Error removing friend uid1 from uid2:", e);
  }
}
