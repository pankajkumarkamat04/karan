'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentFailedPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('Payment failure page viewed');
  }, []);

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 fade-in">
      <section className="border border-red-500 shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-16 w-16 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-red-600 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Oops! Something went wrong while processing your payment. Please try again or contact support.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
          <Link href="/" className="text-sm text-red-500 hover:underline">
            Back to Homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
