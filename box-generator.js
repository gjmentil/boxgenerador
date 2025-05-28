class BoxGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.boxData = {
      width: 100,
      height: 100,
      depth: 100,
      thickness: 3,
      kerf: 0.1,
      units: 'mm',
      fingerWidth: 15
    };
  }

  static get observedAttributes() {
    return ['width', 'height', 'depth', 'thickness', 'kerf', 'units'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.boxData[name] = parseFloat(newValue) || newValue;
      if (this.shadowRoot.innerHTML) {
        this.updateInputs();
        this.generateBox();
      }
    }
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.generateBox();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .container {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.08);
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .header h2 {
          color: #2c3e50;
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 600;
        }
        
        .header p {
          color: #7f8c8d;
          margin: 0;
          font-size: 16px;
        }
        
        .controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
          padding: 25px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
        }
        
        label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #495057;
          font-size: 14px;
        }
        
        input, select {
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s ease;
          background: white;
        }
        
        input:focus, select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }
        
        .preview-container {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          margin: 30px 0;
          background: white;
          overflow: hidden;
        }
        
        .preview-header {
          background: #f8f9fa;
          padding: 15px 20px;
          border-bottom: 1px solid #e9ecef;
          font-weight: 600;
          color: #495057;
        }
        
        .preview {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #ffffff;
        }
        
        .svg-preview {
          width: 100%;
          height: 100%;
          min-height: 400px;
          border: 1px solid #f0f0f0;
          border-radius: 4px;
        }
        
        .download-section {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 30px;
        }
        
        button {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0,123,255,0.3);
        }
        
        button:hover {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,123,255,0.4);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        .info-panel {
          background: #e3f2fd;
          border: 1px solid #bbdefb;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
          color: #1565c0;
        }
        
        .dimensions-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin: 20px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        .dimension-item {
          text-align: center;
          padding: 10px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        }
        
        .dimension-value {
          font-size: 18px;
          font-weight: 600;
          color: #007bff;
          margin-bottom: 5px;
        }
        
        .dimension-label {
          font-size: 12px;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      </style>
      
      <div class="container">
        <div class="header">
          <h2>Generador de Cajas para Corte Láser</h2>
          <p>Crea plantillas personalizadas para cajas con uniones finger joint</p>
        </div>
        
        <div class="controls">
          <div class="input-group">
            <label for="width">Ancho (mm):</label>
            <input type="number" id="width" value="${this.boxData.width}" min="10" step="1">
          </div>
          
          <div class="input-group">
            <label for="height">Alto (mm):</label>
            <input type="number" id="height" value="${this.boxData.height}" min="10" step="1">
          </div>
          
          <div class="input-group">
            <label for="depth">Profundidad (mm):</label>
            <input type="number" id="depth" value="${this.boxData.depth}" min="10" step="1">
          </div>
          
          <div class="input-group">
            <label for="thickness">Grosor Material (mm):</label>
            <input type="number" id="thickness" value="${this.boxData.thickness}" min="0.5" step="0.1">
          </div>
          
          <div class="input-group">
            <label for="fingerWidth">Ancho Dedo (mm):</label>
            <input type="number" id="fingerWidth" value="${this.boxData.fingerWidth}" min="5" step="1">
          </div>
          
          <div class="input-group">
            <label for="kerf">Kerf (mm):</label>
            <input type="number" id="kerf" value="${this.boxData.kerf}" min="0" step="0.01">
          </div>
        </div>
        
        <div class="dimensions-display">
          <div class="dimension-item">
            <div class="dimension-value">${this.boxData.width}mm</div>
            <div class="dimension-label">Ancho</div>
          </div>
          <div class="dimension-item">
            <div class="dimension-value">${this.boxData.height}mm</div>
            <div class="dimension-label">Alto</div>
          </div>
          <div class="dimension-item">
            <div class="dimension-value">${this.boxData.depth}mm</div>
            <div class="dimension-label">Profundidad</div>
          </div>
          <div class="dimension-item">
            <div class="dimension-value">${this.boxData.thickness}mm</div>
            <div class="dimension-label">Grosor</div>
          </div>
        </div>
        
        <div class="info-panel">
          <strong>Información:</strong> Esta herramienta genera 6 piezas para una caja rectangular con uniones finger joint. 
          Ajusta el kerf según tu cortadora láser (típicamente 0.1-0.2mm).
        </div>
        
        <div class="preview-container">
          <div class="preview-header">Vista Previa del Diseño</div>
          <div class="preview">
            <svg class="svg-preview" id="svgPreview" viewBox="0 0 1000 800">
              <!-- El SVG se generará aquí -->
            </svg>
          </div>
        </div>
        
        <div class="download-section">
          <button id="downloadSVG">📥 Descargar SVG</button>
          <button id="downloadDXF">📥 Descargar DXF</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const inputs = this.shadowRoot.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        this.boxData[e.target.id] = parseFloat(e.target.value) || e.target.value;
        this.updateDimensionsDisplay();
        this.generateBox();
      });
    });

    this.shadowRoot.getElementById('downloadSVG').addEventListener('click', () => {
      this.downloadSVG();
    });

    this.shadowRoot.getElementById('downloadDXF').addEventListener('click', () => {
      this.downloadDXF();
    });
  }

  updateInputs() {
    Object.keys(this.boxData).forEach(key => {
      const input = this.shadowRoot.getElementById(key);
      if (input) {
        input.value = this.boxData[key];
      }
    });
  }

  updateDimensionsDisplay() {
    const displays = this.shadowRoot.querySelectorAll('.dimension-value');
    if (displays.length >= 4) {
      displays[0].textContent = `${this.boxData.width}mm`;
      displays[1].textContent = `${this.boxData.height}mm`;
      displays[2].textContent = `${this.boxData.depth}mm`;
      displays[3].textContent = `${this.boxData.thickness}mm`;
    }
  }

  generateBox() {
    const { width, height, depth, thickness, kerf, fingerWidth } = this.boxData;
    const svg = this.shadowRoot.getElementById('svgPreview');
    
    if (!svg) return;
    
    svg.innerHTML = '';

    // Configuración de layout
    let currentX = 20;
    let currentY = 20;
    const spacing = 30;
    const maxWidth = 900;

    // Definir las 6 caras con sus configuraciones de uniones
    const faces = [
      { 
        name: 'Frente', 
        w: width, 
        h: height, 
        edges: { top: 'slots', right: 'tabs', bottom: 'slots', left: 'slots' }
      },
      { 
        name: 'Atrás', 
        w: width, 
        h: height, 
        edges: { top: 'slots', right: 'slots', bottom: 'slots', left: 'tabs' }
      },
      { 
        name: 'Izquierda', 
        w: depth, 
        h: height, 
        edges: { top: 'slots', right: 'tabs', bottom: 'slots', left: 'tabs' }
      },
      { 
        name: 'Derecha', 
        w: depth, 
        h: height, 
        edges: { top: 'slots', right: 'slots', bottom: 'slots', left: 'tabs' }
      },
      { 
        name: 'Arriba', 
        w: width, 
        h: depth, 
        edges: { top: 'tabs', right: 'tabs', bottom: 'tabs', left: 'tabs' }
      },
      { 
        name: 'Abajo', 
        w: width, 
        h: depth, 
        edges: { top: 'tabs', right: 'tabs', bottom: 'tabs', left: 'tabs' }
      }
    ];

    faces.forEach((face, index) => {
      // Crear grupo para la cara
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(${currentX}, ${currentY})`);

      // Generar el path de la cara con finger joints
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const pathData = this.generateFaceWithFingerJoints(
        face.w, 
        face.h, 
        thickness, 
        fingerWidth, 
        kerf, 
        face.edges
      );
      
      pathElement.setAttribute('d', pathData);
      pathElement.setAttribute('fill', 'none');
      pathElement.setAttribute('stroke', '#2c3e50');
      pathElement.setAttribute('stroke-width', '1.5');
      
      group.appendChild(pathElement);

      // Agregar etiqueta
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', face.w / 2);
      text.setAttribute('y', face.h / 2);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', '#007bff');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', '600');
      text.textContent = face.name;
      group.appendChild(text);

      svg.appendChild(group);

      // Calcular posición para la siguiente cara
      currentX += face.w + spacing;
      if (currentX > maxWidth) {
        currentX = 20;
        currentY += Math.max(height, depth) + spacing + 40;
      }
    });

    // Ajustar viewBox
    svg.setAttribute('viewBox', `0 0 ${maxWidth + 40} ${currentY + Math.max(height, depth) + 40}`);
  }

  generateFaceWithFingerJoints(faceWidth, faceHeight, thickness, fingerWidth, kerf, edges) {
    let path = `M 0 0 `;
    
    // Calcular número de dedos por borde
    const fingersTop = Math.max(1, Math.floor(faceWidth / (fingerWidth * 2)) * 2 + 1);
    const fingersRight = Math.max(1, Math.floor(faceHeight / (fingerWidth * 2)) * 2 + 1);
    const fingersBottom = fingersTop;
    const fingersLeft = fingersRight;
    
    const segmentWidthTop = faceWidth / fingersTop;
    const segmentHeightRight = faceHeight / fingersRight;

    // Borde superior
    path += this.generateEdgeWithFingers(
      faceWidth, segmentWidthTop, fingersTop, thickness, kerf, edges.top, 'horizontal', 1
    );

    // Borde derecho
    path += this.generateEdgeWithFingers(
      faceHeight, segmentHeightRight, fingersRight, thickness, kerf, edges.right, 'vertical', 1
    );

    // Borde inferior
    path += this.generateEdgeWithFingers(
      faceWidth, segmentWidthTop, fingersBottom, thickness, kerf, edges.bottom, 'horizontal', -1
    );

    // Borde izquierdo
    path += this.generateEdgeWithFingers(
      faceHeight, segmentHeightRight, fingersLeft, thickness, kerf, edges.left, 'vertical', -1
    );

    path += 'Z';
    return path;
  }

  generateEdgeWithFingers(edgeLength, segmentLength, numSegments, thickness, kerf, edgeType, orientation, direction) {
    let path = '';
    
    for (let i = 0; i < numSegments; i++) {
      const isFinger = (i % 2 === 0);
      
      if (isFinger && edgeType === 'tabs') {
        // Dedo que sale
        if (orientation === 'horizontal') {
          path += `h ${segmentLength * direction} `;
        } else {
          path += `v ${segmentLength * direction} `;
        }
      } else if (isFinger && edgeType === 'slots') {
        // Parte normal del borde
        if (orientation === 'horizontal') {
          path += `h ${segmentLength * direction} `;
        } else {
          path += `v ${segmentLength * direction} `;
        }
      } else if (!isFinger && edgeType === 'tabs') {
        // Espacio entre dedos que salen
        const adjustedThickness = thickness + kerf;
        if (orientation === 'horizontal') {
          path += `v ${direction > 0 ? adjustedThickness : -adjustedThickness} `;
          path += `h ${segmentLength * direction} `;
          path += `v ${direction > 0 ? -adjustedThickness : adjustedThickness} `;
        } else {
          path += `h ${direction > 0 ? -adjustedThickness : adjustedThickness} `;
          path += `v ${segmentLength * direction} `;
          path += `h ${direction > 0 ? adjustedThickness : -adjustedThickness} `;
        }
      } else {
        // Hueco para dedo entrante
        const adjustedThickness = thickness - kerf;
        if (orientation === 'horizontal') {
          path += `v ${direction > 0 ? -adjustedThickness : adjustedThickness} `;
          path += `h ${segmentLength * direction} `;
          path += `v ${direction > 0 ? adjustedThickness : -adjustedThickness} `;
        } else {
          path += `h ${direction > 0 ? adjustedThickness : -adjustedThickness} `;
          path += `v ${segmentLength * direction} `;
          path += `h ${direction > 0 ? -adjustedThickness : adjustedThickness} `;
        }
      }
    }
    
    return path;
  }

  downloadSVG() {
    const svg = this.shadowRoot.getElementById('svgPreview');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(svgBlob);
    downloadLink.download = `caja_${this.boxData.width}x${this.boxData.height}x${this.boxData.depth}.svg`;
    downloadLink.click();
  }

  downloadDXF() {
    const dxfContent = this.generateDXF();
    const dxfBlob = new Blob([dxfContent], { type: 'application/dxf' });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dxfBlob);
    downloadLink.download = `caja_${this.boxData.width}x${this.boxData.height}x${this.boxData.depth}.dxf`;
    downloadLink.click();
  }

  generateDXF() {
    const { width, height, depth } = this.boxData;
    
    return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
TABLES
0
ENDSEC
0
SECTION
2
BLOCKS
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
0
10
0
20
0
11
${width}
21
0
0
LINE
8
0
10
${width}
20
0
11
${width}
21
${height}
0
LINE
8
0
10
${width}
20
${height}
11
0
21
${height}
0
LINE
8
0
10
0
20
${height}
11
0
21
0
0
ENDSEC
0
EOF`;
  }
}

customElements.define('box-generator', BoxGenerator);
