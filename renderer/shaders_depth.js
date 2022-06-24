shaderDepth = function (gl) {
	var vertexShaderSource = `
		attribute vec3 aPosition;
		uniform mat4 uLightMatrix;	
	 	uniform mat4 uM;	
	 
    	void main(void){		
     		gl_Position = uLightMatrix*uM*vec4(aPosition, 1.0);  				
		}
	`;

	var fragmentShaderSource = `
		#extension GL_OES_standard_derivatives : enable
		precision highp float;					
		
 		float PlaneApprox(float Depth) {   
			// Compute partial derivatives of depth.    
			float dx = dFdx(Depth);   
			float dy = dFdy(Depth);   
			// Compute second moment over the pixel extents.   
			return  Depth*Depth + 0.25*(dx*dx + dy*dy);   
		} 
	
		void main(void){	
			gl_FragColor = gl_FragCoord;
 			//gl_FragColor = vec4(gl_FragCoord.z, gl_FragCoord.w, PlaneApprox(gl_FragCoord.z), PlaneApprox(gl_FragCoord.w));
		}	
	`;

	// create the vertex shader
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.compileShader(vertexShader);

	// create the fragment shader
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderSource);
	gl.compileShader(fragmentShader);

	// Create the shader program
	var aPositionIndex = 0;
	var shaderProgram = gl.createProgram();

	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.bindAttribLocation(shaderProgram, aPositionIndex, "aPosition");
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		var str = "Unable to initialize the shader program.\n\n";
		str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
		str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
		str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
		alert(str);
	  }

	shaderProgram.aPositionIndex = aPositionIndex;
	shaderProgram.uLightMatrixLocation = gl.getUniformLocation(shaderProgram, "uLightMatrix");
	shaderProgram.uM = gl.getUniformLocation(shaderProgram, "uM");

	//shaderProgram.vertex_shader = vertexShaderSource;
	//shaderProgram.fragment_shader = fragmentShaderSource;
	return shaderProgram;
};
