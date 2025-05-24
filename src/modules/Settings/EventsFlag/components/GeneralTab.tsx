import React, { useState, useEffect } from 'react';
import {
  Bell, Settings, ChevronDown, ChevronUp, Map, Droplet, Gauge, Lock,
  Calendar, AlertTriangle, Check, Info,
} from 'lucide-react';

type AlertKey = 'geofence' | 'fuelLevel' | 'speedControl' | 'immobilization' | 'maintenance' | 'idle' | 'crash' | 'tamper';

interface Alert {
    key: AlertKey;
    title: string;
    icon: React.ReactNode;
    description: string;
    //triggerType: 'dropdown' | 'input' | 'toggle';
    //triggerOptions?: string[];
    //inputType?: 'percentage' | 'speed' | 'days' | 'number';
    //placeholder?: string;
    //priorityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface GeneralTabProps {
    loading: boolean;
    notificationSettings: Record<string, string | boolean | number>;
    onSettingsChange: (key: string, value: string | number | boolean) => void;
    handleSave: () => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ loading, notificationSettings, onSettingsChange, handleSave }) => {
  const initialExpandedState: Record<AlertKey, boolean> = {
    geofence: Boolean(notificationSettings['hardware.geofences.enable']),
    fuelLevel: Boolean(notificationSettings['hardware.fuel.level.enable']),
    speedControl: Boolean(notificationSettings['hardware.speed.control.enable']),
    immobilization: Boolean(notificationSettings['hardware.immobillize.enable']),
    maintenance: Boolean(notificationSettings['hardware.maintenance.enable']),
    idle: Boolean(notificationSettings['hardware.idle.enable']),
    crash: Boolean(notificationSettings['hardware.crash.enable']),
    tamper: Boolean(notificationSettings['hardware.tamper.enable']),
  };

  const [expandedAlerts, setExpandedAlerts] = useState<Record<AlertKey, boolean>>(initialExpandedState);

  useEffect(() => {
    setExpandedAlerts({
        geofence: Boolean(notificationSettings['hardware.geofences.enable']),
        fuelLevel: Boolean(notificationSettings['hardware.fuel.level.enable']),
        speedControl: Boolean(notificationSettings['hardware.speed.control.enable']),
        immobilization: Boolean(notificationSettings['hardware.immobillize.enable']),
        maintenance: Boolean(notificationSettings['hardware.maintenance.enable']),
        idle: Boolean(notificationSettings['hardware.idle.enable']),
        crash: Boolean(notificationSettings['hardware.crash.enable']),
        tamper: Boolean(notificationSettings['hardware.tamper.enable']),
    });
  }, [notificationSettings]);

    const toggleAlert = (alertKey: AlertKey) => {
      setExpandedAlerts(prev => ({ ...prev, [alertKey]: !prev[alertKey] }));
    };
  
  const handleAlertToggle = (alertKey: AlertKey, toggleType: 'enable' | 'sms' | 'email', value: boolean) => {
    const keys = alertKeyMap[alertKey];
  
    // Set the toggled value
    if (toggleType === 'enable') {
      onSettingsChange(keys.enable, value);
  
      // If Portal Alerts (enable) is turned off, also disable sms & email
      if (!value) {
        onSettingsChange(keys.sms, false);
        onSettingsChange(keys.email, false);
      }
    } else if (toggleType === 'sms') {
      onSettingsChange(keys.sms, value);
    } else if (toggleType === 'email') {
      onSettingsChange(keys.email, value);
    }
  
    // Auto-expand the alert card if not already open
    if (!expandedAlerts[alertKey]) {
      toggleAlert(alertKey);
    }
  };

    const alerts: Alert[] = [
        {
            key: 'geofence',
            title: 'Geofences Alert',
            icon: <Map size={20} />,
            description: 'Notify when vehicles enter or exit defined geographic boundaries',
            //triggerType: 'input',
            //inputType: 'number',
            //placeholder: 'Enter number',
            //priorityLevel: 'High'
        },
        {
            key: 'fuelLevel',
            title: 'Fuel Level Alert',
            icon: <Droplet size={20} />,
            description: 'Notify when fuel level falls below specified threshold',
            //triggerType: 'input',
            //inputType: 'percentage',
            //placeholder: '25%',
            //priorityLevel: 'Medium'
        },
        {
            key: 'speedControl',
            title: 'Speed Control Alert',
            icon: <Gauge size={20} />,
            description: 'Notify when vehicle exceeds speed limit',
            //triggerType: 'input',
            //inputType: 'speed',
            //placeholder: '70 km/h',
            //priorityLevel: 'High'
        },
        {
            key: 'immobilization',
            title: 'Immobillize Alert',
            icon: <Lock size={20} />,
            description: 'Notify when vehicle immobilization is activated',
            //triggerType: 'input',
            //inputType: 'number',
            //placeholder: 'Enter number',
            //priorityLevel: 'Critical'
        },
        {
            key: 'maintenance',
            title: 'Maintenance Alert',
            icon: <Lock size={20} />,
            description: 'Notify when a vehicle is due for preventive or predictive maintenance',
        },
        {
            key: 'idle',
            title: 'Idle Alert',
            icon: <Lock size={20} />,
            description: 'Notify when a vehicle remains idle beyond the specified duration',
        },
        {
            key: 'crash',
            title: 'Impact Sensing Alert',
            icon: <Lock size={20} />,
            description: 'Notify when a potential crash or strong impact is detected based on sensor thresholds',
        },
        {
            key: 'tamper',
            title: 'Tamper',
            icon: <Lock size={20} />,
            description: 'Notifies when the device is tampered with, such as disconnecting the power source (triggers an immediate power disconnect alarm and immobilizes the ignition) or removing external antennas (triggers an antenna disconnection alarm and activates immobilization).',
        },
    ];

    const alertKeyMap: Record<AlertKey, { enable: string, sms: string, email: string, threshold?: string }> = {
      geofence: {
        enable: 'hardware.geofences.enable',
        sms: 'hardware.geofences.receive.sms',
        email: 'hardware.geofences.receive.email',
        threshold: 'hardware.geofences.type',
      },
      fuelLevel: {
        enable: 'hardware.fuel.level.enable',
        sms: 'hardware.fuel.level.receive.sms',
        email: 'hardware.fuel.level.receive.email',
        threshold: 'hardware.fuel.level.min.threshold',
      },
      speedControl: {
        enable: 'hardware.speed.control.enable',
        sms: 'hardware.speed.control.receive.sms',
        email: 'hardware.speed.control.receive.email',
        threshold: 'hardware.speed.control.max.speed',
      },
      immobilization: {
        enable: 'hardware.immobillize.enable',
        sms: 'hardware.immobillize.receive.sms',
        email: 'hardware.immobillize.receive.email',
        threshold: 'hardware.immobillize.type',
      },
      maintenance: {
        enable: 'hardware.maintenance.enable',
        sms: 'hardware.maintenance.receive.sms',
        email: 'hardware.maintenance.receive.email',
        threshold: 'hardware.maintenance.min.severity',
      },
      idle: {
        enable: 'hardware.idle.enable',
        sms: 'hardware.idle.receive.sms',
        email: 'hardware.idle.receive.email',
        threshold: 'hardware.idle.min.threshold',
      },
      crash: {
        enable: 'hardware.crash.enable',
        sms: 'hardware.crash.receive.sms',
        email: 'hardware.crash.receive.email',
        threshold: 'hardware.crash.threshold',
      },
      tamper: {
        enable: 'hardware.tamper.enable',
        sms: 'hardware.tamper.receive.sms',
        email: 'hardware.tamper.receive.email',
        threshold: 'hardware.tamper.action',
      },
    };

    const ToggleSwitch: React.FC<{
      isChecked: boolean;
      onChange: (checked: boolean) => void;
      label: string;
      disabled?: boolean;
    }> = ({ isChecked, onChange, label, disabled = false }) => {
        const handleChange = () => {
            if (disabled) return;
            onChange(!isChecked);
        };
    
        return (
            <label className={`flex items-center ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} group`}>
                <div className="relative">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={isChecked}
                        onChange={handleChange}
                        disabled={disabled}
                    />
                    <div className={`w-10 h-5 ${isChecked ? 'bg-blue-500' : 'bg-gray-300'} rounded-full shadow-inner transition-colors duration-300`} />
                    <div
                        className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                            isChecked ? 'transform translate-x-5' : 'translate-x-0'
                        }`}
                        style={{ top: '2px', left: '2px' }}
                    />
                </div>
                <div className="ml-3 text-gray-700 text-sm group-hover:text-gray-900">{label}</div>
            </label>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 w-full">
            {/* <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 text-white rounded-lg">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">General Alerts Settings</h1>
                        <p className="text-gray-500">Configure notification preferences for vehicle alerts</p>
                    </div>
                </div>
                <button
                    className="flex items-center px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                >
                    <Settings size={18} className="mr-2" />
                    <span>Configure All</span>
                </button>
            </div> */}

            <div className="space-y-6">
                {alerts.map(alert => {
                  const keys = alertKeyMap[alert.key];
                  const isAlertEnabled = Boolean(notificationSettings[keys.enable]);

                  return (
                    <div key={alert.key} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                        <div
                          className={`flex items-center justify-between p-4 ${isAlertEnabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${expandedAlerts[alert.key] ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'} transition-colors duration-300`}
                          onClick={() => {
                            if (isAlertEnabled) {
                              toggleAlert(alert.key);
                            }
                          }}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 ${expandedAlerts[alert.key] ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'} rounded-lg transition-colors duration-300`}>
                                    {alert.icon}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-semibold text-gray-800">{alert.title}</h3>
                                        {/* <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(alert.priorityLevel)}`}>
                                            {alert.priorityLevel}
                                        </span> */}
                                        <div onClick={(e) => e.stopPropagation()}>
                                          <ToggleSwitch
                                            label=""
                                            isChecked={Boolean(notificationSettings[keys.enable])}
                                            onChange={(checked) => handleAlertToggle(alert.key, 'enable', checked)}
                                            disabled={loading}
                                          />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                {expandedAlerts[alert.key] ?
                                    <ChevronUp size={20} className="text-blue-600" /> :
                                    <ChevronDown size={20} className="text-gray-400" />
                                }
                            </div>
                        </div>

                        {expandedAlerts[alert.key] && (
                            <div className="p-6 border-t border-gray-200 bg-white">
                                <div className="mb-6">
                                    <div className="flex items-center mb-4">
                                        <AlertTriangle size={16} className="text-blue-600 mr-2" />
                                        <h4 className="font-medium text-gray-800">Notification Channels</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ml-6">
                                      <ToggleSwitch
                                        label="Portal Alerts"
                                        isChecked={Boolean(notificationSettings[keys.enable])}
                                        onChange={(val) => handleAlertToggle(alert.key, 'enable', val)}
                                        disabled={loading}
                                      />

                                      <ToggleSwitch
                                        label="SMS Alerts"
                                        isChecked={Boolean(notificationSettings[keys.sms])}
                                        onChange={(val) => handleAlertToggle(alert.key, 'sms', val)}
                                        disabled={!Boolean(notificationSettings[keys.enable]) || loading}
                                      />

                                      <ToggleSwitch
                                        label="Email Notifications"
                                        isChecked={Boolean(notificationSettings[keys.email])}
                                        onChange={(val) => handleAlertToggle(alert.key, 'email', val)}
                                        disabled={!Boolean(notificationSettings[keys.enable]) || loading}
                                      />
                                    </div>
                                </div>

                                <div>
                                  {alert.key !== 'tamper' && (
                                    <div className="flex items-center mb-4">
                                      <Settings size={16} className="text-blue-600 mr-2" />
                                      <h4 className="font-medium text-gray-800">Alert Triggers</h4>
                                    </div>
                                  )}
                                  {alert.key === 'tamper' && (
                                    <div className="flex items-center mb-4">
                                      <Settings size={16} className="text-blue-600 mr-2" />
                                      <h4 className="font-medium text-gray-800">Actions</h4>
                                    </div>
                                  )}


                                  <div className="ml-6 space-y-4">
                                    {/* Geofence: Dropdown for Entering/Exiting/Both */}
                                    {alert.key === 'geofence' && (
                                      <select
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        disabled={loading}
                                        value={String(notificationSettings[keys.threshold!] ?? 'Both')}
                                        onChange={(e) => onSettingsChange(keys.threshold!, e.target.value)}
                                      >
                                        {['Both', 'Entering', 'Exiting'].map(option => (
                                          <option key={option} value={option}>{option}</option>
                                        ))}
                                      </select>
                                    )}

                                    {/* Fuel Level: Two input fields for min threshold and big drop */}
                                    {alert.key === 'fuelLevel' && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700">
                                            Minimum Fuel Level to Trigger (L)
                                          </label>
                                          <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Min Threshold %"
                                            value={Number(notificationSettings['hardware.fuel.level.min.threshold']) || 10}
                                            onChange={(e) => onSettingsChange('hardware.fuel.level.min.threshold', Number(e.target.value))}
                                            disabled={loading}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700">
                                            Instant Fuel Level Drop (L)
                                          </label>
                                          <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Big Drop L"
                                            value={Number(notificationSettings['hardware.fuel.level.big.drop']) || 10}
                                            onChange={(e) => onSettingsChange('hardware.fuel.level.big.drop', Number(e.target.value))}
                                            disabled={loading}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Speed Control: Max speed input */}
                                    {alert.key === 'speedControl' && (
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                          Maximun Speed to Trigger (km/h)
                                        </label>
                                        <input
                                          type="number"
                                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          placeholder="Max Speed"
                                          value={Number(notificationSettings[keys.threshold!]) || 90}
                                          onChange={(e) => onSettingsChange(keys.threshold!, Number(e.target.value))}
                                          disabled={loading}
                                        />
                                      </div>
                                    )}

                                    {/* Immobilization: Dropdown for On/Off/Both */}
                                    {alert.key === 'immobilization' && (
                                      <select
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        disabled={loading}
                                        value={String(notificationSettings[keys.threshold!] ?? 'Both')}
                                        onChange={(e) => onSettingsChange(keys.threshold!, e.target.value)}
                                      >
                                        {['Both', 'On', 'Off'].map(option => (
                                          <option key={option} value={option}>{option}</option>
                                        ))}
                                      </select>
                                    )}

                                    {/* Maintenance: Two input fields for min severity and max health score */}
                                    {alert.key === 'maintenance' && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700">
                                            Minimum Severity
                                          </label>
                                          <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Min Severity"
                                            value={Number(notificationSettings['hardware.maintenance.min.severity']) || 90}
                                            onChange={(e) => onSettingsChange('hardware.maintenance.min.severity', Number(e.target.value))}
                                            disabled={loading}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700">
                                            Maximum Health Score
                                          </label>
                                          <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Max Health Score"
                                            value={Number(notificationSettings['hardware.maintenance.max.health.score']) || 20}
                                            onChange={(e) => onSettingsChange('hardware.maintenance.max.health.score', Number(e.target.value))}
                                            disabled={loading}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Idle: Min speed input */}
                                    {alert.key === 'idle' && (
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                          Minimum idle time (minutes)
                                        </label>
                                        <input
                                          type="number"
                                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          placeholder="Min threshold"
                                          value={Number(notificationSettings[keys.threshold!]) || 5}
                                          onChange={(e) => onSettingsChange(keys.threshold!, Number(e.target.value))}
                                          disabled={loading}
                                        />
                                      </div>
                                    )}

                                    {/* Impact Sensing: Two input fields for threshold and duration */}
                                    {alert.key === 'crash' && (
                                      <div>
                                        <p className="text-sm text-gray-500 mb-4">
                                          The vehicle can detect various levels of impact using its sensors. For example, a light tap may register as a small event (Threshold = 100 mg, Duration = 1 ms), while a high-impact collision may be detected as a severe crash (Threshold = 4000 mg, Duration = 5 ms).
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                              Threshold (mg)
                                            </label>
                                            <input
                                              type="number"
                                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                              placeholder="Threshold"
                                              value={Number(notificationSettings['hardware.crash.threshold']) || 90}
                                              onChange={(e) => onSettingsChange('hardware.crash.threshold', Number(e.target.value))}
                                              disabled={loading}
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                              Duration (ms)
                                            </label>
                                            <input
                                              type="number"
                                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                              placeholder="Duration"
                                              value={Number(notificationSettings['hardware.crash.duration']) || 20}
                                              onChange={(e) => onSettingsChange('hardware.crash.duration', Number(e.target.value))}
                                              disabled={loading}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Tamper: Action for No/Immobilize */}
                                    {alert.key === 'tamper' && (
                                      <select
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        disabled={loading}
                                        value={String(notificationSettings[keys.threshold!] ?? 'No')}
                                        onChange={(e) => onSettingsChange(keys.threshold!, e.target.value)}
                                      >
                                        {['No', 'Immobilize'].map(option => (
                                          <option key={option} value={option}>{option}</option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                </div>

                                {/* <div className="mt-8 flex justify-end space-x-4">
                                    <button
                                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 min-w-[120px]"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px]"
                                        disabled={loading}
                                        onClick={handleSave}
                                    >
                                        <Check size={16} />
                                        <span>Save Changes</span>
                                    </button>
                                </div> */}
                            </div>
                        )}
                    </div>
                  )}  
                )}
            </div>
        </div>
    );
};

export default GeneralTab;
