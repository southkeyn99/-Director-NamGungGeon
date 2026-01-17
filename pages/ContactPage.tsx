
import React from 'react';
import { SiteContent } from '../types';

interface ContactPageProps {
  contact: SiteContent['contact'];
  contactTitle?: string;
}

const ContactPage: React.FC<ContactPageProps> = ({ contact, contactTitle }) => {
  return (
    <div className="h-screen flex items-center justify-center px-8">
      <div className="text-center space-y-16 max-w-2xl">
        <header className="space-y-4">
          <h2 className="text-xs tracking-[0.6em] text-yellow-500 font-bold uppercase">Connect</h2>
          <h1 className="text-4xl md:text-5xl font-serif-display leading-tight">
            {contactTitle || "Let's collaborate on your next story"}
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-8 border-t border-white/5">
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest text-yellow-500/70 uppercase font-bold">Inquiries</span>
            <a href={`mailto:${contact.email}`} className="block text-lg hover:text-yellow-400 transition-colors">
              {contact.email}
            </a>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest text-yellow-500/70 uppercase font-bold">Contact</span>
            <p className="text-lg">{contact.phone}</p>
          </div>
        </div>

        <div className="flex justify-center gap-12 pt-8">
          <a href={contact.instagram} target="_blank" rel="noreferrer" className="text-xs tracking-[0.3em] uppercase hover:text-yellow-400 transition-colors">Instagram</a>
          <a href={contact.youtube} target="_blank" rel="noreferrer" className="text-xs tracking-[0.3em] uppercase hover:text-yellow-400 transition-colors">YouTube</a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
