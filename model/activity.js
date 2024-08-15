const activitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: String, // e.g., 'view', 'click', 'purchase'
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    timestamp: { type: Date, default: Date.now }
  });
  
  const Activity = mongoose.model('Activity', activitySchema);

  module.exports = Activity