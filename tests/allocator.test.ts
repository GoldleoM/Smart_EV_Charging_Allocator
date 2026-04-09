import { calculatePriorityScore, allocateSlots } from '../src/engine/allocator';
import { Vehicle, VehiclesMap } from '../src/models/Vehicle';
import { StationsMap } from '../src/models/Station';

describe('Allocator Priority Scoring', () => {
    it('prioritizes low battery heavily', () => {
        const vehicleLowBattery = { batteryLevel: 10, etaMinutes: 5 } as Vehicle;
        const vehicleHighBattery = { batteryLevel: 80, etaMinutes: 5 } as Vehicle;

        const scoreLow = calculatePriorityScore(vehicleLowBattery);
        const scoreHigh = calculatePriorityScore(vehicleHighBattery);

        expect(scoreLow).toBeGreaterThan(scoreHigh);
    });

    it('prioritizes low ETA', () => {
        const vehicleClose = { batteryLevel: 50, etaMinutes: 1 } as Vehicle;
        const vehicleFar = { batteryLevel: 50, etaMinutes: 20 } as Vehicle;

        const scoreClose = calculatePriorityScore(vehicleClose);
        const scoreFar = calculatePriorityScore(vehicleFar);

        expect(scoreClose).toBeGreaterThan(scoreFar);
    });
});

describe('Allocator Queue Bumping', () => {
    it('critical vehicle bumps a lower priority reserved vehicle when full', () => {
        const vehicles: VehiclesMap = {
            v1: {
                id: 'v1',
                batteryLevel: 25,
                etaMinutes: 2,
                status: 'RESERVED',
                targetStationId: 'station_1',
                queuePriorityScore: 0,
                location: { lat: 0, lng: 0 }
            },
            v2: {
                id: 'v2',
                batteryLevel: 5, // CRITICAL
                etaMinutes: 2,
                status: 'driving',
                targetStationId: 'station_1',
                queuePriorityScore: 0,
                location: { lat: 0, lng: 0 }
            }
        };

        const stations: StationsMap = {
            station_1: {
                name: 'Test',
                availableParking: 0, // NO FREE SLOTS
                availableChargers: 0,
                totalParking: 1,
                totalChargers: 1,
                location: { lat: 0, lng: 0 }
            }
        };

        const updates = allocateSlots(vehicles, stations);

        // v2 should steal the slot
        expect(updates['/vehicles/v2/status']).toBe('RESERVED');
        // v1 should be demoted
        expect(updates['/vehicles/v1/status']).toBe('driving');
        // Capacities remain unmodified in payload because net swap is zero
        expect(updates['/stations/station_1/availableParking']).toBeUndefined();
    });
});
