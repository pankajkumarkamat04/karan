import React from 'react';
import PurchaseLimitNotification from '@/components/Home/PurchaseLimitNotification/PurchaseLimitNotification';
import StoreProducts from '@/components/StoreProducts/StoreProducts';

const StorePage = () => {
  return (
    <div className="fade-in">
      <PurchaseLimitNotification />

      <div className="max-w-[1616px] mx-auto px-4 py-10">
        <StoreProducts />
      </div>
    </div>
  );
};

export default StorePage;