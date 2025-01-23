import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Brain, TrendingUp, Clock, Activity, ChevronRight } from 'lucide-react';
import { Feature } from './Feature';

// Sample data for the charts
const moodData = [
  { name: 'Positive', value: 145, color: '#4ADE80' },
  { name: 'Neutral', value: 89, color: '#60A5FA' },
  { name: 'Challenging', value: 67, color: '#F87171' },
];

const timeData = [
  { name: 'Morning', entries: 78 },
  { name: 'Afternoon', entries: 92 },
  { name: 'Evening', entries: 85 },
  { name: 'Night', entries: 46 },
];

const energyData = [
  { date: 'Jan', energy: 7, intensity: 6 },
  { date: 'Feb', energy: 6, intensity: 8 },
  { date: 'Mar', energy: 8, intensity: 7 },
  { date: 'Apr', energy: 7, intensity: 6 },
  { date: 'May', energy: 8, intensity: 7 },
  { date: 'Jun', energy: 9, intensity: 8 },
];

const volumeData = [
  { date: 'Jan', words: 2450 },
  { date: 'Feb', words: 3100 },
  { date: 'Mar', words: 2800 },
  { date: 'Apr', words: 3400 },
  { date: 'May', words: 3800 },
  { date: 'Jun', words: 4200 },
];

export function JournalAnalytics() {
  return (
    <div className="space-y-12">
      {/* Header Section with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
        <div className="relative z-10">
          <h3 className="text-3xl font-bold mb-4">Journal Analytics</h3>
          <p className="text-lg opacity-90 max-w-2xl">
            Gain deep insights into your journaling patterns and emotional trends with our comprehensive analytics dashboard.
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <MetricCard
              title="Total Entries"
              value="301"
              trend="+12 this week"
              icon={Brain}
            />
            <MetricCard
              title="Total Words"
              value="19,750"
              trend="+450 today"
              icon={TrendingUp}
            />
            <MetricCard
              title="Avg. Words/Entry"
              value="65"
              trend="↑ 8% vs last month"
              icon={Activity}
            />
            <MetricCard
              title="Most Active Time"
              value="afternoon"
              trend="trending upward"
              icon={Clock}
            />
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <Feature
          icon={Brain}
          title="Pattern Recognition"
          description="Track your emotional patterns and writing habits over time"
        />
        <Feature
          icon={TrendingUp}
          title="Growth Metrics"
          description="Monitor your progress with detailed analytics and insights"
        />
        <Feature
          icon={Activity}
          title="Energy Tracking"
          description="Understand your energy levels and their impact on your day"
        />
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* First Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Mood Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Mood Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moodData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                >
                  {moodData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {moodData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Writing Time Patterns */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Writing Time Patterns</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="entries" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Energy & Intensity Trends */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Energy & Intensity Trends</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#F59E0B" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="intensity" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#4F46E5" }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                <span className="text-sm text-gray-600">Energy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4F46E5]"></div>
                <span className="text-sm text-gray-600">Intensity</span>
              </div>
            </div>
          </div>

          {/* Writing Volume Trends */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Writing Volume Trends</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="words" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#10B981" }}
                  name="Total Words"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                <span className="text-sm text-gray-600">Total Words</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon }: { 
  title: string; 
  value: string; 
  trend: string;
  icon: typeof Brain;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <h5 className="font-medium text-sm opacity-90">{title}</h5>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-75">{trend}</p>
    </div>
  );
} 