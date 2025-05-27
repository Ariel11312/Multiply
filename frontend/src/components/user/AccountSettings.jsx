import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  Globe,
  Shield,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";
import Navbar from "./Navbar";
import { checkAuth } from "../../middleware/auth";

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: false,
    pushNotifications: false,
    smsNotifications: false,
    marketingEmails: false,
    language: "en",
    timezone: "UTC-8",
    twoFactorAuth: false,
  });

  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isCheckingAuth: true,
    user: null,
    error: null,
  });

  useEffect(() => {
    checkAuth(setAuthState);
  }, []);

  useEffect(() => {
    if (authState.user) {
      setFormData({
        firstName: authState.user.firstName || "",
        lastName: authState.user.lastName || "",
        email: authState.user.email || "",
        phone: authState.user.phoneNumber || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        emailNotifications:
          authState.user.notificationPreferences?.email || false,
        pushNotifications:
          authState.user.notificationPreferences?.push || false,
        smsNotifications: authState.user.notificationPreferences?.sms || false,
        marketingEmails:
          authState.user.notificationPreferences?.marketing || false,
        language: authState.user.preferences?.language || "en",
        timezone: authState.user.preferences?.timezone || "UTC-8",
        twoFactorAuth: authState.user.security?.twoFactorEnabled || false,
      });
    }
  }, [authState.user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (section) => {
    try {
      // Prepare the data to send based on which section is being saved
      let dataToSend = {};

      if (section === "Profile") {
        dataToSend = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        };
      } else if (section === "Security") {
        if (formData.newPassword !== formData.confirmPassword) {
          alert("New passwords don't match!");
          return;
        }
        dataToSend = {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          twoFactorAuth: formData.twoFactorAuth,
        };
      } else if (section === "Notifications") {
        dataToSend = {
          notifications: {
            email: formData.emailNotifications,
            push: formData.pushNotifications,
            sms: formData.smsNotifications,
            marketing: formData.marketingEmails,
          },
        };
      } else if (section === "Preferences") {
        dataToSend = {
          preferences: {
            language: formData.language,
            timezone: formData.timezone,
          },
        };
      }

      // Here you would typically make an API call to update the user data
      // For example:
      // const response = await fetch('/api/user/update', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(dataToSend)
      // });

      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Failed to update');

      // For now, we'll just simulate a successful update
      console.log(`Updating ${section} with:`, dataToSend);
      alert(`${section} settings saved successfully!`);

      // Clear password fields after successful security update
      if (section === "Security") {
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(`Failed to save ${section} settings: ${error.message}`);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
  ];

  if (authState.isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        Please log in to access account settings
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen mt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <User size={24} />
                    Profile Information
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-3 text-gray-400"
                          size={16}
                        />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                   <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Phone Number
  </label>
  <div className="relative">
    <Smartphone
      className="absolute left-3 top-3 text-gray-400"
      size={16}
    />
    <div className="flex">
      <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
        +63
      </span>
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) =>
          handleInputChange("phone", e.target.value)
        }
        className="flex-1 pl-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="9123456789"
      />
    </div>
  </div>
</div>
                    <button
                      onClick={() => handleSave("Profile")}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Shield size={24} />
                    Security Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <Lock
                              className="absolute left-3 top-3 text-gray-400"
                              size={16}
                            />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={(e) =>
                                handleInputChange(
                                  "currentPassword",
                                  e.target.value
                                )
                              }
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) =>
                              handleInputChange("newPassword", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              handleInputChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">
                        Two-Factor Authentication
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Add an extra layer of security to your account
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Requires authentication app or SMS verification
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.twoFactorAuth}
                            onChange={(e) =>
                              handleInputChange(
                                "twoFactorAuth",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSave("Security")}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Update Security
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Bell size={24} />
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    {[
                      {
                        key: "emailNotifications",
                        label: "Email Notifications",
                        desc: "Receive updates via email",
                      },
                      {
                        key: "pushNotifications",
                        label: "Push Notifications",
                        desc: "Browser and mobile notifications",
                      },
                      {
                        key: "smsNotifications",
                        label: "SMS Notifications",
                        desc: "Text message alerts",
                      },
                      {
                        key: "marketingEmails",
                        label: "Marketing Emails",
                        desc: "Promotional content and offers",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.label}
                          </h3>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData[item.key]}
                            onChange={(e) =>
                              handleInputChange(item.key, e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    ))}

                    <button
                      onClick={() => handleSave("Notifications")}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors mt-6"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Globe size={24} />
                    General Preferences
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) =>
                          handleInputChange("language", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={(e) =>
                          handleInputChange("timezone", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="UTC-12">UTC-12 (Baker Island)</option>
                        <option value="UTC-8">UTC-8 (Pacific Time)</option>
                        <option value="UTC-5">UTC-5 (Eastern Time)</option>
                        <option value="UTC+0">UTC+0 (London)</option>
                        <option value="UTC+1">UTC+1 (Central Europe)</option>
                        <option value="UTC+8">UTC+8 (Asia/Manila)</option>
                        <option value="UTC+9">UTC+9 (Tokyo)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleSave("Preferences")}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
