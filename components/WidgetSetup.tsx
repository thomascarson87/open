import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { 
  Copy, Check, BarChart2, Globe, Code, ArrowLeft, 
  Shield, ExternalLink, Users, TrendingUp, DollarSign, Loader2 
} from 'lucide-react';

interface WidgetSetupProps {
  onBack: () => void;
  isEmbedded?: boolean;
}

export default function WidgetSetup({ onBack, isEmbedded = false }: WidgetSetupProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>({
      brand_color_primary: '#0f172a',
      brand_color_secondary: '#3b82f6',
      show_company_logo: true,
      show_salary_range: true,
      custom_css: '',
      domain_whitelist: []
  });
  const [stats, setStats] = useState({ 
    views: 0, 
    applications: 0, 
    conversions: 0,
    viewsGrowth: 0 
  });
  const [copied, setCopied] = useState(false);
  
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    
    // Determine Company ID
    let cId = user!.id;
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('company_id')
      .eq('user_id', user!.id)
      .maybeSingle();
    if (teamMember) cId = teamMember.company_id;
    setCompanyId(cId);

    // Load Config
    const { data: existingConfig } = await supabase
        .from('widget_configurations')
        .select('*')
        .eq('company_id', cId)
        .maybeSingle();
    
    if (existingConfig) setConfig(existingConfig);

    // Load Stats
    const { count: viewCount } = await supabase
        .from('widget_analytics')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', cId)
        .eq('event_type', 'widget_loaded');
        
    const { count: appCount } = await supabase
        .from('widget_analytics')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', cId)
        .eq('event_type', 'application_submitted');

    const { count: conversionCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', cId)
        .eq('source', 'widget')
        .not('conversion_completed_at', 'is', null);

    setStats({
        views: viewCount || 0,
        applications: appCount || 0,
        conversions: conversionCount || 0,
        viewsGrowth: 0 
    });
    
    setLoading(false);
  };

  const handleSave = async () => {
      try {
        const payload = { ...config, company_id: companyId };
        const { error } = await supabase
            .from('widget_configurations')
            .upsert(payload, { onConflict: 'company_id' });
            
        if (error) {
          alert(`Error: ${error.message}`);
        } else {
          alert('Configuration saved successfully!');
        }
      } catch (e) {
        alert('Failed to save configuration');
        console.error(e);
      }
  };

  const widgetCode = `<!-- Open Platform Widget -->
<div id="open-careers-widget"></div>
<script src="${window.location.origin}/widget/open-widget.js" 
        data-company-id="${companyId}" 
        defer></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (loading) return (
    <div className="flex justify-center p-12">
      <Loader2 className="animate-spin text-gray-400"/>
    </div>
  );
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {!isEmbedded && (
        <button 
          onClick={onBack} 
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard
        </button>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Career Page Widget</h1>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Embed your Open Platform jobs directly on your company website. 
          Candidates apply through the widget and appear instantly in your ATS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-gray-500 uppercase">Widget Views</div>
            <BarChart2 className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.views.toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-gray-500 uppercase">Applications</div>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.applications.toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-gray-500 uppercase">Conversions</div>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.conversions}</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-gray-500 uppercase">ROI Savings</div>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${((stats.applications * 50) - (stats.applications * 2)).toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center text-gray-300 text-sm font-medium">
                <Code className="w-4 h-4 mr-2"/> Embed Code
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-xs font-bold flex items-center"
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-blue-300 text-sm font-mono">
                <code>{widgetCode}</code>
              </pre>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 flex items-center mb-4">
              <Globe className="w-5 h-5 mr-2"/> Quick Start Guide
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
              <li>Copy the code snippet above.</li>
              <li>Paste it into your website's HTML where you want jobs to appear.</li>
              <li>The widget will automatically load your <strong>Published</strong> jobs.</li>
              <li>Applicants submit their info and see matched opportunities.</li>
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Widget Appearance</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input type="color" value={config.brand_color_primary} onChange={e => setConfig({...config, brand_color_primary: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={config.brand_color_primary} onChange={e => setConfig({...config, brand_color_primary: e.target.value})} className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={config.show_company_logo} onChange={e => setConfig({...config, show_company_logo: e.target.checked})} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mr-2" />
                  <span className="text-sm text-gray-700 font-medium">Show Company Logo</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={config.show_salary_range} onChange={e => setConfig({...config, show_salary_range: e.target.checked})} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mr-2" />
                  <span className="text-sm text-gray-700 font-medium">Show Salary Ranges</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" /> Security</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Allowed Domains</label>
              <input type="text" value={(config.domain_whitelist || []).join(', ')} onChange={e => setConfig({...config, domain_whitelist: e.target.value.split(',').map((d: string) => d.trim()).filter((d: string) => d.length > 0)})} className="w-full p-3 border border-gray-200 rounded-lg text-sm" placeholder="mycompany.com" />
            </div>
          </div>

          <button onClick={handleSave} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">Save Configuration</button>
        </div>
      </div>
    </div>
  );
}
