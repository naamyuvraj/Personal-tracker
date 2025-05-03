"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import React from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  isSameDay,
  subDays,
  startOfMonth,
  endOfMonth,
  getDate,
} from "date-fns";

// Mock data for the application
const MOCK_HABITS = [
  {
    id: 1,
    name: "Sleep",
    icon: "🌙",
    color: "border-blue-500",
    target: 8,
    unit: "hours",
    frequency: "daily",
  },
  {
    id: 2,
    name: "Water",
    icon: "💧",
    color: "border-blue-500",
    target: 8,
    unit: "glasses",
    frequency: "daily",
  },
  {
    id: 3,
    name: "Screen Time",
    icon: "📱",
    color: "border-red-500",
    target: 2,
    unit: "hours",
    frequency: "daily",
  },
  {
    id: 4,
    name: "Meditation",
    icon: "🧘",
    color: "border-green-500",
    target: 15,
    unit: "minutes",
    frequency: "daily",
  },
  {
    id: 5,
    name: "Reading",
    icon: "📚",
    color: "border-yellow-500",
    target: 20,
    unit: "minutes",
    frequency: "daily",
  },
  {
    id: 6,
    name: "Exercise",
    icon: "🏃",
    color: "border-purple-500",
    target: 30,
    unit: "minutes",
    frequency: "3 times a week",
  },
];

// Generate 30 days of mock data for each habit
const generateMockData = () => {
  const today = new Date();
  const data = [];

  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const dateString = format(date, "yyyy-MM-dd");

    const dayData = {
      date: dateString,
      sleep: Math.random() * 3 + 5, // 5-8 hours
      water: Math.floor(Math.random() * 5 + 4), // 4-8 glasses
      screenTime: Math.random() * 4 + 1, // 1-5 hours
      meditation: Math.random() > 0.3 ? Math.floor(Math.random() * 20 + 10) : 0, // 10-30 minutes or 0
      reading: Math.random() > 0.4 ? Math.floor(Math.random() * 30 + 15) : 0, // 15-45 minutes or 0
      exercise: Math.random() > 0.6 ? Math.floor(Math.random() * 45 + 15) : 0, // 15-60 minutes or 0
      completed: {
        sleep: Math.random() > 0.2,
        water: Math.random() > 0.3,
        screenTime: Math.random() > 0.4,
        meditation: Math.random() > 0.5,
        reading: Math.random() > 0.4,
        exercise: Math.random() > 0.6,
      },
    };

    data.push(dayData);
  }

  return data;
};

const MOCK_DATA = generateMockData();

// Generate weekly summary data
const generateWeeklySummary = (data) => {
  const lastSevenDays = data.slice(-7);

  return {
    sleep: {
      average: (
        lastSevenDays.reduce((sum, day) => sum + day.sleep, 0) / 7
      ).toFixed(1),
      daysCompleted: lastSevenDays.filter((day) => day.completed.sleep).length,
    },
    water: {
      average: (
        lastSevenDays.reduce((sum, day) => sum + day.water, 0) / 7
      ).toFixed(1),
      daysCompleted: lastSevenDays.filter((day) => day.completed.water).length,
    },
    screenTime: {
      average: (
        lastSevenDays.reduce((sum, day) => sum + day.screenTime, 0) / 7
      ).toFixed(1),
      daysCompleted: lastSevenDays.filter((day) => day.completed.screenTime)
        .length,
    },
    meditation: {
      average: (
        lastSevenDays.reduce((sum, day) => sum + day.meditation, 0) / 7
      ).toFixed(1),
      daysCompleted: lastSevenDays.filter((day) => day.completed.meditation)
        .length,
    },
    reading: {
      average: (
        lastSevenDays.reduce((sum, day) => sum + day.reading, 0) / 7
      ).toFixed(1),
      daysCompleted: lastSevenDays.filter((day) => day.completed.reading)
        .length,
    },
    exercise: {
      average: (
        lastSevenDays.reduce((sum, day) => sum + day.exercise, 0) / 7
      ).toFixed(1),
      daysCompleted: lastSevenDays.filter((day) => day.completed.exercise)
        .length,
    },
  };
};

// Generate streak data
const calculateStreaks = (data) => {
  const streaks = {
    sleep: 0,
    water: 0,
    screenTime: 0,
    meditation: 0,
    reading: 0,
    exercise: 0,
  };

  // Calculate current streaks
  const habits = Object.keys(streaks);

  habits.forEach((habit) => {
    let currentStreak = 0;

    // Start from the most recent day and go backwards
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].completed[habit]) {
        currentStreak++;
      } else {
        break;
      }
    }

    streaks[habit] = currentStreak;
  });

  return streaks;
};

// Mock achievements
const ACHIEVEMENTS = [
  {
    id: 1,
    name: "Early Bird",
    description: "Log sleep data for 7 consecutive days",
    icon: "🌅",
    unlocked: true,
  },
  {
    id: 2,
    name: "Hydration Master",
    description: "Reach your water goal for 10 days",
    icon: "💧",
    unlocked: true,
  },
  {
    id: 3,
    name: "Digital Detox",
    description: "Keep screen time under target for 5 days",
    icon: "📵",
    unlocked: false,
  },
  {
    id: 4,
    name: "Zen Master",
    description: "Meditate for 15 days in a month",
    icon: "🧘",
    unlocked: false,
  },
  {
    id: 5,
    name: "Bookworm",
    description: "Read for 20 days in a month",
    icon: "📚",
    unlocked: false,
  },
];

// Mock motivational quotes
const MOTIVATIONAL_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Small habits, big results.",
  "Consistency over intensity.",
  "You don't have to be great to start, but you have to start to be great.",
  "Your future is created by what you do today.",
  "The difference between try and triumph is a little umph.",
  "The only way to do great work is to love what you do.",
  "Don't count the days, make the days count.",
  "Success is the sum of small efforts repeated day in and day out.",
];

// Main component
export default function HabitTracker() {
  // State management
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habitData, setHabitData] = useState(MOCK_DATA);
  const [habits, setHabits] = useState(MOCK_HABITS);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [showMotivationalQuote, setShowMotivationalQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [chartMetric, setChartMetric] = useState("sleep");
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(5);
  const [newHabit, setNewHabit] = useState({
    name: "",
    icon: "📝",
    target: 1,
    unit: "times",
    frequency: "daily",
  });
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [streaks, setStreaks] = useState(calculateStreaks(MOCK_DATA));
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedHabitForStreak, setSelectedHabitForStreak] = useState("water");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Don't forget to log your sleep data!",
      time: "2 hours ago",
    },
    {
      id: 2,
      message: "You're on a 5-day streak for water intake!",
      time: "5 hours ago",
    },
    {
      id: 3,
      message: "New achievement unlocked: Early Bird!",
      time: "1 day ago",
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [accentColor, setAccentColor] = useState("blue");
  const [streakView, setStreakView] = useState("weekly");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [profileName, setProfileName] = useState("Yuvraj");
  const [profileEmail, setProfileEmail] = useState("naam.yuvraj@gmail.com");
  const [profileTimeZone, setProfileTimeZone] = useState("Eastern Time (ET)");

  // Refs
  const sidebarRef = useRef(null);

  // Effects
  useEffect(() => {
    // Show a random motivational quote
    const randomQuote =
      MOTIVATIONAL_QUOTES[
        Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
      ];
    setCurrentQuote(randomQuote);

    // Show motivational quote after 3 seconds
    const quoteTimer = setTimeout(() => {
      setShowMotivationalQuote(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setShowMotivationalQuote(false);
      }, 5000);
    }, 3000);

    // Show a reminder after 10 seconds
    const reminderTimer = setTimeout(() => {
      setReminderMessage("Don't forget to log your water intake for today!");
      setShowReminder(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setShowReminder(false);
      }, 5000);
    }, 10000);

    // Clean up timers
    return () => {
      clearTimeout(quoteTimer);
      clearTimeout(reminderTimer);
    };
  }, []);

  // Click outside to close sidebar
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  // Update streaks when habit data changes
  useEffect(() => {
    setStreaks(calculateStreaks(habitData));
  }, [habitData]);

  // Functions
  const getAccentColorClass = (type) => {
    const colorMap = {
      blue: {
        bg: darkMode ? "bg-blue-500" : "bg-blue-600",
        text: darkMode ? "text-blue-500" : "text-blue-600",
        border: darkMode ? "border-blue-500" : "border-blue-600",
        hover: darkMode ? "hover:bg-blue-600" : "hover:bg-blue-700",
        progress: darkMode ? "bg-blue-500" : "bg-blue-600",
      },
      green: {
        bg: darkMode ? "bg-green-500" : "bg-green-600",
        text: darkMode ? "text-green-500" : "text-green-600",
        border: darkMode ? "border-green-500" : "border-green-600",
        hover: darkMode ? "hover:bg-green-600" : "hover:bg-green-700",
        progress: darkMode ? "bg-green-500" : "bg-green-600",
      },
      yellow: {
        bg: darkMode ? "bg-yellow-500" : "bg-yellow-600",
        text: darkMode ? "text-yellow-500" : "text-yellow-600",
        border: darkMode ? "border-yellow-500" : "border-yellow-600",
        hover: darkMode ? "hover:bg-yellow-600" : "hover:bg-yellow-700",
        progress: darkMode ? "bg-yellow-500" : "bg-yellow-600",
      },
      purple: {
        bg: darkMode ? "bg-purple-500" : "bg-purple-600",
        text: darkMode ? "text-purple-500" : "text-purple-600",
        border: darkMode ? "border-purple-500" : "border-purple-600",
        hover: darkMode ? "hover:bg-purple-600" : "hover:bg-purple-700",
        progress: darkMode ? "bg-purple-500" : "bg-purple-600",
      },
    };

    return colorMap[accentColor][type];
  };

  const logHabit = (habitId, value) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const updatedData = [...habitData];
    const todayIndex = updatedData.findIndex((day) => day.date === today);

    if (todayIndex !== -1) {
      const habit = habits.find((h) => h.id === habitId);
      const habitName = habit.name.toLowerCase().replace(/\s+/g, "");

      updatedData[todayIndex][habitName] = value;
      const wasCompleted =
        updatedData[todayIndex].completed?.[habitName] || false;
      updatedData[todayIndex].completed[habitName] = value >= habit.target;

      // Add XP for completing a habit
      if (value >= habit.target && !wasCompleted) {
        setXp((prev) => prev + 10);

        // Level up if XP reaches threshold
        if (xp + 10 >= level * 300) {
          setLevel((prev) => prev + 1);
        }

        // Show motivational quote for exercise or meditation completion
        if (habitName === "exercise" || habitName === "meditation") {
          showTaskCompletionQuote(habitName);
        }
      }

      setHabitData(updatedData);
    }
  };

  const addNewHabit = () => {
    if (newHabit.name.trim() === "") return;

    const habitName = newHabit.name.toLowerCase().replace(/\s+/g, "");

    // Add new habit to habits list
    const newId =
      habits.length > 0 ? Math.max(...habits.map((h) => h.id)) + 1 : 1;
    const habitColors = [
      "border-blue-500",
      "border-green-500",
      "border-yellow-500",
      "border-purple-500",
      "border-pink-500",
    ];
    const randomColor =
      habitColors[Math.floor(Math.random() * habitColors.length)];

    const habitToAdd = {
      id: newId,
      name: newHabit.name,
      icon: newHabit.icon,
      color: randomColor,
      target: newHabit.target,
      unit: newHabit.unit,
      frequency: newHabit.frequency,
    };

    setHabits([...habits, habitToAdd]);

    // Add this habit to all existing data points with default values
    const updatedData = habitData.map((day) => {
      return {
        ...day,
        [habitName]: 0,
        completed: {
          ...day.completed,
          [habitName]: false,
        },
      };
    });

    setHabitData(updatedData);

    // Set the newly added habit as the selected habit for streak
    setSelectedHabitForStreak(habitName);

    // Reset form
    setNewHabit({
      name: "",
      icon: "📝",
      target: 1,
      unit: "times",
      frequency: "daily",
    });

    setShowAddHabit(false);
  };

  const getTodayData = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return habitData.find((day) => day.date === today) || { completed: {} };
  };

  const getSelectedDateData = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return habitData.find((day) => day.date === dateStr) || { completed: {} };
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const isTargetExceeded = (habitName, value) => {
    if (habitName === "screenTime" && value > 2) return true;
    if (habitName === "sleep" && value > 9) return true;
    return false;
  };

  const showTaskCompletionQuote = (habitName) => {
    const exerciseQuotes = [
      "Great job on your workout! Your body thanks you.",
      "Exercise is a celebration of what your body can do!",
      "You're getting stronger every day!",
    ];

    const meditationQuotes = [
      "Meditation is the key to a peaceful mind.",
      "A moment of mindfulness brings a lifetime of clarity.",
      "Your mind is now clearer than before.",
    ];

    if (habitName === "exercise") {
      setCurrentQuote(
        exerciseQuotes[Math.floor(Math.random() * exerciseQuotes.length)]
      );
      setShowMotivationalQuote(true);
      setTimeout(() => setShowMotivationalQuote(false), 5000);
    } else if (habitName === "meditation") {
      setCurrentQuote(
        meditationQuotes[Math.floor(Math.random() * meditationQuotes.length)]
      );
      setShowMotivationalQuote(true);
      setTimeout(() => setShowMotivationalQuote(false), 5000);
    }
  };

  const renderSidebar = () => {
    return (
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 z-40 h-screen w-64 p-4 bg-black text-white border border-gray-800 shadow-lg"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-full hover:bg-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                  activeTab === "dashboard"
                    ? "bg-gray-800"
                    : "hover:bg-gray-800"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("analytics");
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                  activeTab === "analytics"
                    ? "bg-gray-800"
                    : "hover:bg-gray-800"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Analytics</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("habits");
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                  activeTab === "habits" ? "bg-gray-800" : "hover:bg-gray-800"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>My Habits</span>
              </button>

              <button
                onClick={() => {
                  setShowAchievements(true);
                  setSidebarOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                <span>Achievements</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("settings");
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                  activeTab === "settings" ? "bg-gray-800" : "hover:bg-gray-800"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Settings</span>
              </button>
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium mb-2">Goal Customization</h3>
                <button
                  onClick={() => {
                    setShowAddHabit(true);
                    setSidebarOpen(false);
                  }}
                  className={`w-full py-2 px-4 ${getAccentColorClass(
                    "bg"
                  )} text-white rounded-lg ${getAccentColorClass(
                    "hover"
                  )} transition-colors`}
                >
                  Add New Habit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderHeader = () => {
    return (
      <header
        className={`p-4 flex justify-between items-center ${
          darkMode ? "bg-black" : "bg-white"
        } ${darkMode ? "text-white" : "text-gray-900"} border-b ${
          darkMode ? "border-gray-800" : "border-gray-200"
        }`}
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-full ${
              darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Track Me</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setAccentColor("blue")}
              className={`w-6 h-6 rounded-full bg-blue-500 ${
                accentColor === "blue" ? "ring-2 ring-white" : ""
              }`}
            ></button>
            <button
              onClick={() => setAccentColor("green")}
              className={`w-6 h-6 rounded-full bg-green-500 ${
                accentColor === "green" ? "ring-2 ring-white" : ""
              }`}
            ></button>
            <button
              onClick={() => setAccentColor("yellow")}
              className={`w-6 h-6 rounded-full bg-yellow-500 ${
                accentColor === "yellow" ? "ring-2 ring-white" : ""
              }`}
            ></button>
            <button
              onClick={() => setAccentColor("purple")}
              className={`w-6 h-6 rounded-full bg-purple-500 ${
                accentColor === "purple" ? "ring-2 ring-white" : ""
              }`}
            ></button>
          </div>

          <button
            onClick={() => {
              document.body.classList.add("mode-transition");
              setDarkMode(!darkMode);
              setTimeout(() => {
                document.body.classList.remove("mode-transition");
              }, 2000);
            }}
            className={`p-2 rounded-full ${
              darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
          >
            {darkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <span className="text-yellow-500 font-medium border border-yellow-500/30 rounded-full px-3 py-1 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1 text-yellow-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            {xp} XP (Lv. {level})
          </span>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-full ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              } relative`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-80 ${
                  darkMode ? "bg-black" : "bg-white"
                } rounded-lg shadow-lg z-50 overflow-hidden border ${
                  darkMode ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div
                  className={`p-3 border-b ${
                    darkMode ? "border-gray-800" : "border-gray-200"
                  }`}
                >
                  <h3 className="font-medium">Notifications</h3>
                </div>

                {notifications.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b ${
                          darkMode ? "border-gray-800" : "border-gray-200"
                        } flex justify-between items-start`}
                      >
                        <div>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } ${
                              darkMode ? "bg-gray-800" : "bg-gray-100"
                            } p-2 rounded`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    No notifications
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowEditProfile(true)}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white"
          >
            <span>Y</span>
          </button>
        </div>
      </header>
    );
  };

  const Dashboard = React.memo(
    ({ habits, streaks, darkMode, logHabit, getTodayData }) => {
      const todayData = useMemo(() => getTodayData(), [getTodayData]);

      const isTargetExceeded = (habitKey: string, value: number) =>
        value >
        (habits.find(
          (h) => h.name.toLowerCase().replace(/\s+/g, "") === habitKey
        )?.target || 0);

      const renderHabitCard = useCallback(
        (habit) => {
          const habitKey = habit.name.toLowerCase().replace(/\s+/g, "");
          const value = todayData[habitKey] || 0;
          const isCompleted = value >= (habit.target || 0);

          return (
            <motion.div
              key={habit.id}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-lg border ${
                darkMode
                  ? "border-white bg-transparent"
                  : "border-black bg-white"
              }`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{habit.icon}</span>
                  <div>
                    <h3 className="font-medium">{habit.name}</h3>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Target: {habit.target} {habit.unit} ({habit.frequency})
                    </p>
                  </div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isCompleted
                      ? "bg-green-500"
                      : darkMode
                      ? "bg-gray-600"
                      : "bg-gray-300"
                  }`}
                ></div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Progress
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isTargetExceeded(habitKey, value) ? "text-green-500" : ""
                    }`}
                  >
                    {value} / {habit.target} {habit.unit}
                  </span>
                </div>
                <div
                  className={`w-full h-2 ${
                    darkMode ? "bg-gray-800" : "bg-gray-200"
                  } rounded-full overflow-hidden relative`}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      width: `${Math.min(100, (value / habit.target) * 100)}%`,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`h-full rounded-full ${getAccentColorClass(
                      "bg"
                    )}`}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-sm">
                    {streaks[habitKey] || 0} day streak
                  </span>
                </div>

                <div className="flex space-x-1">
                  <button
                    onClick={() => logHabit(habit.id, Math.max(0, value - 1))}
                    className={`w-8 h-8 rounded-full ${
                      darkMode ? "bg-gray-800" : "bg-gray-200"
                    } flex items-center justify-center ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-300"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => logHabit(habit.id, value + 1)}
                    className={`w-8 h-8 rounded-full ${getAccentColorClass(
                      "bg"
                    )} text-white flex items-center justify-center ${getAccentColorClass(
                      "hover"
                    )}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        },
        [todayData, darkMode, streaks, logHabit]
      );

      return (
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {habits.map(renderHabitCard)}
          </div>
        </div>
      );
    }
  );

  const renderCharts = () => {
    // Prepare data for charts
    const last7Days = habitData.slice(-7);
    const chartData = last7Days.map((day) => ({
      date: format(parseISO(day.date), "MMM dd"),
      sleep: day.sleep,
      water: day.water,
      screenTime: day.screenTime,
      meditation: day.meditation,
      reading: day.reading,
      exercise: day.exercise,
    }));

    // Get chart color based on accent color
    const getChartColor = () => {
      const colorMap = {
        blue: "#3b82f6",
        green: "#10b981",
        yellow: "#f59e0b",
        purple: "#8b5cf6",
      };
      return colorMap[accentColor];
    };

    // Light/dark mode stroke color
    const strokeColor = darkMode ? "#fff" : "#000";
    const tooltipBg = darkMode ? "#000" : "#fff";
    const tooltipBorder = darkMode ? "#333" : "#ccc";

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`p-4 rounded-lg border ${
            darkMode ? "border-white" : "border-black"
          } bg-transparent`}
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <div
            className="flex justify-between items-center mb-4"
            style={{ color: darkMode ? "#fff" : "#000" }}
          >
            <h3 className="font-medium">Activity Tracking</h3>
            <select
              value={chartMetric}
              onChange={(e) => setChartMetric(e.target.value)}
              className="text-sm p-1 rounded border"
              style={{
                borderColor: darkMode ? "#4B5563" : "#D1D5DB", // gray-700 or gray-300
                backgroundColor: darkMode ? "#000" : "#fff",
                color: darkMode ? "#fff" : "#000",
              }}
            >
              <option value="sleep">Sleep</option>
              <option value="screenTime">Screen Time</option>
              <option value="meditation">Meditation</option>
              <option value="reading">Reading</option>
              <option value="exercise">Exercise</option>
            </select>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#333" : "#ccc"}
                />
                <XAxis dataKey="date" stroke={strokeColor} />
                <YAxis stroke={strokeColor} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={chartMetric}
                  stroke={getChartColor()}
                  strokeWidth={2}
                  name={`${
                    chartMetric.charAt(0).toUpperCase() + chartMetric.slice(1)
                  } (${
                    chartMetric === "sleep" || chartMetric === "screenTime"
                      ? "hours"
                      : "minutes"
                  })`}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`p-4 rounded-lg border ${
            darkMode ? "border-white" : "border-black"
          } bg-transparent`}
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <h3 className="font-medium mb-4">Water Intake (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#333" : "#ccc"}
                />
                <XAxis dataKey="date" stroke={strokeColor} />
                <YAxis stroke={strokeColor} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                  }}
                />
                <Legend />
                <Bar
                  dataKey="water"
                  name="Water (glasses)"
                  fill={getChartColor()}
                  className="water-bar"
                  shape={(props) => {
                    const { x, y, width, height } = props;
                    return (
                      <g>
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={getChartColor()}
                        />
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          className="water-fill-animation"
                          fill="url(#waterPattern)"
                        />
                      </g>
                    );
                  }}
                />
                <defs>
                  <pattern
                    id="waterPattern"
                    patternUnits="userSpaceOnUse"
                    width="10"
                    height="10"
                    patternTransform="rotate(45)"
                  >
                    <rect
                      width="10"
                      height="10"
                      fill={getChartColor()}
                      fillOpacity="0.3"
                    />
                    <rect
                      width="5"
                      height="5"
                      fill={getChartColor()}
                      fillOpacity="0.5"
                    />
                  </pattern>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    );
  };
  const renderStreakCalendar = () => {
    const today = new Date();
    const days = [];

    if (streakView === "weekly") {
      const startOfCurrentWeek = startOfWeek(today);
      for (let i = 0; i < 7; i++) {
        days.push(addDays(startOfCurrentWeek, i));
      }
    } else {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      let currentDay = monthStart;

      while (currentDay <= monthEnd) {
        days.push(new Date(currentDay));
        currentDay = addDays(currentDay, 1);
      }
    }

    const habitName = selectedHabitForStreak.toLowerCase().replace(/\s+/g, "");
    const streakColor = darkMode ? "bg-gray-800" : "bg-white";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className={`p-4 mb-8 rounded-lg border ${
          darkMode ? "border-white" : "border-black"
        } bg-transparent`}
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Streak Calendar</h3>
          <div className="flex space-x-2">
            <select
              value={selectedHabitForStreak}
              onChange={(e) => setSelectedHabitForStreak(e.target.value)}
              className={`text-sm p-1 rounded border ${
                darkMode
                  ? "border-gray-700 bg-black text-white"
                  : "border-gray-300 bg-white text-black"
              }`}
            >
              <option value="water">Water Intake</option>
              <option value="sleep">Sleep</option>
              <option value="screenTime">Screen Time</option>
              <option value="meditation">Meditation</option>
              <option value="reading">Reading</option>
              <option value="exercise">Exercise</option>
            </select>

            <select
              value={streakView}
              onChange={(e) => setStreakView(e.target.value)}
              className={`text-sm p-1 rounded border ${
                darkMode
                  ? "border-gray-700 bg-black text-white"
                  : "border-gray-300 bg-white text-black"
              }`}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            {streakView === "weekly" ? (
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const dayData = habitData.find((d) => d.date === dateStr);
                  const isCompleted = dayData?.completed?.[habitName] || false;
                  const isToday = isSameDay(day, today);

                  return (
                    <div key={index} className="flex flex-col items-center">
                      <span className="text-xs text-gray-400 mb-1">
                        {format(day, "EEE")}
                      </span>
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm
                          ${
                            isToday
                              ? `border-2 ${getAccentColorClass("border")}`
                              : ""
                          }
                          ${
                            isCompleted
                              ? getAccentColorClass("bg") + " text-white"
                              : streakColor
                          }`}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs text-gray-400 mb-1"
                  >
                    {day}
                  </div>
                ))}

                {Array.from({ length: startOfMonth(today).getDay() }).map(
                  (_, i) => (
                    <div key={`empty-${i}`} className="w-8 h-8"></div>
                  )
                )}

                {days.map((day, index) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const dayData = habitData.find((d) => d.date === dateStr);
                  const isCompleted = dayData?.completed?.[habitName] || false;
                  const isToday = isSameDay(day, today);

                  return (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs
                        ${
                          isToday
                            ? `border ${getAccentColorClass("border")}`
                            : ""
                        }
                        ${
                          isCompleted
                            ? getAccentColorClass("bg") + " text-white"
                            : "bg-gray-800"
                        }`}
                    >
                      {getDate(day)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-l border-gray-700 pl-4">
            <h4 className="font-medium mb-3">Final Analysis</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Current streak: {streaks[habitName] || 0} days</span>
              </div>

              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Completion rate:
                  {Math.round(
                    (habitData.filter((day) => day.completed?.[habitName])
                      .length /
                      habitData.length) *
                      100
                  )}
                  %
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span>
                  Best streak: {Math.max(streaks[habitName] || 0, 1)} days
                </span>
              </div>

              <button
                onClick={() => setShowWeeklySummary(true)}
                className={`mt-4 px-4 py-2 rounded-lg ${getAccentColorClass(
                  "bg"
                )} text-white`}
              >
                View Weekly Summary
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  const renderDatePicker = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className={`p-4 rounded-lg border ${
          darkMode ? "border-white" : "border-black"
        } bg-transparent`}
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-4">Select Date</h3>
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => setSelectedDate(parseISO(e.target.value))}
              className="w-full p-2 rounded border border-gray-700 "
              style={{
                backgroundColor: darkMode ? "#000" : "#fff",
                color: darkMode ? "#fff" : "#000",
              }}
            />

            <div className="mt-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="text-center text-xs text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({
                  length: startOfMonth(selectedDate).getDay(),
                }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-8 h-8"></div>
                ))}

                {Array.from({ length: endOfMonth(selectedDate).getDate() }).map(
                  (_, i) => {
                    const day = new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      i + 1
                    );
                    const isSelected = day.getDate() === selectedDate.getDate();

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(day)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                        ${
                          isSelected
                            ? getAccentColorClass("bg") + " text-white"
                            : "hover:bg-gray-800"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          <div className="border-l border-gray-700 pl-6">
            <h4 className="text-sm font-medium mb-2">
              Data for {format(selectedDate, "MMMM d, yyyy")}
            </h4>

            <div className="space-y-3">
              {habits.map((habit) => {
                const habitName = habit.name.toLowerCase().replace(/\s+/g, "");
                const selectedDateData = getSelectedDateData();
                const value = selectedDateData[habitName] || 0;
                const isCompleted =
                  selectedDateData.completed?.[habitName] || false;

                return (
                  <div
                    key={habit.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{habit.icon}</span>
                      <span>{habit.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`mr-2 ${
                          isCompleted ? "text-green-500" : "text-gray-400"
                        }`}
                      >
                        {value} {habit.unit}
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isCompleted ? "bg-green-500" : "bg-gray-600"
                        }`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAnalytics = () => {
    // Calculate correlations and trends
    const weeklySummary = generateWeeklySummary(habitData);

    // Get data for last 30 days and 30-60 days ago for comparison
    const last30Days = habitData.slice(-30);
    const previous30Days = habitData.slice(-60, -30);

    const sleepAvgCurrent =
      last30Days.reduce((sum, day) => sum + day.sleep, 0) / 30;
    const sleepAvgPrevious =
      previous30Days.reduce((sum, day) => sum + day.sleep, 0) / 30;
    const sleepChange = sleepAvgCurrent - sleepAvgPrevious;

    const screenTimeAvgCurrent =
      last30Days.reduce((sum, day) => sum + day.screenTime, 0) / 30;

    // Calculate correlation between sleep and screen time
    const correlation = last30Days.some(
      (day) => day.screenTime < 3 && day.sleep > 7
    )
      ? "You tend to sleep better on days with less screen time."
      : "No strong correlation found between sleep and screen time.";

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 rounded-lg border border-gray-700 bg-transparent"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <h3 className="font-medium mb-4">Personal Insights</h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${getAccentColorClass("bg")}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Sleep Trend</h4>
                <p className="text-sm text-gray-300">
                  Your average sleep has{" "}
                  {sleepChange > 0 ? "improved" : "decreased"} by{" "}
                  {Math.abs(sleepChange).toFixed(1)} hours compared to the
                  previous month.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${getAccentColorClass("bg")}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Correlation</h4>
                <p className="text-sm text-gray-300">{correlation}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${getAccentColorClass("bg")}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Top Performing Habit</h4>
                <p className="text-sm text-gray-300">
                  Water intake is your most consistent habit with a{" "}
                  {streaks.water} day streak.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${getAccentColorClass("bg")}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Area to Improve</h4>
                <p className="text-sm text-gray-300">
                  Your screen time is averaging{" "}
                  {screenTimeAvgCurrent.toFixed(1)} hours daily, which is above
                  your target of 2 hours.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-4 rounded-lg border border-gray-700 bg-transparent"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <h3 className="font-medium mb-4">Weekly Summary</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Sleep</h4>
                <span className="text-2xl">🌙</span>
              </div>
              <p className="text-2xl font-bold">
                {weeklySummary.sleep.average} hrs
              </p>
              <p className="text-sm text-gray-300">
                Goal met {weeklySummary.sleep.daysCompleted}/7 days
              </p>
            </div>

            <div className="p-3 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Water</h4>
                <span className="text-2xl">💧</span>
              </div>
              <p className="text-2xl font-bold">
                {weeklySummary.water.average} glasses
              </p>
              <p className="text-sm text-gray-300">
                Goal met {weeklySummary.water.daysCompleted}/7 days
              </p>
            </div>

            <div className="p-3 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Screen Time</h4>
                <span className="text-2xl">📱</span>
              </div>
              <p className="text-2xl font-bold">
                {weeklySummary.screenTime.average} hrs
              </p>
              <p className="text-sm text-gray-300">
                Goal met {weeklySummary.screenTime.daysCompleted}/7 days
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderHabits = () => {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 rounded-lg border border-gray-700 bg-transparent"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">My Habits</h3>
            <button
              onClick={() => setShowAddHabit(true)}
              className={`px-3 py-1 ${getAccentColorClass(
                "bg"
              )} text-white rounded-lg ${getAccentColorClass(
                "hover"
              )} transition-colors text-sm`}
            >
              Add New
            </button>
          </div>

          <div className="space-y-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="p-3 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{habit.icon}</span>
                    <div>
                      <h4 className="font-medium">{habit.name}</h4>
                      <p className="text-sm text-gray-400">
                        {habit.target} {habit.unit} ({habit.frequency})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getAccentColorClass(
                        "bg"
                      )}`}
                    ></div>
                    <span className="text-sm">
                      {streaks[habit.name.toLowerCase().replace(/\s+/g, "")] ||
                        0}{" "}
                      day streak
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 rounded-lg border border-gray-700 bg-transparent"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <h3 className="font-medium mb-4">Preferences</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Theme Color</h4>
                <p className="text-sm text-gray-400">
                  Choose your preferred accent color
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setAccentColor("blue")}
                  className={`w-6 h-6 rounded-full bg-blue-500 ${
                    accentColor === "blue" ? "ring-2 ring-white" : ""
                  }`}
                ></button>
                <button
                  onClick={() => setAccentColor("green")}
                  className={`w-6 h-6 rounded-full bg-green-500 ${
                    accentColor === "green" ? "ring-2 ring-white" : ""
                  }`}
                ></button>
                <button
                  onClick={() => setAccentColor("yellow")}
                  className={`w-6 h-6 rounded-full bg-yellow-500 ${
                    accentColor === "yellow" ? "ring-2 ring-white" : ""
                  }`}
                ></button>
                <button
                  onClick={() => setAccentColor("purple")}
                  className={`w-6 h-6 rounded-full bg-purple-500 ${
                    accentColor === "purple" ? "ring-2 ring-white" : ""
                  }`}
                ></button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Dark Mode</h4>
                <p className="text-sm text-gray-400">
                  Toggle between light and dark mode
                </p>
              </div>
              <button
                onClick={() => {
                  document.body.classList.add("mode-transition");
                  setDarkMode(!darkMode);
                  setTimeout(() => {
                    document.body.classList.remove("mode-transition");
                  }, 2000);
                }}
                className={`w-12 h-6 rounded-full flex items-center ${
                  darkMode ? getAccentColorClass("bg") : "bg-gray-400"
                } ${
                  darkMode ? "justify-end" : "justify-start"
                } transition-colors`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mx-0.5"></span>
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Motivational Quotes</h4>
                <p className="text-sm text-gray-400">
                  Show daily motivational quotes
                </p>
              </div>
              <button
                onClick={() => setShowMotivationalQuote(true)}
                className={`w-12 h-6 rounded-full flex items-center ${getAccentColorClass(
                  "bg"
                )} justify-end transition-colors`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mx-0.5"></span>
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Reminders</h4>
                <p className="text-sm text-gray-400">Enable habit reminders</p>
              </div>
              <button
                onClick={() => setShowReminder(true)}
                className={`w-12 h-6 rounded-full flex items-center ${getAccentColorClass(
                  "bg"
                )} justify-end transition-colors`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mx-0.5"></span>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-4 rounded-lg border border-gray-700 bg-transparent"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <h3 className="font-medium mb-4">Account</h3>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl">
                Y
              </div>
              <div>
                <h4 className="font-medium">{profileName}</h4>
                <p className="text-sm text-gray-400">{profileEmail}</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowEditProfile(true)}
                className={`${getAccentColorClass(
                  "text"
                )} hover:underline text-sm`}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderAddHabitModal = () => {
    return (
      <AnimatePresence>
        {showAddHabit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${
              darkMode ? "bg-black bg-opacity-70" : "bg-gray-500 bg-opacity-50"
            } flex items-center justify-center z-50 p-4`}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-lg border ${
                darkMode
                  ? "border-gray-700 bg-black"
                  : "border-gray-300 bg-white"
              } p-6`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <h3 className="text-xl font-bold mb-4">Add New Habit</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={newHabit.name}
                    onChange={(e) =>
                      setNewHabit({ ...newHabit, name: e.target.value })
                    }
                    className={`w-full p-2 rounded border ${
                      darkMode
                        ? "border-gray-700 bg-black"
                        : "border-gray-300 bg-white"
                    }`}
                    placeholder="e.g., Meditation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Icon</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      "📝",
                      "🏃",
                      "🧘",
                      "💧",
                      "📚",
                      "🌙",
                      "🍎",
                      "💪",
                      "🚶",
                      "🧠",
                    ].map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewHabit({ ...newHabit, icon })}
                        className={`p-2 rounded-lg text-xl ${
                          newHabit.icon === icon
                            ? getAccentColorClass("bg")
                            : darkMode
                            ? "bg-gray-800"
                            : "bg-gray-200"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Target
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newHabit.target}
                      onChange={(e) =>
                        setNewHabit({
                          ...newHabit,
                          target: Number.parseInt(e.target.value) || 1,
                        })
                      }
                      className={`w-full p-2 rounded border ${
                        darkMode
                          ? "border-gray-700 bg-black"
                          : "border-gray-300 bg-white"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Unit
                    </label>
                    <select
                      value={newHabit.unit}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, unit: e.target.value })
                      }
                      className={`w-full p-2 rounded border ${
                        darkMode
                          ? "border-gray-700 bg-black"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <option value="times">times</option>
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                      <option value="glasses">glasses</option>
                      <option value="steps">steps</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Frequency
                  </label>
                  <select
                    value={newHabit.frequency}
                    onChange={(e) =>
                      setNewHabit({ ...newHabit, frequency: e.target.value })
                    }
                    className={`w-full p-2 rounded border ${
                      darkMode
                        ? "border-gray-700 bg-black"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="3 times a week">3 times a week</option>
                    <option value="5 times a week">5 times a week</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddHabit(false)}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={addNewHabit}
                  className={`px-4 py-2 ${getAccentColorClass(
                    "bg"
                  )} text-white rounded-lg ${getAccentColorClass("hover")}`}
                  disabled={!newHabit.name.trim()}
                >
                  Add Habit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderWeeklySummaryModal = () => {
    const weeklySummary = generateWeeklySummary(habitData);

    return (
      <AnimatePresence>
        {showWeeklySummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${
              darkMode ? "bg-black bg-opacity-70" : "bg-gray-500 bg-opacity-50"
            } flex items-center justify-center z-50 p-4`}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-lg border ${
                darkMode
                  ? "border-gray-700 bg-black"
                  : "border-gray-300 bg-white"
              } p-6`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Weekly Summary</h3>
                <button
                  onClick={() => setShowWeeklySummary(false)}
                  className={`p-1 rounded-full ${
                    darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-lg">
                  This week you slept an average of{" "}
                  {weeklySummary.sleep.average} hours, hit your water goal{" "}
                  {weeklySummary.water.daysCompleted} times, and kept screen
                  time under target {weeklySummary.screenTime.daysCompleted}{" "}
                  times!
                </p>

                <div
                  className={`p-4 rounded-lg border ${
                    darkMode ? "border-gray-700" : "border-gray-300"
                  }`}
                >
                  <h4 className="font-medium mb-2">Top Performing Habits</h4>
                  <ul className="space-y-1">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>
                        Water intake: {weeklySummary.water.daysCompleted}/7 days
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>
                        Sleep: {weeklySummary.sleep.daysCompleted}/7 days
                      </span>
                    </li>
                  </ul>
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    darkMode ? "border-gray-700" : "border-gray-300"
                  }`}
                >
                  <h4 className="font-medium mb-2">Areas to Improve</h4>
                  <ul className="space-y-1">
                    <li className="flex items-center">
                      <span className="text-yellow-500 mr-2">!</span>
                      <span>
                        Screen time:{" "}
                        {7 - weeklySummary.screenTime.daysCompleted} days over
                        target
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-yellow-500 mr-2">!</span>
                      <span>
                        Meditation: {7 - weeklySummary.meditation.daysCompleted}{" "}
                        days missed
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowWeeklySummary(false)}
                  className={`w-full py-2 ${getAccentColorClass(
                    "bg"
                  )} text-white rounded-lg ${getAccentColorClass("hover")}`}
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderReminderModal = () => {
    return (
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div
              className={`p-4 rounded-lg border ${
                darkMode
                  ? "border-gray-700 bg-black"
                  : "border-gray-300 bg-white"
              } max-w-sm`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-full ${getAccentColorClass("bg")}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Reminder</h4>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } mt-1`}
                  >
                    {reminderMessage}
                  </p>
                </div>
                <button
                  onClick={() => setShowReminder(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderMotivationalQuote = () => {
    return (
      <AnimatePresence>
        {showMotivationalQuote && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 z-50"
          >
            <div
              className={`p-4 rounded-lg border ${
                darkMode
                  ? "border-gray-700 bg-black"
                  : "border-gray-300 bg-white"
              } max-w-sm`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-yellow-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Daily Motivation</h4>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } mt-1`}
                  >
                    {currentQuote}
                  </p>
                </div>
                <button
                  onClick={() => setShowMotivationalQuote(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderAchievementsModal = () => {
    return (
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${
              darkMode ? "bg-black bg-opacity-70" : "bg-gray-500 bg-opacity-50"
            } flex items-center justify-center z-50 p-4`}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-lg border ${
                darkMode
                  ? "border-gray-700 bg-black"
                  : "border-gray-300 bg-white"
              } p-6`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Achievements</h3>
                <button
                  onClick={() => setShowAchievements(false)}
                  className={`p-1 rounded-full ${
                    darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border ${
                      darkMode ? "border-gray-700" : "border-gray-300"
                    } ${achievement.unlocked ? "border-green-500/30" : ""}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          achievement.unlocked
                            ? "bg-green-500/20"
                            : darkMode
                            ? "bg-gray-800"
                            : "bg-gray-200"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <div className="ml-auto">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowAchievements(false)}
                  className={`w-full py-2 ${getAccentColorClass(
                    "bg"
                  )} text-white rounded-lg ${getAccentColorClass("hover")}`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderEditProfileModal = () => {
    return (
      <AnimatePresence>
        {showEditProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${
              darkMode ? "bg-black bg-opacity-70" : "bg-gray-500 bg-opacity-50"
            } flex items-center justify-center z-50 p-4`}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-lg border ${
                darkMode
                  ? "border-gray-700 bg-black"
                  : "border-gray-300 bg-white"
              } p-6`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Edit Profile</h3>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className={`p-1 rounded-full ${
                    darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-white text-2xl">
                    Y
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={`w-full p-2 rounded border ${
                      darkMode
                        ? "border-gray-700 bg-black"
                        : "border-gray-300 bg-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className={`w-full p-2 rounded border ${
                      darkMode
                        ? "border-gray-700 bg-black"
                        : "border-gray-300 bg-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Time Zone
                  </label>
                  <select
                    value={profileTimeZone}
                    onChange={(e) => setProfileTimeZone(e.target.value)}
                    className={`w-full p-2 rounded border ${
                      darkMode
                        ? "border-gray-700 bg-black"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <option>Eastern Time (ET)</option>
                    <option>Central Time (CT)</option>
                    <option>Mountain Time (MT)</option>
                    <option>Pacific Time (PT)</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    // Here we would normally save to a database
                    // For now, just close the modal and show a notification
                    setShowEditProfile(false);
                    setNotifications([
                      {
                        id: Date.now(),
                        message: "Profile updated successfully!",
                        time: "just now",
                      },
                      ...notifications,
                    ]);
                  }}
                  className={`w-full py-2 ${getAccentColorClass(
                    "bg"
                  )} text-white rounded-lg ${getAccentColorClass("hover")}`}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Main render
  const logHabitCallback = useCallback(
    (id, value) => {
      logHabit(id, value);
    },
    [logHabit]
  );

  const getTodayDataMemo = useCallback(() => getTodayData(), [getTodayData]);

  return (
    <div
      className={`min-h-screen pb-6 pt-6 ${
        darkMode ? "bg-black text-white" : "bg-white text-gray-900"
      }`}
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {renderSidebar()}
      {renderHeader()}

      <main className="container mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <>
            {
              <Dashboard
                habits={habits}
                streaks={streaks}
                darkMode={darkMode}
                logHabit={logHabitCallback}
                getTodayData={getTodayDataMemo}
              />
            }
            {renderCharts()}
            {renderStreakCalendar()}
            {renderDatePicker()}
          </>
        )}

        {activeTab === "analytics" && renderAnalytics()}
        {activeTab === "habits" && renderHabits()}
        {activeTab === "settings" && renderSettings()}
      </main>

      {renderAddHabitModal()}
      {renderWeeklySummaryModal()}
      {renderReminderModal()}
      {renderMotivationalQuote()}
      {renderAchievementsModal()}
      {renderEditProfileModal()}
    </div>
  );
}
