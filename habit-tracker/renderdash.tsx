const renderDashboard = () => {
    const todayData = getTodayData();
      const [flooded, setFlooded] = useState(false);
      const prevWaterValue = useRef(0);
    
      const waterHabit = habits.find(
        (habit) => habit.name.toLowerCase().replace(/\s+/g, "") === "water"
      );
      const waterName = "water";
      const waterValue = todayData[waterName] || 0;
      const target = waterHabit?.target || 0;
    
      // Trigger flood when crossing target
      useEffect(() => {
        if (waterValue >= target && prevWaterValue.current < target) {
          setFlooded(true);
          document.body.style.overflow = "hidden";
          setTimeout(() => {
            setFlooded(false);
            document.body.style.overflow = "auto";
          }, 6000);
        }
        prevWaterValue.current = waterValue;
      }, [waterValue, target]);
    
      return (
        <div className="relative">
          <AnimatePresence>
            {flooded && (
              <motion.div
                className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: { y: '100%' },
                  visible: { y: 0 },
                }}
                transition={{ duration: 6, ease: 'easeInOut' }}
              >
                {/* Water Wave */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 1440 320"
                  preserveAspectRatio="none"
                >
                  <path
                    fill="#3b82f6"
                    fillOpacity="0.7"
                    d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,234.7C672,235,768,213,864,186.7C960,160,1056,128,1152,122.7C1248,117,1344,139,1392,149.3L1440,160L1440,320L0,320Z"
                  />
                </svg>
    
                {/* Bubbles */}
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-white bg-opacity-40 rounded-full"
                    style={{
                      width: `${Math.random() * 16 + 8}px`,
                      height: `${Math.random() * 16 + 8}px`,
                      left: `${Math.random() * 100}%`,
                    }}
                    initial={{ y: '100%', opacity: 0.8 }}
                    animate={{ y: '-20%', opacity: 0 }}
                    transition={{
                      duration: Math.random() * 3 + 3,
                      delay: Math.random() * 2,
                      ease: 'easeOut',
                      repeat: Infinity,
                    }}
                  />
                ))}
    
                {/* Message */}
                <motion.h2
                  className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl font-bold text-white drop-shadow-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                >
                  💧 Water Target Reached!
                </motion.h2>
              </motion.div>
            )}
          </AnimatePresence>
    
          {/* Original Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {habits.map((habit) => {
              const habitKey = habit.name.toLowerCase().replace(/\s+/g, "");
              const value = todayData[habitKey] || 0;
              const isCompleted = value >= (habit.target || 0);
    
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg border ${
                    darkMode ? 'border-white' : 'border-black'
                  } ${darkMode ? 'bg-transparent' : 'bg-white'}`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{habit.icon}</span>
                      <div>
                        <h3 className="font-medium">{habit.name}</h3>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Target: {habit.target} {habit.unit} ({habit.frequency})
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isCompleted
                          ? 'bg-green-500'
                          : darkMode
                          ? 'bg-gray-600'
                          : 'bg-gray-300'
                      }`}
                    ></div>
                  </div>
    
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Progress</span>
                      <span className={`text-sm font-medium ${
                        isTargetExceeded(habitKey, value)
                          ? 'text-red-500'
                          : isCompleted
                          ? 'text-green-500'
                          : ''
                      }`}>
                        {value} / {habit.target} {habit.unit}
                      </span>
                    </div>
                    <div className={`w-full h-2 ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-200'
                    } rounded-full overflow-hidden relative`}>
                      <div
                        className={`h-full rounded-full ${
                          habitKey === 'water' && isCompleted
                            ? 'water-wave-animation'
                            : getAccentColorClass('bg')
                        }`}
                        style={{ width: `${Math.min(100, (value / habit.target) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
    
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm">{streaks[habitKey] || 0} day streak</span>
                    </div>
    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => logHabit(habit.id, Math.max(0, value - 1))}
                        className={`w-8 h-8 rounded-full ${
                          darkMode ? 'bg-gray-800' : 'bg-gray-200'
                        } flex items-center justify-center ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => logHabit(habit.id, value + 1)}
                        className={`w-8 h-8 rounded-full ${getAccentColorClass('bg')} text-white flex items-center justify-center ${getAccentColorClass('hover')}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
}