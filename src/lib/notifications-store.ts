import {
  getAllNetworkUsers,
  getUserByUsername,
  getUserByUid,
  cleanHandle,
  registerOrUpdateNetworkUser,
  type NetworkUser,
} from "./user-network";

export interface CortexNotification {
  id: string;
  type:
    | "buddy_request"
    | "buddy_accepted"
    | "credit"
    | "sos"
    | "buddy"
    | "achievement"
    | "session"
    | "group_invite";
  title?: string;
  text: string;
  time: string;
  timestamp: number;
  read: boolean;

  // Buddy request metadata
  fromUser?: {
    uid: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    institution?: string;
    role?: string;
    degreeOrStream?: string;
  };
  requestStatus?: "pending" | "accepted" | "declined";
  customNote?: string;
  actionUrl?: string;
}

const STORAGE_KEY_NOTIFS = "cortex_notifications_v1";
const STORAGE_KEY_CONNECTED = "cortex_connected_buddies_v1";

export const NOTIFICATION_EVENT = "cortex_notifications_updated";

function notifyListeners() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATION_EVENT));
  }
}

const INITIAL_SEED_NOTIFICATIONS: CortexNotification[] = [
  {
    id: "notif_seed_1",
    type: "buddy_request",
    title: "Study Buddy Request",
    text: "Aditi Sharma (@aditi_sharma) sent you a connection request.",
    time: "10m ago",
    timestamp: Date.now() - 1000 * 60 * 10,
    read: false,
    fromUser: {
      uid: "b1",
      username: "aditi_sharma",
      displayName: "Aditi Sharma",
      avatarUrl: "https://i.pravatar.cc/150?img=25",
      institution: "IIT Delhi",
      role: "student",
      degreeOrStream: "BS Computer Science",
    },
    requestStatus: "pending",
    customNote:
      "Hey Alex! Saw we both study Data Structures & Algorithms. Let's team up for midterms & practice LeetCode together!",
  },
  {
    id: "notif_seed_2",
    type: "buddy_request",
    title: "Study Buddy Request",
    text: "Rahul Verma (@rahul_verma) sent you a connection request.",
    time: "45m ago",
    timestamp: Date.now() - 1000 * 60 * 45,
    read: false,
    fromUser: {
      uid: "b_2",
      username: "rahul_verma",
      displayName: "Rahul Verma",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      institution: "Stanford University",
      role: "student",
      degreeOrStream: "BS Data Science",
    },
    requestStatus: "pending",
    customNote:
      "Looking for a partner to review OS kernel deadlocks and concurrency homework before Friday!",
  },
  {
    id: "notif_seed_3",
    type: "credit",
    title: "Credits Awarded",
    text: "You earned +45 credits for assisting Nia K. with Operating Systems notes.",
    time: "2h ago",
    timestamp: Date.now() - 1000 * 60 * 120,
    read: false,
  },
  {
    id: "notif_seed_4",
    type: "sos",
    title: "Matching SOS Request",
    text: "3 urgent study SOS alerts match your Machine Learning & PyTorch skills.",
    time: "4h ago",
    timestamp: Date.now() - 1000 * 60 * 240,
    read: true,
  },
  {
    id: "notif_seed_5",
    type: "session",
    title: "Upcoming Session",
    text: "Tutoring session with Dr. Sana Rehman (@dr_sana) starts tomorrow at 4:00 PM.",
    time: "1d ago",
    timestamp: Date.now() - 1000 * 60 * 1440,
    read: true,
  },
];

/** Get all notifications from storage or initial seed */
export function getNotifications(): CortexNotification[] {
  if (typeof window === "undefined") return INITIAL_SEED_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (raw) {
      const parsed: CortexNotification[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.timestamp - a.timestamp);
      }
    }
  } catch {
    // fallback
  }

  // Seed default if empty
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(INITIAL_SEED_NOTIFICATIONS));
  } catch {
    // ignore
  }
  return INITIAL_SEED_NOTIFICATIONS;
}

/** Save notifications to localStorage and dispatch event */
export function saveNotifications(items: CortexNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(items));
    notifyListeners();
  } catch {
    // ignore
  }
}

/** Get list of UIDs of connected buddies */
export function getConnectedBuddyUids(): string[] {
  if (typeof window === "undefined") return ["b_1"]; // Elena Rostova by default
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONNECTED);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  const defaultList = ["b_1"];
  try {
    localStorage.setItem(STORAGE_KEY_CONNECTED, JSON.stringify(defaultList));
  } catch {
    // ignore
  }
  return defaultList;
}

/** Check if user is connected as a buddy */
export function isConnectedBuddy(uidOrHandle: string): boolean {
  const connected = getConnectedBuddyUids();
  if (connected.includes(uidOrHandle)) return true;

  const targetUser = getUserByUsername(uidOrHandle) || getUserByUid(uidOrHandle);
  if (targetUser && connected.includes(targetUser.uid)) return true;

  return false;
}

/** Add user UID to connected buddies list */
export function addConnectedBuddy(uid: string): void {
  const current = getConnectedBuddyUids();
  if (!current.includes(uid)) {
    const updated = [...current, uid];
    localStorage.setItem(STORAGE_KEY_CONNECTED, JSON.stringify(updated));
    notifyListeners();
  }
}

/** Get unread notification count */
export function getUnreadNotificationCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

/** Mark a specific notification as read */
export function markNotificationRead(id: string): void {
  const notifs = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(notifs);
}

/** Mark all notifications as read */
export function markAllNotificationsRead(): void {
  const notifs = getNotifications().map((n) => ({ ...n, read: true }));
  saveNotifications(notifs);
}

/** Delete a single notification */
export function deleteNotification(id: string): void {
  const notifs = getNotifications().filter((n) => n.id !== id);
  saveNotifications(notifs);
}

/** Clear all notifications */
export function clearAllNotifications(): void {
  saveNotifications([]);
}

/**
 * Send a Buddy Request to a target user via UID or @username handle
 */
export function sendBuddyRequest(params: {
  targetUidOrHandle: string;
  customNote?: string;
  senderProfile?: {
    uid: string;
    username?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    institution?: string | null;
    role?: string | null;
    degreeOrStream?: string | null;
  };
}): {
  success: boolean;
  message: string;
  targetUser?: NetworkUser;
  notification?: CortexNotification;
} {
  const { targetUidOrHandle, customNote, senderProfile } = params;
  const rawInput = targetUidOrHandle.trim();

  if (!rawInput) {
    return { success: false, message: "Please enter a valid User ID or @username handle." };
  }

  const handle = cleanHandle(rawInput);
  let targetUser = getUserByUsername(handle) || getUserByUid(rawInput) || getUserByUid(handle);

  // If not found, create a stub record in network if input looks like a valid ID/handle
  if (!targetUser) {
    if (handle.length >= 3) {
      const isCustomId = rawInput.startsWith("user_") || rawInput.startsWith("uid_");
      const displayName = isCustomId
        ? `Learner (${rawInput.slice(0, 8)})`
        : rawInput.replace(/^@/, "");

      targetUser = {
        uid: isCustomId ? rawInput : `uid_${handle}`,
        username: handle,
        displayName,
        role: "student",
        avatarUrl: `https://i.pravatar.cc/150?u=${handle}`,
        institution: "Cortex Global Network",
        online: true,
      };
      registerOrUpdateNetworkUser(targetUser);
    } else {
      return {
        success: false,
        message: `No user found matching ID or handle "${rawInput}". Please check the ID or username.`,
      };
    }
  }

  // Prevent sending request to oneself
  if (
    senderProfile &&
    (targetUser.uid === senderProfile.uid ||
      cleanHandle(targetUser.username) === cleanHandle(senderProfile.username || ""))
  ) {
    return { success: false, message: "You cannot send a buddy request to yourself." };
  }

  // Check if already connected
  if (isConnectedBuddy(targetUser.uid)) {
    return {
      success: false,
      message: `You are already connected as Study Buddies with ${targetUser.displayName} (@${targetUser.username}).`,
      targetUser,
    };
  }

  const existingNotifs = getNotifications();

  // Check if a pending request already exists for this target
  const pending = existingNotifs.find(
    (n) =>
      n.type === "buddy_request" &&
      n.fromUser?.uid === targetUser?.uid &&
      n.requestStatus === "pending",
  );

  if (pending) {
    return {
      success: true,
      message: `A buddy request with ${targetUser.displayName} (@${targetUser.username}) is already pending! Check your notifications.`,
      targetUser,
      notification: pending,
    };
  }

  // Build sender profile object
  const senderInfo = {
    uid: senderProfile?.uid || "demo_user_1",
    username: senderProfile?.username || "alex_morgan",
    displayName: senderProfile?.displayName || "Alex Morgan",
    avatarUrl:
      senderProfile?.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
    institution: senderProfile?.institution || "Stanford University",
    role: senderProfile?.role || "student",
    degreeOrStream: senderProfile?.degreeOrStream || "BS Computer Science & AI",
  };

  // Create new notification record
  const newNotif: CortexNotification = {
    id: `notif_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: "buddy_request",
    title: "Outgoing Buddy Request",
    text: `Buddy request sent to ${targetUser.displayName} (@${targetUser.username}).`,
    time: "Just now",
    timestamp: Date.now(),
    read: false,
    fromUser: {
      uid: targetUser.uid,
      username: targetUser.username,
      displayName: targetUser.displayName,
      avatarUrl: targetUser.avatarUrl,
      institution: targetUser.institution,
      role: targetUser.role,
      degreeOrStream: targetUser.degreeOrStream,
    },
    requestStatus: "pending",
    customNote: customNote?.trim() || `Sent buddy request from @${senderInfo.username}`,
  };

  saveNotifications([newNotif, ...existingNotifs]);

  return {
    success: true,
    message: `Buddy request successfully sent to ${targetUser.displayName} (@${targetUser.username})!`,
    targetUser,
    notification: newNotif,
  };
}

/**
 * Respond to an incoming buddy request (Accept or Decline)
 */
export function respondToBuddyRequest(
  notificationId: string,
  accept: boolean,
): { success: boolean; message: string; user?: NetworkUser } {
  const notifs = getNotifications();
  const index = notifs.findIndex((n) => n.id === notificationId);

  if (index === -1) {
    return { success: false, message: "Notification not found." };
  }

  const targetNotif = notifs[index];
  const fromUser = targetNotif.fromUser;

  if (!fromUser) {
    return { success: false, message: "Invalid request payload." };
  }

  if (accept) {
    // Add to connected buddies
    addConnectedBuddy(fromUser.uid);

    // Update current request status
    notifs[index] = {
      ...targetNotif,
      requestStatus: "accepted",
      read: true,
      text: `You accepted ${fromUser.displayName}'s (@${fromUser.username}) study buddy request.`,
    };

    // Create follow-up notification
    const confirmationNotif: CortexNotification = {
      id: `notif_connected_${Date.now()}`,
      type: "buddy_accepted",
      title: "New Study Buddy Connected 🎉",
      text: `You and ${fromUser.displayName} (@${fromUser.username}) are now Study Buddies! You can now send direct messages.`,
      time: "Just now",
      timestamp: Date.now(),
      read: false,
      fromUser,
      requestStatus: "accepted",
    };

    saveNotifications([confirmationNotif, ...notifs]);

    return {
      success: true,
      message: `Accepted! You and ${fromUser.displayName} (@${fromUser.username}) are now study buddies.`,
      user: getUserByUid(fromUser.uid) || {
        uid: fromUser.uid,
        username: fromUser.username,
        displayName: fromUser.displayName,
        avatarUrl: fromUser.avatarUrl,
        institution: fromUser.institution,
        role: (fromUser.role as "student" | "tutor" | "admin") || "student",
      },
    };
  } else {
    // Decline request
    notifs[index] = {
      ...targetNotif,
      requestStatus: "declined",
      read: true,
      text: `Declined buddy request from ${fromUser.displayName} (@${fromUser.username}).`,
    };

    saveNotifications(notifs);

    return {
      success: true,
      message: `Declined request from ${fromUser.displayName}.`,
    };
  }
}
