/**
 * Available breathing shapes
 */

import type { BreathingShape } from '../types/breathing.types';

export const BREATHING_SHAPES: BreathingShape[] = [
  {
    id: 'circle',
    name: 'Circle',
    type: 'circle',
    description: 'Classic circular breathing'
  },
  {
    id: 'triangle',
    name: 'Triangle',
    type: 'triangle',
    svgPath: 'M100,20 L180,160 L20,160 Z',
    description: 'Sharp focus breathing'
  },
  {
    id: 'square',
    name: 'Square',
    type: 'square',
    svgPath: 'M40,40 L160,40 L160,160 L40,160 Z',
    description: 'Box breathing visualization'
  },
  {
    id: 'star',
    name: 'Star',
    type: 'star',
    svgPath: 'M100,20 L112,68 L160,68 L122,100 L135,148 L100,120 L65,148 L78,100 L40,68 L88,68 Z',
    description: 'Energy breathing'
  },
  {
    id: 'heart',
    name: 'Heart',
    type: 'heart',
    svgPath: 'M100,160 C100,160 60,120 60,90 C60,70 80,50 100,60 C120,50 140,70 140,90 C140,120 100,160 100,160 Z',
    description: 'Loving-kindness breathing'
  }
];
