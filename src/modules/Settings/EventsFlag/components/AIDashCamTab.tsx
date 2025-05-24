import React, { useState } from 'react';
import { Bell, Camera, AlertCircle, Eye, Loader, ChevronDown, ChevronUp, AlertTriangle, Shield, Info, CheckCircle, Settings, LucideIcon, Mail } from 'lucide-react';

interface Alert {
    id: string;
    name: string;
    icon: LucideIcon;
    category: 'critical' | 'warning' | 'info';
}

interface AlertConfigRowProps {
    alert: Alert;
}

interface NotificationState {
    portal: boolean;
    sms: boolean;
    email: boolean;
}

interface ExpandedSections {
    adas: boolean;
    dsm: boolean;
}

interface AIDashCamTabProps {
  loading: boolean;
}

const AIDashCamTab: React.FC<AIDashCamTabProps> = ({ loading }) => {
    const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
        adas: true,
        dsm: false
    });

    const toggleSection = (section: keyof ExpandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const adasAlerts: Alert[] = [
        { id: 'collision', name: 'Collision Warning', icon: AlertCircle, category: 'critical' },
        { id: 'distance', name: 'Unsafe Distance', icon: AlertCircle, category: 'warning' },
        { id: 'harsh', name: 'Harsh Driving', icon: AlertCircle, category: 'warning' },
        { id: 'lane', name: 'Lane Departure', icon: AlertCircle, category: 'warning' },
        { id: 'pedestrian', name: 'Pedestrian Detected', icon: AlertCircle, category: 'critical' },
        { id: 'trafficSign', name: 'Traffic Sign Violation', icon: AlertCircle, category: 'info' },
        { id: 'cameraBlocked', name: 'Camera Blocked', icon: Camera, category: 'warning' }
    ];

    const dsmAlerts: Alert[] = [
        { id: 'distraction', name: 'Driver Distraction', icon: Eye, category: 'warning' },
        { id: 'abnormal', name: 'Driver Abnormal', icon: AlertCircle, category: 'critical' },
        { id: 'changed', name: 'Driver Changed', icon: AlertCircle, category: 'info' },
        { id: 'glasses', name: 'Driver Wearing Glasses', icon: Eye, category: 'info' },
        { id: 'mask', name: 'Driver Wearing Mask', icon: Eye, category: 'info' },
        { id: 'missing', name: 'Driver Missing', icon: AlertCircle, category: 'critical' },
        { id: 'phone', name: 'Driver Using the Phone', icon: AlertCircle, category: 'warning' },
        { id: 'eyesClosed', name: 'Driver\'s Eyes Closed', icon: Eye, category: 'warning' },
        { id: 'fatigue', name: 'Driver Fatigue', icon: AlertCircle, category: 'warning' },
        { id: 'seatbelt', name: 'Driver Not Wearing Seatbelt', icon: AlertCircle, category: 'warning' },
        { id: 'smoking', name: 'Driver Smoking', icon: AlertCircle, category: 'info' },
        { id: 'yawning', name: 'Driver Yawning', icon: Eye, category: 'info' },
        { id: 'acceleration', name: 'Harsh Acceleration', icon: AlertCircle, category: 'warning' },
        { id: 'braking', name: 'Harsh Braking', icon: AlertCircle, category: 'warning' },
        { id: 'cornering', name: 'Harsh Cornering', icon: AlertCircle, category: 'warning' },
        { id: 'idle', name: 'Idle Detected', icon: Loader, category: 'info' },
        { id: 'lowSpeed', name: 'Low Speed Detected', icon: Loader, category: 'info' },
        { id: 'overspeeding', name: 'Overspeeding Detected', icon: AlertCircle, category: 'critical' }
    ];

    interface AlertState {
        expanded: boolean;
        sensitivity: 'low' | 'medium' | 'high';
        notifications: NotificationState;
    }

    const getCategoryIcon = (category: Alert['category']) => {
        switch (category) {
            case 'critical': return <AlertTriangle size={14} className="text-red-500" />;
            case 'warning': return <AlertCircle size={14} className="text-orange-500" />;
            case 'info': return <Info size={14} className="text-blue-500" />;
            default: return null;
        }
    };

    const getCategoryStyle = (category: Alert['category']) => {
        switch (category) {
            case 'critical': return 'border-l-4 border-red-500 bg-red-50/50';
            case 'warning': return 'border-l-4 border-orange-500 bg-orange-50/50';
            case 'info': return 'border-l-4 border-blue-500 bg-blue-50/50';
            default: return '';
        }
    };

    const AlertConfigRow = ({ alert }: AlertConfigRowProps) => {
        const [state, setState] = useState<AlertState>({
            expanded: true,
            sensitivity: 'medium',
            notifications: {
                portal: true,
                sms: false,
                email: true
            }
        });

        const toggleExpanded = (e: React.MouseEvent) => {
            e.stopPropagation();
            setState(prev => ({ ...prev, expanded: !prev.expanded }));
        };

        const setSensitivity = (sensitivity: 'low' | 'medium' | 'high') => {
            setState(prev => ({ ...prev, sensitivity }));
        };

        const toggleNotification = (channel: keyof NotificationState) => {
            setState(prev => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    [channel]: !prev.notifications[channel]
                }
            }));
        };

        const { expanded, sensitivity, notifications } = state;
        const Icon = alert.icon;

        return (
            <div className="bg-white rounded-xl p-6">
                <button
                    className="w-full flex items-center justify-between"
                    onClick={toggleExpanded}
                >
                    <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${alert.category === 'critical' ? 'bg-red-500' : alert.category === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                        <div>
                            <h3 className="text-gray-900 font-medium">{alert.name}</h3>
                            <p className="text-gray-500 text-sm">12 incidents detected</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium px-2 py-1 rounded ${alert.category === 'critical' ? 'text-red-500 bg-red-50' : alert.category === 'warning' ? 'text-orange-500 bg-orange-50' : 'text-blue-500 bg-blue-50'}`}>
                            {alert.category}
                        </span>
                        <div className="p-1">
                            {expanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </div>
                </button>

                {expanded && <div className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm text-gray-600 mb-2 block">Sensitivity</label>
                        <div className="h-12 bg-gray-100 rounded-lg relative">
                            <div className="absolute inset-0 flex">
                                <button
                                    className={`flex-1 flex items-center justify-center relative z-10 text-sm transition-colors duration-200 ${sensitivity === 'low' ? 'text-white font-medium' : 'text-gray-500'}`}
                                    onClick={() => setSensitivity('low')}
                                >
                                    Low
                                </button>
                                <button
                                    className={`flex-1 flex items-center justify-center relative z-10 text-sm transition-colors duration-200 ${sensitivity === 'medium' ? 'text-white font-medium' : 'text-gray-500'}`}
                                    onClick={() => setSensitivity('medium')}
                                >
                                    Medium
                                </button>
                                <button
                                    className={`flex-1 flex items-center justify-center relative z-10 text-sm transition-colors duration-200 ${sensitivity === 'high' ? 'text-white font-medium' : 'text-gray-500'}`}
                                    onClick={() => setSensitivity('high')}
                                >
                                    High
                                </button>
                            </div>
                            <div
                                className="absolute inset-0 bg-blue-500 rounded-lg transition-all duration-200"
                                style={{
                                    width: '33.333%',
                                    transform: `translateX(${sensitivity === 'low' ? '0' : sensitivity === 'medium' ? '100%' : '200%'})`
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-2 block">Notifications</label>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-purple-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white rounded-lg">
                                        <Bell className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <span className="text-sm text-gray-700">Portal Alerts</span>
                                </div>
                                <button
                                    className="relative w-10 h-5 rounded-full focus:outline-none"
                                    onClick={() => toggleNotification('portal')}
                                >
                                    <div className={`absolute inset-0 ${notifications.portal ? 'bg-blue-500' : 'bg-gray-300'} rounded-full transition-colors`} />
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${notifications.portal ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <span className="text-sm text-gray-700">SMS Alerts</span>
                                </div>
                                <button
                                    className="relative w-10 h-5 rounded-full focus:outline-none"
                                    onClick={() => toggleNotification('sms')}
                                >
                                    <div className={`absolute inset-0 ${notifications.sms ? 'bg-blue-500' : 'bg-gray-300'} rounded-full transition-colors`} />
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${notifications.sms ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white rounded-lg">
                                        <Mail className="w-5 h-5 text-green-500" />
                                    </div>
                                    <span className="text-sm text-gray-700">Email Notifications</span>
                                </div>
                                <button
                                    className="relative w-10 h-5 rounded-full focus:outline-none"
                                    onClick={() => toggleNotification('email')}
                                >
                                    <div className={`absolute inset-0 ${notifications.email ? 'bg-blue-500' : 'bg-gray-300'} rounded-full transition-colors`} />
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${notifications.email ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
        );
    };

    return (
        <div className="space-y-6">


            {/* ADAS Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors duration-300 ${expandedSections.adas ? 'bg-green-50/50 border-b border-gray-200' : 'bg-white hover:bg-gray-50'}`}
                    onClick={() => toggleSection('adas')}
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-600 rounded-lg text-white">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">ADAS Alerts</h3>
                            <p className="text-sm text-gray-500">Advanced Driver Assistance System alerts</p>
                        </div>
                    </div>
                    <div className="p-2 bg-white rounded-full">
                        {expandedSections.adas ? <ChevronUp size={20} className="text-green-600" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                </div>

                {expandedSections.adas && (
                    <div className="p-4 bg-white">
                        <div className="space-y-2">
                            {adasAlerts.map(alert => (
                                <AlertConfigRow key={alert.id} alert={alert} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* DSM Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors duration-300 ${expandedSections.dsm ? 'bg-purple-50/50 border-b border-gray-200' : 'bg-white hover:bg-gray-50'}`}
                    onClick={() => toggleSection('dsm')}
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-600 rounded-lg text-white">
                            <Eye size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">DSM Alerts</h3>
                            <p className="text-sm text-gray-500">Driver State Monitoring alerts</p>
                        </div>
                    </div>
                    <div className="p-2 bg-white rounded-full">
                        {expandedSections.dsm ? <ChevronUp size={20} className="text-purple-600" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                </div>

                {expandedSections.dsm && (
                    <div className="p-4 bg-white">
                        <div className="space-y-2">
                            {dsmAlerts.map(alert => (
                                <AlertConfigRow key={alert.id} alert={alert} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AIDashCamTab;
