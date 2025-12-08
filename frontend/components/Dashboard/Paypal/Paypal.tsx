"use client";
import React, { useState } from "react";
import { MdAdd, MdDelete, MdEdit, MdCheck, MdClose, MdVisibility, MdVisibilityOff } from "react-icons/md";
import DynamicTable, { TableColumn } from "@/components/ui/DynamicTable/DynamicTable";
import Pagination from "@/components/ui/Pagination/Pagination";
import {
  useGetPaypalAccountsQuery,
  useCreatePaypalAccountMutation,
  useUpdatePaypalAccountMutation,
  useDeletePaypalAccountMutation,
  useVerifyPaypalAccountMutation,
  useActivatePaypalAccountMutation,
  useDeactivatePaypalAccountMutation,
  useCreateWebhookMutation,
  PaypalAccount,
  CreatePaypalAccountDto,
  UpdatePaypalAccountDto,
} from "@/app/store/api/services/paypalAccountsApi";

const Paypal = () => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [showWebhookForm, setShowWebhookForm] = useState<string | null>(null);

  // API hooks
  const { data: accountsResponse, isLoading, error } = useGetPaypalAccountsQuery();
  const [createAccount] = useCreatePaypalAccountMutation();
  const [updateAccount] = useUpdatePaypalAccountMutation();
  const [deleteAccount] = useDeletePaypalAccountMutation();
  const [verifyAccount] = useVerifyPaypalAccountMutation();
  const [activateAccount] = useActivatePaypalAccountMutation();
  const [deactivateAccount] = useDeactivatePaypalAccountMutation();
  const [createWebhook] = useCreateWebhookMutation();

  const paypalAccounts = accountsResponse?.data || [];

  const [formData, setFormData] = useState<CreatePaypalAccountDto>({
    account_name: "",
    client_id: "",
    client_secret: "",
    email: "",
    environment: "sandbox",
    webhook_id: "",
  });

  const [editFormData, setEditFormData] = useState<UpdatePaypalAccountDto>({
    account_name: "",
    client_id: "",
    client_secret: "",
    email: "",
    environment: "sandbox",
    webhook_id: "",
  });

  const [webhookUrl, setWebhookUrl] = useState("");

  const toggleSecretVisibility = (accountId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const maskSecret = (secret: string, show: boolean) => {
    if (show) return secret;
    return secret.substring(0, 8) + "...";
  };

  // Transform data for table display
  const accountsData = paypalAccounts.map((account: PaypalAccount) => ({
    id: account.id,
    account_name: account.account_name,
    client_id: maskSecret(account.client_id, showSecrets[account.id] || false),
    environment: account.environment.charAt(0).toUpperCase() + account.environment.slice(1),
    email: account.email,
    status: account.is_active ? "Active" : "Inactive",
    verified: account.is_verified ? "Verified" : "Not Verified",
    createdAt: new Date(account.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    isActive: account.is_active,
    isVerified: account.is_verified,
  }));

  const handleAddAccount = async () => {
    if (!formData.account_name || !formData.client_id || !formData.client_secret || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createAccount(formData).unwrap();
      setFormData({
        account_name: "",
        client_id: "",
        client_secret: "",
        email: "",
        environment: "sandbox",
        webhook_id: "",
      });
      setShowAddForm(false);
      alert("PayPal account created successfully!");
    } catch (error: any) {
      alert(error?.data?.message || "Failed to create account");
    }
  };

  const handleEditAccount = (accountId: string) => {
    const account = paypalAccounts.find((acc: PaypalAccount) => acc.id === accountId);
    if (account) {
      setEditFormData({
        account_name: account.account_name,
        client_id: account.client_id,
        client_secret: account.client_secret,
        email: account.email,
        environment: account.environment,
        webhook_id: account.webhook_id || "",
      });
      setEditingAccount(accountId);
    }
  };

  const handleUpdateAccount = async () => {
    if (!editFormData.account_name || !editFormData.client_id || !editFormData.client_secret || !editFormData.email) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await updateAccount({ id: editingAccount!, data: editFormData }).unwrap();
      setEditingAccount(null);
      setEditFormData({
        account_name: "",
        client_id: "",
        client_secret: "",
        email: "",
        environment: "sandbox",
        webhook_id: "",
      });
      alert("PayPal account updated successfully!");
    } catch (error: any) {
      alert(error?.data?.message || "Failed to update account");
    }
  };

  const handleVerifyAccount = async (accountId: string) => {
    try {
      await verifyAccount(accountId).unwrap();
      alert("Account verified successfully!");
    } catch (error: any) {
      alert(error?.data?.message.message || "Failed to verify account");
    }
  };

  const handleActivateAccount = async (accountId: string) => {
    const account = paypalAccounts.find((acc: PaypalAccount) => acc.id === accountId);
    if (!account?.is_verified) {
      alert("Please verify the account credentials before activating.");
      return;
    }

    try {
      await activateAccount(accountId).unwrap();
      alert("Account activated successfully!");
    } catch (error: any) {
      alert(error?.data?.message || "Failed to activate account");
    }
  };

  const handleDeactivateAccount = async (accountId: string) => {
    try {
      await deactivateAccount(accountId).unwrap();
      alert("Account deactivated successfully!");
    } catch (error: any) {
      alert(error?.data?.message || "Failed to deactivate account");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (window.confirm("Are you sure you want to delete this PayPal account?")) {
      try {
        await deleteAccount(accountId).unwrap();
        alert("Account deleted successfully!");
      } catch (error: any) {
        alert(error?.data?.message || "Failed to delete account");
      }
    }
  };

  const handleCreateWebhook = async (accountId: string) => {
    if (!webhookUrl) {
      alert("Please enter a webhook URL");
      return;
    }

    try {
      await createWebhook({ id: accountId, data: { webhook_url: webhookUrl } }).unwrap();
      setShowWebhookForm(null);
      setWebhookUrl("");
      alert("Webhook created successfully!");
    } catch (error: any) {
      alert(error?.data?.message || "Failed to create webhook");
    }
  };

  const totalItems = accountsData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = accountsData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: TableColumn[] = [
    { key: "account_name", label: "Account Name", type: "text" },
    { key: "client_id", label: "Client ID", type: "text" },
    { key: "environment", label: "Environment", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "verified", label: "Status", type: "text" },
    { key: "status", label: "Active", type: "text" },
    { key: "createdAt", label: "Created On", type: "text" },
    { key: "actions", label: "Actions", type: "text" },
  ];

  // Add actions column to data
  const dataWithActions = currentPageData.map(account => ({
    ...account,
    actions: (
      <div className="flex items-center gap-1 flex-wrap">
        <button
          onClick={() => toggleSecretVisibility(account.id)}
          className="bg-gray-500 hover:bg-gray-600 text-white p-1 rounded transition-colors"
          title="Toggle Secret Visibility"
        >
          {showSecrets[account.id] ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
        </button>
        
        {!account.isVerified && (
          <button
            onClick={() => handleVerifyAccount(account.id)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs transition-colors"
            title="Verify Credentials"
          >
            Verify
          </button>
        )}
        
        {!account.isActive && account.isVerified && (
          <button
            onClick={() => handleActivateAccount(account.id)}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
            title="Activate Account"
          >
            Activate
          </button>
        )}

        {account.isActive && (
          <>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
              Active
            </span>
            <button
              onClick={() => handleDeactivateAccount(account.id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs transition-colors"
              title="Deactivate Account"
            >
              Deactivate
            </button>
          </>
        )}
        
        <button
          onClick={() => handleEditAccount(account.id)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded transition-colors"
          title="Edit Account"
        >
          <MdEdit size={16} />
        </button>

        <button
          onClick={() => setShowWebhookForm(account.id)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs transition-colors"
          title="Create Webhook"
          disabled={!account.isVerified}
        >
          Webhook
        </button>
        
        <button
          onClick={() => handleDeleteAccount(account.id)}
          className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors disabled:bg-gray-400"
          title="Delete Account"
          disabled={account.isActive}
        >
          <MdDelete size={16} />
        </button>
      </div>
    ),
  }));

  if (error) {
    return <div className="text-red-500">Error loading PayPal accounts</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">PayPal Merchant Accounts</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 flex items-center gap-2 rounded transition-colors"
        >
          <MdAdd size={20} />
          Add PayPal Account
        </button>
      </div>

      {/* Add Account Form */}
      {showAddForm && (
        <div className="bg-white text-black p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Add New PayPal Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Main Store Account"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="merchant@business.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Client ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="PayPal Client ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Client Secret <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.client_secret}
                onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="PayPal Client Secret"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Environment <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value as 'sandbox' | 'production' })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sandbox">Sandbox</option>
                <option value="production">Production</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Webhook ID <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.webhook_id}
                onChange={(e) => setFormData({ ...formData, webhook_id: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="PayPal Webhook ID"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddAccount}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <MdCheck size={16} />
              Add Account
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({
                  account_name: "",
                  client_id: "",
                  client_secret: "",
                  email: "",
                  environment: "sandbox",
                  webhook_id: "",
                });
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <MdClose size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Account Form */}
      {editingAccount && (
        <div className="bg-white text-black p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Edit PayPal Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editFormData.account_name}
                onChange={(e) => setEditFormData({ ...editFormData, account_name: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Main Store Account"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="merchant@business.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Client ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editFormData.client_id}
                onChange={(e) => setEditFormData({ ...editFormData, client_id: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="PayPal Client ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Client Secret <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={editFormData.client_secret}
                onChange={(e) => setEditFormData({ ...editFormData, client_secret: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="PayPal Client Secret"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Environment <span className="text-red-500">*</span>
              </label>
              <select
                value={editFormData.environment}
                onChange={(e) => setEditFormData({ ...editFormData, environment: e.target.value as 'sandbox' | 'production' })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sandbox">Sandbox</option>
                <option value="production">Production</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Webhook ID <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={editFormData.webhook_id}
                onChange={(e) => setEditFormData({ ...editFormData, webhook_id: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="PayPal Webhook ID"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpdateAccount}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <MdCheck size={16} />
              Update Account
            </button>
            <button
              onClick={() => {
                setEditingAccount(null);
                setEditFormData({
                  account_name: "",
                  client_id: "",
                  client_secret: "",
                  email: "",
                  environment: "sandbox",
                  webhook_id: "",
                });
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <MdClose size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Webhook Form */}
      {showWebhookForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Create Webhook</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Webhook URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://your-domain.com/api/paypal/webhook"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCreateWebhook(showWebhookForm)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <MdCheck size={16} />
              Create Webhook
            </button>
            <button
              onClick={() => {
                setShowWebhookForm(null);
                setWebhookUrl("");
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <MdClose size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Account Info */}
      {paypalAccounts.some((acc: PaypalAccount) => acc.is_active) && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Currently Active Account</h3>
          {paypalAccounts
            .filter((acc: PaypalAccount) => acc.is_active)
            .map((account: PaypalAccount) => (
              <div key={account.id} className="text-green-700">
                <p><strong>Account Name:</strong> {account.account_name}</p>
                <p><strong>Environment:</strong> {account.environment}</p>
                <p><strong>Email:</strong> {account.email}</p>
                <p><strong>Merchant ID:</strong> {account.merchant_id || 'Not retrieved'}</p>
              </div>
            ))}
        </div>
      )}

      {/* Accounts Table */}
      <DynamicTable
        columns={columns}
        data={dataWithActions}
        loading={isLoading}
      />

      {/* Pagination */}
      {!isLoading && totalItems > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      )}
    </div>
  );
};

export default Paypal;