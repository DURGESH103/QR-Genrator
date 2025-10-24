const QrCode = require('../models/QrCode');
const Scan = require('../models/Scan');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total QR codes
    const totalQRCodes = await QrCode.countDocuments({ user: userId });

    // Get total scans
    const qrCodes = await QrCode.find({ user: userId }).select('_id');
    const qrCodeIds = qrCodes.map(qr => qr._id);
    const totalScans = await Scan.countDocuments({ qrCode: { $in: qrCodeIds } });

    // Get active QR codes
    const activeQRCodes = await QrCode.countDocuments({ user: userId, isActive: true });

    // Get recent scans (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentScans = await Scan.countDocuments({
      qrCode: { $in: qrCodeIds },
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        totalQRCodes,
        totalScans,
        activeQRCodes,
        recentScans
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getScanAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d', qrCodeId } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      default:
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }

    // Get user's QR codes
    let qrCodeFilter = { user: userId };
    if (qrCodeId) {
      qrCodeFilter._id = qrCodeId;
    }

    const qrCodes = await QrCode.find(qrCodeFilter).select('_id');
    const qrCodeIds = qrCodes.map(qr => qr._id);

    // Scans over time
    const scansOverTime = await Scan.aggregate([
      {
        $match: {
          qrCode: { $in: qrCodeIds },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Device breakdown
    const deviceBreakdown = await Scan.aggregate([
      {
        $match: {
          qrCode: { $in: qrCodeIds },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 }
        }
      }
    ]);

    // Location breakdown
    const locationBreakdown = await Scan.aggregate([
      {
        $match: {
          qrCode: { $in: qrCodeIds },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$location.country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Browser breakdown
    const browserBreakdown = await Scan.aggregate([
      {
        $match: {
          qrCode: { $in: qrCodeIds },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top performing QR codes
    const topQRCodes = await Scan.aggregate([
      {
        $match: {
          qrCode: { $in: qrCodeIds },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$qrCode',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'qrcodes',
          localField: '_id',
          foreignField: '_id',
          as: 'qrCode'
        }
      },
      {
        $project: {
          count: 1,
          title: { $arrayElemAt: ['$qrCode.title', 0] },
          type: { $arrayElemAt: ['$qrCode.type', 0] }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        scansOverTime,
        deviceBreakdown,
        locationBreakdown,
        browserBreakdown,
        topQRCodes
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getQRCodeAnalytics = async (req, res) => {
  try {
    const qrCode = await QrCode.findById(req.params.id);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    if (qrCode.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get detailed scan data for this QR code
    const scans = await Scan.find({ qrCode: req.params.id })
      .sort({ createdAt: -1 })
      .limit(100);

    // Scans over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const scansOverTime = await Scan.aggregate([
      {
        $match: {
          qrCode: qrCode._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      qrCode,
      scans,
      scansOverTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getScanAnalytics,
  getQRCodeAnalytics
};