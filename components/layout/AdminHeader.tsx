"use client";

import React, { useState, useEffect } from 'react';

export default function AdminHeader() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: "New enrollment", description: "John Doe enrolled in React Course", time: "2 min ago", read: false, type: "enrollment" },
    { id: 2, title: "Assignment submitted", description: "Assignment #3 submitted by Sarah", time: "1 hour ago", read: false, type: "assignment" },
    { id: 3, title: "Course completed", description: "Jane completed JavaScript Basics", time: "2 hours ago", read: true, type: "completion" },
    { id: 4, title: "System update", description: "System maintenance scheduled for tonight", time: "1 day ago", read: true, type: "system" },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "enrollment":
        return "icon-[tabler--user-plus]";
      case "assignment":
        return "icon-[tabler--file-text]";
      case "completion":
        return "icon-[tabler--trophy]";
      case "system":
        return "icon-[tabler--settings]";
      default:
        return "icon-[tabler--bell]";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "enrollment":
        return "text-blue-600 bg-blue-50";
      case "assignment":
        return "text-green-600 bg-green-50";
      case "completion":
        return "text-purple-600 bg-purple-50";
      case "system":
        return "text-amber-600 bg-amber-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Menu button and Search */}
          <div className="flex items-center flex-1">
            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 lg:hidden"
              aria-label="Open sidebar"
            >
              <span className="icon-[tabler--menu-2] size-5"></span>
            </button>

            {/* Search */}
            <div className="hidden lg:flex items-center ml-4 flex-1 max-w-md">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="icon-[tabler--search] size-5 text-gray-400"></span>
                </div>
                <input
                  type="text"
                  placeholder="Search users, courses, or reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Right side - Actions and User menu */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <span className="icon-[tabler--sun] size-5"></span>
              ) : (
                <span className="icon-[tabler--moon] size-5"></span>
              )}
            </button>

            {/* Quick actions dropdown */}
            <div className="relative">
              <button
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                aria-label="Quick actions"
              >
                <span className="icon-[tabler--bolt] size-5"></span>
              </button>
            </div>

            {/* Notifications dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 relative"
                aria-label="Notifications"
              >
                <span className="icon-[tabler--bell] size-5"></span>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications dropdown panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                              <span className={`size-4 ${getNotificationIcon(notification.type)}`}></span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {notification.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href="/admin/notifications"
                      className="block text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName || "User"} {user?.lastName || ""}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role?.toLowerCase() || "Admin"}
                  </p>
                </div>
                <span className="icon-[tabler--chevron-down] size-4 text-gray-400"></span>
              </button>

              {/* User dropdown panel */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.firstName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <a
                      href="/admin/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <span className="icon-[tabler--user] size-5"></span>
                      <span>My Profile</span>
                    </a>
                    
                    <a
                      href="/admin/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <span className="icon-[tabler--settings] size-5"></span>
                      <span>Settings</span>
                    </a>
                    
                    <a
                      href="/admin/help"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <span className="icon-[tabler--help] size-5"></span>
                      <span>Help & Support</span>
                    </a>
                  </div>
                  
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <span className="icon-[tabler--logout] size-5"></span>
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="lg:hidden px-4 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="icon-[tabler--search] size-5 text-gray-400"></span>
          </div>
          <input
            type="text"
            placeholder="Search users, courses, or reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}