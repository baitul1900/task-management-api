// plugins/softDelete.js
export default function softDeletePlugin(schema, options = {}) {
  // fields
  schema.add({
    deletedAt:   { type: Date, default: null, index: true },
    deletedBy:   { type: schema.constructor.Types.ObjectId, ref: options.userModel || 'User', default: null },
    deleteReason:{ type: String, default: null },
  });

  // ------- Query filters (exclude deleted by default) -------
  const excludeDeleted = function(next) {
    // Allow explicit opt-in via query helpers
    if (this._withDeleted) return next();
    this.where({ deletedAt: null });
    next();
  };

  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('count', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('findOneAndDelete', excludeDeleted);
  schema.pre('findOneAndRemove', excludeDeleted);

  // For aggregations, inject a $match unless explicitly opted-in.
  schema.pre('aggregate', function(next) {
    if (this.options && this.options.withDeleted) return next();
    // add at pipeline start
    this.pipeline().unshift({ $match: { deletedAt: null } });
    next();
  });

  // ------- Query helpers -------
  schema.query.withDeleted = function() {
    this._withDeleted = true; return this;
  };
  schema.query.onlyDeleted = function() {
    this._withDeleted = true; // allow deleted
    return this.where({ deletedAt: { $ne: null } });
  };
  schema.query.notDeleted = function() {
    this._withDeleted = false; // enforce not deleted
    return this.where({ deletedAt: null });
  };

  // ------- Instance helpers -------
  schema.methods.isDeleted = function() {
    return !!this.deletedAt;
  };

  // ------- Static helpers -------
  schema.statics.softDeleteById = async function({ id, actorId = null, reason = null }) {
    const doc = await this.findById(id).withDeleted();
    if (!doc) return null;
    if (doc.deletedAt) return doc; // already deleted (idempotent)
    doc.deletedAt = new Date();
    doc.deletedBy = actorId;
    doc.deleteReason = reason;
    // Optional: business flags (e.g., disable login)
    if ('isActive' in doc) doc.isActive = false;
    if ('refreshToken' in doc) doc.refreshToken = null;
    await doc.save();
    return doc;
  };

  schema.statics.restoreById = async function({ id }) {
    const doc = await this.findById(id).withDeleted();
    if (!doc) return null;
    if (!doc.deletedAt) return doc; // not deleted
    doc.deletedAt = null;
    doc.deletedBy = null;
    doc.deleteReason = null;
    if ('isActive' in doc) doc.isActive = true;
    await doc.save();
    return doc;
  };

  schema.statics.forceDeleteById = async function({ id }) {
    // hard delete from DB
    return this.deleteOne({ _id: id });
  };
}
