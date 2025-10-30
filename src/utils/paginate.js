// utils/paginate.js
export default async function paginate(Model, {
  query = {},
  sort = { createdAt: -1, _id: -1 },
  select = null,
  page = 1,
  limit = 20,
  maxLimit = 100,
  includeTotal = true,
}) {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), maxLimit);

  const findQ = Model.find(query).sort(sort).skip((p - 1) * l).limit(l).lean();
  if (select) findQ.select(select);

  const [items, total] = await Promise.all([
    findQ,
    includeTotal ? Model.countDocuments(query) : null,
  ]);

  const paging = includeTotal
    ? {
        page: p,
        limit: l,
        total,
        totalPages: Math.max(Math.ceil(total / l), 1),
        hasNext: p * l < total,
        hasPrev: p > 1,
      }
    : { page: p, limit: l, hasPrev: p > 1 };

  return { items, paging };
}
