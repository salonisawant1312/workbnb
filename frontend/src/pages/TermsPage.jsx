import React from 'react';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-800">Terms of Service</h1>
        <p className="mt-2 text-slate-500">Effective Date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="glass rounded-2xl border border-white/50 p-8 shadow-float prose prose-slate max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the WorkBnB platform, you agree to be bound by these Terms of Service. 
          If you do not agree to all the terms and conditions of this agreement, then you may not access 
          the website or use any services.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          WorkBnB provides an online marketplace that connects hosts who have workspaces to rent with 
          guests seeking to book those workspaces. You understand and agree that WorkBnB is not a party 
          to any agreements entered into between hosts and guests.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          To access certain features of the service, you must register for an account. You are responsible 
          for maintaining the confidentiality of your account and password and for restricting access to 
          your computer, and you agree to accept responsibility for all activities that occur under your 
          account or password.
        </p>

        <h2>4. Prohibited Conduct</h2>
        <p>
          You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, 
          or impairs the service. You may not use the service to transmit any material that is defamatory, 
          offensive, or of an obscene or menacing character.
        </p>

        <h2>5. Termination</h2>
        <p>
          We may terminate or suspend access to our service immediately, without prior notice or liability, 
          for any reason whatsoever, including without limitation if you breach the Terms.
        </p>

        <h2>6. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
          What constitutes a material change will be determined at our sole discretion.
        </p>
      </div>
    </div>
  );
}
