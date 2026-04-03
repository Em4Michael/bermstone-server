const Property   = require('../models/Property');
const Investment = require('../models/Investment');
const Booking    = require('../models/Booking');
const Inquiry    = require('../models/Inquiry');
const Review     = require('../models/Review');
const User       = require('../models/User');

// GET /api/analytics/overview  (admin)
exports.getOverview = async (_req, res, next) => {
  try {
    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    const [
      totalProperties, activeProperties,
      totalInvestments,
      totalBookings, pendingBookings, confirmedBookings,
      totalInquiries, newInquiries,
      totalUsers,
      totalReviews,
      investmentAgg,
      revenueAgg,
      bookingsByMonth,
      topProperties,
      inquiryByType,
    ] = await Promise.all([
      Property.countDocuments({}),
      Property.countDocuments({ isActive: true }),
      Investment.countDocuments({}),
      Booking.countDocuments({}),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Inquiry.countDocuments({}),
      Inquiry.countDocuments({ status: 'new' }),
      User.countDocuments({}),
      Review.countDocuments({}),

      // Investment funding totals
      Investment.aggregate([{
        $group: {
          _id:          null,
          totalTarget:  { $sum: '$totalAmount' },
          totalRaised:  { $sum: '$currentlyRaised' },
        },
      }]),

      // Total revenue (non-cancelled bookings)
      Booking.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      // Bookings by month — last 12 months
      Booking.aggregate([
        { $match: { createdAt: { $gte: yearAgo } } },
        {
          $group: {
            _id:     { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count:   { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Top 5 properties by booking count
      Booking.aggregate([
        { $group: { _id: '$property', bookings: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'properties', localField: '_id', foreignField: '_id', as: 'property' } },
        { $unwind: '$property' },
        { $project: { 'property.name': 1, 'property.coverImage': 1, bookings: 1, revenue: 1 } },
      ]),

      // Inquiries by type
      Inquiry.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      data: {
        properties:  { total: totalProperties, active: activeProperties },
        investments: {
          total:       totalInvestments,
          totalTarget: investmentAgg[0]?.totalTarget || 0,
          totalRaised: investmentAgg[0]?.totalRaised  || 0,
        },
        bookings:  { total: totalBookings, pending: pendingBookings, confirmed: confirmedBookings },
        inquiries: { total: totalInquiries, new: newInquiries },
        users:     { total: totalUsers },
        reviews:   { total: totalReviews },
        revenue:   { total: revenueAgg[0]?.total || 0 },
        charts:    { bookingsByMonth, topProperties, inquiryByType },
      },
    });
  } catch (err) { next(err); }
};
