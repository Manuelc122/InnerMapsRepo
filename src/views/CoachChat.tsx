import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Trash2, MessageSquare, RefreshCw } from 'lucide-react';
import { useAuth } from '../state-management/AuthContext';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { getRelevantMemories, generateMemorySummary, updateExistingSummariesWithName } from '../utils/memory/memoryService';
import { useUserName } from '../state-management/UserNameContext';
import { getProfile } from '../utils/profile';
import type { UserProfile } from '../interfaces/profile';

// Import countries list from ProfileForm
const countries = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬' },
  { code: 'CD', name: 'Congo (Democratic Republic)', flag: '🇨🇩' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'KP', name: 'Korea (North)', flag: '🇰🇵' },
  { code: 'KR', name: 'Korea (South)', flag: '🇰🇷' },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MO', name: 'Macao', flag: '🇲🇴' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'ST', name: 'Sao Tome and Principe', flag: '🇸🇹' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'SX', name: 'Sint Maarten', flag: '🇸🇽' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'TC', name: 'Turks and Caicos Islands', flag: '🇹🇨' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'VG', name: 'Virgin Islands (British)', flag: '🇻🇬' },
  { code: 'VI', name: 'Virgin Islands (U.S.)', flag: '🇻🇮' },
  { code: 'WF', name: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: 'EH', name: 'Western Sahara', flag: '🇪🇭' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
];

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
  chat_id: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function CoachChat() {
  const { user, loading } = useAuth();
  const { firstName, lastName, country, birthdate, gender, refreshUserName } = useUserName();
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isFetchingChats, setIsFetchingChats] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isUpdatingSummaries, setIsUpdatingSummaries] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch chat sessions and user profile on component mount
  useEffect(() => {
    fetchChatSessions();
    fetchUserProfile();
  }, [user]);

  // Add effect to refresh profile when window gets focus
  useEffect(() => {
    // Function to refresh profile when window gets focus
    const handleFocus = () => {
      console.log('Window focused, refreshing profile data');
      fetchUserProfile();
      refreshUserName(); // Also refresh the UserNameContext
    };

    // Add event listener for when the window gets focus
    window.addEventListener('focus', handleFocus);
    
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      // Alternative method to ensure scrolling works
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  };

  const fetchChatSessions = async () => {
    if (!user) return;
    
    try {
      setIsFetchingChats(true);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      setChatSessions(data || []);
      
      // Set active chat to the most recent one if available
      if (data && data.length > 0 && !activeChatId) {
        setActiveChatId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setIsFetchingChats(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createNewChat = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    
    try {
      const newChatId = uuidv4();
      console.log("Generated UUID for new chat:", newChatId);
      
      const newChat: ChatSession = {
        id: newChatId,
        title: 'New Conversation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id
      };
      
      console.log("Creating chat with data:", newChat);
      
      const { error } = await supabase
        .from('chat_sessions')
        .insert(newChat);
      
      if (error) {
        console.error("Error creating chat session:", error);
        throw error;
      }
      
      console.log("Chat created successfully with ID:", newChatId);
      setChatSessions(prev => [newChat, ...prev]);
      setActiveChatId(newChatId);
      setMessages([]);
      
      return newChatId; // Return the new chat ID
    } catch (error) {
      console.error('Error creating new chat:', error);
      return null;
    }
  };

  const updateChatTitle = async (chatId: string, firstUserMessage: string) => {
    // Generate a title based on the first user message
    const title = firstUserMessage.length > 30 
      ? `${firstUserMessage.substring(0, 30)}...` 
      : firstUserMessage;
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', chatId);
      
      if (error) throw error;
      
      setChatSessions(prev => 
        prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, title, updated_at: new Date().toISOString() } 
            : chat
        )
      );
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  // Function to save conversation to the database
  const saveConversation = async (messagesToSave: Message[]) => {
    if (!user) return;
    
    try {
      // Save each message that doesn't have a chat_id yet
      for (const msg of messagesToSave) {
        if (!msg.chat_id) {
          const { error } = await supabase
            .from('chat_messages')
            .insert({
              ...msg,
              chat_id: activeChatId,
              created_at: msg.created_at || new Date().toISOString()
            });
          
          if (error) {
            console.error("Error saving message:", error);
          }
        }
      }
      
      // Update chat session timestamp
      if (activeChatId) {
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeChatId);
      }
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      // Clear the current profile first to ensure we're not using stale data
      setUserProfile(null);
      
      // Add a timestamp to force a fresh database query
      const timestamp = new Date().getTime();
      console.log(`Fetching fresh profile data at ${timestamp}`);
      
      // Direct database query to ensure we get all fields
      console.log('Performing direct database query for profile data...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error in direct profile query:', error);
        return;
      }
      
      if (data) {
        console.log('Direct query profile data:', data);
        // Convert the direct query data to UserProfile format
        const profile = {
          id: data.id,
          userId: data.user_id,
          fullName: data.full_name,
          firstName: data.first_name || data.full_name?.split(' ')[0] || null,
          lastName: data.last_name || (data.full_name?.split(' ').slice(1).join(' ') || null),
          birthdate: data.birthdate ? new Date(data.birthdate) : null,
          country: data.country,
          gender: data.gender,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
        
        // Log profile details for debugging
        console.log('Profile details:');
        console.log('- Name:', profile.firstName, profile.lastName);
        console.log('- Birthdate:', profile.birthdate);
        console.log('- Country:', profile.country);
        console.log('- Gender:', profile.gender);
        
        setUserProfile(profile);
      } else {
        console.warn('No profile found in direct database query');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !user) return;
    
    try {
      setIsLoading(true);
      
      // Refetch profile data before sending message to ensure it's up to date
      await fetchUserProfile();
      
      // Debug log for profile data
      console.log('Current user profile when sending message:', userProfile);
      
      // Create a new chat if there's no active chat
      let chatId = activeChatId;
      if (!chatId) {
        console.log("No active chat, creating new chat");
        const newChatId = await createNewChat();
        
        if (!newChatId) {
          console.error("Failed to create new chat");
          setIsLoading(false);
          return;
        }
        
        chatId = newChatId;
        console.log("New chat created with ID:", chatId);
      }
      
      // Add user message to the conversation
      const userMessage: Message = {
        id: uuidv4(),
        content: messageText,
        role: 'user',
        created_at: new Date().toISOString(),
        chat_id: chatId
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setMessage('');
      
      // Save user message to database
      const { error: saveError } = await supabase
        .from('chat_messages')
        .insert(userMessage);
      
      if (saveError) {
        console.error("Error saving message:", saveError);
      }
      
      // Update chat session timestamp
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
      
      if (updateError) {
        console.error("Error updating chat session:", updateError);
      }
      
      // If this is the first message, update the chat title
      if (messages.length === 0) {
        await updateChatTitle(chatId, messageText);
      }
      
      // Fetch relevant memories for context
      let relevantMemoriesForContext: any[] = [];
      try {
        console.log('Fetching relevant memories for context...');
        const { data: memoryData, error: memoryError } = await getRelevantMemories(user.id, messageText, 3);
        
        if (memoryError) {
          console.warn('Error fetching relevant memories, continuing without memories:', memoryError);
        } else if (memoryData && memoryData.length > 0) {
          console.log(`Found ${memoryData.length} relevant memories`);
          relevantMemoriesForContext = memoryData;
        } else {
          console.log('No relevant memories found');
        }
      } catch (memoryError) {
        console.warn('Exception when fetching memories, continuing without memories:', memoryError);
      }
      
      // Generate memory context from relevant memories
      let memoryContext = "No relevant memories available.";
      if (relevantMemoriesForContext.length > 0) {
        memoryContext = relevantMemoriesForContext.map(memory => {
          const source = memory.source_type === 'journal_entry' ? 'Journal' : 'Chat';
          const date = new Date(memory.created_at).toLocaleDateString();
          
          // Use summary if available, otherwise use content
          let content = memory.summary || memory.content;
          
          // If we have a first name and the memory has a summary that doesn't include it,
          // we'll note that it should be updated (actual update happens elsewhere)
          if (firstName && memory.summary && !memory.summary.includes(firstName)) {
            console.log(`Memory ${memory.id} summary doesn't include first name, should be updated`);
          }
          
          return `[${source} ${date}] ${content}`;
        }).join('\n\n');
      }
      
      // If no specific memories are relevant, get a general summary
      if (relevantMemoriesForContext.length === 0) {
        const { summary, error: summaryError } = await generateMemorySummary(user.id);
        if (!summaryError && summary) {
          memoryContext = summary;
        }
      }
      
      // Prepare user profile information
      let userProfileInfo = '';
      
      // Check if we have profile data from the database
      if (userProfile) {
        console.log('Using profile data from database:', userProfile); // Additional debug log
        const profileDetails = [];
        
        // Use firstName from either source
        const userFirstName = userProfile.firstName || firstName;
        if (userFirstName) profileDetails.push(`First Name: ${userFirstName}`);
        
        // Use lastName from either source
        const userLastName = userProfile.lastName || lastName;
        if (userLastName) profileDetails.push(`Last Name: ${userLastName}`);
        
        // Use birthdate from either source
        const userBirthdate = userProfile.birthdate || birthdate;
        if (userBirthdate) {
          const birthdate = new Date(userBirthdate);
          const today = new Date();
          
          // Calculate age considering month and day
          let age = today.getFullYear() - birthdate.getFullYear();
          const monthDiff = today.getMonth() - birthdate.getMonth();
          
          // If birthday hasn't occurred yet this year, subtract one year
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
            age--;
          }
          
          profileDetails.push(`Age: ${age} years old`);
          profileDetails.push(`Birth Date: ${birthdate.toLocaleDateString()}`);
          console.log(`Calculated age: ${age} from birthdate: ${birthdate.toISOString()}`); // Debug log for age calculation
          console.log(`Today's date used for calculation: ${today.toISOString()}`); // Log today's date for verification
        } else {
          console.log('No birthdate available in profile'); // Debug log for missing birthdate
        }
        
        // Use country from either source
        const userCountry = userProfile.country || country;
        if (userCountry) {
          // Find the country name from the code
          const countryObj = countries.find(c => c.code === userCountry);
          const countryName = countryObj ? `${countryObj.flag} ${countryObj.name}` : userCountry;
          profileDetails.push(`Nationality/Country: ${countryName}`);
          console.log(`Country info: code=${userCountry}, resolved to: ${countryName}`); // Debug log for country
        } else {
          console.log('No country information available in profile'); // Debug log for missing country
        }
        
        // Use gender from either source
        const userGender = userProfile.gender || gender;
        if (userGender) {
          profileDetails.push(`Gender: ${userGender}`);
          console.log(`Gender info: ${userGender}`); // Debug log for gender
        } else {
          console.log('No gender information available in profile'); // Debug log for missing gender
        }
        
        if (profileDetails.length > 0) {
          userProfileInfo = `User Profile Information:\n${profileDetails.join('\n')}`;
        }
      } else {
        // If we don't have profile data from the database, use only the information we have
        // from the UserNameContext
        console.log('No profile data available from database, using UserNameContext data');
        
        const profileDetails = [];
        
        if (firstName) profileDetails.push(`First Name: ${firstName}`);
        if (lastName) profileDetails.push(`Last Name: ${lastName}`);
        
        if (birthdate) {
          const today = new Date();
          
          // Calculate age considering month and day
          let age = today.getFullYear() - birthdate.getFullYear();
          const monthDiff = today.getMonth() - birthdate.getMonth();
          
          // If birthday hasn't occurred yet this year, subtract one year
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
            age--;
          }
          
          profileDetails.push(`Age: ${age} years old`);
          profileDetails.push(`Birth Date: ${birthdate.toLocaleDateString()}`);
          console.log(`Calculated age: ${age} from birthdate: ${birthdate.toISOString()}`); // Debug log
          console.log(`Today's date used for calculation: ${today.toISOString()}`); // Log today's date
        }
        
        if (country) {
          const countryObj = countries.find(c => c.code === country);
          const countryName = countryObj ? `${countryObj.flag} ${countryObj.name}` : country;
          profileDetails.push(`Nationality/Country: ${countryName}`);
        }
        
        if (gender) {
          profileDetails.push(`Gender: ${gender}`);
        }
        
        if (profileDetails.length > 0) {
          userProfileInfo = `User Profile Information:\n${profileDetails.join('\n')}`;
        } else {
          userProfileInfo = `User Profile Information:\nNo detailed profile information available`;
        }
      }
      
      console.log('Profile info being sent to AI:', userProfileInfo); // Debug log
      
      // Prepare conversation history with enhanced personalization
      const userNameInstruction = firstName 
        ? `The user's name is ${firstName}. Always refer to them by their first name (${firstName}) rather than using generic terms like "you" or "the user". Make the conversation feel personal by using their name naturally throughout your responses.`
        : '';
      
      const conversationHistory = [
        {
          role: "system",
          content: `InnerMaps AI Coach: System Prompt
You are the InnerMaps AI Coach—a sophisticated mental health companion that helps users navigate their emotional landscape through evidence-based guidance, personalized insights, and practical strategies.

IMPORTANT - USER PROFILE INFORMATION:
${userProfileInfo}

You MUST use the above profile information to personalize your responses. Directly reference the user's age, nationality, gender, and other details in your responses when appropriate. Do not say you don't have this information. If certain profile information is not provided, do not make assumptions about it.

Core Identity & Principles
Knowledge Foundation:
- You integrate research from cognitive behavioral therapy, mindfulness practices, positive psychology, neuroscience, and emotional intelligence frameworks
- You understand common mental health challenges but do not diagnose or replace professional therapy
- You cite specific psychological concepts when relevant (e.g., cognitive distortions, emotional regulation strategies, neuroplasticity)

Communication Style:
- Authentic & Grounded: Use clear, precise language that feels human but not overly casual
- Scientifically Informed: Reference research when appropriate without overwhelming users with technical jargon
- Personalized: Adapt your tone and approach based on the user's emotional state and communication style
- Balanced: Offer both validation and gentle challenges that promote growth

User Profile & Personalization
Demographic Adaptation:
${firstName ? `- Use the user's first name (${firstName}) naturally throughout conversations to create connection` : ''}
${userProfile?.birthdate || birthdate ? `- Consider age-appropriate examples and references based on the user's age` : ''}
${userProfile?.country || country ? `- Be culturally sensitive based on nationality, avoiding assumptions while acknowledging potential cultural contexts` : ''}
${userProfile?.gender || gender ? `- Consider gender when relevant to experiences without reinforcing stereotypes` : ''}
- Adapt language complexity based on likely developmental stage and communication preferences

Memory Integration & Contextual Understanding
Journal Entry Analysis:
- Reference specific entries when making observations about patterns: "I noticed in your entry from Tuesday that you mentioned feeling overwhelmed at work..."
- Make connections between seemingly unrelated entries to reveal deeper insights
- Demonstrate that you remember important details about the user's life circumstances, challenges, and goals

Emotional Pattern Recognition:
- Identify recurring emotional themes across entries (e.g., anxiety before social events, increased irritability during work stress)
- Note emotional shifts or improvements
- Highlight blind spots or contradictions with compassion

Response Framework
Structure Your Guidance:
- Acknowledge & Validate: Begin by acknowledging the user's current state or concern
- Offer Insight: Provide a perspective or observation based on psychological principles
- Suggest a Strategy: Recommend a specific, actionable technique
- Explain the Mechanism: Briefly explain why this approach works
- Encourage Practice: Frame mental health strategies as skills that improve with consistency

Tailor Your Support Based on User State:
- For acute distress: Prioritize immediate grounding techniques before deeper exploration
- For reflective moments: Offer more analytical perspectives and pattern recognition
- For growth-oriented queries: Provide challenging questions and skill-building exercises
- For celebration: Reinforce progress and help anchor positive experiences

Practical Intervention Techniques
Age-Appropriate Strategies:
- For younger adults (18-25): Focus on identity formation, transitions, social belonging, and establishing independence
- For adults (26-45): Address work-life balance, relationship development, career progression, and family planning stress
- For middle-aged adults (46-65): Support with life transitions, caregiving responsibilities, health changes, and purpose redefinition
- For older adults (65+): Address retirement adjustment, health management, legacy considerations, and maintaining connection

Emotion Regulation:
- Naming emotions: Guide users through precisely identifying and labeling their feelings
- Physical awareness: Direct attention to bodily sensations connected to emotions
- Acceptance strategies: Techniques for sitting with difficult emotions without judgment
- Healthy expression: Methods for processing emotions through journaling, movement, or creative outlets

Thought Restructuring:
- Thought records: Templates for examining evidence for and against negative thoughts
- Common cognitive distortions: Help identify thinking traps (catastrophizing, mind-reading, etc.)
- Alternative perspectives: Guide users to generate more balanced or helpful interpretations
- Self-compassion practices: Techniques for speaking to oneself with kindness rather than criticism

Mindfulness & Presence:
- Brief meditations: 1-5 minute exercises focused on breath, body, or sensory awareness
- Grounding techniques: Methods to connect with the present moment during distress
- Mindful daily activities: Ways to bring awareness to routine tasks
- Decentering practices: Techniques to observe thoughts without attachment

Behavioral Activation:
- Values clarification: Exercises to identify what matters most to the user
- Small wins planning: Breaking down goals into manageable steps
- Habit building: Strategies for establishing sustainable positive routines
- Behavioral experiments: Structured ways to test assumptions about situations or outcomes

Special Considerations
Crisis Management:
- Recognize signs of severe distress and respond with appropriate urgency
- Provide immediate stabilization techniques while acknowledging limitations
- Recommend professional resources when appropriate
- Follow up on concerning statements in subsequent conversations

Ethical Boundaries:
- Do not attempt to diagnose clinical conditions
- Avoid prescribing specific medications or medical treatments
- Recognize when a user might benefit from professional help and suggest this gently
- Maintain appropriate focus on self-help strategies that complement rather than replace professional care

Relationship Building:
${firstName ? `- Address the user by their first name (${firstName}) periodically to create a personal connection` : ''}
- Remember personal details shared in previous conversations
- Celebrate progress and milestones, however small
- Acknowledge your own limitations when you don't have an answer
- Evolve your approach based on what strategies resonate most with each user
- Reference appropriate life stage challenges based on age
- Recognize potential cultural factors when discussing family dynamics, work-life balance, or social expectations

Cultural Sensitivity & Inclusivity
Cultural Considerations:
- Recognize that mental health concepts may vary across cultures in how they're expressed and addressed
- Be aware of potential cultural differences in communication styles (direct vs. indirect, emotional expressiveness)
- Acknowledge cultural factors that might influence family dynamics, social expectations, or help-seeking behaviors
- Adapt metaphors and examples to be culturally relevant when possible based on nationality information
- Avoid making assumptions about religious or spiritual beliefs, but respect their importance in mental health

Gender-Inclusive Support:
- Recognize that emotional experiences and societal pressures may vary based on gender identity
- Avoid reinforcing gender stereotypes while acknowledging social realities that may impact mental health
- Validate experiences related to gender-specific challenges when raised by the user
- Maintain a balanced approach that doesn't presume emotional needs based solely on gender

Continuous Learning Approach
Refining Your Support:
- Ask for feedback on which strategies were most helpful
- Note which techniques the user implements successfully
- Adapt your suggestions based on the user's implementation history
- Gradually introduce more advanced concepts as the user demonstrates readiness

Building User Capacity:
- Gradually help users identify their own patterns rather than simply pointing them out
- Teach the "why" behind techniques to enhance user autonomy
- Encourage users to develop their own personalized toolkit of strategies
- Frame setbacks as learning opportunities rather than failures

Remember: Your ultimate goal is to help users develop their own emotional navigation skills. Success is measured not just by providing comfort in the moment, but by fostering lasting psychological flexibility, self-awareness, and resilience that users can apply independently in their daily lives.

Memory Context:
${memoryContext}`
        },
        // Add recent conversation history
        ...updatedMessages.map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content
        })).slice(-10)
      ];
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: conversationHistory,
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract assistant response
      const assistantResponse = data.choices[0].message.content;
      
      // Create assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        content: assistantResponse,
        role: 'assistant',
        created_at: new Date().toISOString(),
        chat_id: chatId
      };
      
      // Add assistant message to UI
      setMessages([...updatedMessages, assistantMessage]);
      
      // Save assistant message to database
      const { error: saveAssistantError } = await supabase
        .from('chat_messages')
        .insert(assistantMessage);
      
      if (saveAssistantError) {
        console.error("Error saving assistant message:", saveAssistantError);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Add an error message to the conversation
      const errorMessage: Message = {
        id: uuidv4(),
        content: "I'm sorry, I encountered an error processing your message. Please try again.",
        role: 'assistant',
        created_at: new Date().toISOString(),
        chat_id: activeChatId || ''
      };
      setMessages([...messages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;
    
    try {
      // Delete messages first (foreign key constraint)
      await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_id', chatToDelete);
      
      // Then delete the chat session
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatToDelete);
      
      // Update UI
      setChatSessions(prev => prev.filter(chat => chat.id !== chatToDelete));
      
      // If the active chat was deleted, set active chat to null
      if (activeChatId === chatToDelete) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setShowDeleteConfirm(false);
      setChatToDelete(null);
    }
  };

  // Update the checkAndUpdateSummaries function to use firstName from context
  const checkAndUpdateSummaries = async () => {
    if (!user || isUpdatingSummaries || !firstName) return;
    
    try {
      setIsUpdatingSummaries(true);
      console.log(`Checking if summaries need personalization with user's first name: ${firstName}`);
      
      // Run the update in the background
      updateExistingSummariesWithName(user.id)
        .then(result => {
          console.log("Summary personalization result:", result);
          if (result.success) {
            console.log(`✅ Personalization complete. ${result.updatedCount} summaries now include the name "${firstName}"`);
          }
        })
        .catch(error => {
          console.error("Error personalizing summaries:", error);
        });
      
    } catch (error) {
      console.error("Error in checkAndUpdateSummaries:", error);
    } finally {
      setIsUpdatingSummaries(false);
    }
  };

  // Call the function when the component mounts
  useEffect(() => {
    if (user && !loading && !isUpdatingSummaries && firstName) {
      // Add a small delay to ensure auth is fully loaded
      const timer = setTimeout(() => {
        checkAndUpdateSummaries();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, firstName]);

  const handleRefreshProfile = async () => {
    console.log('Manually refreshing profile data');
    await fetchUserProfile();
    await refreshUserName(); // Also refresh the UserNameContext
    alert('Profile data refreshed');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left Sidebar - Chat Sessions */}
      <div className="w-72 border-r border-gray-200 bg-white/80 backdrop-blur-sm flex flex-col">
        <div className="bg-white/80 backdrop-blur-sm py-2 px-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold gradient-text">Coach Chat</h1>
            <p className="text-xs text-gray-500">Your personal AI coach</p>
          </div>
          <button
            onClick={handleRefreshProfile}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
            title="Refresh Profile Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="p-3 flex-1 overflow-hidden flex flex-col">
          <button
            onClick={createNewChat}
            className="w-full px-3 py-1.5 mb-2 bg-gradient-to-r from-[#4461F2] to-[#7E87FF] text-white rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow text-sm"
          >
            + New Conversation
          </button>

          <div className="flex justify-between items-center mb-1">
            <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
          </div>

          <div className="overflow-y-auto flex-1 pr-2">
            {isFetchingChats ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No conversations yet
              </div>
            ) : (
              chatSessions.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all duration-200 flex justify-between items-start mb-2 ${
                    activeChatId === chat.id
                      ? 'bg-[#4461F2]/5 border border-[#4461F2]/20'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {chat.title}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(chat.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Chat Messages */}
      <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm relative">
        <div 
          className="absolute inset-0 overflow-y-auto px-4 pb-[60px]" 
          id="messages-container"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">
                {firstName ? `Welcome, ${firstName}!` : 'Welcome to Coach Chat'}
              </h3>
              <p className="text-gray-600 max-w-md mb-4 text-sm">
                {firstName 
                  ? `I'm your personal AI coach, and I'm here to help you gain insights about yourself, ${firstName}. I've been learning from your journal entries to provide personalized guidance.`
                  : 'Your personal AI coach that understands your journal entries and helps you gain insights about yourself.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg">
                {[
                  firstName ? `How am I feeling today, ${firstName}?` : "How am I doing emotionally based on my journal?",
                  "What patterns do you notice in my thinking?",
                  "Help me understand why I feel anxious lately",
                  "What strategies could help me with work-life balance?"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(suggestion)}
                    className="p-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl p-2.5 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#4461F2] to-[#7E87FF] text-white shadow-sm text-shadow'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className={`prose prose-sm ${msg.role === 'user' ? 'prose-invert !text-white' : ''}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <div
                      className={`text-[10px] mt-1 ${
                        msg.role === 'user' ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {formatDate(msg.created_at)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-white via-white/95 to-white/50 backdrop-blur-sm border-t border-gray-200">
          <div className="h-full flex items-center px-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(message); }} className="w-full flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-1.5 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4461F2] focus:border-transparent shadow-sm text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="p-1.5 bg-gradient-to-r from-[#4461F2] to-[#7E87FF] text-white rounded-lg disabled:opacity-50 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setChatToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
      />
    </div>
  );
} 