import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Clock,
  Calendar,
  Link,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getUserById, inviteUser } from "@/utils/api";
import { toast } from "react-toastify";

const UserInvitationSetup = ({ onClose, userId }) => {
  const [inviteMethod, setInviteMethod] = useState("email");
  const [expiryDays, setExpiryDays] = useState(24);
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    getUserById(userId)
      .then((data) => {
        setUserData(data);
        console.log("User data:", data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [userId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = () => {
    const postData = {
      userId: userId,
      invitationExpiry: expiryDays,
      sendEmail: inviteMethod === "email",
      customMessage: customMessage,
    };

    inviteUser(postData)
      .then((response) => {
        setInviteLink(response);
        console.log("response:", response);
        console.log("Invitation sent successfully:", response);
        if (postData.sendEmail) {
          onClose();
          toast.success("Invitation email sent successfully");
        }
      })
      .catch((error) => {
        console.error("Error sending invitation:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Details
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Invite User</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up the invitation for your new team member
          </p>
        </div>

        {/* User Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-medium">User Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{userData?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userData?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">
                  {userData?.roles
                    ?.map((role: { name: any }) => role.name)
                    .join(", ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Access Level</p>
                <p className="font-medium">
                  {userData?.permissionList?.length} permissions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invitation Method Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Invitation Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  className={`flex-1 p-4 border rounded-lg ${
                    inviteMethod === "email"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setInviteMethod("email")}
                >
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div className="text-left">
                      <p className="font-medium">Email Invitation</p>
                      <p className="text-sm text-gray-500">
                        Send an invitation email
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  className={`flex-1 p-4 border rounded-lg ${
                    inviteMethod === "link"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setInviteMethod("link")}
                >
                  <div className="flex items-center space-x-3">
                    <Link className="h-5 w-5 text-gray-400" />
                    <div className="text-left">
                      <p className="font-medium">Invitation Link</p>
                      <p className="text-sm text-gray-500">
                        Share a secure link
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Expiry Setting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Expiry
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                >
                  <option value={24}>24 hours</option>
                  <option value={72}>3 days</option>
                  <option value={168}>7 days</option>
                  <option value={336}>14 days</option>
                  <option value={720}>30 days</option>
                </select>
              </div>

              {/* Custom Message */}
              {inviteMethod === "email" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personal message to your invitation..."
                  />
                </div>
              )}

              {/* Invitation Link */}
              {inviteMethod === "link" && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invitation Link
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="flex-1 rounded-l-md border border-r-0 border-gray-300 px-3 py-2 bg-gray-50"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-white hover:bg-gray-50"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Security Notice</AlertTitle>
          <AlertDescription>
            The invitation link will only work once and expires after{" "}
            {expiryDays} days. The new user will need to set up 2FA during their
            first login.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSendInvite}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {inviteMethod === "email" ? "Send Invitation" : "Generate Link"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInvitationSetup;
