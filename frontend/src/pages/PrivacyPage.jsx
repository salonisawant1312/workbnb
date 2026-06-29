import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-800">Privacy Policy</h1>
        <p className="mt-2 text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="glass rounded-2xl border border-white/50 p-8 shadow-float prose prose-slate max-w-none">
        <h2>1. Information We Collect</h2>
        <p>
          We collect information that you provide directly to us when you register for an account, 
          update your profile, list a workspace, book a workspace, or communicate with us. 
          This may include your name, email address, phone number, payment information, and any 
          other information you choose to provide.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect to operate, maintain, and provide the features and 
          functionality of WorkBnB. This includes processing transactions, sending you related 
          information such as confirmations and invoices, and responding to your comments, questions, 
          and requests.
        </p>

        <h2>3. Sharing of Your Information</h2>
        <p>
          We do not share your personal information with third parties without your consent, 
          except as reasonably necessary to provide our services (e.g., sharing host information 
          with a booked guest), to comply with the law, or to protect the rights, property, 
          or safety of WorkBnB, our users, or others.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We take reasonable measures to help protect information about you from loss, theft, 
          misuse and unauthorized access, disclosure, alteration, and destruction. However, no 
          security system is impenetrable, and we cannot guarantee the security of our systems 
          100%.
        </p>

        <h2>5. Your Choices</h2>
        <p>
          You may update, correct, or delete information about you at any time by logging into 
          your online account or by emailing us.
        </p>
      </div>
    </div>
  );
}
