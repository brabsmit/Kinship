import React, { useState } from 'react';
import { Link, Check } from 'lucide-react';

/**
 * ShareButton - A reusable button component for sharing URLs
 * Shows a success state when URL is copied
 */
export default function ShareButton({ url, label = "Share", className = "", size = 16 }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation(); // Prevent triggering parent onClick events

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback: select the URL if clipboard fails
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-md transition-all ${
        copied
          ? 'bg-green-100 text-green-700 border border-green-200'
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      } ${className}`}
      title={copied ? 'Link copied!' : 'Copy link to clipboard'}
    >
      {copied ? (
        <>
          <Check size={size} className="text-green-600" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Link size={size} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

/**
 * ShareIconButton - A minimal icon-only version for compact spaces
 */
export function ShareIconButton({ url, className = "", size = 16 }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`p-1.5 rounded-md transition-all ${
        copied
          ? 'bg-green-100 text-green-600'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
      } ${className}`}
      title={copied ? 'Link copied!' : 'Copy share link'}
    >
      {copied ? <Check size={size} /> : <Link size={size} />}
    </button>
  );
}
