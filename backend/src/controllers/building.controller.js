import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as buildingService from '../services/building.service.js';

export const createBuilding = asyncHandler(async (req, res) => {
  const building = await buildingService.createBuilding(req.user, req.body);
  new ApiResponse(201, { building }, 'Building created successfully').send(res);
});

export const listBuildings = asyncHandler(async (req, res) => {
  const buildings = await buildingService.listBuildings(req.user, req.query.hostelId);
  new ApiResponse(200, { buildings }, 'Buildings fetched successfully').send(res);
});

export const getBuilding = asyncHandler(async (req, res) => {
  const building = await buildingService.getBuildingById(req.user, req.params.id);
  new ApiResponse(200, { building }, 'Building fetched successfully').send(res);
});

export const updateBuilding = asyncHandler(async (req, res) => {
  const building = await buildingService.updateBuilding(req.user, req.params.id, req.body);
  new ApiResponse(200, { building }, 'Building updated successfully').send(res);
});

export const addFloor = asyncHandler(async (req, res) => {
  const building = await buildingService.addFloor(req.user, req.params.id, req.body);
  new ApiResponse(201, { building }, 'Floor added successfully').send(res);
});