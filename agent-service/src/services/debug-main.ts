import { Request, Response, NextFunction } from "express";
import { main } from "./main";
import dataKunjunganRawatInapService from "./dataKunjunganRawatInapService";

// Mock request, response, and next objects for testing.
const mockRequest = {} as Request; // or more complex mock
const mockResponse = {
    status: () => mockResponse,
    send: () => {},
} as unknown as Response;
const mockNext = () => {};

console.log("On Process");

main(mockRequest, mockResponse, mockNext).catch((err: Error) => {
    console.error("Error in main:", err);
    process.exit(1); // Optional: exit the process if main encounters an error.
});

console.log("Done");

// dataKunjunganRawatInapService();
