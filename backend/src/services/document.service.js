import { Document } from '../models/Document.model.js';
import { Resident } from '../models/Resident.model.js';
import { uploadBufferToCloudinary, cloudinary } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';

export async function uploadDocument(user, residentId, file, { fileType }) {
  if (!file) throw ApiError.badRequest('No file was uploaded');

  const resident = await Resident.findById(residentId);
  if (!resident) throw ApiError.notFound('Resident not found');
  const hostelId = resolveHostelScope(user, resident.hostelId.toString());

  const result = await uploadBufferToCloudinary(file.buffer, {
    folder: `hostel-management/${hostelId}/residents/${residentId}`,
    resource_type: 'auto',
  });

  try {
    return await Document.create({
      hostelId,
      residentId,
      fileType,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: result.secure_url,
      publicId: result.public_id,
      uploadedBy: user.id,
    });
  } catch (err) {
    // The Cloudinary upload already succeeded — clean it up if the DB
    // write failed, so we don't leak orphaned files.
    await cloudinary.uploader.destroy(result.public_id).catch(() => {});
    throw err;
  }
}

export async function listDocumentsForResident(user, residentId) {
  const resident = await Resident.findById(residentId);
  if (!resident) throw ApiError.notFound('Resident not found');
  resolveHostelScope(user, resident.hostelId.toString());

  return Document.find({ residentId }).sort({ createdAt: -1 });
}

export async function deleteDocument(user, residentId, id) {
  const doc = await Document.findOne({ _id: id, residentId });
  if (!doc) throw ApiError.notFound('Document not found');
  resolveHostelScope(user, doc.hostelId.toString());

  await cloudinary.uploader.destroy(doc.publicId).catch(() => {});
  await doc.deleteOne();
}