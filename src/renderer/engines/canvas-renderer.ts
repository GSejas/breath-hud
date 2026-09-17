/**
 * Canvas Renderer for breathing shapes
 * Handles all canvas drawing operations
 */

import type { BreathingShape } from '../../shared/types/breathing.types';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private readonly WIDTH = 200;
  private readonly HEIGHT = 200;

  constructor(container: HTMLElement) {
    this.initializeCanvas(container);
  }

  /**
   * Initialize canvas element
   */
  private initializeCanvas(container: HTMLElement): void {
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = this.WIDTH;
    canvas.height = this.HEIGHT;
    canvas.style.cssText =
      'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); cursor: pointer;';
    canvas.className = 'breathing-canvas';

    container.appendChild(canvas);
    this.canvas = canvas;
    this.context = canvas.getContext('2d') || null;
  }

  /**
   * Clear canvas
   */
  public clear(): void {
    if (!this.context || !this.canvas) return;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Get canvas context
   */
  public getContext(): CanvasRenderingContext2D | null {
    return this.context;
  }

  /**
   * Draw circle shape
   */
  public drawCircle(
    centerX: number,
    centerY: number,
    radius: number,
    color: string,
    opacity: number
  ): void {
    if (!this.context) return;

    const ctx = this.context;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw stroked shape
   */
  public drawStrokedShape(
    centerX: number,
    centerY: number,
    radius: number,
    color: string,
    opacity: number,
    lineWidth: number = 3.5,
    drawPath: (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => void
  ): void {
    if (!this.context) return;

    const ctx = this.context;
    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = opacity;

    ctx.beginPath();
    drawPath(ctx, centerX, centerY, radius);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Apply glow effect
   */
  public applyGlow(
    centerX: number,
    centerY: number,
    blurRadius: number,
    color: string
  ): void {
    if (!this.context) return;

    const ctx = this.context;
    ctx.shadowColor = color;
    ctx.shadowBlur = blurRadius;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  /**
   * Clear glow effect
   */
  public clearGlow(): void {
    if (!this.context) return;
    this.context.shadowColor = 'transparent';
    this.context.shadowBlur = 0;
  }

  /**
   * Draw triangle
   */
  public drawTriangle(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX + radius * 0.866, centerY + radius * 0.5);
    ctx.lineTo(centerX - radius * 0.866, centerY + radius * 0.5);
    ctx.closePath();
  }

  /**
   * Draw square
   */
  public drawSquare(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    const half = radius * 0.707;
    ctx.rect(centerX - half, centerY - half, half * 2, half * 2);
  }

  /**
   * Draw star
   */
  public drawStar(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.4;

    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.moveTo(centerX, centerY - outerRadius);

    for (let i = 0; i < spikes; i++) {
      const x = centerX + Math.cos(rot) * outerRadius;
      const y = centerY + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      const x2 = centerX + Math.cos(rot) * innerRadius;
      const y2 = centerY + Math.sin(rot) * innerRadius;
      ctx.lineTo(x2, y2);
      rot += step;
    }

    ctx.lineTo(centerX, centerY - outerRadius);
    ctx.closePath();
  }

  /**
   * Draw heart
   */
  public drawHeart(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    const scale = radius / 60;
    const width = 60 * scale;
    const height = 50 * scale;

    ctx.moveTo(centerX, centerY + height * 0.3);
    ctx.bezierCurveTo(
      centerX,
      centerY - height * 0.1,
      centerX - width * 0.5,
      centerY - height * 0.5,
      centerX - width * 0.25,
      centerY - height * 0.1
    );
    ctx.bezierCurveTo(
      centerX - width * 0.1,
      centerY - height * 0.3,
      centerX + width * 0.1,
      centerY - height * 0.3,
      centerX + width * 0.25,
      centerY - height * 0.1
    );
    ctx.bezierCurveTo(
      centerX + width * 0.5,
      centerY - height * 0.5,
      centerX,
      centerY - height * 0.1,
      centerX,
      centerY + height * 0.3
    );
  }

  /**
   * Draw nostril breathing visualization
   */
  public drawNostrilShape(
    centerX: number,
    centerY: number,
    radius: number,
    leftActive: boolean,
    rightActive: boolean,
    activeColor: string,
    inactiveColor: string,
    baseOpacity: number,
    shapeFn: (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => void
  ): void {
    if (!this.context) return;
    const ctx = this.context;

    // Left half
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, centerX, 200);
    ctx.clip();

    ctx.beginPath();
    ctx.globalAlpha = leftActive ? baseOpacity : baseOpacity * 0.25;
    ctx.strokeStyle = leftActive ? activeColor : inactiveColor;

    if (leftActive) {
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 15;
    }

    shapeFn(ctx, centerX, centerY, radius);
    ctx.stroke();
    ctx.restore();

    // Right half
    ctx.save();
    ctx.beginPath();
    ctx.rect(centerX, 0, 200, 200);
    ctx.clip();

    ctx.beginPath();
    ctx.globalAlpha = rightActive ? baseOpacity : baseOpacity * 0.25;
    ctx.strokeStyle = rightActive ? activeColor : inactiveColor;

    if (rightActive) {
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 15;
    }

    shapeFn(ctx, centerX, centerY, radius);
    ctx.stroke();
    ctx.restore();

    // Center dividing line
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(centerX, centerY - radius - 10);
    ctx.lineTo(centerX, centerY + radius + 10);
    ctx.stroke();
    ctx.restore();

    ctx.globalAlpha = 1.0;
  }

  /**
   * Draw directional arrows indicating breathing phase
   * @param direction 'in' for inhale (upward), 'out' for exhale (downward)
   * @param centerX X coordinate of arrow center
   * @param centerY Y coordinate of arrow center
   * @param color Arrow color
   * @param opacity Arrow opacity (0-1)
   * @param arrowSize Size of arrows (number of arrows or size multiplier)
   */
  public drawDirectionalArrows(
    direction: 'in' | 'out',
    centerX: number,
    centerY: number,
    color: string,
    opacity: number,
    arrowSize: number = 3
  ): void {
    if (!this.context) return;

    const ctx = this.context;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw multiple arrows based on size
    const arrowCount = Math.max(2, Math.min(5, Math.floor(arrowSize)));
    const spacing = 40 / arrowCount;
    const startY = centerY - (spacing * (arrowCount - 1)) / 2;

    for (let i = 0; i < arrowCount; i++) {
      const y = startY + i * spacing;
      const arrowX = centerX;
      const arrowY = y;
      const arrowLength = 20;
      const headSize = 8;

      if (direction === 'in') {
        // Upward arrow (inhale)
        // Shaft
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY + arrowLength);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();

        // Arrowhead pointing up
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - headSize / 2, arrowY + headSize);
        ctx.lineTo(arrowX + headSize / 2, arrowY + headSize);
        ctx.closePath();
        ctx.fill();
      } else {
        // Downward arrow (exhale)
        // Shaft
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY - arrowLength);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();

        // Arrowhead pointing down
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - headSize / 2, arrowY - headSize);
        ctx.lineTo(arrowX + headSize / 2, arrowY - headSize);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Draw single arrow for minimal visualization
   * @param direction 'in' or 'out'
   * @param centerX X coordinate
   * @param centerY Y coordinate
   * @param color Arrow color
   * @param opacity Arrow opacity
   */
  public drawSingleArrow(
    direction: 'in' | 'out',
    centerX: number,
    centerY: number,
    color: string,
    opacity: number
  ): void {
    if (!this.context) return;

    const ctx = this.context;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const arrowLength = 30;
    const headSize = 10;

    if (direction === 'in') {
      // Upward arrow
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + arrowLength);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX - headSize / 2, centerY + headSize);
      ctx.lineTo(centerX + headSize / 2, centerY + headSize);
      ctx.closePath();
      ctx.fill();
    } else {
      // Downward arrow
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - arrowLength);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX - headSize / 2, centerY - headSize);
      ctx.lineTo(centerX + headSize / 2, centerY - headSize);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Render a shape to canvas
   */
  public render(
    shape: BreathingShape,
    centerX: number,
    centerY: number,
    radius: number,
    primaryColor: string,
    opacity: number
  ): void {
    this.clear();

    if (shape.type === 'circle') {
      this.drawCircle(centerX, centerY, radius, primaryColor, opacity);
    } else {
      const pathFn = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
        switch (shape.type) {
          case 'triangle':
            this.drawTriangle(ctx, cx, cy, r);
            break;
          case 'square':
            this.drawSquare(ctx, cx, cy, r);
            break;
          case 'star':
            this.drawStar(ctx, cx, cy, r);
            break;
          case 'heart':
            this.drawHeart(ctx, cx, cy, r);
            break;
          default:
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            break;
        }
      };

      this.drawStrokedShape(centerX, centerY, radius, primaryColor, opacity, 3.5, pathFn);
    }
  }
}
