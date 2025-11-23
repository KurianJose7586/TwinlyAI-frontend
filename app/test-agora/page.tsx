"use client";

import dynamic from 'next/dynamic';

// This imports the component ONLY on the client side
const AgoraSandbox = dynamic(() => import('@/components/AgoraSandbox'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Loading Agora Engine...</p>
    </div>
  )
});

export default function Page() {
  return <AgoraSandbox />;
}