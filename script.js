// Vector class for mathematical operations
class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other) {
        return new Vector3D(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    subtract(other) {
        return new Vector3D(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    cross(other) {
        return new Vector3D(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    toString() {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
    }
}

// 3D Scene Manager
class VectorVisualizer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.vectorA = new Vector3D(0, 0, 0);
        this.vectorB = new Vector3D(0, 0, 0);
        this.resultVector = new Vector3D(0, 0, 0);
        this.currentOperation = 'add';
        

        
        this.vectorAMesh = null;
        this.vectorBMesh = null;
        this.resultMesh = null;
        this.axesHelper = null;
        this.gridHelper = null;
        this.activeVector = null; // Track which vector is being edited
        
        this.init();
        this.setupEventListeners();
        this.updateVisualization();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f5f5);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            //window.innerWidth / window.innerHeight,
            1,
            0.1,
            1000
        );
        this.camera.position.set(10, 10, 10);

        // Create renderer
        const container = document.getElementById('canvas-container');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Add controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Add lighting
        this.setupLighting();

        // Add helpers
        this.setupHelpers();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    setupLighting() {
        // Ambient light (brighter for light background)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 0.4);
        pointLight.position.set(-10, -10, -10);
        this.scene.add(pointLight);
    }

    setupHelpers() {
        // Create 3D grid
        this.create3DGrid();

        // Custom colored axes with numbers
        this.createColoredAxes();
    }

    create3DGrid() {
        // Remove default grid helper
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
        }

        const gridSize = 10;
        const gridDivisions = 1; // Grid lines at each integer
        const gridMaterial = new THREE.LineBasicMaterial({ color: 0x666666, opacity: 0.4, transparent: true });

        // Create grid lines for XZ plane (horizontal)
        for (let i = -gridSize; i <= gridSize; i += gridDivisions) {
            // Lines parallel to X-axis
            const xLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-gridSize, 0, i),
                new THREE.Vector3(gridSize, 0, i)
            ]);
            const xLine = new THREE.Line(xLineGeometry, gridMaterial);
            this.scene.add(xLine);

            // Lines parallel to Z-axis
            const zLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(i, 0, -gridSize),
                new THREE.Vector3(i, 0, gridSize)
            ]);
            const zLine = new THREE.Line(zLineGeometry, gridMaterial);
            this.scene.add(zLine);
        }

        // Create grid lines for XY plane (vertical)
        for (let i = -gridSize; i <= gridSize; i += gridDivisions) {
            // Lines parallel to X-axis
            const xLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-gridSize, i, 0),
                new THREE.Vector3(gridSize, i, 0)
            ]);
            const xLine = new THREE.Line(xLineGeometry, gridMaterial);
            this.scene.add(xLine);

            // Lines parallel to Y-axis
            const yLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(i, -gridSize, 0),
                new THREE.Vector3(i, gridSize, 0)
            ]);
            const yLine = new THREE.Line(yLineGeometry, gridMaterial);
            this.scene.add(yLine);
        }

        // Create grid lines for YZ plane (vertical)
        for (let i = -gridSize; i <= gridSize; i += gridDivisions) {
            // Lines parallel to Y-axis
            const yLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, -gridSize, i),
                new THREE.Vector3(0, gridSize, i)
            ]);
            const yLine = new THREE.Line(yLineGeometry, gridMaterial);
            this.scene.add(yLine);

            // Lines parallel to Z-axis
            const zLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, i, -gridSize),
                new THREE.Vector3(0, i, gridSize)
            ]);
            const zLine = new THREE.Line(zLineGeometry, gridMaterial);
            this.scene.add(zLine);
        }
    }

    createColoredAxes() {
        // X-axis (dark grey)
        const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(10, 0, 0)
        ]);
        const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 3 });
        const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);
        this.scene.add(xAxis);

        // Y-axis (dark grey)
        const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 10, 0)
        ]);
        const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 3 });
        const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
        this.scene.add(yAxis);

        // Z-axis (dark grey)
        const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 10)
        ]);
        const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 3 });
        const zAxis = new THREE.Line(zAxisGeometry, zAxisMaterial);
        this.scene.add(zAxis);

        // Add axis labels and tick marks
        this.addAxisLabels();
        this.addAxisNumbers();
    }

    addAxisLabels() {
        // Create canvas for text
        const createTextSprite = (text) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 256;
            
            context.font = 'bold 96px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            // Draw black border (stroke) - thicker for better visibility
            context.strokeStyle = '#000000';
            context.lineWidth = 12;
            context.strokeText(text, 128, 128);
            
            // Draw white fill
            context.fillStyle = '#ffffff';
            context.fillText(text, 128, 128);
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.alphaTest = 0.1;
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true,
                alphaTest: 0.1
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(1.2, 1.2, 1.2);
            
            return sprite;
        };

        // X-axis label
        const xLabel = createTextSprite('X');
        xLabel.position.set(10.5, 0, 0);
        this.scene.add(xLabel);

        // Y-axis label
        const yLabel = createTextSprite('Y');
        yLabel.position.set(0, 10.5, 0);
        this.scene.add(yLabel);

        // Z-axis label
        const zLabel = createTextSprite('Z');
        zLabel.position.set(0, 0, 10.5);
        this.scene.add(zLabel);
    }

    addAxisNumbers() {
        // Create tick marks and numbers for each axis
        for (let i = 1; i <= 10; i++) {
            // X-axis numbers
            this.createNumberLabel(i, i, 0, 0, 'x');
            
            // Y-axis numbers
            this.createNumberLabel(i, 0, i, 0, 'y');
            
            // Z-axis numbers
            this.createNumberLabel(i, 0, 0, i, 'z');
        }

        // Negative numbers
        for (let i = 1; i <= 10; i++) {
            // X-axis numbers
            this.createNumberLabel(-i, -i, 0, 0, 'x');
            
            // Y-axis numbers
            this.createNumberLabel(-i, 0, -i, 0, 'y');
            
            // Z-axis numbers
            this.createNumberLabel(-i, 0, 0, -i, 'z');
        }
    }

    createNumberLabel(number, x, y, z, axis) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 160;
        canvas.height = 128;
        
        // Clear canvas with transparent background
        context.clearRect(0, 0, 160, 128);
        
        // Draw the number with white fill and black border - larger and bolder
        context.font = 'bold 96px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Draw black border (stroke) - thicker for better visibility
        context.strokeStyle = '#000000';
        context.lineWidth = 10;
        context.strokeText(number.toString(), 80, 64);
        
        // Draw white fill
        context.fillStyle = '#ffffff';
        context.fillText(number.toString(), 80, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.alphaTest = 0.1;
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.7, 0.7, 0.7);
        
        // Position the number label at the same position as the tick mark
        if (axis === 'x') {
            sprite.position.set(x, 0, 0);
        } else if (axis === 'y') {
            sprite.position.set(0, y, 0);
        } else if (axis === 'z') {
            sprite.position.set(0, 0, z);
        }
        
        this.scene.add(sprite);
    }

    createTextSprite(text, color, backgroundColor = null) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;
        
        // Clear canvas with transparent background
        context.clearRect(0, 0, 256, 256);
        
        // Add background if specified, otherwise transparent
        if (backgroundColor) {
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, 256, 256);
        }
        
        // Add text with white fill and black border - larger and bolder
        context.font = 'bold 120px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Black border (stroke) - thicker for better visibility
        context.strokeStyle = '#000000';
        context.lineWidth = 16;
        context.strokeText(text, 128, 128);
        
        // White fill
        context.fillStyle = '#ffffff';
        context.fillText(text, 128, 128);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.alphaTest = 0.1; // Enable transparency
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1.2, 1.2, 1.2);
        
        return sprite;
    }

    createVectorArrow(vector, color, name, label = null, isActive = false) {
        // Remove existing arrow if it exists
        if (this[name]) {
            this.scene.remove(this[name]);
            this[name] = null;
        }

        // Create arrow geometry
        const direction = new THREE.Vector3(vector.x, vector.y, vector.z);
        const length = direction.length();
        
        // If vector has zero length and not active, don't create it
        if (length === 0 && !isActive) {
            this[name] = null;
            return;
        }

        // If length is 0 but active, create a small visible vector
        if (length === 0) {
            direction.set(0.1, 0, 0); // Small default direction
        } else {
            direction.normalize();
        }

        // Use brighter color and larger arrow if active
        const displayColor = isActive ? this.brightenColor(color) : color;
        const arrowSize = isActive ? 0.3 : 0.2;
        const arrowLength = isActive ? 0.6 : 0.5;

        // Create line geometry first (use actual vector or small default if zero)
        const endPoint = length === 0 && isActive 
            ? new THREE.Vector3(0.1, 0, 0) 
            : new THREE.Vector3(vector.x, vector.y, vector.z);
            
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            endPoint
        ]);
        
        // Create group first
        const group = new THREE.Group();
        
        // If active, add a glow effect with a slightly thicker line using a duplicate
        if (isActive) {
            const glowLine = new THREE.Line(
                lineGeometry.clone(),
                new THREE.LineBasicMaterial({ 
                    color: displayColor,
                    opacity: 0.4,
                    transparent: true
                })
            );
            group.add(glowLine);
        }

        // Create main line
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: displayColor,
            linewidth: 100 // Note: linewidth doesn't work in WebGL, but kept for compatibility
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);

        // Create arrow geometry
        const arrowGeometry = new THREE.ConeGeometry(arrowSize, arrowLength, 8);
        const arrowMaterial = new THREE.MeshLambertMaterial({ color: displayColor });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

        // Position arrow at the end of the line and orient it correctly
        arrow.position.set(endPoint.x, endPoint.y, endPoint.z);
        // Make arrow point in the direction of the vector (away from origin)
        arrow.lookAt(endPoint.x + direction.x, endPoint.y + direction.y, endPoint.z + direction.z);
        arrow.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        group.add(arrow);

        // Add label if provided (with transparent background)
        if (label) {
            const labelSprite = this.createTextSprite(label, '#333333', null);
            // Position label at the end of the vector, slightly offset along the direction
            const offset = direction.clone().multiplyScalar(0.6);
            labelSprite.position.set(
                endPoint.x + offset.x,
                endPoint.y + offset.y,
                endPoint.z + offset.z
            );
            // Keep the larger scale from createTextSprite (already 1.2x)
            group.add(labelSprite);
        }

        this[name] = group;
        this.scene.add(group);
    }

    brightenColor(color) {
        // Convert hex to RGB, brighten, and convert back
        const r = ((color >> 16) & 0xff) * 1.5;
        const g = ((color >> 8) & 0xff) * 1.5;
        const b = (color & 0xff) * 1.5;
        
        return ((Math.min(255, Math.floor(r)) << 16) |
                (Math.min(255, Math.floor(g)) << 8) |
                Math.min(255, Math.floor(b)));
    }

    updateVisualization() {
        // Update vector A with label and highlight if active
        const isAActive = this.activeVector === 'A';
        this.createVectorArrow(this.vectorA, 0xb30000, 'vectorAMesh', 'A', isAActive);
        
        // Update vector B with label and highlight if active
        const isBActive = this.activeVector === 'B';
        this.createVectorArrow(this.vectorB, 0x0000b3, 'vectorBMesh', 'B', isBActive);
        
        // Calculate and update result vector only if both vectors have magnitude > 0
        const vectorAMagnitude = this.vectorA.magnitude();
        const vectorBMagnitude = this.vectorB.magnitude();
        
        if (vectorAMagnitude > 0 && vectorBMagnitude > 0) {
            this.calculateResult();
            this.createVectorArrow(this.resultVector, 0x00b300, 'resultMesh', 'R', false);
        } else {
            // Remove result vector if it exists
            if (this.resultMesh) {
                this.scene.remove(this.resultMesh);
                this.resultMesh = null;
            }
            // Reset result vector to zero for display purposes
            this.resultVector = new Vector3D(0, 0, 0);
        }
        
        // Update display
        this.updateDisplay();
    }

    calculateResult() {
        switch (this.currentOperation) {
            case 'add':
                this.resultVector = this.vectorA.add(this.vectorB);
                break;
            case 'subtract':
                this.resultVector = this.vectorA.subtract(this.vectorB);
                break;
            case 'multiply':
                this.resultVector = this.vectorA.cross(this.vectorB);
                break;
        }
    }

    updateDisplay() {
        // Update slider value displays
        document.getElementById('vectorA-x-value').textContent = this.vectorA.x.toFixed(1);
        document.getElementById('vectorA-y-value').textContent = this.vectorA.y.toFixed(1);
        document.getElementById('vectorA-z-value').textContent = this.vectorA.z.toFixed(1);
        
        document.getElementById('vectorB-x-value').textContent = this.vectorB.x.toFixed(1);
        document.getElementById('vectorB-y-value').textContent = this.vectorB.y.toFixed(1);
        document.getElementById('vectorB-z-value').textContent = this.vectorB.z.toFixed(1);
        
        // Update vector information displays with colored components
        document.getElementById('vectorA-display').innerHTML = this.getColoredVectorString(this.vectorA);
        document.getElementById('vectorB-display').innerHTML = this.getColoredVectorString(this.vectorB);
        document.getElementById('result-display').innerHTML = this.getColoredVectorString(this.resultVector);
        document.getElementById('magnitude-display').textContent = this.resultVector.magnitude().toFixed(2);
    }

    getColoredVectorString(vector) {
        return `(${this.getColoredComponent(vector.x, 'x')}, ${this.getColoredComponent(vector.y, 'y')}, ${this.getColoredComponent(vector.z, 'z')})`;
    }

    getColoredComponent(value, axis) {
        const colors = {
            x: '#b30000',
            y: '#00b300',
            z: '#0000b3'
        };
        return `<span style="color: ${colors[axis]}; font-weight: bold;">${value.toFixed(2)}</span>`;
    }



    setupEventListeners() {
        // Vector A sliders
        document.getElementById('vectorA-x').addEventListener('input', (e) => {
            this.activeVector = 'A';
            this.vectorA.x = parseFloat(e.target.value);
            this.updateVisualization();
        });
        
        document.getElementById('vectorA-y').addEventListener('input', (e) => {
            this.activeVector = 'A';
            this.vectorA.y = parseFloat(e.target.value);
            this.updateVisualization();
        });
        
        document.getElementById('vectorA-z').addEventListener('input', (e) => {
            this.activeVector = 'A';
            this.vectorA.z = parseFloat(e.target.value);
            this.updateVisualization();
        });

        // Vector B sliders
        document.getElementById('vectorB-x').addEventListener('input', (e) => {
            this.activeVector = 'B';
            this.vectorB.x = parseFloat(e.target.value);
            this.updateVisualization();
        });
        
        document.getElementById('vectorB-y').addEventListener('input', (e) => {
            this.activeVector = 'B';
            this.vectorB.y = parseFloat(e.target.value);
            this.updateVisualization();
        });
        
        document.getElementById('vectorB-z').addEventListener('input', (e) => {
            this.activeVector = 'B';
            this.vectorB.z = parseFloat(e.target.value);
            this.updateVisualization();
        });

        // Clear active vector when mouse is released (on mouseup)
        ['vectorA-x', 'vectorA-y', 'vectorA-z', 'vectorB-x', 'vectorB-y', 'vectorB-z'].forEach(id => {
            document.getElementById(id).addEventListener('mouseup', () => {
                setTimeout(() => {
                    this.activeVector = null;
                    this.updateVisualization();
                }, 100);
            });
            document.getElementById(id).addEventListener('touchend', () => {
                setTimeout(() => {
                    this.activeVector = null;
                    this.updateVisualization();
                }, 100);
            });
        });

        // Operation buttons
        document.getElementById('add-btn').addEventListener('click', () => {
            this.setActiveOperation('add');
        });
        
        document.getElementById('subtract-btn').addEventListener('click', () => {
            this.setActiveOperation('subtract');
        });
        
        document.getElementById('multiply-btn').addEventListener('click', () => {
            this.setActiveOperation('multiply');
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetVectors();
        });

        // Randomize button
        document.getElementById('randomize-btn').addEventListener('click', () => {
            this.randomizeVectors();
        });
    }

    randomizeVectors() {
        // Generate random values between -10 and 10 for Vector A
        this.vectorA.x = Math.floor(Math.random() * 21) - 10; // -10 to 10
        this.vectorA.y = Math.floor(Math.random() * 21) - 10;
        this.vectorA.z = Math.floor(Math.random() * 21) - 10;

        // Generate random values between -10 and 10 for Vector B
        this.vectorB.x = Math.floor(Math.random() * 21) - 10;
        this.vectorB.y = Math.floor(Math.random() * 21) - 10;
        this.vectorB.z = Math.floor(Math.random() * 21) - 10;

        // Update sliders to match random values
        document.getElementById('vectorA-x').value = this.vectorA.x;
        document.getElementById('vectorA-y').value = this.vectorA.y;
        document.getElementById('vectorA-z').value = this.vectorA.z;
        
        document.getElementById('vectorB-x').value = this.vectorB.x;
        document.getElementById('vectorB-y').value = this.vectorB.y;
        document.getElementById('vectorB-z').value = this.vectorB.z;

        // Update visualization
        this.updateVisualization();
    }

    resetVectors() {
        // Reset vector A to (0, 0, 0)
        this.vectorA.x = 0;
        this.vectorA.y = 0;
        this.vectorA.z = 0;

        // Reset vector B to (0, 0, 0)
        this.vectorB.x = 0;
        this.vectorB.y = 0;
        this.vectorB.z = 0;

        // Reset sliders to 0
        document.getElementById('vectorA-x').value = 0;
        document.getElementById('vectorA-y').value = 0;
        document.getElementById('vectorA-z').value = 0;
        
        document.getElementById('vectorB-x').value = 0;
        document.getElementById('vectorB-y').value = 0;
        document.getElementById('vectorB-z').value = 0;

        // Update visualization
        this.updateVisualization();
    }

    setActiveOperation(operation) {
        this.currentOperation = operation;
        
        // Update button states
        document.querySelectorAll('.operation-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        switch (operation) {
            case 'add':
                document.getElementById('add-btn').classList.add('active');
                break;
            case 'subtract':
                document.getElementById('subtract-btn').classList.add('active');
                break;
            case 'multiply':
                document.getElementById('multiply-btn').classList.add('active');
                break;
        }
        
        this.updateVisualization();
    }

    onWindowResize() {
        const container = document.getElementById('canvas-container');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VectorVisualizer();
});
