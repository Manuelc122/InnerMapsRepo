import React, { useEffect, useState } from 'react';
import { getAnalytics, type AnalyticsData } from '../lib/analytics';
import { 
  LineChart, Line, PieChart, Pie, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  ResponsiveContainer 
} from 'recharts';

function getMoodEmoji(mood: string): string {
  const moodEmojis: Record<string, string> = {
    'Happy': '😊',
    'Sad': '😢',
    'Anxious': '😰',
    'Calm': '😌',
    'Energetic': '⚡',
    'Tired': '😴',
    'Frustrated': '😤',
    'Grateful': '🙏',
    'Inspired': '✨',
    'Overwhelmed': '😩',
    'Confident': '💪',
    'Loved': '❤️',
    'Confused': '😕',
    'Strong': '💪',
    'Relaxed': '😎',
    'Exhausted': '😫',
    'Hurt': '💔',
    'Unwell': '🤒'
  };
  return moodEmojis[mood] || '😐';
}

function getMostFrequentMoodByTime(analytics: AnalyticsData): string {
  const timeDistribution = analytics.timeOfDayDistribution;
  const mostActiveTime = Object.entries(timeDistribution)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
  // You would need to add logic to track moods by time in your analytics
  // This is a placeholder return
  return 'most energetic';
}

function getMostActiveTime(analytics: AnalyticsData): string {
  const timeDistribution = analytics.timeOfDayDistribution;
  const mostActiveTime = Object.entries(timeDistribution)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  const timeLabels = {
    morning: 'mornings (5-11 AM)',
    afternoon: 'afternoons (12-4 PM)',
    evening: 'evenings (5-8 PM)',
    night: 'nights (9 PM-4 AM)'
  };
  
  return timeLabels[mostActiveTime as keyof typeof timeLabels];
}

export function AnalysisPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState<30 | 90 | 180>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAnalytics(timeframe);
        
        if (mounted) {
          if (!data) {
            setError('Failed to load analytics data');
          } else {
            setAnalytics(data);
          }
        }
      } catch (err) {
        if (mounted) {
          setError('An error occurred while loading analytics');
          console.error('Analytics error:', err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, [timeframe]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#4461F2] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-center mt-6 text-gray-500">Analyzing your journal entries...</p>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalEntries === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Journal Entries Yet</h2>
            <p className="text-gray-600 mb-6">Start writing journal entries to see your analytics and insights.</p>
            <a 
              href="/journal" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="mr-2">Write Your First Entry</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Colors for charts
  const COLORS = ['#4461F2', '#22C55E', '#F59E0B', '#EF4444'];
  const MOOD_COLORS = {
    positive: '#22C55E',
    challenging: '#EF4444',
    energy: '#F59E0B'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Journal Analytics</h1>
            <p className="text-gray-600 mt-2">
              Insights from your journaling journey
              {analytics.lastAnalyzedAt && (
                <span className="text-sm text-gray-400 ml-2">
                  · Last updated {new Date(analytics.lastAnalyzedAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value) as 30 | 90 | 180)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700"
          >
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={180}>Last 180 Days</option>
          </select>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Entries', value: analytics.totalEntries },
            { label: 'Total Words', value: analytics.totalWords.toLocaleString() },
            { label: 'Avg. Words/Entry', value: analytics.averageWordsPerEntry },
            { label: 'Most Active Time', value: Object.entries(analytics.timeOfDayDistribution)
              .reduce((a, b) => a[1] > b[1] ? a : b)[0] }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mood Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.moodsByCategory).map(([key, value]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {Object.keys(MOOD_COLORS).map((key, index) => (
                    <Cell key={`cell-${index}`} fill={MOOD_COLORS[key as keyof typeof MOOD_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Time of Day Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Writing Time Patterns</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(analytics.timeOfDayDistribution).map(([key, value]) => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                entries: value
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="entries" fill="#4461F2" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Energy and Intensity Over Time */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy & Intensity Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  type="category"
                  data={analytics.energyOverTime}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  data={analytics.energyOverTime}
                  dataKey="energy" 
                  stroke="#F59E0B" 
                  name="Energy"
                />
                <Line 
                  type="monotone" 
                  data={analytics.intensityOverTime}
                  dataKey="intensity" 
                  stroke="#4461F2" 
                  name="Intensity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Word Count Trends */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Writing Volume Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.wordCountOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#22C55E" 
                  name="Word Count"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotional Analysis Section */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotional Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Most Frequent Emotions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Most Frequent Emotions</h4>
              <div className="space-y-2">
                {Object.entries(analytics.moodDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([mood, count]) => (
                    <div key={mood} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getMoodEmoji(mood)}</span>
                        <span className="text-sm font-medium text-gray-700">{mood}</span>
                      </div>
                      <span className="text-sm text-gray-500">{count} times</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Emotional Balance */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Emotional Balance</h4>
              <div className="space-y-3">
                {Object.entries(analytics.moodsByCategory).map(([category, count]) => {
                  const percentage = Math.round(
                    (count / Object.values(analytics.moodsByCategory).reduce((a, b) => a + b, 0)) * 100
                  );
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{category}</span>
                        <span className="text-gray-700 font-medium">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: MOOD_COLORS[category as keyof typeof MOOD_COLORS]
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emotional Insights */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Key Insights</h4>
              <div className="space-y-3">
                {/* Average Mood Intensity */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-500">🎯</span>
                    <span className="text-sm font-medium text-gray-700">Average Intensity</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your emotions tend to be felt at 
                    <span className="font-medium"> {analytics.averageMoodIntensity}/5 </span> 
                    intensity
                  </p>
                </div>

                {/* Energy Level Pattern */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500">⚡</span>
                    <span className="text-sm font-medium text-gray-700">Energy Levels</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your average energy level is
                    <span className="font-medium"> {analytics.averageEnergyLevel}/5</span>
                  </p>
                </div>

                {/* Time Pattern */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-purple-500">🕒</span>
                    <span className="text-sm font-medium text-gray-700">Time Patterns</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    You tend to feel most {getMostFrequentMoodByTime(analytics)} during 
                    {' '}{getMostActiveTime(analytics)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Qualitative Analysis Section */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Your Patterns & Insights</h3>
            <span className="text-sm text-gray-500">{analytics.totalEntries} entries analyzed</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Thought Patterns */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Thought Patterns</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {analytics.thoughtPatterns[0]}
              </p>
            </div>

            {/* Growth Areas */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Growth Areas</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {analytics.growthAreas[0]}
              </p>
            </div>

            {/* Core Values */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Core Values</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {analytics.coreValues[0]}
              </p>
            </div>

            {/* Strengths */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Strengths</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {analytics.strengths[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Personality Profile Section */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Personality Profile</h3>
          </div>

          {/* Summary - Full width blue background */}
          <div className="bg-blue-50/50 rounded-xl p-4">
            <p className="text-gray-700 leading-relaxed">
              {analytics.personalityProfile.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 