import { Building } from '../models/Building.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';

export async function createBuilding(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const existing = await Building.findOne({ hostelId, name: data.name });
  if (existing) throw ApiError.conflict('A building with this name already exists in this hostel');

  return Building.create({ hostelId, name: data.name, floors: data.floors ?? [] });
}

export async function listBuildings(user, requestedHostelId) {
  const hostelId = resolveHostelScope(user, requestedHostelId);
  const filter = hostelId ? { hostelId } : {};
  return Building.find(filter).sort({ name: 1 });
}

export async function getBuildingById(user, id) {
  const building = await Building.findById(id);
  if (!building) throw ApiError.notFound('Building not found');
  resolveHostelScope(user, building.hostelId.toString());
  return building;
}

export async function updateBuilding(user, id, data) {
  const building = await getBuildingById(user, id);
  Object.assign(building, data);
  await building.save();
  return building;
}

export async function addFloor(user, buildingId, floorData) {
  const building = await getBuildingById(user, buildingId);
  const duplicate = building.floors.some(
    (f) => f.name.toLowerCase() === floorData.name.toLowerCase()
  );
  if (duplicate) throw ApiError.conflict('A floor with this name already exists in this building');

  building.floors.push(floorData);
  await building.save();
  return building;
}