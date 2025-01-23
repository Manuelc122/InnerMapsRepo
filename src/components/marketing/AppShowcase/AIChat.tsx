import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

export function AIChat() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm text-gray-600">
                I've noticed you've been writing about work-life balance lately. Would you like to explore what an ideal balance looks like for you?
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm text-gray-600">
                Yes, I've been struggling with setting boundaries...
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm text-gray-600">
                Setting boundaries can be challenging. Let's break this down - what specific situations make it hardest for you to maintain boundaries?
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <button className="p-2 bg-blue-600 text-white rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">AI Companion Chat</h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          Have meaningful conversations with your AI companion that help you gain deeper insights from your journal entries.
        </p>
        <ul className="space-y-4">
          <Feature
            icon={Sparkles}
            title="Contextual Understanding"
            description="Your AI companion understands your journal entries and provides personalized guidance"
          />
          <Feature
            icon={MessageSquare}
            title="Natural Conversations"
            description="Engage in flowing, natural dialogue that helps you explore your thoughts"
          />
        </ul>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, description }: {
  icon: typeof Sparkles;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="w-5 h-5 text-blue-500" />
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </li>
  );
}