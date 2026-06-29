import React, { useState } from 'react';

export default function SupportPage() {
  const [formData, setFormData] = useState({ name: '', email: '', topic: 'general', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send data to an API
    console.log('Feedback submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', topic: 'general', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-800">Support Center</h1>
        <p className="mt-2 text-slate-500">How can we help you today?</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* FAQs Section */}
        <div className="space-y-6">
          <div className="glass rounded-2xl border border-white/50 p-6 shadow-float">
            <h2 className="mb-4 text-xl font-bold text-slate-800">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="font-semibold text-slate-800">How do I book a workspace?</h3>
                <p className="mt-1 text-sm text-slate-600">You can book a workspace by browsing our listings on the Explore page, selecting your desired dates, and completing the payment process.</p>
              </div>
              <div className="border-b border-slate-200 pb-4">
                <h3 className="font-semibold text-slate-800">Can I cancel my booking?</h3>
                <p className="mt-1 text-sm text-slate-600">Yes, you can cancel your booking from the Trips page. Cancellation policies vary by host, so please check the listing details for specific terms.</p>
              </div>
              <div className="border-b border-slate-200 pb-4">
                <h3 className="font-semibold text-slate-800">How do I become a host?</h3>
                <p className="mt-1 text-sm text-slate-600">You can become a host by navigating to the Host Dashboard and completing your host profile. Once approved, you can start listing your spaces.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Is my payment information secure?</h3>
                <p className="mt-1 text-sm text-slate-600">Absolutely. We use industry-standard encryption and partner with trusted payment gateways like Razorpay to ensure your data is secure.</p>
              </div>
            </div>
          </div>
          
          <div className="glass flex items-center justify-between rounded-2xl border border-white/50 p-6 shadow-float">
             <div>
                <h3 className="font-bold text-slate-800">Need immediate help?</h3>
                <p className="text-sm text-slate-600">Call us at 1-800-WORKBNB</p>
             </div>
             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
             </div>
          </div>
        </div>

        {/* Feedback / Contact Form */}
        <div className="glass rounded-2xl border border-white/50 p-6 shadow-float">
          <h2 className="mb-4 text-xl font-bold text-slate-800">Send us a Message</h2>
          <p className="mb-6 text-sm text-slate-600">Have feedback, found a bug, or need account assistance? Fill out the form below.</p>
          
          {submitted ? (
            <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800 border border-emerald-200">
              <p className="font-semibold">Thank you for your feedback!</p>
              <p className="text-sm">We've received your message and will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input mt-1"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input mt-1"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topic</label>
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className="input mt-1"
                >
                  <option value="general">General Inquiry</option>
                  <option value="feedback">Product Feedback</option>
                  <option value="bug">Report a Bug</option>
                  <option value="billing">Billing Support</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</label>
                <textarea
                  name="message"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="input mt-1 resize-none"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              
              <button type="submit" className="btn-primary w-full justify-center">
                Submit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
