import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { qrAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { 
  QrCode, 
  Search, 
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Calendar,
  Plus
} from 'lucide-react';

const QrCodes = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQrCodes();
  }, [currentPage, searchTerm, filterType]);

  const fetchQrCodes = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        type: filterType !== 'all' ? filterType : undefined
      };
      
      const response = await qrAPI.getAll(params);
      setQrCodes(response.data.qrCodes || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  const deleteQRCode = async (id) => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      try {
        await qrAPI.delete(id);
        toast.success('QR code deleted successfully');
        fetchQrCodes();
      } catch (error) {
        toast.error('Failed to delete QR code');
      }
    }
  };

  const downloadQR = (qrImage, title) => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  const filteredQrCodes = qrCodes.filter(qr => 
    qr.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const QrCodeCard = ({ qr }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={qr.qrImage}
            alt={qr.title}
            className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-600"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {qr.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {qr.type} QR Code
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/create?edit=${qr._id}`}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => deleteQRCode(qr._id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Eye className="h-4 w-4" />
            <span>{qr.scanCount || 0} scans</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{new Date(qr.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex space-x-2">
            <button 
              onClick={() => window.open(qr.qrImage, '_blank')}
              className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View</span>
            </button>
            <button 
              onClick={() => downloadQR(qr.qrImage, qr.title)}
              className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors text-sm"
            >
              <QrCode className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My QR Codes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all your QR codes in one place
          </p>
        </div>
        <Link
          to="/create"
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create New QR</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search QR codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="url">URL</option>
              <option value="text">Text</option>
              <option value="wifi">WiFi</option>
              <option value="vcard">vCard</option>
              <option value="file">File</option>
            </select>
          </div>
        </div>
      </div>

      {/* QR Codes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredQrCodes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredQrCodes.map((qr) => (
              <QrCodeCard key={qr._id} qr={qr} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No QR codes found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first QR code to get started'}
          </p>
          <Link
            to="/create"
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create QR Code</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default QrCodes;