// Braille character mapping - standard 6-dot Braille patterns
const BRAILLE_PATTERNS: { [key: string]: string } = {
  '000000': ' ',
  '100000': 'a',
  '110000': 'b',
  '100100': 'c',
  '100110': 'd',
  '100010': 'e',
  '110100': 'f',
  '110110': 'g',
  '110010': 'h',
  '010100': 'i',
  '010110': 'j',
  '101000': 'k',
  '111000': 'l',
  '101100': 'm',
  '101110': 'n',
  '101010': 'o',
  '111100': 'p',
  '111110': 'q',
  '111010': 'r',
  '011100': 's',
  '011110': 't',
  '101001': 'u',
  '111001': 'v',
  '010111': 'w',
  '101101': 'x',
  '101111': 'y',
  '101011': 'z',
  // Numbers (preceded by number sign)
  '010111': '#', // number sign
  '100000': '1', // when after #
  '110000': '2',
  '100100': '3',
  '100110': '4',
  '100010': '5',
  '110100': '6',
  '110110': '7',
  '110010': '8',
  '010100': '9',
  '010110': '0',
  // Common punctuation
  '000001': "'",
  '000011': '"',
  '001000': ',',
  '001001': ';',
  '001010': ':',
  '001100': '.',
  '001101': '!',
  '001110': '?',
  '010001': '-',
};

interface BrailleCell {
  pattern: string;
  confidence: number;
  x: number;
  y: number;
}

export class BrailleRecognizer {
  private cellWidth = 10;
  private cellHeight = 15;
  private dotRadius = 2;

  async recognizeFromImageUri(imageUri: string): Promise<string> {
    try {
      // Load and process the image
      const imageData = await this.loadImageData(imageUri);
      
      // Detect Braille cells
      const cells = await this.detectBrailleCells(imageData);
      
      // Convert cells to text
      const text = this.cellsToText(cells);
      
      return text || 'No Braille text detected';
    } catch (error) {
      console.error('Braille recognition error:', error);
      throw new Error(`Braille recognition failed: ${error.message}`);
    }
  }

  private async loadImageData(imageUri: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUri;
    });
  }

  private async detectBrailleCells(imageData: ImageData): Promise<BrailleCell[]> {
    // Convert to grayscale and apply threshold
    const grayData = this.toGrayscale(imageData);
    const binaryData = this.applyThreshold(grayData, 128);
    
    const cells: BrailleCell[] = [];
    const { width, height } = imageData;
    
    // Scan for Braille cells in a grid pattern
    for (let y = 0; y < height - this.cellHeight; y += this.cellHeight) {
      for (let x = 0; x < width - this.cellWidth; x += this.cellWidth) {
        const cell = this.extractBrailleCell(binaryData, width, x, y);
        if (cell.confidence > 0.3) {
          cells.push(cell);
        }
      }
    }
    
    return cells;
  }

  private toGrayscale(imageData: ImageData): Uint8ClampedArray {
    const { data, width, height } = imageData;
    const grayData = new Uint8ClampedArray(width * height);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      grayData[i / 4] = gray;
    }
    
    return grayData;
  }

  private applyThreshold(grayData: Uint8ClampedArray, threshold: number): Uint8ClampedArray {
    const binaryData = new Uint8ClampedArray(grayData.length);
    
    for (let i = 0; i < grayData.length; i++) {
      binaryData[i] = grayData[i] < threshold ? 0 : 255;
    }
    
    return binaryData;
  }

  private extractBrailleCell(binaryData: Uint8ClampedArray, width: number, startX: number, startY: number): BrailleCell {
    const dots = new Array(6).fill(false);
    const dotPositions = [
      [1, 1], [1, 8],   // dots 1, 4
      [1, 4], [1, 11],  // dots 2, 5  
      [1, 7], [1, 14]   // dots 3, 6
    ];
    
    let totalConfidence = 0;
    
    // Check each dot position
    for (let i = 0; i < 6; i++) {
      const [dx, dy] = dotPositions[i];
      const x = startX + dx;
      const y = startY + dy;
      
      if (x >= 0 && x < width && y >= 0) {
        const pixelIndex = y * width + x;
        const isDot = binaryData[pixelIndex] === 0; // Dark pixel = dot
        dots[i] = isDot;
        
        if (isDot) {
          totalConfidence += 0.2;
        }
      }
    }
    
    // Convert dots to pattern string
    const pattern = dots.map(dot => dot ? '1' : '0').join('');
    
    return {
      pattern,
      confidence: totalConfidence,
      x: startX,
      y: startY
    };
  }

  private cellsToText(cells: BrailleCell[]): string {
    // Sort cells by position (left to right, top to bottom)
    cells.sort((a, b) => {
      const rowDiff = Math.floor(a.y / this.cellHeight) - Math.floor(b.y / this.cellHeight);
      if (rowDiff !== 0) return rowDiff;
      return a.x - b.x;
    });
    
    let text = '';
    let isNumber = false;
    
    for (const cell of cells) {
      const char = BRAILLE_PATTERNS[cell.pattern];
      
      if (char === '#') {
        isNumber = true;
        continue;
      }
      
      if (char) {
        if (isNumber && '1234567890'.includes(char)) {
          text += char;
          isNumber = false;
        } else {
          text += char;
          isNumber = false;
        }
      }
    }
    
    return text.trim();
  }
}