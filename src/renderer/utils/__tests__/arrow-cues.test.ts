import {
  getBreathingArrowAnchor,
  getBreathingArrowPositions,
  getGenericBreathingArrowPositions,
} from '../arrow-cues';

describe('getBreathingArrowAnchor', () => {
  it('tracks the runtime shape position', () => {
    expect(getBreathingArrowAnchor({ x: 24, y: -12 })).toEqual({ centerX: 124, centerY: 88 });
  });
});

describe('getBreathingArrowPositions', () => {
  it('maps left airflow to one inward/outward cue', () => {
    expect(getBreathingArrowPositions('left', 100, 100, 70)).toEqual([
      {
        x: 30,
        y: 100,
        inwardDirection: 'right',
        outwardDirection: 'left',
      },
    ]);
  });

  it('maps right airflow to one inward/outward cue', () => {
    expect(getBreathingArrowPositions('right', 100, 100, 70)).toEqual([
      {
        x: 170,
        y: 100,
        inwardDirection: 'left',
        outwardDirection: 'right',
      },
    ]);
  });

  it('maps both nostrils to mirrored cues', () => {
    expect(getBreathingArrowPositions('both', 100, 100, 70)).toHaveLength(2);
  });
});

describe('getGenericBreathingArrowPositions', () => {
  it('uses vertical cues only for ordinary breathing', () => {
    expect(getGenericBreathingArrowPositions(100, 100, 70)).toEqual([
      { x: 100, y: 30, inwardDirection: 'down', outwardDirection: 'up' },
      { x: 100, y: 170, inwardDirection: 'up', outwardDirection: 'down' },
    ]);
  });
});
