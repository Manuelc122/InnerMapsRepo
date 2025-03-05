import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-indigo-100 p-6 shadow-sm max-h-96 overflow-y-auto text-sm">
      <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text">InnerMaps Privacy Policy</h2>
      <p className="mb-4 text-gray-600">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-4">
        <section>
          <h3 className="font-semibold text-gray-800">1. Introduction</h3>
          <p className="text-gray-600">
            InnerMaps ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains 
            how we collect, use, disclose, and safeguard your information when you use our service. Please read this 
            Privacy Policy carefully. By using the Service, you consent to the data practices described in this policy.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-gray-800">2. Information We Collect</h3>
          <p className="text-gray-600">
            We may collect information about you in various ways, including:
          </p>
          <ul className="list-disc pl-5 text-gray-600 mt-2">
            <li>
              <strong>Personal Data:</strong> Personally identifiable information such as your name, email address, 
              and other information you directly provide when registering or using our Service.
            </li>
            <li>
              <strong>User Content:</strong> Information and content you provide when using the Service, including 
              your reflections, insights, notes, and other materials you create, upload, or share.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you access and use the Service, including your IP 
              address, browser type, device information, pages visited, time spent on pages, and other diagnostic data.
            </li>
            <li>
              <strong>Cookies and Tracking Data:</strong> We use cookies and similar tracking technologies to track 
              activity on our Service and hold certain information to improve and analyze our Service.
            </li>
          </ul>
        </section>
        
        <section>
          <h3 className="font-semibold text-gray-800">3. How We Use Your Information</h3>
          <p className="text-gray-600">
            We may use the information we collect for various purposes, including to:
          </p>
          <ul className="list-disc pl-5 text-gray-600 mt-2">
            <li>Provide, maintain, and improve our Service</li>
            <li>Process transactions and manage your account</li>
            <li>Send you technical notices, updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our Service</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>Personalize and improve your experience with our Service</li>
            <li>Generate anonymized, aggregated data for research and analysis purposes</li>
          </ul>
        </section>
        
        <section>
          <h3 className="font-semibold text-gray-800">4. Data Ownership and Sharing</h3>
          <p className="text-gray-600">
            As detailed in our Terms of Service, while you retain ownership of your User Content, InnerMaps owns all 
            data derived from your use of the Service, including but not limited to usage patterns, feature engagement 
            metrics, and aggregated insights.
          </p>
          <p className="text-gray-600 mt-2">
            We may share your information in the following circumstances:
          </p>
          <ul className="list-disc pl-5 text-gray-600 mt-2">
            <li>
              <strong>With Service Providers:</strong> We may share your information with third-party vendors, 
              service providers, contractors, or agents who perform services for us.
            </li>
            <li>
              <strong>For Business Transfers:</strong> We may share or transfer your information in connection with, 
              or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a 
              portion of our business to another company.
            </li>
            <li>
              <strong>With Your Consent:</strong> We may disclose your personal information for any other purpose 
              with your consent.
            </li>
            <li>
              <strong>For Legal Purposes:</strong> We may disclose your information where required to do so by law 
              or in response to valid requests by public authorities.
            </li>
            <li>
              <strong>To Protect Rights:</strong> We may disclose your information to protect and defend the rights, 
              property, or safety of InnerMaps, our users, or others.
            </li>
          </ul>
        </section>
        
        <section>
          <h3 className="font-semibold text-gray-800">5. Data Security</h3>
          <p className="text-gray-600">
            We implement appropriate technical and organizational measures to protect the security of your personal 
            information. However, please be aware that no method of transmission over the Internet or method of 
            electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your 
            personal information, we cannot guarantee its absolute security.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-gray-800">6. Data Retention</h3>
          <p className="text-gray-600">
            We will retain your personal information only for as long as is necessary for the purposes set out in 
            this Privacy Policy. We will retain and use your information to the extent necessary to comply with our 
            legal obligations, resolve disputes, and enforce our policies.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-gray-800">7. Your Data Protection Rights</h3>
          <p className="text-gray-600">
            Depending on your location, you may have certain rights regarding your personal information, such as:
          </p>
          <ul className="list-disc pl-5 text-gray-600 mt-2">
            <li>The right to access, update, or delete your information</li>
            <li>The right to rectification (to correct inaccurate information)</li>
            <li>The right to object to our processing of your personal information</li>
            <li>The right to restriction (to request that we restrict processing of your personal information)</li>
            <li>The right to data portability (to receive a copy of your personal information)</li>
            <li>The right to withdraw consent</li>
          </ul>
          <p className="text-gray-600 mt-2">
            To exercise these rights, please contact us at privacy@innermaps.com. Note that we may ask you to verify 
            your identity before responding to such requests.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-gray-800">8. Children's Privacy</h3>
          <p className="text-gray-600">
            Our Service is not directed to anyone under the age of 18. We do not knowingly collect personally 
            identifiable information from anyone under the age of 18. If you are a parent or guardian and you are 
            aware that your child has provided us with personal information, please contact us. If we become aware 
            that we have collected personal information from children without verification of parental consent, we 
            take steps to remove that information from our servers.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-gray-800">9. Analytics and Third-Party Services</h3>
          <p className="text-gray-600">
            We may use third-party Service Providers to monitor and analyze the use of our Service. These third 
            parties may have access to your personal information only to perform these tasks on our behalf and are 
            obligated not to disclose or use it for any other purpose.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-gray-800">10. International Data Transfers</h3>
          <p className="text-gray-600">
            Your information may be transferred to — and maintained on — computers located outside of your state, 
            province, country, or other governmental jurisdiction where the data protection laws may differ from 
            those of your jurisdiction. If you are located outside [Your Country] and choose to provide information 
            to us, please note that we transfer the data to [Your Country] and process it there. Your consent to 
            this Privacy Policy followed by your submission of such information represents your agreement to that 
            transfer.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-gray-800">11. Changes to This Privacy Policy</h3>
          <p className="text-gray-600">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy 
            Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted 
            on this page.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-gray-800">12. Contact Us</h3>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact us at privacy@innermaps.com.
          </p>
        </section>
      </div>
    </div>
  );
}

export function PrivacyPolicyAcceptance({ onAccept, onDecline }: { onAccept: () => void, onDecline: () => void }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-indigo-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text">Privacy Policy Agreement</h2>
      <p className="text-gray-600 mb-4">
        Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
      </p>
      
      <div className="mb-6">
        <PrivacyPolicy />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={onDecline}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Decline
        </button>
        <button
          onClick={onAccept}
          className="px-4 py-2 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          I Accept
        </button>
      </div>
    </div>
  );
} 