import { User, Mail, Phone, MapPin, Lock, Camera } from "lucide-react";

export default function CustomerSettingsPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
                <p className="text-sm font-medium text-gray-500 mt-1">Manage your profile, security, and preferences</p>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
                    <p className="text-sm text-gray-500">Update your account's profile information and email address.</p>
                </div>

                <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-virsa-primary text-white flex items-center justify-center text-3xl font-bold shadow-md overflow-hidden">
                                    AD
                                </div>
                                <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </button>
                            </div>
                            <button className="text-sm font-bold text-virsa-primary hover:text-virsa-primary/80 transition-colors">
                                Change Avatar
                            </button>
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 space-y-4 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            defaultValue="Alex"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Last Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            defaultValue="Doe"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        defaultValue="alex@example.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        defaultValue="+1 (555) 123-4567"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-virsa-primary transition-colors shadow-sm">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Management */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Address Book</h2>
                        <p className="text-sm text-gray-500">Manage your shipping and billing addresses.</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-bold text-virsa-primary hover:bg-virsa-light/30 rounded-lg transition-colors">
                        + Add New
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Address Card 1 */}
                    <div className="border-2 border-virsa-primary rounded-xl p-5 relative bg-virsa-light/10">
                        <span className="absolute top-4 right-4 bg-virsa-primary text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                            Default
                        </span>
                        <div className="flex items-start gap-3 mb-3">
                            <MapPin className="w-5 h-5 text-virsa-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-gray-900">Home</h3>
                                <p className="text-sm text-gray-600 mt-1">123 Market Street, Apt 4B<br />San Francisco, CA 94105<br />United States</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-virsa-primary/20">
                            <button className="text-sm font-bold text-virsa-primary hover:underline">Edit</button>
                            <button className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                        </div>
                    </div>

                    {/* Address Card 2 */}
                    <div className="border border-gray-200 rounded-xl p-5 relative hover:border-gray-300 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-gray-900">Office</h3>
                                <p className="text-sm text-gray-600 mt-1">456 Corporate Blvd, Suite 200<br />San Francisco, CA 94107<br />United States</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                            <button className="text-sm font-bold text-virsa-primary hover:underline">Edit</button>
                            <button className="text-sm font-medium text-gray-600 hover:text-virsa-primary transition-colors">Set as Default</button>
                            <button className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors ml-auto">Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-virsa-primary" />
                        Update Password
                    </h2>
                    <p className="text-sm text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <div className="p-6">
                    <div className="max-w-md space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Current Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">New Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                            />
                        </div>

                        <div className="pt-4">
                            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-virsa-primary transition-colors shadow-sm">
                                Save Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
