
//costanti utili
//colori
grigioRuota = [41 / 255, 47 / 255, 50 / 255, 1];
nero = [25 / 255, 25 / 255, 25 / 255, 1];
rossoRuota = [200 / 255, 35 / 255, 40 / 255, 1];
guscioUovo = [255 / 255, 204 / 255, 153 / 255, 1];
tuorlo = [100 / 255, 78 / 255, 10 / 61, 1];
albume = [250 / 255, 248 / 255, 245 / 255, 1];
grigioChiaro = [210 / 255, 210 / 255, 210 / 255, 1];

//coeff phong
CPtelaioInternoD = [0.8, 0.8, 0.8];
CPtelaioInternoS = [0.7, 0.7, 0.7, 45.0];

CPgommeD = [0.4, 0.4, 0.4];
CPgommeS = [0.1, 0.1, 0.1, 5.0];

CPlucidoD = [0.75, 0.75, 0.75];
CPlucidoS = [0.9, 0.9, 0.9, 25.0];

CPopacoD = [0.7, 0.7, 0.7];
CPopacoS = [0.3, 0.3, 0.3, 15.0];

CPStandardD = [0.9, 0.9, 0.9];
CPStandardS = [0.9, 0.9, 0.9, 71.0];

//quante texture sono state caricate staticamente, utile per la shadow map
nTexture = 0;

function rand(a, b){
	return (b-a)*Math.random + a;
}
//costruttori C
//n < 1
CreateCGrigioLucido = function (n){
	//coefficenti phong shading e luce emissiva
	this.coeffD = CPlucidoD; //RGB
	this.coeffS = CPlucidoS; //RGB e esponente 
	this.coeffE = [0.0,0.0,0.0]; //RGB

	//tipo shading, 0=phong, 1=flat
	this.shType = 1;

	//coefficente valenza texture
	this.text = 0.0; 

	//colore
	if(n > 1 || n < 0) n = 0.5;
	this.fillColor = [n,n,n,1];
}
CreateCTuorlo = function (){
	//coefficenti phong shading e luce emissiva
	this.coeffD = CPtelaioInternoD; //RGB
	this.coeffS = CPtelaioInternoS; //RGB e esponente 
	this.coeffE = [0.0,0.0,0.0]; //RGB

	//tipo shading, 0=phong, 1=flat
	this.shType = 1;

	//coefficente valenza texture
	this.text = 0.0; 

	//colore
	this.fillColor = tuorlo;
}
CreateCAlbume = function (){
	//coefficenti phong shading e luce emissiva
	this.coeffD = CPgommeD; //RGB
	this.coeffS = CPgommeS; //RGB e esponente 
	this.coeffE = [0.0,0.0,0.0]; //RGB

	//tipo shading, 0=phong, 1=flat
	this.shType = 0;

	//coefficente valenza texture
	this.text = 1.0; 

	//colore
	this.fillColor = albume;
}
CreateCGuscio = function (){
	//coefficenti phong shading e luce emissiva
	this.coeffD = CPlucidoD; //RGB
	this.coeffS = CPlucidoS; //RGB e esponente 
	this.coeffE = [0.0,0.0,0.0]; //RGB

	//tipo shading, 0=phong, 1=flat
	this.shType = 0;

	//coefficente valenza texture
	this.text = 0.0; 

	//colore
	this.fillColor = guscioUovo;
}
CreateCPietra = function (n){
	//coefficenti phong shading e luce emissiva
	this.coeffD = CPopacoD; //RGB
	this.coeffS = CPopacoS; //RGB e esponente 
	this.coeffE = [0.0,0.0,0.0]; //RGB

	//tipo shading, 0=phong, 1=flat
	this.shType = 1;

	//coefficente valenza texture
	this.text = 0.0; 

	//colore
	if(n > 1 || n < 0) n = 0.5;
	this.fillColor = [n,n,n,1];
}
CreateCVuoto = function (n){
	//coefficenti phong shading e luce emissiva
	this.coeffD = [0.0,0.0,0.0]; //RGB
	this.coeffS = [0.0,0.0,0.0,1.0]; //RGB e esponente 
	this.coeffE = [0.0,0.0,0.0]; //RGB

	//tipo shading, 0=phong, 1=flat
	this.shType = 1;

	//coefficente valenza texture
	this.text = 0.0; 

	//colore
	this.fillColor = [1.0,1.0,1.0,1.0];
}


/*
the FollowFromUpCamera always look at the car from a position abova right over the car
*/
FollowFromUpCamera = function () {

	/* the only data it needs is the position of the camera */
	this.frame = glMatrix.mat4.create();

	/* update the camera with the current car position */
	this.update = function (car_position) {
		this.frame = car_position;
	}

	/* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
	this.matrix = function () {
		let eye = glMatrix.vec3.create();
		let target = glMatrix.vec3.create();
		let up = glMatrix.vec4.create();

		glMatrix.vec3.transformMat4(eye, [0, 25, 0], this.frame);
		glMatrix.vec3.transformMat4(target, [0.0, 0.0, 0.0, 1.0], this.frame);
		glMatrix.vec4.transformMat4(up, [0.0, 0.0, -1, 0.0], this.frame);

		return glMatrix.mat4.lookAt(glMatrix.mat4.create(), eye, target, up.slice(0, 3));
	}
}
/*
the ChaseCamera always look at the car from behind the car, slightly above
*/
ChaseCamera = function () {

	/* the only data it needs is the position of the camera */
	this.frame = glMatrix.mat4.create();

	/* update the camera with the current car position */
	this.update = function (car_frame) {
		this.frame = car_frame.slice();
	}

	/* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
	this.matrix = function () {
		let occhio = glMatrix.vec3.create();
		let punto_target = glMatrix.vec3.create();
		let up = glMatrix.vec4.create();
		glMatrix.vec3.transformMat4(occhio, [0, 4, 8, 1], this.frame)
		glMatrix.vec3.transformMat4(punto_target, [0, 1, 0, 1], this.frame)
		glMatrix.vec4.transformMat4(up, [0.0, 0.0, -1, 0.0], this.frame);
		return glMatrix.mat4.lookAt(glMatrix.mat4.create(), //output
			occhio, // posizione occhio
			punto_target, // punto da guardare
			up.slice(0, 3)); // pointing up	
	}
}
/*
La freeCamera è la camera libera controllabile da tastiera
(wasd per spostarsi, shift per farlo più lentamente)
*/
FreeCamera = function () {

	this.frame = glMatrix.mat4.create();

	this.keys = [];
	this.angles = [];
	//target della vista quando il mouse è al centro del canvas, riferimento target di vista 
	this.targetO = glMatrix.vec3.fromValues(0, 5, 5);
	//posizione del punto di vista attuale
	this.eyePos = glMatrix.vec3.fromValues(0, 5, 0);
	//posizione del target attuale
	this.targetPos = glMatrix.vec3.fromValues(0, 5, 5);
	this.upV = glMatrix.vec3.fromValues(0, 1, 0);

	//aggiornamento dei parameteri della camera
	this.update = function () {
		//variabile temporanea
		let dummyV3 = glMatrix.vec3.create();
		//traslazione composta da applicare al frame
		let tras = glMatrix.mat4.create();

		//inverso della direzione di vista
		let menoVista = glMatrix.vec3.sub(glMatrix.vec3.create(), this.eyePos, this.targetO);

		//rotazione orizzontale imposta dalla posizione del mouse
		let rot = glMatrix.mat4.fromRotation(glMatrix.mat4.create(), this.angles['h'], this.upV);

		//rotazione verticale imposta dalla posizione del mouse
		//asse di rotazione
		let HAxes = glMatrix.vec3.cross(glMatrix.vec3.create(), this.upV, menoVista);
		glMatrix.mat4.mul(rot, rot, glMatrix.mat4.fromRotation(glMatrix.mat4.create(), this.angles['v'], HAxes));
		//applichiamo tutte le rotazioni
		this.targetPos = glMatrix.vec3.transformMat4(this.targetPos, this.targetO, rot);

		//MODIFICA4
		//SETUP traslazione frame da tastiera
		//direzione di vista
		glMatrix.vec3.sub(dummyV3, this.targetPos, this.eyePos);
		glMatrix.vec3.normalize(dummyV3, dummyV3);
		glMatrix.vec3.scale(dummyV3, dummyV3, 0.2);//"regolazione della velocità della camera"
		//traslazioni da applicare in base ai tasti input
		if (this.keys['a']) {//sinistra
			let vS = glMatrix.vec3.cross(glMatrix.vec3.create(), this.upV, dummyV3);
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), vS));
		}else if (this.keys['d']) {//destra
			let vS = glMatrix.vec3.cross(glMatrix.vec3.create(), dummyV3, this.upV);
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), vS));
		}
		else if (this.keys['w']) {//avanti (verso il target attuale)
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), dummyV3));
		}else if (this.keys['s']) {//indietro (allontanandosi dal target attuale)
			let vS = glMatrix.vec3.scale(glMatrix.vec3.create(), dummyV3, -1);//inversione della direzione
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), vS));
		}else if (this.keys['A']) {//sinistra
			let vS = glMatrix.vec3.cross(glMatrix.vec3.create(), this.upV, dummyV3);
			glMatrix.vec3.scale(vS, vS, 0.3);
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), vS));
		}else if (this.keys['D']) {//destra
			let vS = glMatrix.vec3.cross(glMatrix.vec3.create(), dummyV3, this.upV);
			glMatrix.vec3.scale(vS, vS, 0.3);
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), vS));
		}else if (this.keys['W']) {//avanti (verso il target attuale)
			let vS = glMatrix.vec3.scale(glMatrix.vec3.create(), dummyV3, 0.3);
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), vS));
		}else if (this.keys['S']) {//indietro (allontanandosi dal target attuale)
			let vS = glMatrix.vec3.scale(glMatrix.vec3.create(), dummyV3, -0.3);//inversione della direzione
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), vS));
		}

		//applichiamo la trasformazione
		glMatrix.mat4.mul(this.frame, this.frame, tras);
	}

	//resetta il frame della camera
	this.reset = function () {
		this.frame = glMatrix.mat4.create();
	}

	/* return the transformation matrix to transform from warlord coordiantes to the view reference frame */
	this.matrix = function () {

		let eye = glMatrix.vec3.create();
		let target = glMatrix.vec3.create();

		glMatrix.vec3.transformMat4(eye, this.eyePos, this.frame);
		glMatrix.vec3.transformMat4(target, this.targetPos, this.frame);

		return glMatrix.mat4.lookAt(glMatrix.mat4.create(), //output
			eye, // posizione occhio
			target, // punto da guardare
			this.upV); // pointing up	
	}
}

/* the main object to be implementd */
var Renderer = new Object();

/* array of cameras that will be used */
Renderer.cameras = [];
//free cam
var fCam = new FreeCamera();
// add a FollowFromUpCamera
Renderer.cameras.push(new FollowFromUpCamera());
Renderer.cameras.push(new ChaseCamera());
Renderer.cameras.push(fCam);

// set the camera currently in use
Renderer.currentCamera = 0;

/*
create the buffers for an object as specified in common/shapes/triangle.js
*/
Renderer.createObjectBuffers = function (gl, obj) {

	obj.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	if (typeof obj.texCoords != 'undefined') {
		obj.texCoordsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, obj.texCoords, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	if (typeof obj.tangents != 'undefined') {
		obj.tangentsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.tangentsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, obj.tangents, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	if (typeof obj.normals != 'undefined') {
		obj.normalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, obj.normals, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	obj.indexBufferTriangles = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.triangleIndices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	// create edges
	var edges = new Uint16Array(obj.numTriangles * 3 * 2);
	for (var i = 0; i < obj.numTriangles; ++i) {
		edges[i * 6 + 0] = obj.triangleIndices[i * 3 + 0];
		edges[i * 6 + 1] = obj.triangleIndices[i * 3 + 1];
		edges[i * 6 + 2] = obj.triangleIndices[i * 3 + 0];
		edges[i * 6 + 3] = obj.triangleIndices[i * 3 + 2];
		edges[i * 6 + 4] = obj.triangleIndices[i * 3 + 1];
		edges[i * 6 + 5] = obj.triangleIndices[i * 3 + 2];
	}

	obj.indexBufferEdges = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}
Renderer.createFramebuffer = function (gl, size) {
	
	var depthTexture = gl.createTexture();
	const depthTextureSize = size;
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	gl.texImage2D(
		gl.TEXTURE_2D,      // target
		0,                  // mip level
		gl.DEPTH_COMPONENT, // internal format
		depthTextureSize,   // width
		depthTextureSize,   // height
		0,                  // border
		gl.DEPTH_COMPONENT, // format
		gl.UNSIGNED_INT,    // type
		null);              // data

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	var depthFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,       // target
		gl.DEPTH_ATTACHMENT,  // attachment point
		gl.TEXTURE_2D,        // texture target
		depthTexture,         // texture
		0);                   // mip level

	// create a color texture of the same size as the depth texture
	var colorTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, colorTexture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		depthTextureSize,
		depthTextureSize,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		null,
	);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	// attach it to the framebuffer
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,        // target
		gl.COLOR_ATTACHMENT0,  // attachment point
		gl.TEXTURE_2D,         // texture target
		colorTexture,         // texture
		0);                    // mip level

	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	depthFramebuffer.depthTexture = depthTexture;
	depthFramebuffer.colorTexture = colorTexture;
	depthFramebuffer.size = depthTextureSize;

	return depthFramebuffer;
}
/*
draw an object as specified in common/shapes/triangle.js for which the buffer 
have alrady been created
*/
Renderer.drawObject = function (gl, obj, C) {

	if (C != undefined && C.coeffD != undefined) { gl.uniform3fv(this.uniformShader.uKDiffuseLocation, C.coeffD); }
	else { gl.uniform3fv(this.uniformShader.uKDiffuseLocation, CPStandardD); }
	if (C != undefined && C.coeffS != undefined) { gl.uniform4fv(this.uniformShader.uKSpecularLocation, C.coeffS); }
	else { gl.uniform4fv(this.uniformShader.uKSpecularLocation, CPStandardS); }
	if (C != undefined && C.coeffE != undefined) { gl.uniform3fv(this.uniformShader.uKEmLocation, C.coeffE); }
	else { gl.uniform3fv(this.uniformShader.uKEmLocation, [0.0, 0.0, 0.0]); }
	if (C != undefined && C.shType != undefined) { gl.uniform1i(this.uniformShader.shType, C.shType); }
	else { gl.uniform1i(this.uniformShader.shType, 1); }
	if (C != undefined && C.text != undefined) { gl.uniform1f(this.uniformShader.textP, C.text); }
	else { gl.uniform1f(this.uniformShader.textP, 1.0); }

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.enableVertexAttribArray(this.uniformShader.aPositionIndex);
	gl.vertexAttribPointer(this.uniformShader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	if (typeof obj.normals != 'undefined') {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
		gl.enableVertexAttribArray(this.uniformShader.aNormalIndex);
		gl.vertexAttribPointer(this.uniformShader.aNormalIndex, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	if (typeof obj.texCoords != 'undefined') {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordsBuffer);
		gl.enableVertexAttribArray(this.uniformShader.aTexCoordsIndex);
		gl.vertexAttribPointer(this.uniformShader.aTexCoordsIndex, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	if (typeof obj.tangentsBuffer != 'undefined') {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.tangentsBuffer);
		gl.enableVertexAttribArray(this.uniformShader.aTangentsIndex);
		gl.vertexAttribPointer(this.uniformShader.aTangentsIndex, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.polygonOffset(1.0, 1.0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	if (C != undefined && C.fillColor != undefined) { gl.uniform4fv(this.uniformShader.uColorLocation, C.fillColor);}
	else { gl.uniform4fv(this.uniformShader.uColorLocation, [0.0,1.0,1.0,1.0]); }
	gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

	gl.disable(gl.POLYGON_OFFSET_FILL);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}
Renderer.drawShadowObject = function (gl, obj) {

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.enableVertexAttribArray(this.shaderDepth.aPositionIndex);
	gl.vertexAttribPointer(this.shaderDepth.aPositionIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.polygonOffset(1.0, 1.0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

	gl.disable(gl.POLYGON_OFFSET_FILL);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

/*
initialize the object in the scene
*/
Renderer.initializeObjects = function (gl) {
	//estensioni web gl
	gl.getExtension('OES_standard_derivatives');
	gl.getExtension('WEBGL_depth_texture');

	Game.setScene(scene_0);
	this.car = Game.addCar("mycar");
	
	//faretti
	this.posArr = new Array();
	for (let p = 0; p < Game.scene.lamps.length; p++) {
		let dummyA = [];
		dummyA.push(Game.scene.lamps[p].position[0]);
		dummyA.push(Game.scene.lamps[p].height);
		dummyA.push(Game.scene.lamps[p].position[2]);
		dummyA.push(1.0);
		this.posArr.push(dummyA);
	}

	this.dirArr = new Array();
	for (let p = 0; p < Game.scene.lamps.length; p++) {
		let dummyA = [];
		dummyA.push(0.0);
		dummyA.push(-1.0);
		dummyA.push(0.0);
		dummyA.push(0.0);
		this.dirArr.push(dummyA);
	}

	this.cube = new Cube2(10);
	ComputeNormals(this.cube);
	this.createObjectBuffers(gl, this.cube);

	this.cube1 = new Cube2(1);
	ComputeNormals(this.cube1);
	this.createObjectBuffers(gl, this.cube1);

	this.cylinder = new Cylinder2(50);
	ComputeNormals(this.cylinder);
	this.createObjectBuffers(gl, this.cylinder);

	this.cylinderB = new Cylinder2(15);
	ComputeNormals(this.cylinderB);
	this.createObjectBuffers(gl, this.cylinderB);

	this.doubleCone = new Sphere(1, 50);
	ComputeNormals(this.doubleCone);
	this.createObjectBuffers(gl, this.doubleCone);

	this.sphere = new Sphere(50, 50);
	ComputeNormals(this.sphere);
	this.createObjectBuffers(gl, this.sphere);

	ComputeNormals(Game.scene.trackObj);
	Renderer.createObjectBuffers(gl, Game.scene.trackObj);
	ComputeNormals(Game.scene.groundObj);
	Renderer.createObjectBuffers(gl, Game.scene.groundObj);

	for (var i = 0; i < Game.scene.buildings.length; ++i) {
		ComputeNormals(Game.scene.buildingsObjTex[i]);
		ComputeNormals(Game.scene.buildingsObjTex[i].roof);
		Renderer.createObjectBuffers(gl, Game.scene.buildingsObjTex[i]);
		Renderer.createObjectBuffers(gl, Game.scene.buildingsObjTex[i].roof);
	}

	Renderer.loadTexture(gl, nTexture++, "../common/textures/Cobblestone.png",2);
	Renderer.loadTexture(gl, nTexture++, "../common/textures/wall1.jpg",1);
	Renderer.loadTexture(gl, nTexture++, "../common/textures/roof3.png",1);
	Renderer.loadTexture(gl, nTexture++, "../common/textures/Grass.png",2);
	Renderer.loadTexture(gl, nTexture++, "../common/textures/headlight.png", 0);
	Renderer.loadTexture(gl, nTexture++, "../common/textures/IronBlockCube.png",1);
	Renderer.loadTexture(gl, nTexture++, "../common/textures/TntCylinder.png", 1);//6
	Renderer.loadTexture(gl, nTexture++, "../common/textures/BirchCylinder.png", 1);//7
	Renderer.loadTexture(gl, nTexture++, "../common/textures/oakCylinder.png", 1);//8
	Renderer.loadTexture(gl, nTexture++, "../common/textures/Lamp.png", 1);//9
	Renderer.loadTexture(gl, nTexture++, "../common/textures/DiamondBlockCube.png", 1);
	Renderer.loadTexture(gl, nTexture++, "../common/textures/GoldBlockCube.png", 1);
	Renderer.loadTexture(gl, nTexture++, "../common/textures/CopperBlockCube.png", 1);
	Renderer.loadTexture(gl, nTexture++, "../common/textures/EmeraldBlockCube.png", 1);
	Renderer.loadTexture(gl, nTexture++, "../common/textures/QuartzBlockCube.png", 1);


	this.CAlbume = new CreateCAlbume();
	this.CTuorlo = new CreateCTuorlo();
	this.CGuscio = new CreateCGuscio();
	this.CFaro = new CreateCVuoto();
	this.CFaro.coeffE = [0.8,0.8,0.0];
	this.CFaroSpento = new CreateCGrigioLucido(0.5);
	this.CFaroSpento.shType = 1;

	this.CPietra1 = new CreateCGrigioLucido(0.3);
	this.CPietra2 = new CreateCGrigioLucido(0.5);
	this.CIron = new CreateCGrigioLucido(0.7);
	this.CIron.text = 1.0;
	this.CIron.CPStandardS = [0.7,0.7,0.8, 5.0];
	this.CIron.CPStandardD = [0.7,0.7,0.9];

	this.CLampioniLuce = new CreateCVuoto();
	this.CLampioniLuce.coeffE = [0.9,0.9,0.75];
	this.CLampioniLuce.shType = 0;
	this.CLampioniBase = new CreateCGrigioLucido(0.0);
	this.CLampioniPalo = new CreateCGrigioLucido(0.8);
	this.CLampioniBase.shType = 0;
	this.CLampioniPalo.shType = 0;
	this.CLampioniPalo.text = 1.0;

	this.CVuoto = new CreateCVuoto();
	this.CVuoto.text = 0.0;
	this.CVuoto.shType = 0.0;
	this.CVuoto
}
Renderer.loadTexture = function (gl, tu, url, n) {
	var image = new Image();
	image.src = url;
	image.addEventListener('load', function () {
		gl.activeTexture(gl.TEXTURE0 + tu);
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		if (n == 0) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		else if(n==1) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		} if(n==2) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
			gl.generateMipmap(gl.TEXTURE_2D);
		}
	});
}

Renderer.drawCar = function (gl, scale, carrozzeriaC, ruoteC, telaioC, luceC) {

	let velRuote = this.car.wheelsSpeedAngle * 2;

	Renderer.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), scale));

	//carrozzeria
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 1, 0]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [1, 1.3, 1]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.sphere, carrozzeriaC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//birch
	gl.uniform1i(this.uniformShader.uSamplerLocation, 7);
	/////////////////////////////////////////RUOTONA DESTRA
	//ruota post destra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1.4, 0.8, 1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.81, 0.15, 0.81]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, ruoteC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//rinforzo ruota post destra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.95, 0.8, 1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.55, 0.45, 0.55]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.doubleCone, telaioC);
	//resettiamo lo stack
	Renderer.stack.pop();
	//////////////////////////////////////////////////////////

	///////////////////////////////////////RUOTINA DESTRA
	//ruota ant destra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1.4, 0.49, -1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), this.car.wheelsAngle));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.5, 0.1, 0.5]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, ruoteC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//rinforzo ruota ant destra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1.1, 0.49, -1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.3, 0.3, 0.3]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.doubleCone, telaioC);
	//resettiamo lo stack
	Renderer.stack.pop();
	/////////////////////////////////////////////////////////////////

	///////////////////////////////////////RUOTONA SINISTRA
	//ruota post sinistra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1.4, 0.8, 1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), -velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.81, 0.15, 0.81]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, ruoteC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//rinforzo ruota post sinistra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-0.95, 0.8, 1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), -velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.55, 0.45, 0.55]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.doubleCone, telaioC);
	//resettiamo lo stack
	Renderer.stack.pop();
	///////////////////////////////////////////////

	/////////////////////////////////////////RUOTINA SINISTRA
	//ruota ant sinistra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1.4, 0.49, -1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), -this.car.wheelsAngle));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), -velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.5, 0.1, 0.5]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, ruoteC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//rinforzo ruota ant sinistra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1.1, 0.49, -1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), -velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.3, 0.3, 0.3]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.doubleCone, telaioC);
	//resettiamo lo stack
	Renderer.stack.pop();
	//////////////////////////////////////////////////


	//oak
	telaioC.text = 1.0;
	gl.uniform1i(this.uniformShader.uSamplerLocation, 8);
	//asta ruote posteriori
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.8, 1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.1, 1.45, 0.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinderB, telaioC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//asta ruote anteriori
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.5, -1.09]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.05, 1.3, 0.05]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinderB, telaioC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//rinforzo asta ruote anteriori
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.5, -1.085]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.1, 0.4, 0.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinderB, telaioC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//collegamento asta ruote anteriori
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.5, -1.085]));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), Math.PI / 4));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2, 0.18, 0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinderB, telaioC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//faro
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 1.1, -1.18]));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.36, 0.18, 0.36]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinderB, telaioC);
	//resettiamo lo stack
	Renderer.stack.pop();
	//lampadina
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 1.1, -1.5]));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2, 0.2, 0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.sphere, luceC);
	//resettiamo lo stack
	Renderer.stack.pop();

	Renderer.stack.pop(); //matrice di scaling

	telaioC.text = 0.0;
}
Renderer.drawShadowCar = function (gl,scale) {

	let velRuote = this.car.wheelsSpeedAngle * 2;

	Renderer.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), scale));

	//carrozzeria
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 1, 0]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [1, 1.3, 1]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.sphere);
	//resettiamo lo stack
	Renderer.stack.pop();

	//asta ruote posteriori
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.8, 1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.1, 1.45, 0.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

	//asta ruote anteriori
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.5, -1.08]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.05, 1.3, 0.05]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

	//rinforzo asta ruote anteriori
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.5, -1.08]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.1, 0.4, 0.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

	//collegamento asta ruote anteriori
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.5, -1.08]));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), Math.PI / 4));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2, 0.18, 0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

	/////////////////////////////////////////RUOTONA DESTRA
	//ruota post destra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1.4, 0.8, 1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.81, 0.15, 0.81]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

	//rinforzo ruota post destra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.95, 0.8, 1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.55, 0.45, 0.55]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.doubleCone);
	//resettiamo lo stack
	Renderer.stack.pop();
	//////////////////////////////////////////////////////////

	///////////////////////////////////////RUOTINA DESTRA
	//ruota ant destra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1.4, 0.49, -1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), this.car.wheelsAngle));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.5, 0.1, 0.5]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

	//rinforzo ruota ant destra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1.1, 0.49, -1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.3, 0.3, 0.3]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.doubleCone);
	//resettiamo lo stack
	Renderer.stack.pop();
	/////////////////////////////////////////////////////////////////

	///////////////////////////////////////RUOTONA SINISTRA
	//ruota post sinistra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1.4, 0.8, 1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), -velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.81, 0.15, 0.81]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

	//rinforzo ruota post sinistra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-0.95, 0.8, 1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), -velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.55, 0.45, 0.55]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.doubleCone);
	//resettiamo lo stack
	Renderer.stack.pop();
	///////////////////////////////////////////////

	/////////////////////////////////////////RUOTINA SINISTRA
	//ruota ant sinistra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1.4, 0.49, -1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), -this.car.wheelsAngle));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), -velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.5, 0.1, 0.5]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stak
	Renderer.stack.pop();

	//rinforzo ruota ant sinistra
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1.1, 0.49, -1.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), -velRuote));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.3, 0.3, 0.3]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.doubleCone);
	//resettiamo lo stack
	Renderer.stack.pop();
	//////////////////////////////////////////////////

	//faro
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 1.1, -1.18]));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.36, 0.18, 0.36]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

	//lampadina
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 1.1, -1.5]));
	Renderer.stack.multiply(glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), -Math.PI / 2));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2, 0.2, 0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

	Renderer.stack.pop();

}

Renderer.drawLamp = function (gl, scale, luceC, lampioneBaseC, lampionePaloC, lampioneOrnamentiC) {

	//palo
	gl.uniform1i(this.uniformShader.uSamplerLocation, 9);
	Renderer.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), scale));
	//base
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, -0.1, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.6, 0.2, 0.6]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.sphere, lampioneBaseC);
	//resettiamo lo stack
	Renderer.stack.pop();


	//palo
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 2.0, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.1, 2.0, 0.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, -1.0, 0.0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, lampionePaloC);
	//resettiamo lo stack
	Renderer.stack.pop();



	//cilindrino base luce
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 3.7, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.25, 0.15, 0.25]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, -1.0, 0.0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, lampioneOrnamentiC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//luce
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 4.0, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.5, 0.4, 0.5]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.doubleCone, luceC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//sopra la luce 1
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 4.0, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.4, 0.1, 0.4]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, lampioneOrnamentiC);
	//resettiamo lo stack
	Renderer.stack.pop();

	//sopra la luce 1
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 4.25, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.15, 0.05, 0.15]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, lampioneOrnamentiC);
	//resettiamo lo stack
	Renderer.stack.pop();
	Renderer.stack.pop();
}
Renderer.drawShadowLamp = function (gl) {

	//base
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, -0.1, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.6, 0.2, 0.6]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.sphere);
	//resettiamo lo stack
	Renderer.stack.pop();


	//palo
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 2.0, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.1, 2.0, 0.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, -1.0, 0.0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();



	//cilindrino base luce
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 3.7, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.25, 0.15, 0.25]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, -1.0, 0.0]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

	//luce
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 4.0, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.5, 0.4, 0.5]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.doubleCone);
	//resettiamo lo stack
	Renderer.stack.pop();

	//sopra la luce 1
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 4.0, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.4, 0.1, 0.4]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

	//sopra la luce 1
	Renderer.stack.push();
	//accumuliamo le trasformazioni
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.0, 4.25, 0.0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.15, 0.05, 0.15]));
	//disegnamo l'oggetto
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	//resettiamo lo stack
	Renderer.stack.pop();

}

Renderer.drawShadowScene = function (gl,faro) {
	gl.enable(gl.CULL_FACE);

	gl.bindFramebuffer(gl.FRAMEBUFFER, Renderer.framebuffer);
	gl.viewport(0, 0, Renderer.shadowMapSize, Renderer.shadowMapSize);
	//gl.viewport(0, 0, canvasW, canvasH);
	gl.enable(gl.DEPTH_TEST);

	gl.clearColor(0.34, 0.5, 0.74, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	

	gl.useProgram(Renderer.shaderDepth);

	// initialize the stack with the identity
	this.stack.loadIdentity();

	//LightMatrix -> Matrice di vista per il depth shader
	gl.uniformMatrix4fv(this.shaderDepth.uLightMatrixLocation, false, faro);

	// drawing the car
	this.stack.push();
	this.stack.multiply(this.car.frame);
	this.drawShadowCar(gl, 	[0.6, 0.6, 0.6]);
	//fine macchina
	this.stack.pop();

	//statua!
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [55, 0, 20]));
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [10, 0.5, 10]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 1, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.drawShadowObject(gl, this.cube);
	this.stack.pop();
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [11, 0.2, 11]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 1, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.drawShadowObject(gl, this.cube);
	this.stack.pop();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 1, 0]));
	this.drawShadowCar(gl,[5.0,5.0,5.0]);
	this.stack.pop();
	this.stack.pop();


	//disegnamo altra roba da aggiungere
	//cubi random
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-60, 0, -60]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 1, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.drawShadowObject(gl, this.cube1);

	//matrici di traslazioe si sommano facilmente senza problemi
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [4, 0, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.drawShadowObject(gl, this.cube1);

	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-4, 0, 4]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.drawShadowObject(gl, this.cube1);

	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [4, 0, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.drawShadowObject(gl, this.cube1);
	this.stack.pop();

	//quarzo con coefficenti strani
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [8, 0.5, -20]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2,0.5,0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	this.stack.pop();
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [8, 2, -20]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.CVuoto.coeffD = [0.3,1.0,0.3];
	this.CVuoto.coeffS = [0.3,0.3,1.0, 65];
	this.drawShadowObject(gl, this.sphere);
	this.stack.pop();

	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [13, 0.5, -20]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2,0.5,0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	this.stack.pop();
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [13, 2, -20]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.CVuoto.coeffD = [1.0,0.2,0.2];
	this.CVuoto.coeffS = [0.2,1.0,0.2, 65];
	this.drawShadowObject(gl, this.sphere);
	this.stack.pop();

	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [18, 0.5, -20]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2,0.5,0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	this.stack.pop();
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [18, 2, -20]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	this.CVuoto.coeffD = [0.2,0.2,1.0];
	this.CVuoto.coeffS = [1.0,0.2,0.2, 65];
	this.drawShadowObject(gl, this.sphere);
	this.stack.pop();

	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);
	// drawing the static elements (ground, track and buldings)
	this.drawShadowObject(gl, Game.scene.groundObj);
	this.drawShadowObject(gl, Game.scene.trackObj);

	for (var i in Game.scene.buildingsObj)
		this.drawShadowObject(gl, Game.scene.buildingsObjTex[i]);
	for (var i in Game.scene.buildingsObj)
		this.drawShadowObject(gl, Game.scene.buildingsObjTex[i].roof);

	//disegna lampioni
	for (let p = 0; p < Game.scene.lamps.length; p++) {
		this.stack.push();
		this.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), Game.scene.lamps[p].position));
		this.drawShadowLamp(gl);
		this.stack.pop();
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER,null);
}
Renderer.drawScene = function () {
	let gl = Renderer.gl;

	//faro
	let occhio = glMatrix.vec3.create();
	let punto_target = glMatrix.vec3.create();
	let up = glMatrix.vec4.create();
	let faroFrame = glMatrix.mat4.mul(glMatrix.mat4.create(), glMatrix.mat4.create(), this.car.frame);

	glMatrix.vec3.transformMat4(occhio, [0.0, 0.71, -0.75, 1], faroFrame)
	glMatrix.vec3.transformMat4(punto_target, [0.0, 0, -4, 1], faroFrame)
	glMatrix.vec4.transformMat4(up, [0.0, 1.0, 0.0, 0.0], faroFrame);

	//senza proiezione
	let faro = glMatrix.mat4.lookAt(glMatrix.mat4.create(), //output
		occhio, // posizione occhio
		punto_target, // punto da guardare
		up); // pointing up	
	//con proiezione
	let faroP = glMatrix.mat4.mul(glMatrix.mat4.create(), glMatrix.mat4.perspective(glMatrix.mat4.create(), Math.PI / 2, 1.5, 0.05, 35), faro);

	//shadow buffer
	this.drawShadowScene(gl,faroP);
	//gl.activeTexture(gl.TEXTURE0 + 6);
	//gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.colorTexture);
	gl.activeTexture(gl.TEXTURE0 + nTexture);
	gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.depthTexture);
	//gl.generateMipmap(gl.TEXTURE_2D);
	//gl.bindTexture(gl.TEXTURE_2D, null);

	gl.enable(gl.CULL_FACE);

	gl.viewport(0, 0, canvasW, canvasH);
	gl.enable(gl.DEPTH_TEST);

	// Clear the framebuffer
	gl.clearColor(0.34, 0.65, 0.84, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(this.uniformShader);

	//matrice proiezione
	gl.uniformMatrix4fv(this.uniformShader.uProjectionMatrixLocation, false, glMatrix.mat4.perspective(glMatrix.mat4.create(), Math.PI/ 4, canvasW / canvasH, 1, 250));

	//matrice di vistra
	Renderer.cameras[Renderer.currentCamera].update(this.car.frame);
	var invV = Renderer.cameras[Renderer.currentCamera].matrix();
	gl.uniformMatrix4fv(this.uniformShader.uViewMatrixLocation, false, invV);

	//luce del sole
	gl.uniform3fv(this.uniformShader.uSunDirection, Game.scene.weather.sunLightDirection);

	//faretti
	let posArrView = [];
	let dirArrView = [];
	for(let n = 0; n<12; n++){
		let dummy1 = glMatrix.vec4.transformMat4(glMatrix.vec4.create(), this.posArr[n], invV);
		let dummy2 = glMatrix.vec4.transformMat4(glMatrix.vec4.create(), this.dirArr[n], invV);
		glMatrix.vec4.normalize(dummy2,dummy2);

		posArrView.push(dummy1[0]);
		posArrView.push(dummy1[1]);
		posArrView.push(dummy1[2]);

		dirArrView.push(dummy2[0]);
		dirArrView.push(dummy2[1]);
		dirArrView.push(dummy2[2]);
	}
	gl.uniform3fv(this.uniformShader.uLArrayPosLocation, posArrView);
	gl.uniform3fv(this.uniformShader.uLArrayDirLocation, dirArrView);

	// initialize the stack with the identity
	this.stack.loadIdentity();

	//sampler del faro della macchina
	gl.uniform1i(this.uniformShader.uSamplerFLocation, 4);
	gl.uniformMatrix4fv(this.uniformShader.uFaroLocation, false, faroP);
	gl.uniformMatrix4fv(this.uniformShader.uFaroViewLocation, false, faro);

	//risultato calcolo shadow mapping
	gl.uniform1i(this.uniformShader.uDepthSamplerLocation,nTexture);

	// drawing the car
	this.stack.push();
	this.stack.multiply(this.car.frame); // projection * viewport
	this.drawCar(gl, [0.6, 0.6, 0.6],this.CGuscio, this.CAlbume, this.CTuorlo, this.CFaro);
	//fine macchina
	this.stack.pop();

	//statua!
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [55, 0, 20]));
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [10, 0.5, 10]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 1, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	gl.uniform1i(this.uniformShader.uSamplerLocation, 5);
	this.drawObject(gl, this.cube, this.CIron);
	this.stack.pop();
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [11, 0.2, 11]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 1, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	this.drawObject(gl, this.cube, this.CIron);
	this.stack.pop();

	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 1, 0]));
	this.drawCar(gl,[5.0,5.0,5.0], this.CGuscio, this.CAlbume, this.CTuorlo, this.CFaroSpento);

	this.stack.pop();
	this.stack.pop();

	//disegnamo altra roba da aggiungere
	//cubi random
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-60, 0, -60]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 1, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	gl.uniform1i(this.uniformShader.uSamplerLocation, 10);
	this.drawObject(gl, this.cube1, this.CIron);

	//matrici di traslazioe si sommano facilmente senza problemi
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [4, 0, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	gl.uniform1i(this.uniformShader.uSamplerLocation, 11);
	this.drawObject(gl, this.cube1, this.CIron);

	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-4, 0, 4]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	gl.uniform1i(this.uniformShader.uSamplerLocation, 12);
	this.drawObject(gl, this.cube1, this.CIron);

	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [4, 0, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	gl.uniform1i(this.uniformShader.uSamplerLocation, 13);
	this.drawObject(gl, this.cube1, this.CIron);
	this.stack.pop();

	//quarzo con coefficenti strani
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [8, 0.5, -20]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2,0.5,0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	gl.uniform1i(this.uniformShader.uSamplerLocation, 7);
	this.drawObject(gl, this.cylinder, this.CAlbume);
	this.stack.pop();
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [8, 2, -20]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	this.CVuoto.coeffD = [0.3,1.0,0.3];
	this.CVuoto.coeffS = [0.3,0.3,1.0, 65];
	this.drawObject(gl, this.sphere, this.CVuoto);
	this.stack.pop();

	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [13, 0.5, -20]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2,0.5,0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	gl.uniform1i(this.uniformShader.uSamplerLocation, 7);
	this.drawObject(gl, this.cylinder, this.CAlbume);
	this.stack.pop();
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [13, 2, -20]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	this.CVuoto.coeffD = [1.0,0.2,0.2];
	this.CVuoto.coeffS = [0.2,1.0,0.2, 65];
	this.drawObject(gl, this.sphere, this.CVuoto);
	this.stack.pop();

	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [18, 0.5, -20]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2,0.5,0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	gl.uniform1i(this.uniformShader.uSamplerLocation, 7);
	this.drawObject(gl, this.cylinder, this.CAlbume);
	this.stack.pop();
	this.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [18, 2, -20]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);
	this.CVuoto.coeffD = [0.2,0.2,1.0];
	this.CVuoto.coeffS = [1.0,0.2,0.2, 65];
	this.drawObject(gl, this.sphere, this.CVuoto);
	this.stack.pop();

	//resettiamo la model matrix per il resto della scene
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);

	// drawing the static elements (ground, track and buldings)
	gl.uniform1i(this.uniformShader.uSamplerLocation, 3);
	this.drawObject(gl, Game.scene.groundObj, [0.3, 0.7, 0.2, 1.0]);

	gl.uniform1i(this.uniformShader.uSamplerLocation, 0);
	this.drawObject(gl, Game.scene.trackObj, [0.9, 0.8, 0.7, 1.0]);


	gl.uniform1i(this.uniformShader.uSamplerLocation, 1);
	for (var i in Game.scene.buildingsObj)
		this.drawObject(gl, Game.scene.buildingsObjTex[i], [0.8, 0.8, 0.8, 1.0]);
	gl.uniform1i(this.uniformShader.uSamplerLocation, 2);
	for (var i in Game.scene.buildingsObj)
		this.drawObject(gl, Game.scene.buildingsObjTex[i].roof, [0.8, 0.8, 0.8, 1.0]);

	//disegna lampioni
	for (let p = 0; p < Game.scene.lamps.length; p++) {
		this.stack.push();
		this.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), Game.scene.lamps[p].position));
		this.drawLamp(gl, [1.0,1.0,1.0], this.CLampioniLuce, this.CLampioniBase, this.CLampioniPalo, this.CLampioniPalo);
		this.stack.pop();
	}

	gl.useProgram(null);
}


Renderer.Display = function () {
	Renderer.drawScene();
	window.requestAnimationFrame(Renderer.Display);
}
Renderer.setupAndStart = function () {
	/* create the canvas */
	Renderer.canvas = document.getElementById("OUTPUT-CANVAS");
	//regolazione dimensioni canvas
	//Renderer.canvas.width = document.body.clientWidth - 80;
	//Renderer.canvas.height = document.body.clientHeight - 130;
	Renderer.canvas.width = 1200;
	Renderer.canvas.height = 700;
	canvasW = Renderer.canvas.width;
	canvasH = Renderer.canvas.height;

	/* get the webgl context */
	Renderer.gl = Renderer.canvas.getContext("webgl");

	/* read the webgl version and log */
	var gl_version = Renderer.gl.getParameter(Renderer.gl.VERSION);
	log("glversion: " + gl_version);
	var GLSL_version = Renderer.gl.getParameter(Renderer.gl.SHADING_LANGUAGE_VERSION);
	log("glsl  version: " + GLSL_version);

	/* initialize objects to be rendered */
	Renderer.initializeObjects(Renderer.gl);
	Renderer.stack = new MatrixStack();

	/* create the shader */
	Renderer.uniformShader = new uniformShader(Renderer.gl);
	Renderer.shaderDepth = new shaderDepth(Renderer.gl);
	Renderer.shadowMapSize = 2048.0;
	Renderer.framebuffer = Renderer.createFramebuffer(Renderer.gl,Renderer.shadowMapSize);

	/*
	add listeners for the mouse / keyboard events
	*/
	Renderer.canvas.addEventListener('mousemove', on_mouseMove, false);
	Renderer.canvas.addEventListener('keydown', on_keydown, false);
	Renderer.canvas.addEventListener('keyup', on_keyup, false);

	Renderer.Display();
}

on_mouseMove = function (e) {
	//calcolo dei radianti relativamente all'angolo orizzontale
	fCam.angles['h'] = (e.offsetX / canvasW) * 2 * Math.PI - Math.PI;
	//calcolo dei radianti relativamente all'angolo verticale
	fCam.angles['v'] = (e.offsetY / canvasH) * Math.PI * 6 / 12 - Math.PI * 8 / 24;
}

on_keyup = function (e) {

	//MODIFICA4
	if (e.key == ' ') {
		Renderer.currentCamera = (Renderer.currentCamera + 1) % Renderer.cameras.length;
		log("Cambio camera: " + Renderer.currentCamera);
	} else if (e.key == 'w' || e.key == 'a' || e.key == 's' || e.key == 'd') {
		fCam.keys[e.key] = false;
		fCam.keys[e.key.toUpperCase()] = false;
	} else if (e.key == 'W' || e.key == 'A' || e.key == 'S' || e.key == 'D') {
		fCam.keys[e.key] = false;
		fCam.keys[e.key.toLowerCase()] = false;
	}else if (e.key == 'r') {
		fCam.reset();
		log("Reset FREE CAM");
	} else if (e.key == 'h') {
		log(Renderer.cylinder.normals);
	}

	Renderer.car.control_keys[e.key] = false;
}

on_keydown = function (e) {

	//MODIFICA4
	if (e.key == 'w' || e.key == 'a' || e.key == 's' || e.key == 'd') {
		fCam.keys[e.key] = true;
	}else if (e.key == 'W' || e.key == 'A' || e.key == 'S' || e.key == 'D') {
		fCam.keys[e.key] = true;
	}

	Renderer.car.control_keys[e.key] = true;
}
window.onload = Renderer.setupAndStart;
