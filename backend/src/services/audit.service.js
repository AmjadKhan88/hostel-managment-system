import { AuditLog } from '../models/AuditLog.model.js';
import { logger } from '../config/logger.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';

/**
 * Fire-and-forget audit recording. Never throws — a failure to write an
 * audit entry must never break the underlying business operation it
 * describes. Callers are responsible for keeping `metadata` safe (no
 * passwords, tokens, or other secrets) before it reaches here.
 */
export function recordAuditLog({ hostelId, actorId, actorName, action, entityType, entityId, metadata }) {
  AuditLog.create({
    hostelId: hostelId ?? null,
    actorId: actorId ?? null,
    actorName: actorName ?? null,
    action,
    entityType: entityType ?? null,
    entityId: entityId ?? null,
    metadata: metadata ?? {},
  }).catch((err) => {
    logger.error({ err, action }, 'Failed to record audit log entry');
  });
}

export async function listAuditLogs(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query, { defaultLimit: 25, maxLimit: 100 });

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.action) filter.action = query.action;
  if (query.entityType) filter.entityType = query.entityType;
  if (query.actorId) filter.actorId = query.actorId;

  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('actorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}