'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Save, Upload, X, Image } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserProfileProps {
  user: any;
}

export default function UserProfile({ user }: UserProfileProps) {
  const { supabase } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
    email: user?.email || '',
    bio: user?.user_metadata?.bio || '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const MAX_BYTES = 1 * 1024 * 1024; // 1MB
  const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg", 
    "image/jpg",
    "image/svg+xml",
    "application/postscript",
  ];

  // Load user logo on component mount
  useEffect(() => {
    if (!user) return;
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      console.log('Supabase not configured, skipping logo load');
      return;
    }
    
    (async () => {
      try {
        // For now, we'll store the logo URL in user metadata since we can't modify the profiles table
        const logoUrl = user.user_metadata?.logo_url;
        if (logoUrl) {
          setLogoUrl(logoUrl);
        }
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    })();
  }, [user, supabase]);

  const handleLogoUpload = async (file: File) => {
    setLogoError(null);
    setLogoUploading(true);
    
    if (file.size > MAX_BYTES) {
      setLogoError(`File size exceeds ${MAX_BYTES / 1024 / 1024}MB limit.`);
      setLogoUploading(false);
      return;
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLogoError("Only PNG, JPEG, JPG, SVG, and AI files are allowed.");
      setLogoUploading(false);
      return;
    }

    try {
      const objectPath = `${user.id}/logo`;
      const { error: upErr } = await supabase.storage.from("logos").upload(objectPath, file, {
        upsert: true,
      });
      
      if (upErr) throw upErr;
      
      const { data: signed } = await supabase.storage
        .from("logos")
        .createSignedUrl(objectPath, 60 * 5);
      
      // Store logo URL in user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          logo_url: signed?.signedUrl ?? null
        }
      });
      
      if (updateError) throw updateError;
      
      setLogoUrl(signed?.signedUrl ?? null);
      setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
    } catch (error: any) {
      setLogoError(error.message ?? "Upload failed");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: formData.displayName,
          bio: formData.bio,
        }
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
      email: user?.email || '',
      bio: user?.user_metadata?.bio || '',
    });
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full border border-gray-200 hover:bg-gray-50">
                <Upload className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell us about yourself"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-gray-600 mt-1">{user?.email}</p>
                {user?.user_metadata?.bio && (
                  <p className="text-gray-700 mt-2">{user.user_metadata.bio}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logo Upload Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Logo</h3>
          
          <div className="flex items-start space-x-4">
            {/* Current Logo Display */}
            <div className="flex-shrink-0">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Current logo" 
                  className="w-16 h-16 object-contain border border-gray-200 rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                  <Image className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Upload Controls */}
            <div className="flex-1">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Logo
                </label>
                <div className="flex items-center space-x-3">
                  <label className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
                    {logoUploading ? 'Uploading...' : 'Choose File'}
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                      accept=".png,.jpg,.jpeg,.svg,.ai"
                      disabled={logoUploading}
                    />
                  </label>
                  <span className="text-sm text-gray-500">
                    PNG, JPG, SVG, AI (max 1MB)
                  </span>
                </div>
                
                {logoError && (
                  <p className="text-sm text-red-600">{logoError}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <User className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email Address</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Member Since</p>
              <p className="text-sm text-gray-600">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Delete Account</h4>
            <p className="text-sm text-gray-600 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
