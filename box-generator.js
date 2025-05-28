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
      fingerWidth: 15,
      fingerSpacing: 5,
      units: 'mm'
    };
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
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
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
        
        .controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
          padding: 25px;
          background: #f8f9fa;
          border-radius: 8px;
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
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #ffffff;
        }
        
        .svg-preview {
          width: 100%;
          height: 100%;
          min-height: 500px;
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
        }
        
        button:hover {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: translateY(-2px);
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
      </style>
      
      <div class="container">
        <div class="header">
          <h2>Generador de Cajas para Corte Láser</h2>
          <p>Crea plantillas personalizadas con uniones finger joint perfectas</p>
        </div>
        
        <div class="controls">
          <div class="input-group">
            <label for="width">Ancho (mm):</label>
            <input type="number" id="width" value="${this.boxData.width}" min="20" step="1">
          </div>
          
          <div class="input-group">
            <label for="height">Alto (mm):</label>
            <input type="number" id="height" value="${this.boxData.height}" min="20" step="1">
          </div>
          
          <div class="input-group">
            <label for="depth">Profundidad (mm):</label>
            <input type="number" id="depth" value="${this.boxData.depth}" min="20" step="1">
          </div>
          
          <div class="input-group">
            <label for="thickness">Grosor Material (mm):</label>
            <input type="number" id="thickness" value="${this.boxData.thickness}" min="1" step="0.1">
          </div>
          
          <div class="input-group">
            <label for="fingerWidth">Ancho Pestaña (mm):</label>
            <input type="number" id="fingerWidth" value="${this.boxData.fingerWidth}" min="5" step="1">
          </div>
          
          <div class="input-group">
            <label for="fingerSpacing">Espacio entre Pestañas (mm):</label>
            <input type="number" id="fingerSpacing" value="${this.boxData.fingerSpacing}" min="1" step="1">
          </div>
          
          <div class="input-group">
            <label for="kerf">Kerf (mm):</label>
            <input type="number" id="kerf" value="${this.boxData.kerf}" min="0" step="0.01">
          </div>
        </div>
        
        <div class="info-panel">
          <strong>Configuración:</strong> Ancho Pestaña controla el tamaño de cada dedo. 
          Espacio entre Pestañas controla la separación. El Kerf compensa el corte del láser.
        </div>
        
        <div class="preview-container">
          <div class="preview-header">Vista Previa del Diseño - Layout Optimizado</div>
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

  generateBox() {
    const { width, height, depth, thickness, kerf, fingerWidth, fingerSpacing } = this.boxData;
    const svg = this.shadowRoot.getElementById('svgPreview');
    
    if (!svg) return;
    
    svg.innerHTML = '';

    // Layout inteligente para evitar superposiciones
    const margin = 20;
    const spacing = 40;
    
    // Calcular posiciones para layout en grid
    const positions = this.calculateLayout(width, height, depth, margin, spacing);

    // Definir las 6 caras con configuraciones correctas
    const faces = [
      { 
        name: 'Frente', 
        w: width, 
        h: height, 
        edges: { top: 'slots', right: 'tabs', bottom: 'slots', left: 'slots' },
        pos: positions[0]
      },
      { 
        name: 'Atrás', 
        w: width, 
        h: height, 
        edges: { top: 'slots', right: 'slots', bottom: 'slots', left: 'tabs' },
        pos: positions[1]
      },
      { 
        name: 'Izquierda', 
        w: depth, 
        h: height, 
        edges: { top: 'slots', right: 'tabs', bottom: 'slots', left: 'tabs' },
        pos: positions[2]
      },
      { 
        name: 'Derecha', 
        w: depth, 
        h: height, 
        edges: { top: 'slots', right: 'slots', bottom: 'slots', left: 'tabs' },
        pos: positions[3]
      },
      { 
        name: 'Arriba', 
        w: width, 
        h: depth, 
        edges: { top: 'tabs', right: 'tabs', bottom: 'tabs', left: 'tabs' },
        pos: positions[4]
      },
      { 
        name: 'Abajo', 
        w: width, 
        h: depth, 
        edges: { top: 'tabs', right: 'tabs', bottom: 'tabs', left: 'tabs' },
        pos: positions[5]
      }
    ];

    faces.forEach((face, index) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(${face.pos.x}, ${face.pos.y})`);

      // Generar el path integrado con finger joints
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const pathData = this.generateIntegratedFingerJointPath(
        face.w, 
        face.h, 
        thickness, 
        fingerWidth, 
        fingerSpacing,
        kerf, 
        face.edges
      );
      
      pathElement.setAttribute('d', pathData);
      pathElement.setAttribute('fill', 'none');
      pathElement.setAttribute('stroke', '#2c3e50');
      pathElement.setAttribute('stroke-width', '1.5');
      
      group.appendChild(pathElement);

      // Etiqueta centrada
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
    });

    // Ajustar viewBox dinámicamente
    const maxX = Math.max(...positions.map(p => p.x)) + Math.max(width, depth) + margin;
    const maxY = Math.max(...positions.map(p => p.y)) + Math.max(height, depth) + margin;
    svg.setAttribute('viewBox', `0 0 ${maxX} ${maxY}`);
  }

  calculateLayout(width, height, depth, margin, spacing) {
    // Layout inteligente en 2 filas para evitar superposiciones
    const positions = [];
    
    // Fila 1: Frente, Atrás, Izquierda
    positions.push({ x: margin, y: margin }); // Frente
    positions.push({ x: margin + width + spacing, y: margin }); // Atrás
    positions.push({ x: margin + width * 2 + spacing * 2, y: margin }); // Izquierda
    
    // Fila 2: Derecha, Arriba, Abajo
    const row2Y = margin + height + spacing;
    positions.push({ x: margin, y: row2Y }); // Derecha
    positions.push({ x: margin + depth + spacing, y: row2Y }); // Arriba
    positions.push({ x: margin + depth + width + spacing * 2, y: row2Y }); // Abajo
    
    return positions;
  }

  generateIntegratedFingerJointPath(faceWidth, faceHeight, thickness, fingerWidth, fingerSpacing, kerf, edges) {
    let path = `M 0 0 `;
    
    // Borde superior
    path += this.generateEdgeWithIntegratedFingers(
      faceWidth, fingerWidth, fingerSpacing, thickness, kerf, edges.top, 'horizontal', 1
    );

    // Borde derecho
    path += this.generateEdgeWithIntegratedFingers(
      faceHeight, fingerWidth, fingerSpacing, thickness, kerf, edges.right, 'vertical', 1
    );

    // Borde inferior
    path += this.generateEdgeWithIntegratedFingers(
      faceWidth, fingerWidth, fingerSpacing, thickness, kerf, edges.bottom, 'horizontal', -1
    );

    // Borde izquierdo
    path += this.generateEdgeWithIntegratedFingers(
      faceHeight, fingerWidth, fingerSpacing, thickness, kerf, edges.left, 'vertical', -1
    );

    path += 'Z';
    return path;
  }

  generateEdgeWithIntegratedFingers(edgeLength, fingerWidth, fingerSpacing, thickness, kerf, edgeType, orientation, direction) {
    let path = '';
    let currentPos = 0;
    const adjustedFingerWidth = fingerWidth - kerf;
    const adjustedThickness = thickness - kerf;
    
    while (currentPos < edgeLength) {
      const remainingLength = edgeLength - currentPos;
      const segmentLength = Math.min(fingerWidth, remainingLength);
      
      // Determinar si es pestaña o hueco
      const fingerIndex = Math.floor(currentPos / (fingerWidth + fingerSpacing));
      const isFingerSegment = (fingerIndex % 2 === 0);
      
      if (isFingerSegment && edgeType === 'tabs') {
        // Pestaña que sale
        if (orientation === 'horizontal') {
          path += `h ${segmentLength * direction} `;
        } else {
          path += `v ${segmentLength * direction} `;
        }
      } else if (isFingerSegment && edgeType === 'slots') {
        // Borde normal
        if (orientation === 'horizontal') {
          path += `h ${segmentLength * direction} `;
        } else {
          path += `v ${segmentLength * direction} `;
        }
      } else if (!isFingerSegment && edgeType === 'tabs') {
        // Espacio entre pestañas que salen
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
        // Hueco para pestaña entrante
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
      
      currentPos += fingerWidth + fingerSpacing;
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
    downloadLink.href = URL.createObjectURL(svgBlob);
    downloadLink.download = `caja_${this.boxData.width}x${this.boxData.height}x${this.boxData.depth}.dxf`;
    downloadLink.click();
  }

  generateDXF() {
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
ENTITIES
0
ENDSEC
0
EOF`;
  }
}

customElements.define('box-generator', BoxGenerator);
