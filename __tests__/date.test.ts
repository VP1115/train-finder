import { addDays } from '../src/lib/date';

describe('date utility', () => {
  test('addDays should correctly add days to a date', () => {
    // Test adding 1 day
    expect(addDays('2023-01-01', 1)).toBe('2023-01-02');
    
    // Test adding 5 days
    expect(addDays('2023-01-01', 5)).toBe('2023-01-06');
    
    // Test adding 0 days
    expect(addDays('2023-01-01', 0)).toBe('2023-01-01');
    
    // Test adding days across month boundary
    expect(addDays('2023-01-31', 1)).toBe('2023-02-01');
    
    // Test adding days across year boundary
    expect(addDays('2023-12-31', 1)).toBe('2024-01-01');
  });
});