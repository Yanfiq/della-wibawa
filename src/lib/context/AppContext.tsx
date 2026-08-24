"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User, ActiveRoute, AppNotification, BusinessProfile } from "@/types";
import { authService } from "@/services/auth.service";
import { notificationService } from "@/services/notification.service";
import { settingsService } from "@/services/settings.service";
import { todayISO } from "@/lib/utils";

export type AppScreen = "landing" | "auth" | "app";
export type AuthMode = "login" | "register";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  body: string;
  onConfirm: () => void;
  confirmLabel?: string;
  isDanger?: boolean;
}

interface AppContextType {
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  currentUser: User | null;
  currentProfile: BusinessProfile | null;
  refreshUser: () => Promise<void>;
  route: ActiveRoute;
  setRoute: (route: ActiveRoute) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isNotifOpen: boolean;
  setIsNotifOpen: (open: boolean) => void;
  notifications: AppNotification[];
  unreadNotifCount: number;
  refreshNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  confirmDialog: ConfirmDialogState;
  showConfirm: (
    title: string,
    body: string,
    onConfirm: () => void,
    confirmLabel?: string,
    isDanger?: boolean
  ) => void;
  hideConfirm: () => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  editingTxId: string | null;
  setEditingTxId: (id: string | null) => void;
  openAuth: (mode?: AuthMode) => void;
  showLanding: () => void;
  enterApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<BusinessProfile | null>(null);
  const [route, setRouteState] = useState<ActiveRoute>("beranda");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    todayISO().slice(0, 7)
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear())
  );
  const [editingTxId, setEditingTxId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    body: "",
    onConfirm: () => {},
    confirmLabel: "Ya, Lanjutkan",
    isDanger: true,
  });

  const refreshUser = useCallback(async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const profile = await settingsService.getProfile(user.id);
      setCurrentProfile(profile);
      await notificationService.pushReminders(user.id);
      const notifs = await notificationService.list(user.id);
      setNotifications(notifs);
    } else {
      setCurrentProfile(null);
      setNotifications([]);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (currentUser) {
      const notifs = await notificationService.list(currentUser.id);
      setNotifications(notifs);
    }
  }, [currentUser]);

  const markAllNotificationsRead = useCallback(async () => {
    if (currentUser) {
      await notificationService.markAllAsRead(currentUser.id);
      await refreshNotifications();
    }
  }, [currentUser, refreshNotifications]);

  const clearNotifications = useCallback(async () => {
    if (currentUser) {
      await notificationService.clearAll(currentUser.id);
      await refreshNotifications();
    }
  }, [currentUser, refreshNotifications]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const setRoute = useCallback((newRoute: ActiveRoute) => {
    setRouteState(newRoute);
    setIsSidebarOpen(false);
    setIsNotifOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const openAuth = useCallback((mode: AuthMode = "login") => {
    setAuthMode(mode);
    setScreen("auth");
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const showLanding = useCallback(() => {
    setScreen("landing");
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const enterApp = useCallback(() => {
    setScreen("app");
    authService.getCurrentUser().then((u) => {
      if (u) {
        setRoute(u.role === "admin" ? "admin" : "beranda");
      }
    });
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [setRoute]);

  const showConfirm = useCallback(
    (
      title: string,
      body: string,
      onConfirm: () => void,
      confirmLabel = "Ya, Lanjutkan",
      isDanger = true
    ) => {
      setConfirmDialog({
        isOpen: true,
        title,
        body,
        onConfirm,
        confirmLabel,
        isDanger,
      });
    },
    []
  );

  const hideConfirm = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        authMode,
        setAuthMode,
        currentUser,
        currentProfile,
        refreshUser,
        route,
        setRoute,
        isSidebarOpen,
        setIsSidebarOpen,
        isNotifOpen,
        setIsNotifOpen,
        notifications,
        unreadNotifCount,
        refreshNotifications,
        markAllNotificationsRead,
        clearNotifications,
        confirmDialog,
        showConfirm,
        hideConfirm,
        selectedPeriod,
        setSelectedPeriod,
        selectedYear,
        setSelectedYear,
        editingTxId,
        setEditingTxId,
        openAuth,
        showLanding,
        enterApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
