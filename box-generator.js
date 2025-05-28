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
      units: 'mm'
    };
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        
        .container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
        }
        
        label {
          font-weight: bold;
          margin-bottom: 5px;
          color: #333;
        }
        
        input, select {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .preview {
          border: 1px solid #ddd;
          border-radius: 4px;
          margin: 20px 0;
          min-height: 300px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .download-section {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }
        
        button:hover {
          background: #0056b3;
        }
        
        .svg-preview {
          width: 100%;
          height: 100%;
          min-height: 300px;
        }
      </style>
      
      <div class="container">
        <h2>Generador de Cajas para Corte Láser</h2>
        
        <div class="controls">
          <div class="input-group">
            <label for="width">Ancho:</label>
            <input type="number" id="width" value="${this.boxData.width}" min="1">
          </div>
          
          <div class="input-group">
            <label for="height">Alto:</label>
            <input type="number" id="height" value="${this.boxData.height}" min="1">
          </div>
          
          <div class="input-group">
            <label for="depth">Profundidad:</label>
            <input type="number" id="depth" value="${this.boxData.depth}" min="1">
          </div>
          
          <div class="input-group">
            <label for="thickness">Grosor Material:</label>
            <input type="number" id="thickness" value="${this.boxData.thickness}" min="0.1" step="0.1">
          </div>
          
          <div class="input-group">
            <label for="kerf">Kerf:</label>
            <input type="number" id="kerf" value="${this.boxData.kerf}" min="0" step="0.01">
          </div>
          
          <div class="input-group">
            <label for="units">Unidades:</label>
            <select id="units">
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="in">pulgadas</option>
            </select>
          </div>
        </div>
        
        <div class="preview">
          <svg class="svg-preview" id="svgPreview" viewBox="0 0 800 600">
            <!-- El SVG se generará aquí -->
          </svg>
        </div>
        
        <div class="download-section">
          <button id="downloadSVG">Descargar SVG</button>
          <button id="downloadDXF">Descargar DXF</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const inputs = this.shadowRoot.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => {
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

    // Generar caja inicial
    this.generateBox();
  }

  generateBox() {
    const { width, height, depth, thickness, kerf } = this.boxData;
    const k = kerf;
    const t = thickness;

    // Calcular dimensiones ajustadas
    const w = width - 2 * k;
    const h = height - 2 * k;
    const d = depth - 2 * k;

    const svg = this.shadowRoot.getElementById('svgPreview');
    
    // Limpiar SVG
    svg.innerHTML = '';

    let currentX = 10;
    let currentY = 10;
    const spacing = 20;

    // Generar las 6 caras de la caja
    const faces = [
      { name: 'Frente/Atrás', width: w, height: h, count: 2 },
      { name: 'Izquierda/Derecha', width: d, height: h, count: 2 },
      { name: 'Arriba/Abajo', width: w, height: d, count: 2 }
    ];

    faces.forEach(face => {
      for (let i = 0; i < face.count; i++) {
        this.createFace(svg, currentX, currentY, face.width, face.height, t);
        currentX += face.width + spacing;
        
        // Nueva fila si es necesario
        if (currentX > 600) {
          currentX = 10;
          currentY += face.height + spacing + 30;
        }
      }
    });

    // Actualizar viewBox del SVG
    svg.setAttribute('viewBox', `0 0 ${Math.max(800, currentX + 200)} ${currentY + 200}`);
  }

  createFace(svg, x, y, width, height, thickness) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Rectángulo principal
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', '#000');
    rect.setAttribute('stroke-width', '1');
    
    group.appendChild(rect);

    // Agregar pestañas (fingers) para ensamblaje
    this.addFingers(group, x, y, width, height, thickness);
    
    svg.appendChild(group);
  }

  addFingers(group, x, y, width, height, thickness) {
    const fingerWidth = thickness * 2;
    const fingerCount = Math.floor(width / (fingerWidth * 2));
    
    // Pestañas superiores
    for (let i = 0; i < fingerCount; i++) {
      const fingerX = x + (i * fingerWidth * 2) + fingerWidth;
      const finger = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      finger.setAttribute('x', fingerX);
      finger.setAttribute('y', y - thickness);
      finger.setAttribute('width', fingerWidth);
      finger.setAttribute('height', thickness);
      finger.setAttribute('fill', 'none');
      finger.setAttribute('stroke', '#000');
      finger.setAttribute('stroke-width', '1');
      group.appendChild(finger);
    }

    // Pestañas inferiores
    for (let i = 0; i < fingerCount; i++) {
      const fingerX = x + (i * fingerWidth * 2) + fingerWidth;
      const finger = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      finger.setAttribute('x', fingerX);
      finger.setAttribute('y', y + height);
      finger.setAttribute('width', fingerWidth);
      finger.setAttribute('height', thickness);
      finger.setAttribute('fill', 'none');
      finger.setAttribute('stroke', '#000');
      finger.setAttribute('stroke-width', '1');
      group.appendChild(finger);
    }
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
    // Generar contenido DXF básico
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
