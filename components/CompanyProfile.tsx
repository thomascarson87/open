
import React, { useState } from 'react';
import { CompanyProfile as CompanyProfileType } from '../types';
import { supabase } from '../services/supabaseClient';
import { Building2, Save } from 'lucide-react';

interface Props {
  profile: CompanyProfileType;
  onSave: (p: CompanyProfileType) => void;
}

const CompanyProfile: React.FC<Props> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<CompanyProfileType>(profile);
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('company-logos').upload(filePath, file);

      if (uploadError) {
          console.error(uploadError);
          setUploading(false);
          return;
      }

      const { data } = supabase.storage.from('company-logos').getPublicUrl(filePath);
      setFormData({ ...formData, logoUrl: data.publicUrl });
      setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Company Profile</h2>
        
        <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Company Logo</label>
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                    {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-cover"/> : <Building2 className="w-8 h-8 text-gray-400"/>}
                </div>
                <div>
                    <input type="file" id="logo" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    <label htmlFor="logo" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold cursor-pointer hover:bg-gray-50">
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                    </label>
                    <p className="text-xs text-gray-400 mt-2">Recommended size: 400x400px</p>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full p-3 border rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Website</label>
                <input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full p-3 border rounded-lg" />
            </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">About</label>
                <textarea value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} className="w-full p-3 border rounded-lg h-32" />
            </div>
        </div>

        <div className="mt-8 pt-6 border-t">
            <button onClick={() => onSave(formData)} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-black flex items-center">
                <Save className="w-4 h-4 mr-2"/> Save Changes
            </button>
        </div>
    </div>
  );
};

export default CompanyProfile;
