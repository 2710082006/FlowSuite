import {
  Menu,
  Bell,
  Search,
  Check,
  Trash2,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../context/useAuth";
import api from "../../services/api";

import "./Header.css";

function Header({ onMenuClick }) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] =
    useState(false);
  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const timeout = setTimeout(() => {
      fetchNotifications();
    }, 0);

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await api.put(
          `/notifications/${notification._id}/read`
        );

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  isRead: true,
                  readAt: new Date(),
                }
              : item
          )
        );

        setUnreadCount((count) =>
          Math.max(count - 1, 0)
        );
      }
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );
    }
  };

  const handleDeleteNotification = async (
    event,
    notificationId
  ) => {
    event.stopPropagation();

    try {
      const notification = notifications.find(
        (item) => item._id === notificationId
      );

      await api.delete(
        `/notifications/${notificationId}`
      );

      setNotifications((current) =>
        current.filter(
          (item) => item._id !== notificationId
        )
      );

      if (notification && !notification.isRead) {
        setUnreadCount((count) =>
          Math.max(count - 1, 0)
        );
      }
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );
    }
  };

  const formatNotificationTime = (date) => {
    if (!date) {
      return "";
    }

    const notificationDate = new Date(date);
    const now = new Date();

    const diff =
      now.getTime() -
      notificationDate.getTime();

    const minutes = Math.floor(
      diff / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d ago`;
    }

    return notificationDate.toLocaleDateString();
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>

        <div className="header-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search anything..."
          />

          <span>⌘ K</span>
        </div>
      </div>

      <div className="header-right">
        <div
          className="fs-notification-wrapper"
          ref={notificationRef}
        >
          <button
            className="header-icon-button"
            aria-label="Notifications"
            onClick={() =>
              setShowNotifications(
                (current) => !current
              )
            }
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="fs-notification-count">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fs-notification-dropdown">
              <div className="fs-notification-panel-header">
                <div className="fs-notification-title-area">
                  <strong>Notifications</strong>

                  {unreadCount > 0 && (
                    <span>
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    className="fs-mark-all-button"
                    onClick={handleMarkAllRead}
                  >
                    <Check size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="fs-notification-list">
                {loadingNotifications ? (
                  <div className="fs-notification-empty">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="fs-notification-empty">
                    <Bell size={24} />

                    <span>
                      No notifications yet
                    </span>
                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <div
                        key={notification._id}
                        className={`fs-notification-item ${
                          notification.isRead
                            ? ""
                            : "fs-notification-unread"
                        }`}
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                      >
                        <div className="fs-notification-content">
                          <strong>
                            {notification.title}
                          </strong>

                          <p>
                            {notification.message}
                          </p>

                          <span>
                            {formatNotificationTime(
                              notification.createdAt
                            )}
                          </span>
                        </div>

                        <button
                          className="fs-notification-delete"
                          aria-label="Delete notification"
                          onClick={(event) =>
                            handleDeleteNotification(
                              event,
                              notification._id
                            )
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  )
                )}
              </div>

              {notifications.length > 0 && (
                <div className="fs-notification-footer">
                  Showing latest{" "}
                  {notifications.length}{" "}
                  notifications
                </div>
              )}
            </div>
          )}
        </div>

        <div className="header-user">
          <div className="header-avatar">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div className="header-user-info">
            <strong>
              {user?.name || "User"}
            </strong>

            <span>
              {user?.role || "Member"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;