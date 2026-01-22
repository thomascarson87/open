import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import {
  Copy, Check, BarChart2, Globe, Code, ArrowLeft,
  Shield, Users, TrendingUp, DollarSign, Loader2,
  Type, Palette, Layout, FileText, Settings, Sparkles,
  ChevronDown, ChevronUp, Eye, Briefcase, MapPin, Clock
} from 'lucide-react';

interface WidgetSetupProps {
  onBack: () => void;
  isEmbedded?: boolean;
}

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  brand_color_primary: string;
  brand_color_secondary: string;
  background_color: string;
  text_color: string;
  text_muted_color: string;
  border_color: string;
  font_family: string;
  font_heading: string;
  border_radius: string;
  density: string;
}

interface WidgetConfig {
  company_id?: string;
  // Existing fields
  brand_color_primary: string;
  brand_color_secondary: string;
  show_company_logo: boolean;
  show_salary_range: boolean;
  custom_css: string;
  domain_whitelist: string[];
  // Typography
  font_family: string;
  font_heading: string;
  font_size_base: 'small' | 'medium' | 'large';
  // Style / Appearance
  border_radius: 'sharp' | 'rounded' | 'pill';
  density: 'compact' | 'normal' | 'spacious';
  theme_preset: string;
  color_mode: 'light' | 'dark' | 'auto';
  background_color: string;
  text_color: string;
  text_muted_color: string;
  border_color: string;
  // Layout
  max_width: string;
  jobs_per_page: number;
  show_company_header: boolean;
  show_job_count: boolean;
  show_powered_by: boolean;
  // Application Form
  require_resume: boolean;
  require_cover_letter: boolean;
  success_message: string;
  redirect_url: string;
  // SEO
  page_title: string;
  meta_description: string;
}

const DEFAULT_CONFIG: WidgetConfig = {
  brand_color_primary: '#0f172a',
  brand_color_secondary: '#3b82f6',
  show_company_logo: true,
  show_salary_range: true,
  custom_css: '',
  domain_whitelist: [],
  font_family: 'Inter',
  font_heading: 'Inter',
  font_size_base: 'medium',
  border_radius: 'rounded',
  density: 'normal',
  theme_preset: 'default',
  color_mode: 'light',
  background_color: '#ffffff',
  text_color: '#111827',
  text_muted_color: '#6b7280',
  border_color: '#e5e7eb',
  max_width: '1200px',
  jobs_per_page: 10,
  show_company_header: true,
  show_job_count: true,
  show_powered_by: true,
  require_resume: false,
  require_cover_letter: false,
  success_message: "Thank you for applying! We'll be in touch soon.",
  redirect_url: '',
  page_title: '',
  meta_description: ''
};

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'system-ui', label: 'System Default' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' }
];

export default function WidgetSetup({ onBack, isEmbedded = false }: WidgetSetupProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [themePresets, setThemePresets] = useState<ThemePreset[]>([]);
  const [stats, setStats] = useState({
    views: 0,
    applications: 0,
    conversions: 0,
    viewsGrowth: 0
  });
  const [copied, setCopied] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('Your Company');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    typography: true,
    colors: true,
    layout: true,
    application: false,
    advanced: false
  });

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

    // Load company name
    const { data: companyData } = await supabase
      .from('company_profiles')
      .select('company_name')
      .eq('id', cId)
      .maybeSingle();
    if (companyData?.company_name) setCompanyName(companyData.company_name);

    // Load Theme Presets
    const { data: presets } = await supabase
      .from('widget_theme_presets')
      .select('*')
      .eq('is_public', true);
    if (presets) setThemePresets(presets);

    // Load Config
    const { data: existingConfig } = await supabase
      .from('widget_configurations')
      .select('*')
      .eq('company_id', cId)
      .maybeSingle();

    if (existingConfig) {
      setConfig({ ...DEFAULT_CONFIG, ...existingConfig });
    }

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
    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const applyThemePreset = (presetId: string) => {
    const preset = themePresets.find(p => p.id === presetId);
    if (preset) {
      setConfig(prev => ({
        ...prev,
        theme_preset: presetId,
        brand_color_primary: preset.brand_color_primary,
        brand_color_secondary: preset.brand_color_secondary,
        background_color: preset.background_color,
        text_color: preset.text_color,
        text_muted_color: preset.text_muted_color,
        border_color: preset.border_color,
        font_family: preset.font_family,
        font_heading: preset.font_heading,
        border_radius: preset.border_radius as 'sharp' | 'rounded' | 'pill',
        density: preset.density as 'compact' | 'normal' | 'spacious'
      }));
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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

  // Preview style helpers
  const getBorderRadius = () => {
    switch (config.border_radius) {
      case 'sharp': return '0px';
      case 'pill': return '9999px';
      default: return '12px';
    }
  };

  const getSpacing = () => {
    switch (config.density) {
      case 'compact': return { padding: '12px', gap: '8px' };
      case 'spacious': return { padding: '24px', gap: '20px' };
      default: return { padding: '16px', gap: '12px' };
    }
  };

  const getFontSize = () => {
    switch (config.font_size_base) {
      case 'small': return { body: '13px', heading: '18px' };
      case 'large': return { body: '16px', heading: '24px' };
      default: return { body: '14px', heading: '20px' };
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, section }: { icon: any, title: string, section: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-600" />
        <span className="font-bold text-gray-900">{title}</span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 animate-in fade-in duration-300">
      {!isEmbedded && (
        <button
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Career Page Widget</h1>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Embed your Open Platform jobs directly on your company website.
          Customize the appearance to match your brand.
        </p>
      </div>

      {/* Stats Row */}
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

      {/* Embed Code */}
      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg mb-8">
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center text-gray-300 text-sm font-medium">
            <Code className="w-4 h-4 mr-2" /> Embed Code
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

      {/* Main Content: Settings + Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column: Settings */}
        <div className="space-y-4">
          {/* Theme Preset Selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Theme Presets</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Select a preset to quickly apply a coordinated style, then customize individual settings below.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themePresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyThemePreset(preset.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    config.theme_preset === preset.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.brand_color_primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.brand_color_secondary }}
                    />
                  </div>
                  <div className="text-sm font-bold text-gray-900">{preset.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Typography Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <SectionHeader icon={Type} title="Typography" section="typography" />
            {expandedSections.typography && (
              <div className="p-6 space-y-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Body Font</label>
                    <select
                      value={config.font_family}
                      onChange={e => setConfig({ ...config, font_family: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                    >
                      {FONT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Heading Font</label>
                    <select
                      value={config.font_heading}
                      onChange={e => setConfig({ ...config, font_heading: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                    >
                      {FONT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Font Size</label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map(size => (
                      <button
                        key={size}
                        onClick={() => setConfig({ ...config, font_size_base: size })}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                          config.font_size_base === size
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Colors Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <SectionHeader icon={Palette} title="Colors" section="colors" />
            {expandedSections.colors && (
              <div className="p-6 space-y-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.brand_color_primary}
                        onChange={e => setConfig({ ...config, brand_color_primary: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-200 p-1"
                      />
                      <input
                        type="text"
                        value={config.brand_color_primary}
                        onChange={e => setConfig({ ...config, brand_color_primary: e.target.value })}
                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Secondary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.brand_color_secondary}
                        onChange={e => setConfig({ ...config, brand_color_secondary: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-200 p-1"
                      />
                      <input
                        type="text"
                        value={config.brand_color_secondary}
                        onChange={e => setConfig({ ...config, brand_color_secondary: e.target.value })}
                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Background</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.background_color}
                        onChange={e => setConfig({ ...config, background_color: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-200 p-1"
                      />
                      <input
                        type="text"
                        value={config.background_color}
                        onChange={e => setConfig({ ...config, background_color: e.target.value })}
                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.text_color}
                        onChange={e => setConfig({ ...config, text_color: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-200 p-1"
                      />
                      <input
                        type="text"
                        value={config.text_color}
                        onChange={e => setConfig({ ...config, text_color: e.target.value })}
                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Muted Text</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.text_muted_color}
                        onChange={e => setConfig({ ...config, text_muted_color: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-200 p-1"
                      />
                      <input
                        type="text"
                        value={config.text_muted_color}
                        onChange={e => setConfig({ ...config, text_muted_color: e.target.value })}
                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Border Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.border_color}
                        onChange={e => setConfig({ ...config, border_color: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-200 p-1"
                      />
                      <input
                        type="text"
                        value={config.border_color}
                        onChange={e => setConfig({ ...config, border_color: e.target.value })}
                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color Mode</label>
                  <div className="flex gap-2">
                    {(['light', 'dark', 'auto'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setConfig({ ...config, color_mode: mode })}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                          config.color_mode === mode
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Layout Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <SectionHeader icon={Layout} title="Layout" section="layout" />
            {expandedSections.layout && (
              <div className="p-6 space-y-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Border Radius</label>
                  <div className="flex gap-2">
                    {(['sharp', 'rounded', 'pill'] as const).map(radius => (
                      <button
                        key={radius}
                        onClick={() => setConfig({ ...config, border_radius: radius })}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                          config.border_radius === radius
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {radius.charAt(0).toUpperCase() + radius.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Content Density</label>
                  <div className="flex gap-2">
                    {(['compact', 'normal', 'spacious'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setConfig({ ...config, density: d })}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                          config.density === d
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Max Width</label>
                    <input
                      type="text"
                      value={config.max_width}
                      onChange={e => setConfig({ ...config, max_width: e.target.value })}
                      placeholder="1200px"
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Jobs Per Page</label>
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={config.jobs_per_page}
                      onChange={e => setConfig({ ...config, jobs_per_page: parseInt(e.target.value) || 10 })}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.show_company_header}
                      onChange={e => setConfig({ ...config, show_company_header: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm text-gray-700 font-medium">Show Company Header</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.show_company_logo}
                      onChange={e => setConfig({ ...config, show_company_logo: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm text-gray-700 font-medium">Show Company Logo</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.show_job_count}
                      onChange={e => setConfig({ ...config, show_job_count: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm text-gray-700 font-medium">Show Job Count Badge</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.show_salary_range}
                      onChange={e => setConfig({ ...config, show_salary_range: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm text-gray-700 font-medium">Show Salary Ranges</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.show_powered_by}
                      onChange={e => setConfig({ ...config, show_powered_by: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm text-gray-700 font-medium">Show "Powered by Open" Badge</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Application Form Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <SectionHeader icon={FileText} title="Application Form" section="application" />
            {expandedSections.application && (
              <div className="p-6 space-y-4 border-t border-gray-100">
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.require_resume}
                      onChange={e => setConfig({ ...config, require_resume: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm text-gray-700 font-medium">Require Resume Upload</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.require_cover_letter}
                      onChange={e => setConfig({ ...config, require_cover_letter: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm text-gray-700 font-medium">Require Cover Letter</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Success Message</label>
                  <textarea
                    value={config.success_message}
                    onChange={e => setConfig({ ...config, success_message: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none"
                    placeholder="Thank you for applying! We'll be in touch soon."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Redirect URL (Optional)</label>
                  <input
                    type="url"
                    value={config.redirect_url}
                    onChange={e => setConfig({ ...config, redirect_url: e.target.value })}
                    placeholder="https://yourcompany.com/thank-you"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Redirect applicants to this URL after submission</p>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <SectionHeader icon={Settings} title="Advanced" section="advanced" />
            {expandedSections.advanced && (
              <div className="p-6 space-y-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Page Title (SEO)</label>
                  <input
                    type="text"
                    value={config.page_title}
                    onChange={e => setConfig({ ...config, page_title: e.target.value })}
                    placeholder="Careers at Your Company"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Meta Description (SEO)</label>
                  <textarea
                    value={config.meta_description}
                    onChange={e => setConfig({ ...config, meta_description: e.target.value })}
                    rows={2}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none"
                    placeholder="Join our team and work on exciting projects..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" /> Allowed Domains
                  </label>
                  <input
                    type="text"
                    value={(config.domain_whitelist || []).join(', ')}
                    onChange={e => setConfig({
                      ...config,
                      domain_whitelist: e.target.value.split(',').map(d => d.trim()).filter(d => d.length > 0)
                    })}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                    placeholder="mycompany.com, careers.mycompany.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to allow embedding on any domain</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Custom CSS</label>
                  <textarea
                    value={config.custom_css}
                    onChange={e => setConfig({ ...config, custom_css: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono resize-none"
                    placeholder=".open-widget-card { /* your styles */ }"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

        {/* Right Column: Live Preview */}
        <div className="xl:sticky xl:top-8 xl:self-start">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-600" />
              <span className="font-bold text-gray-900">Live Preview</span>
            </div>

            {/* Preview Container */}
            <div
              className="p-6 min-h-[600px]"
              style={{
                backgroundColor: config.background_color,
                fontFamily: config.font_family
              }}
            >
              {/* Company Header Preview */}
              {config.show_company_header && (
                <div className="mb-6" style={{ textAlign: 'center' }}>
                  {config.show_company_logo && (
                    <div
                      className="w-16 h-16 mx-auto mb-3 flex items-center justify-center"
                      style={{
                        backgroundColor: config.brand_color_primary,
                        borderRadius: getBorderRadius(),
                        color: '#fff',
                        fontFamily: config.font_heading,
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}
                    >
                      {companyName.charAt(0)}
                    </div>
                  )}
                  <h2
                    style={{
                      fontFamily: config.font_heading,
                      fontSize: getFontSize().heading,
                      color: config.text_color,
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    }}
                  >
                    Careers at {companyName}
                  </h2>
                  {config.show_job_count && (
                    <span
                      style={{
                        fontSize: '12px',
                        color: config.text_muted_color,
                        fontWeight: '500'
                      }}
                    >
                      3 open positions
                    </span>
                  )}
                </div>
              )}

              {/* Sample Job Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: getSpacing().gap }}>
                {[
                  { title: 'Senior Frontend Engineer', location: 'Remote', salary: '$150k - $180k', type: 'Full-time' },
                  { title: 'Product Designer', location: 'San Francisco, CA', salary: '$120k - $150k', type: 'Full-time' },
                  { title: 'Backend Engineer', location: 'New York, NY', salary: '$140k - $170k', type: 'Hybrid' }
                ].map((job, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: config.color_mode === 'dark' ? '#1f2937' : '#ffffff',
                      border: `1px solid ${config.border_color}`,
                      borderRadius: getBorderRadius(),
                      padding: getSpacing().padding,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: config.font_heading,
                        fontSize: getFontSize().heading,
                        color: config.text_color,
                        fontWeight: 'bold',
                        marginBottom: '8px'
                      }}
                    >
                      {job.title}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        fontSize: getFontSize().body,
                        color: config.text_muted_color
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> {job.location}
                      </span>
                      {config.show_salary_range && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <DollarSign size={14} /> {job.salary}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {job.type}
                      </span>
                    </div>
                    <button
                      style={{
                        marginTop: '12px',
                        backgroundColor: config.brand_color_secondary,
                        color: '#ffffff',
                        padding: '8px 16px',
                        borderRadius: config.border_radius === 'pill' ? '9999px' : config.border_radius === 'sharp' ? '0' : '8px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>

              {/* Powered By */}
              {config.show_powered_by && (
                <div
                  style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: config.text_muted_color
                  }}
                >
                  Powered by <span style={{ fontWeight: 'bold' }}>Open Platform</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Start Guide */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-4">
            <h3 className="font-bold text-blue-900 flex items-center mb-4">
              <Globe className="w-5 h-5 mr-2" /> Quick Start Guide
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
              <li>Copy the embed code above.</li>
              <li>Paste it into your website's HTML where you want jobs to appear.</li>
              <li>The widget will automatically load your <strong>Published</strong> jobs.</li>
              <li>Applicants submit their info and see matched opportunities.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
