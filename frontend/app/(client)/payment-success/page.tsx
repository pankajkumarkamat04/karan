'use client'
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Home, ShoppingBag, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

type PaymentStatus = 'success' | 'failed' | 'cancelled';

interface StatusConfig {
    icon: React.ReactNode;
    iconBg: string;
    borderColor: string;
    title: string;
    message: string;
    primaryButton: {
        text: string;
        bg: string;
        hover: string;
        textColor: string;
        link?: string;
        action?: () => void;
    };
    secondaryButton: {
        text: string;
        bg: string;
        hover: string;
        textColor: string;
        link: string;
    };
}

const PaymentStatusPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isAnimated, setIsAnimated] = useState(false);
    const [status, setStatus] = useState<PaymentStatus>('success');

    // Get status from query parameter and update state
    useEffect(() => {
        const statusParam = searchParams.get('status');

        if (statusParam) {
            const lowerStatus = statusParam.toLowerCase();

            if (lowerStatus === 'success' || lowerStatus === 'failed' || lowerStatus === 'cancelled') {
                setStatus(lowerStatus as PaymentStatus);
            } else {
                setStatus('success');
            }
        } else {
            setStatus('success');
        }
    }, [searchParams]);

    // Extract transaction details from query parameters
    const transactionId = searchParams.get('transactionId');
    const amount = searchParams.get('amount');
    const merchantName = searchParams.get('merchantName');
    const clientTrxId = searchParams.get('clientTrxId');
    const customerName = searchParams.get('customerName');
    const customerEmail = searchParams.get('customerEmail');
    const customerMobile = searchParams.get('customerMobile');

    useEffect(() => {
        // Trigger animation after component mounts
        setTimeout(() => setIsAnimated(true), 100);
    }, []);

    const statusConfigs: Record<PaymentStatus, StatusConfig> = {
        success: {
            icon: <CheckCircle className="w-10 h-10 text-white" />,
            iconBg: 'bg-green-500',
            borderColor: 'border-green-600',
            title: 'Payment Successful!',
            message: 'Thank you for your purchase. Your order has been confirmed and will be processed shortly.',
            primaryButton: {
                text: 'Continue Shopping',
                bg: 'bg-[#fada1d]',
                hover: 'hover:bg-[#fada1d]/80',
                textColor: 'text-black',
                link: '/gamestore'
            },
            secondaryButton: {
                text: 'Go Home',
                bg: 'bg-gray-200',
                hover: 'hover:bg-gray-300',
                textColor: 'text-gray-800',
                link: '/'
            }
        },
        failed: {
            icon: <XCircle className="w-10 h-10 text-white" />,
            iconBg: 'bg-red-500',
            borderColor: 'border-red-600',
            title: 'Payment Failed!',
            message: 'Oops! Something went wrong while processing your payment. Please try again or contact support if the issue persists.',
            primaryButton: {
                text: 'Try Again',
                bg: 'bg-red-600',
                hover: 'hover:bg-red-700',
                textColor: 'text-white',
                action: () => router.back()
            },
            secondaryButton: {
                text: 'Back to Store',
                bg: 'bg-gray-200',
                hover: 'hover:bg-gray-300',
                textColor: 'text-gray-800',
                link: '/gamestore'
            }
        },
        cancelled: {
            icon: <AlertCircle className="w-10 h-10 text-white" />,
            iconBg: 'bg-orange-500',
            borderColor: 'border-orange-600',
            title: 'Payment Cancelled',
            message: 'Your payment has been cancelled. No charges have been made to your account. You can try again whenever you\'re ready.',
            primaryButton: {
                text: 'Return to Cart',
                bg: 'bg-orange-600',
                hover: 'hover:bg-orange-700',
                textColor: 'text-white',
                link: '/cart'
            },
            secondaryButton: {
                text: 'Continue Shopping',
                bg: 'bg-gray-200',
                hover: 'hover:bg-gray-300',
                textColor: 'text-gray-800',
                link: '/gamestore'
            }
        }
    };

    const config = statusConfigs[status] || statusConfigs.success;

    // Debug logging (can be removed in production)
    console.log('Payment Status Page - Status:', status, 'Config:', config.title);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div
                className={`max-w-md w-full bg-[#080705] border ${config.borderColor} rounded-lg shadow-2xl p-8 text-center transition-all duration-500 transform ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
            >
                {/* Status Icon with Animation */}
                <div className="flex justify-center mb-6">
                    <div
                        className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center transition-transform duration-500 ${isAnimated ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                            }`}
                    >
                        {config.icon}
                    </div>
                </div>

                {/* Status Message */}
                <h1 className="text-3xl font-bold text-white mb-3">
                    {config.title}
                </h1>
                <p className="text-gray-300 mb-8 leading-relaxed">
                    {config.message}
                </p>

                {/* Transaction Details */}
                {(transactionId || amount || merchantName) && (
                    <div className="mb-8 bg-black/30 border border-gray-700 rounded-lg p-6 text-left">
                        <h2 className="text-lg font-semibold text-white mb-4 text-center">Transaction Details</h2>
                        <div className="space-y-3">
                            {transactionId && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Transaction ID:</span>
                                    <span className="text-white text-sm font-mono">{transactionId}</span>
                                </div>
                            )}
                            {clientTrxId && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Client Trx ID:</span>
                                    <span className="text-white text-sm font-mono">{clientTrxId}</span>
                                </div>
                            )}
                            {amount && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Amount:</span>
                                    <span className="text-[#fada1d] text-lg font-bold">₹{amount}</span>
                                </div>
                            )}
                            {merchantName && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Merchant:</span>
                                    <span className="text-white text-sm">{decodeURIComponent(merchantName)}</span>
                                </div>
                            )}
                            {customerName && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Customer:</span>
                                    <span className="text-white text-sm">{decodeURIComponent(customerName)}</span>
                                </div>
                            )}
                            {customerEmail && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Email:</span>
                                    <span className="text-white text-sm">{decodeURIComponent(customerEmail)}</span>
                                </div>
                            )}
                            {customerMobile && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Mobile:</span>
                                    <span className="text-white text-sm">{customerMobile}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {config.primaryButton.link ? (
                        <Link href={config.primaryButton.link} className="block">
                            <button className={`w-full ${config.primaryButton.bg} ${config.primaryButton.hover} ${config.primaryButton.textColor} font-medium py-3 px-4 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-105`}>
                                {config.primaryButton.text}
                            </button>
                        </Link>
                    ) : (
                        <button
                            onClick={config.primaryButton.action}
                            className={`w-full ${config.primaryButton.bg} ${config.primaryButton.hover} ${config.primaryButton.textColor} font-medium py-3 px-4 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-105`}
                        >
                            {config.primaryButton.text}
                        </button>
                    )}

                    <Link href={config.secondaryButton.link} className="block">
                        <button className={`w-full ${config.secondaryButton.bg} ${config.secondaryButton.hover} ${config.secondaryButton.textColor} font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105`}>
                            {config.secondaryButton.text}
                        </button>
                    </Link>
                </div>

                {/* Additional Help Link for Failed/Cancelled Status */}
                {(status === 'failed' || status === 'cancelled') && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                            Need help? <Link href="/contact" className="text-[#fada1d] hover:underline">Contact Support</Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatusPage;