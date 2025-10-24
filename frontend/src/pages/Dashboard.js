import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, qrAPI } from '../utils/api';
import { 
  QrCode, 
  Eye, 
  TrendingUp, 
  Calendar,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentQRCodes, setRecentQRCodes] = useState([]);
  const [scanData, setScanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, qrCodesRes, analyticsRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        qrAPI.getAll({ limit: 5 }),
        analyticsAPI.getScanAnalytics({ period: '7d' })
      ]);

      setStats(statsRes.data.stats || {});
      setRecentQRCodes(qrCodesRes.data.qrCodes || []);
      setScanData(analyticsRes.data.analytics?.scansOverTime || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({});
      setRecentQRCodes([]);
      setScanData([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteQRCode = async (id) => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      try {
        await qrAPI.delete(id);
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting QR code:', error);
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your QR codes today.
          </p>
        </div>
        <Link
          to="/create"
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create QR Code</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total QR Codes"
          value={stats.totalQRCodes || 0}
          icon={QrCode}
          color="bg-blue-500"
          change={12}
        />
        <StatCard
          title="Total Scans"
          value={stats.totalScans || 0}
          icon={Eye}
          color="bg-green-500"
          change={8}
        />
        <StatCard
          title="Active QR Codes"
          value={stats.activeQRCodes || 0}
          icon={TrendingUp}
          color="bg-purple-500"
          change={-2}
        />
        <StatCard
          title="Recent Scans"
          value={stats.recentScans || 0}
          icon={Calendar}
          color="bg-orange-500"
          change={15}
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Analytics Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Scan Analytics
            </h3>
            <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scanData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent QR Codes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent QR Codes
            </h3>
            <Link
              to="/qr-codes"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentQRCodes.map((qr) => (
              <div key={qr._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={qr.qrImage}
                    alt={qr.title}
                    className="w-10 h-10 rounded-md"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {qr.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {qr.type} • {qr.scanCount} scans
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => deleteQRCode(qr._id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {recentQRCodes.length === 0 && (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No QR codes yet. Create your first one!
                </p>
                <Link
                  to="/create"
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mt-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create QR Code</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/create?type=url"
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <div className="p-2 bg-blue-500 rounded-lg">
              <ExternalLink className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">URL QR</span>
          </Link>
          
          <Link
            to="/create?type=text"
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <div className="p-2 bg-green-500 rounded-lg">
              <QrCode className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Text QR</span>
          </Link>
          
          <Link
            to="/create?type=wifi"
            className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <div className="p-2 bg-purple-500 rounded-lg">
              <QrCode className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">WiFi QR</span>
          </Link>
          
          <Link
            to="/analytics"
            className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <div className="p-2 bg-orange-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;