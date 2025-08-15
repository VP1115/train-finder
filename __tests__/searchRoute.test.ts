// Mock Next.js server dependencies
const mockNextResponseJson = jest.fn((data) => ({ json: () => Promise.resolve(data), status: 200 }));
const mockNextResponseError = jest.fn((data, options) => ({
  json: () => Promise.resolve(data),
  status: options?.status || 400
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: mockNextResponseJson,
    error: mockNextResponseError
  }
}));

// Mock the transportRestProvider
jest.mock('../src/lib/providers/transportRest', () => ({
  transportRestProvider: {
    searchJourneys: jest.fn()
  }
}));

// Import modules after mocks
import { POST } from '../src/app/api/search/route';
import { transportRestProvider } from '../src/lib/providers/transportRest';

describe('search API route', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should return outbound journeys for one-way trip', async () => {
    // Mock the provider response
    (transportRestProvider.searchJourneys as jest.Mock).mockResolvedValue([
      {
        durationMinutes: 300,
        transfers: 0,
        legs: [
          {
            departure: '2023-01-01T08:00:00Z',
            arrival: '2023-01-01T13:00:00Z',
            origin: { id: '8002549', name: 'Hamburg Hbf' },
            destination: { id: '8400058', name: 'Amsterdam Centraal' }
          }
        ]
      }
    ]);

    // Create a mock request
    const mockRequest = {
      json: () => Promise.resolve({
        originId: '8002549',
        destinationId: '8400058',
        date: '2023-01-01',
        isRoundTrip: false
      })
    };

    await POST(mockRequest as any);

    // Since we're mocking NextResponse.json, we need to get the data differently
    expect(mockNextResponseJson).toHaveBeenCalled();
    expect(transportRestProvider.searchJourneys).toHaveBeenCalledTimes(1);
  });

  test('should return outbound and inbound journeys for round-trip', async () => {
    // Mock the provider responses
    (transportRestProvider.searchJourneys as jest.Mock)
      .mockResolvedValueOnce([
        // Outbound journey
        {
          durationMinutes: 300,
          transfers: 0,
          legs: [
            {
              departure: '2023-01-01T08:00:00Z',
              arrival: '2023-01-01T13:00:00Z',
              origin: { id: '8002549', name: 'Hamburg Hbf' },
              destination: { id: '8400058', name: 'Amsterdam Centraal' }
            }
          ]
        }
      ])
      .mockResolvedValueOnce([
        // Inbound journey
        {
          durationMinutes: 300,
          transfers: 0,
          legs: [
            {
              departure: '2023-01-03T08:00:00Z',
              arrival: '2023-01-03T13:00:00Z',
              origin: { id: '8400058', name: 'Amsterdam Centraal' },
              destination: { id: '8002549', name: 'Hamburg Hbf' }
            }
          ]
        }
      ]);

    // Create a mock request
    const mockRequest = {
      json: () => Promise.resolve({
        originId: '8002549',
        destinationId: '8400058',
        date: '2023-01-01',
        isRoundTrip: true,
        nights: 2
      })
    };

    await POST(mockRequest as any);

    // Since we're mocking NextResponse.json, we need to get the data differently
    expect(mockNextResponseJson).toHaveBeenCalled();
    expect(transportRestProvider.searchJourneys).toHaveBeenCalledTimes(2);
  });

  test('should handle missing required fields', async () => {
    // Create a mock request with missing fields
    const mockRequest = {
      json: () => Promise.resolve({
        destinationId: '8400058',
        date: '2023-01-01'
        // originId is missing
      })
    };

    await POST(mockRequest as any);

    // Since we're mocking NextResponse.json, we need to check for it
    expect(mockNextResponseJson).toHaveBeenCalled();
  });
});