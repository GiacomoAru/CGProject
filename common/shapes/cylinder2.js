///// CYLINDER DEFINITION
/////
///// Resolution is the number of faces used to tesselate the cylinder.
///// Cylinder is defined to be centered at the origin of the coordinate axis, and lying on the XZ plane.
///// Cylinder height is assumed to be 2.0. Cylinder radius is assumed to be 1.0 .
function Cylinder2(resolution) {

    this.name = "cylinder2";

    // vertices definition
    ////////////////////////////////////////////////////////////

    this.vertices = new Float32Array(3 * (2 * 2 * resolution + 2 + 2));

    var radius = 1.0;
    var angle;
    var step = 6.283185307179586476925286766559 / resolution;

    // lower circle
    var vertexoffset = 0;
    for (var i = 0; i < resolution; i++) {

        angle = step * i;

        this.vertices[vertexoffset] = radius * Math.cos(angle);
        this.vertices[vertexoffset + 1] = 0.0;
        this.vertices[vertexoffset + 2] = radius * Math.sin(angle);
        vertexoffset += 3;
    }

    let dummy = vertexoffset;

    // upper circle
    for (var i = 0; i < resolution; i++) {

        angle = step * i;

        this.vertices[vertexoffset] = radius * Math.cos(angle);
        this.vertices[vertexoffset + 1] = 2.0;
        this.vertices[vertexoffset + 2] = radius * Math.sin(angle);
        vertexoffset += 3;
    }

    this.vertices[vertexoffset] = 0.0;
    this.vertices[vertexoffset + 1] = 0.0;
    this.vertices[vertexoffset + 2] = 0.0;
    vertexoffset += 3;

    this.vertices[vertexoffset] = 0.0;
    this.vertices[vertexoffset + 1] = 2.0;
    this.vertices[vertexoffset + 2] = 0.0;
    vertexoffset += 3;

    //lower circle 2
    for (var i = 0; i < resolution; i++) {

        angle = step * i;

        this.vertices[vertexoffset] = radius * Math.cos(angle);
        this.vertices[vertexoffset + 1] = 0.0;
        this.vertices[vertexoffset + 2] = radius * Math.sin(angle);
        vertexoffset += 3;
    }

    // upper circle 2
    for (var i = 0; i < resolution; i++) {

        angle = step * i;

        this.vertices[vertexoffset] = radius * Math.cos(angle);
        this.vertices[vertexoffset + 1] = 2.0;
        this.vertices[vertexoffset + 2] = radius * Math.sin(angle);
        vertexoffset += 3;
    }

    //2 vertici aggiuntivi
    this.vertices[vertexoffset++] = this.vertices[0];
    this.vertices[vertexoffset++] = this.vertices[1];
    this.vertices[vertexoffset++] = this.vertices[2];
    this.vertices[vertexoffset++] = this.vertices[dummy + 0];
    this.vertices[vertexoffset++] = this.vertices[dummy + 1];
    this.vertices[vertexoffset++] = this.vertices[dummy + 2];

    //texture
    this.texCoords = new Float32Array(2 * (2 * 2 * resolution + 2 + 2));

    //upper and lower surfaces
    // lower circle
    var vertexoffset = 0;
    for (var i = 0; i < resolution; i++) {

        angle = step * i;

        this.texCoords[vertexoffset] = 1.0 - ((i / resolution)) / 2;
        this.texCoords[vertexoffset + 1] = 0.5;
        vertexoffset += 2;
    }

    // upper circle
    for (var i = 0; i < resolution; i++) {
        angle = step * i;

        this.texCoords[vertexoffset] = 1.0 - ((i / resolution)) / 2;
        this.texCoords[vertexoffset + 1] = 0.0;
        vertexoffset += 2;
    }

    this.texCoords[vertexoffset++] = 0.25;
    this.texCoords[vertexoffset++] = 0.25;
    this.texCoords[vertexoffset++] = 0.25;
    this.texCoords[vertexoffset++] = 0.25;

    for (var i = 0; i < resolution; i++) {

        angle = step * i;

        this.texCoords[vertexoffset + 1] = (Math.sin(angle) + 1) / 4;
        this.texCoords[vertexoffset] = (Math.cos(angle) + 1) / 4;
        vertexoffset += 2;
    }

    // upper circle
    for (var i = 0; i < resolution; i++) {

        angle = step * i;

        this.texCoords[vertexoffset] = (Math.cos(angle) + 1) / 4;
        this.texCoords[vertexoffset + 1] = (Math.sin(angle) + 1) / 4;
        vertexoffset += 2;
    }

    //ultimi 2
    this.texCoords[vertexoffset++] = 0.5;
    this.texCoords[vertexoffset++] = 0.5;

    this.texCoords[vertexoffset++] = 0.5;
    this.texCoords[vertexoffset++] = 0.0;

    // triangles definition
    ////////////////////////////////////////////////////////////

    this.triangleIndices = new Uint16Array(3 * 4 * resolution);

    // lateral surface
    var triangleoffset = 0;
    for (var i = 0; i < resolution - 1; i++) {
        this.triangleIndices[triangleoffset] = i;
        this.triangleIndices[triangleoffset + 2] = (i + 1) % resolution;
        this.triangleIndices[triangleoffset + 1] = (i % resolution) + resolution;
        triangleoffset += 3;

        this.triangleIndices[triangleoffset] = (i % resolution) + resolution;
        this.triangleIndices[triangleoffset + 2] = (i + 1) % resolution;
        this.triangleIndices[triangleoffset + 1] = ((i + 1) % resolution) + resolution;
        triangleoffset += 3;
    }

    this.triangleIndices[triangleoffset] = resolution - 1;
    this.triangleIndices[triangleoffset + 2] = (this.vertices.length/3) - 2;
    this.triangleIndices[triangleoffset + 1] = 2 * resolution - 1;
    triangleoffset += 3;

    this.triangleIndices[triangleoffset] = 2 * resolution - 1;
    this.triangleIndices[triangleoffset + 2] = (this.vertices.length/3) - 2;
    this.triangleIndices[triangleoffset + 1] = (this.vertices.length/3) - 1;
    triangleoffset += 3;

    // bottom of the cylinder
    for (var i = 0; i < resolution; i++) {
        this.triangleIndices[triangleoffset] = i + (2 * resolution + 2);
        this.triangleIndices[triangleoffset + 1] = (i + 1) % resolution + (2 * resolution + 2);
        this.triangleIndices[triangleoffset + 2] = 2 * resolution;
        triangleoffset += 3;
    }

    // top of the cylinder
    for (var i = 0; i < resolution; i++) {
        this.triangleIndices[triangleoffset] = resolution + i + (2 * resolution + 2);
        this.triangleIndices[triangleoffset + 2] = ((i + 1) % resolution) + resolution + (2 * resolution + 2);
        this.triangleIndices[triangleoffset + 1] = 2 * resolution + 1;
        triangleoffset += 3;
    }

    this.numVertices = this.vertices.length / 3;
    this.numTriangles = this.triangleIndices.length / 3;
}
