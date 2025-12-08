'use client'
import React from 'react';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const PaymentSuccessPage = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg[#080705] border border-green-600 rounded-lg shadow-lg p-8 text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Payment Successful!
                </h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. Your order has been confirmed.
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link href="/gamestore" className="block">
                        <button className="w-full bg-[#fada1d] hover:bg-[#fada1d]/80 text-black font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer">
                            Continue Shopping
                        </button>
                    </Link>
                    <Link href="/" className="block">
                        <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors">
                            Go Home
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;