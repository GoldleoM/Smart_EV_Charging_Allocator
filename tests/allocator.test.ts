import { calculatePriorityScore, allocateSlots } from '../src/engine/allocator';
import { Vehicle } from '../src/models/Vehicle';

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
