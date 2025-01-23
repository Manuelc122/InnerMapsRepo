interface ReminderSettings {
  enabled: boolean;
  time: string;
  days: string[];
}

const ReminderSetup = () => {
  return (
    <div className="bg-white/80 rounded-xl p-6 border border-gray-100">
      <h3 className="text-lg font-medium mb-4">Journal Reminders</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Remind me to write</label>
          <Switch />
        </div>
        <input
          type="time"
          className="rounded-lg border-gray-200"
        />
        <div className="flex gap-2">
          {['S','M','T','W','T','F','S'].map(day => (
            <button className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100">
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 