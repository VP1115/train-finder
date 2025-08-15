import { transportRestProvider } from '../src/lib/providers/transportRest';
import { PRICE_CACHE, JOURNEY_CACHE } from '../src/lib/providers/transportRest';

// Mock the fetch function
global.fetch = jest.fn();

describe('transportRestProvider', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Clear caches before each test
    PRICE_CACHE.clear();
    JOURNEY_CACHE.clear();
  });

  test('should fetch journeys successfully', async () => {
    // Mock the fetch response for journeys
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        journeys: [
          {
            legs: [
              {
                departure: '2023-01-01T08:00:00Z',
                arrival: '2023-01-01T13:00:00Z',
                origin: { id: '8002549', name: 'Hamburg Hbf' },
                destination: { id: '8400058', name: 'Amsterdam Centraal' },
                operator: { name: 'DB' },
                line: { name: 'ICE 123' }
              }
            ],
            transfers: 0,
            duration: 'PT5H0M',
            tickets: []
          }
        ]
      })
    // Mock the fetch response for prices (fallback)
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        tickets: [
          { price: 29.99, currency: 'EUR' }
        ]
      })
    });

    const result = await transportRestProvider.searchJourneys({
      originId: '8002549',
      destinationId: '8400058',
      date: '2023-01-01'
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('durationMinutes');
    expect(result[0]).toHaveProperty('transfers');
    expect(result[0]).toHaveProperty('legs');
    // Expect two fetch calls: one for journeys, one for prices
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('should handle API errors gracefully', async () => {
    // Mock the fetch response to simulate an error for journeys
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(
      transportRestProvider.searchJourneys({
        originId: '8002549',
        destinationId: '8400058',
        date: '2023-01-01'
      })
    ).rejects.toThrow('Transport REST error: 500');
  });

  test('should handle empty journey results', async () => {
    // Mock the fetch response with empty journeys
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        journeys: []
      })
    // Mock the fetch response for prices (fallback) to also be empty
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        tickets: []
      })
    });

    const result = await transportRestProvider.searchJourneys({
      originId: '8002549',
      destinationId: '8400058',
      date: '2023-01-01'
    });

    expect(result).toHaveLength(0);
  });
});